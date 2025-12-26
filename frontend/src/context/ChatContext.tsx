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
	senderName?: string;
	receiverId?: string;
	content: string;
	conversationId: string;
	timestamp: number;
	read?: boolean;
}

interface OtherUser {
	id: string;
	name: string;
	isOnline: boolean;
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
	otherUser: OtherUser | null;
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
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null
	);
	const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null
	);

	const [isConnected, setIsConnected] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [otherUser, setOtherUser] = useState<OtherUser | null>(null);

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
		const apiUrl = import.meta.env.VITE_API_URL || '';
		let wsHost: string;

		if (apiUrl) {
			try {
				const url = new URL(apiUrl);
				// Extract just the hostname, no protocol
				wsHost = url.host;
			} catch {
				// If API_URL is invalid, use backend URL directly
				wsHost = 'two47tradespeople-backend.onrender.com';
			}
		} else {
			// Production backend
			wsHost = 'two47tradespeople-backend.onrender.com';
		}

		// Determine protocol (wss for production, ws for local dev)
		const protocol = wsHost.includes('localhost') ? 'ws:' : 'wss:';
		const wsUrl = `${protocol}//${wsHost}/ws/chat?token=${encodeURIComponent(
			token
		)}`;

		console.log('🔌 Connecting to:', wsUrl.replace(token, 'TOKEN_HIDDEN'));

		try {
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
				setError('Connection error. Attempting to reconnect...');
			};

			ws.onclose = (event) => {
				console.log('🔌 WebSocket disconnected', event.code, event.reason);
				setIsConnected(false);
				stopHeartbeat();

				// Handle different close codes
				if (event.code === 1006) {
					setError('Connection lost. Reconnecting...');
				} else if (event.code === 401 || event.code === 403) {
					setError('Authentication failed. Please login again.');
					return; // Don't reconnect on auth failure
				}

				// Auto-reconnect after 3 seconds (except for auth failures)
				if (event.code !== 401 && event.code !== 403) {
					reconnectTimeoutRef.current = setTimeout(() => {
						if (currentUserIdRef.current && currentConversationIdRef.current) {
							console.log('🔄 Reconnecting...');
							connect(
								currentUserIdRef.current,
								currentConversationIdRef.current
							);
						}
					}, 3000);
				}
			};

			wsRef.current = ws;
		} catch (err) {
			console.error('❌ Failed to create WebSocket:', err);
			setError('Failed to connect. Please try again.');
		}
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
		setOtherUser(null);
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
					// Set previous messages from server
					if (message.payload.messages) {
						setMessages(message.payload.messages);
					}
					// Set other user info
					if (message.payload.otherUser) {
						setOtherUser(message.payload.otherUser);
					}
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

				case 'user_online':
					// Update other user's online status
					setOtherUser((prev) => (prev ? { ...prev, isOnline: true } : null));
					break;

				case 'user_offline':
					// Update other user's online status
					setOtherUser((prev) => (prev ? { ...prev, isOnline: false } : null));
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
		otherUser,
	};

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
