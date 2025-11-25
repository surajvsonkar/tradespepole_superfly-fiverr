// src/websocket/chatServer.ts

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

// ============================================================================
// TYPES
// ============================================================================

interface Client {
	ws: WebSocket;
	userId: string;
	conversationId: string | null;
}

interface ChatMessage {
	type:
		| 'join'
		| 'joined'
		| 'message'
		| 'new_message'
		| 'message_sent'
		| 'typing'
		| 'stop_typing'
		| 'user_typing'
		| 'user_stop_typing'
		| 'ping'
		| 'pong'
		| 'error';
	payload?: any;
	timestamp: number;
}

interface JWTPayload {
	userId: string;
	email: string;
	type: string;
}

// ============================================================================
// CONNECTION MANAGER
// ============================================================================

class ChatServer {
	private wss: WebSocketServer;
	private clients: Map<string, Client> = new Map();
	private userSockets: Map<string, string[]> = new Map();
	private conversations: Map<string, Set<string>> = new Map();
	private jwtSecret: string;

	constructor(server: Server) {
		// Get JWT secret from environment
		this.jwtSecret = process.env.JWT_SECRET || '';
        console.log(this.jwtSecret)

		if (!this.jwtSecret) {
			throw new Error('JWT_SECRET is not defined in environment variables');
		}

		this.wss = new WebSocketServer({
			server,
			path: '/ws/chat',
			verifyClient: this.verifyClient.bind(this),
		});

		this.wss.on('connection', this.handleConnection.bind(this));
		console.log('✅ WebSocket Chat Server initialized with JWT authentication');
	}

	// ========================================================================
	// TOKEN VERIFICATION
	// ========================================================================

	private verifyClient(
		info: { origin: string; secure: boolean; req: IncomingMessage },
		callback: (res: boolean, code?: number, message?: string) => void
	) {
		try {
			const url = new URL(
				info.req.url || '',
				`http://${info.req.headers.host}`
			);
			const token = url.searchParams.get('token');

			if (!token) {
				console.error('❌ No token provided in WebSocket connection');
				callback(false, 401, 'Unauthorized: No token provided');
				return;
			}

			// Verify JWT token
			jwt.verify(token, this.jwtSecret, (err, decoded) => {
				if (err) {
					console.error('❌ Invalid token:', err.message);
					callback(false, 401, 'Unauthorized: Invalid token');
					return;
				}

				// Store decoded user info in request for later use
				(info.req as any).user = decoded as JWTPayload;
				console.log(
					'✅ Token verified for user:',
					(decoded as JWTPayload).userId
				);
				callback(true);
			});
		} catch (error) {
			console.error('❌ Error verifying client:', error);
			callback(false, 500, 'Internal server error');
		}
	}

	// ========================================================================
	// CONNECTION HANDLING
	// ========================================================================

	private handleConnection(ws: WebSocket, req: IncomingMessage) {
		const socketId = uuidv4();
		const authenticatedUser = (req as any).user as JWTPayload;

		console.log(
			`🔌 New authenticated connection: ${socketId} (User: ${authenticatedUser.userId})`
		);

		// Initialize client with authenticated user info
		const client: Client = {
			ws,
			userId: authenticatedUser.userId,
			conversationId: null,
		};
		this.clients.set(socketId, client);

		// Track user socket
		if (!this.userSockets.has(authenticatedUser.userId)) {
			this.userSockets.set(authenticatedUser.userId, []);
		}
		this.userSockets.get(authenticatedUser.userId)!.push(socketId);

		// Send welcome message with user info
		this.send(socketId, {
			type: 'joined',
			payload: {
				userId: authenticatedUser.userId,
				email: authenticatedUser.email,
				message: 'Successfully connected to chat server',
			},
			timestamp: Date.now(),
		});

		// Setup heartbeat
		this.setupHeartbeat(ws, socketId);

		// Message handler
		ws.on('message', (data: Buffer) => {
			this.handleMessage(socketId, data);
		});

		// Disconnect handler
		ws.on('close', () => {
			this.handleDisconnect(socketId);
		});

		// Error handler
		ws.on('error', (error) => {
			console.error(`❌ WebSocket error for ${socketId}:`, error);
			this.handleDisconnect(socketId);
		});
	}

	// ========================================================================
	// MESSAGE HANDLING
	// ========================================================================

	private handleMessage(socketId: string, data: Buffer) {
		try {
			const message: ChatMessage = JSON.parse(data.toString());
			const client = this.clients.get(socketId);

			if (!client) {
				console.error(`❌ Client not found: ${socketId}`);
				return;
			}

			// Handle ping/pong
			if (message.type === 'ping') {
				this.send(socketId, {
					type: 'pong',
					timestamp: Date.now(),
				});
				return;
			}

			console.log(`📨 Message from ${socketId}:`, message.type);

			switch (message.type) {
				case 'join':
					this.handleJoin(socketId, client, message.payload);
					break;

				case 'message':
					this.handleChatMessage(socketId, client, message.payload);
					break;

				case 'typing':
					this.handleTyping(socketId, client, true);
					break;

				case 'stop_typing':
					this.handleTyping(socketId, client, false);
					break;

				default:
					console.warn(`⚠️ Unknown message type: ${message.type}`);
			}
		} catch (error) {
			console.error(`❌ Error handling message from ${socketId}:`, error);
			this.sendError(socketId, 'Invalid message format');
		}
	}

