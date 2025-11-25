// src/contexts/ChatContext.tsx

import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	useCallback,
} from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface ChatMessage {
	id: string;
	senderId: string;
	receiverId: string;
	content: string;
	conversationId: string;
	timestamp: number;
}

interface ChatContextType {
	isConnected: boolean;
	connect: (userId: string, conversationId: string) => void;
	disconnect: () => void;
	sendMessage: (receiverId: string, content: string) => void;
	messages: ChatMessage[];
	sendTyping: () => void;
	stopTyping: () => void;
	isTyping: boolean;
	error: string | null;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = () => {
	const context = useContext(ChatContext);
	if (!context) {
		throw new Error('useChatContext must be used within ChatProvider');
	}
	return context;
};

// ============================================================================
// PROVIDER
// ============================================================================

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
	const heartbeatIntervalRef = useRef<NodeJS.Timeout>();

	const [isConnected, setIsConnected] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const currentUserIdRef = useRef<string>('');
	const currentConversationIdRef = useRef<string>('');

	// ========================================================================
	// GET AUTH TOKEN
	// ========================================================================

	const getAuthToken = (): string | null => {
		// Get token from localStorage (or wherever you store it)
		return localStorage.getItem('token');
	};

	// ========================================================================
	// CONNECTION MANAGEMENT
	// ========================================================================

	const connect = useCallback((userId: string, conversationId: string) => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			console.log('Already connected');
			return;
		}

		const token = getAuthToken();
		if (!token) {
			setError('Authentication token not found. Please login again.');
			console.error('❌ No auth token found');
			return;
		}

		currentUserIdRef.current = userId;
		currentConversationIdRef.current = conversationId;

		// Build WebSocket URL with token
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const host = 'localhost:3001';
		const wsUrl = `${protocol}//${host}/ws/chat?token=${encodeURIComponent(
			token
		)}`;

		console.log('🔌 Connecting to:', wsUrl.replace(token, 'TOKEN_HIDDEN'));
		const ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log('✅ WebSocket connected');
			setIsConnected(true);
			setError(null);

			// Join conversation after connection
			ws.send(
				JSON.stringify({
					type: 'join',
					payload: { conversationId },
					timestamp: Date.now(),
				})
			);

			startHeartbeat(ws);
		};

		ws.onmessage = (event) => {
			handleMessage(event.data);
		};

		ws.onerror = (event) => {
			console.error('❌ WebSocket error:', event);
			setError('Connection error. Please check your internet connection.');
		};

		ws.onclose = (event) => {
			console.log('🔌 WebSocket disconnected', event.code, event.reason);
			setIsConnected(false);
			stopHeartbeat();

			// Handle different close codes
			if (event.code === 1006) {
				setError('Connection lost. Reconnecting...');
			} else if (event.code === 401) {
				setError('Authentication failed. Please login again.');
				return; // Don't reconnect on auth failure
			}

			// Auto-reconnect after 3 seconds (except for auth failures)
			if (event.code !== 401) {
				reconnectTimeoutRef.current = setTimeout(() => {
					if (currentUserIdRef.current && currentConversationIdRef.current) {
						console.log('🔄 Reconnecting...');
						connect(currentUserIdRef.current, currentConversationIdRef.current);
					}
				}, 3000);
			}
		};

		wsRef.current = ws;
	}, []);

	const disconnect = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
		}
		stopHeartbeat();

		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		currentUserIdRef.current = '';
		currentConversationIdRef.current = '';
		setIsConnected(false);
		setMessages([]);
		setError(null);
	}, []);

	// ========================================================================
	// MESSAGE HANDLING
	// ========================================================================

	const handleMessage = useCallback((data: string) => {
		try {
			const message = JSON.parse(data);
			console.log('📨 Received:', message.type);

			switch (message.type) {
				case 'joined':
					console.log('✅ Joined:', message.payload);
					break;

				case 'new_message':
					setMessages((prev) => [...prev, message.payload]);
					break;

				case 'message_sent':
					setMessages((prev) => [...prev, message.payload]);
					break;

				case 'user_typing':
					setIsTyping(true);
					break;

				case 'user_stop_typing':
					setIsTyping(false);
					break;

				case 'error':
					console.error('❌ Server error:', message.payload.error);
					setError(message.payload.error);
					break;

				case 'pong':
					// Heartbeat response
					break;

				default:
					console.warn('⚠️ Unknown message type:', message.type);
			}
		} catch (error) {
			console.error('❌ Error parsing message:', error);
		}
	}, []);

	const sendMessage = useCallback((receiverId: string, content: string) => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			setError('Not connected. Please wait...');
			return;
		}

		wsRef.current.send(
			JSON.stringify({
				type: 'message',
				payload: { receiverId, content },
				timestamp: Date.now(),
			})
		);
	}, []);

	// ========================================================================
	// TYPING INDICATORS
	// ========================================================================

	const sendTyping = useCallback(() => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

		wsRef.current.send(
			JSON.stringify({
				type: 'typing',
				timestamp: Date.now(),
			})
		);
	}, []);

	const stopTyping = useCallback(() => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

		wsRef.current.send(
			JSON.stringify({
				type: 'stop_typing',
				timestamp: Date.now(),
			})
		);
	}, []);

	// ========================================================================
	// HEARTBEAT
	// ========================================================================

	const startHeartbeat = (ws: WebSocket) => {
		heartbeatIntervalRef.current = setInterval(() => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
			}
		}, 25000);
	};

	const stopHeartbeat = () => {
		if (heartbeatIntervalRef.current) {
			clearInterval(heartbeatIntervalRef.current);
		}
	};

	// ========================================================================
	// CLEANUP
	// ========================================================================

	useEffect(() => {
		return () => {
			disconnect();
		};
	}, [disconnect]);

	// ========================================================================
	// CONTEXT VALUE
	// ========================================================================

	const value: ChatContextType = {
		isConnected,
		connect,
		disconnect,
		sendMessage,
		messages,
		sendTyping,
		stopTyping,
		isTyping,
		error,
	};

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