	// ========================================================================
	// JOIN CONVERSATION
	// ========================================================================

	private handleJoin(socketId: string, client: Client, payload: any) {
		const { conversationId } = payload;

		if (!conversationId) {
			this.sendError(socketId, 'conversationId is required');
			return;
		}

		// Update client conversation
		client.conversationId = conversationId;

		// Track conversation members
		if (!this.conversations.has(conversationId)) {
			this.conversations.set(conversationId, new Set());
		}
		this.conversations.get(conversationId)!.add(client.userId);

		// Send confirmation
		this.send(socketId, {
			type: 'joined',
			payload: {
				conversationId,
				userId: client.userId,
			},
			timestamp: Date.now(),
		});

		console.log(
			`✅ User ${client.userId} joined conversation ${conversationId}`
		);
	}

	// ========================================================================
	// CHAT MESSAGE
	// ========================================================================

	private handleChatMessage(socketId: string, client: Client, payload: any) {
		const { content, receiverId } = payload;

		if (!content || !receiverId) {
			this.sendError(socketId, 'content and receiverId are required');
			return;
		}

		if (!client.userId || !client.conversationId) {
			this.sendError(socketId, 'You must join a conversation first');
			return;
		}

		// Create message object
		const messageData = {
			id: uuidv4(),
			senderId: client.userId,
			receiverId,
			content,
			conversationId: client.conversationId,
			timestamp: Date.now(),
		};

		// Send to receiver
		this.sendToUser(receiverId, {
			type: 'new_message',
			payload: messageData,
			timestamp: Date.now(),
		});

		// Confirm to sender
		this.send(socketId, {
			type: 'message_sent',
			payload: messageData,
			timestamp: Date.now(),
		});

		console.log(`💬 Message from ${client.userId} to ${receiverId}`);
	}

	// ========================================================================
	// TYPING INDICATOR
	// ========================================================================

	private handleTyping(socketId: string, client: Client, isTyping: boolean) {
		if (!client.userId || !client.conversationId) {
			return;
		}

		const conversation = this.conversations.get(client.conversationId);
		if (!conversation) return;

		conversation.forEach((userId) => {
			if (userId !== client.userId) {
				this.sendToUser(userId, {
					type: isTyping ? 'user_typing' : 'user_stop_typing',
					payload: {
						userId: client.userId,
						conversationId: client.conversationId,
					},
					timestamp: Date.now(),
				});
			}
		});
	}

	// ========================================================================
	// DISCONNECT HANDLING
	// ========================================================================

	private handleDisconnect(socketId: string) {
		const client = this.clients.get(socketId);

		if (client) {
			console.log(`🔌 Disconnected: ${socketId} (User: ${client.userId})`);

			if (client.userId) {
				const sockets = this.userSockets.get(client.userId);
				if (sockets) {
					const index = sockets.indexOf(socketId);
					if (index > -1) sockets.splice(index, 1);

					if (sockets.length === 0) {
						this.userSockets.delete(client.userId);

						if (client.conversationId) {
							this.conversations
								.get(client.conversationId)
								?.delete(client.userId);
						}
					}
				}
			}

			this.clients.delete(socketId);
		}
	}

	// ========================================================================
	// HEARTBEAT
	// ========================================================================

	private setupHeartbeat(ws: WebSocket, socketId: string) {
		(ws as any).isAlive = true;

		ws.on('pong', () => {
			(ws as any).isAlive = true;
		});

		const interval = setInterval(() => {
			if ((ws as any).isAlive === false) {
				console.log(`💔 Client ${socketId} heartbeat failed`);
				clearInterval(interval);
				ws.terminate();
				return;
			}

			(ws as any).isAlive = false;
			ws.ping();
		}, 30000);

		ws.on('close', () => clearInterval(interval));
	}

	// ========================================================================
	// UTILITY METHODS
	// ========================================================================

	private send(socketId: string, message: ChatMessage) {
		const client = this.clients.get(socketId);
		if (client && client.ws.readyState === WebSocket.OPEN) {
			client.ws.send(JSON.stringify(message));
		}
	}

	private sendToUser(userId: string, message: ChatMessage) {
		const socketIds = this.userSockets.get(userId);
		if (socketIds) {
			socketIds.forEach((socketId) => {
				this.send(socketId, message);
			});
		}
	}

	private sendError(socketId: string, error: string) {
		this.send(socketId, {
			type: 'error',
			payload: { error },
			timestamp: Date.now(),
		});
	}
}

export default ChatServer;
