import { Request, Response } from 'express';
import prisma from '../configs/database';

// Get all conversations for the current user
export const getAllConversations = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;

		console.log(`📨 Fetching all conversations for user ${userId}`);

		const conversations = await prisma.conversation.findMany({
			where: {
				OR: [
					{ homeownerId: userId },
					{ tradespersonId: userId }
				]
			},
			include: {
				messages: {
					orderBy: { timestamp: 'desc' },
					take: 1
				},
				homeowner: true,
				tradesperson: true
			},
			orderBy: {
				updatedAt: 'desc'
			}
		});

		console.log(`✅ Found ${conversations.length} conversations for user ${userId}`);

		// Transform to include otherUser and unread count
		const transformedConversations = conversations.map(conv => {
			const isHomeowner = conv.homeownerId === userId;
			const otherUser = isHomeowner ? conv.tradesperson : conv.homeowner;
			const lastMessage = conv.messages[0] || null;

			return {
				id: conv.id,
				jobId: conv.jobId,
				jobTitle: conv.jobTitle,
				homeownerId: conv.homeownerId,
				tradespersonId: conv.tradespersonId,
				createdAt: conv.createdAt,
				updatedAt: conv.updatedAt,
				messages: [],
				otherUser: {
					id: otherUser.id,
					name: otherUser.name,
					avatar: otherUser.avatar,
					type: otherUser.type,
					trades: otherUser.trades
				},
				lastMessage: lastMessage ? {
					id: lastMessage.id,
					senderId: lastMessage.senderId,
					senderName: lastMessage.senderName,
					content: lastMessage.content,
					timestamp: lastMessage.timestamp,
					read: lastMessage.read
				} : null,
				unreadCount: 0 // TODO: Calculate unread count
			};
		});

		res.json({ conversations: transformedConversations });
	} catch (error) {
		console.error('❌ Error fetching conversations:', error);
		res.status(500).json({ error: 'Failed to fetch conversations' });
	}
};

// Get a specific conversation with all messages
export const getConversation = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const { conversationId } = req.params;

		console.log(`📨 Fetching conversation ${conversationId} for user ${userId}`);

		const conversation = await prisma.conversation.findUnique({
			where: { id: conversationId },
			include: {
				messages: {
					orderBy: { timestamp: 'asc' }
				},
				homeowner: true,
				tradesperson: true
			}
		});

		if (!conversation) {
			return res.status(404).json({ error: 'Conversation not found' });
		}

		// Verify user is part of this conversation
		if (conversation.homeownerId !== userId && conversation.tradespersonId !== userId) {
			return res.status(403).json({ error: 'Unauthorized' });
		}

		const isHomeowner = conversation.homeownerId === userId;
		const otherUser = isHomeowner ? conversation.tradesperson : conversation.homeowner;

		console.log(`✅ Conversation fetched with ${conversation.messages.length} messages`);

		res.json({
			conversation: {
				id: conversation.id,
				jobId: conversation.jobId,
				jobTitle: conversation.jobTitle,
				homeownerId: conversation.homeownerId,
				tradespersonId: conversation.tradespersonId,
				createdAt: conversation.createdAt,
				updatedAt: conversation.updatedAt,
				messages: conversation.messages,
				otherUser: {
					id: otherUser.id,
					name: otherUser.name,
					avatar: otherUser.avatar,
					type: otherUser.type,
					trades: otherUser.trades
				},
				unreadCount: 0
			}
		});
	} catch (error) {
		console.error('❌ Error fetching conversation:', error);
		res.status(500).json({ error: 'Failed to fetch conversation' });
	}
};

// Get conversation for a specific job and user
export const getConversationByJobAndUser = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const { jobId, otherUserId } = req.params;

		console.log(`📨 Fetching conversation for job ${jobId} and user ${otherUserId}`);

		const conversation = await prisma.conversation.findFirst({
			where: {
				jobId,
				OR: [
					{
						homeownerId: userId,
						tradespersonId: otherUserId
					},
					{
						homeownerId: otherUserId,
						tradespersonId: userId
					}
				]
			},
			include: {
				messages: {
					orderBy: { timestamp: 'asc' }
				},
				homeowner: true,
				tradesperson: true
			}
		});

		if (!conversation) {
			return res.status(404).json({ error: 'Conversation not found' });
		}

		const isHomeowner = conversation.homeownerId === userId;
		const otherUser = isHomeowner ? conversation.tradesperson : conversation.homeowner;

		console.log(`✅ Conversation fetched with ${conversation.messages.length} messages`);

		res.json({
			conversation: {
				id: conversation.id,
				jobId: conversation.jobId,
				jobTitle: conversation.jobTitle,
				homeownerId: conversation.homeownerId,
				tradespersonId: conversation.tradespersonId,
				createdAt: conversation.createdAt,
				updatedAt: conversation.updatedAt,
				messages: conversation.messages,
				otherUser: {
					id: otherUser.id,
					name: otherUser.name,
					avatar: otherUser.avatar,
					type: otherUser.type,
					trades: otherUser.trades
				},
				unreadCount: 0
			}
		});
	} catch (error) {
		console.error('❌ Error fetching conversation:', error);
		res.status(500).json({ error: 'Failed to fetch conversation' });
	}
};

// Mark conversation as read
export const markConversationAsRead = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const { conversationId } = req.params;

		console.log(`📨 Marking conversation ${conversationId} as read for user ${userId}`);

		// Verify user is part of this conversation
		const conversation = await prisma.conversation.findUnique({
			where: { id: conversationId }
		});

		if (!conversation) {
			return res.status(404).json({ error: 'Conversation not found' });
		}

		if (conversation.homeownerId !== userId && conversation.tradespersonId !== userId) {
			return res.status(403).json({ error: 'Unauthorized' });
		}

		// Mark all messages from the other user as read
		const result = await prisma.message.updateMany({
			where: {
				conversationId,
				senderId: { not: userId },
				read: false
			},
			data: { read: true }
		});

		console.log(`✅ Marked ${result.count} messages as read`);

		res.json({ success: true, updatedCount: result.count });
	} catch (error) {
		console.error('❌ Error marking conversation as read:', error);
		res.status(500).json({ error: 'Failed to mark conversation as read' });
	}
};

// Search conversations
export const searchConversations = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const { q } = req.query;

		if (!q || typeof q !== 'string') {
			return res.status(400).json({ error: 'Search query is required' });
		}

		console.log(`🔍 Searching conversations for user ${userId} with query: ${q}`);

		const conversations = await prisma.conversation.findMany({
			where: {
				AND: [
					{
						OR: [
							{ homeownerId: userId },
							{ tradespersonId: userId }
						]
					},
					{
						OR: [
							{ homeowner: { name: { contains: q, mode: 'insensitive' } } },
							{ tradesperson: { name: { contains: q, mode: 'insensitive' } } },
							{ jobTitle: { contains: q, mode: 'insensitive' } }
						]
					}
				]
			},
			include: {
				messages: {
					orderBy: { timestamp: 'desc' },
					take: 1
				},
				homeowner: true,
				tradesperson: true
			},
			orderBy: {
				updatedAt: 'desc'
			}
		});

		console.log(`✅ Found ${conversations.length} matching conversations`);

		// Transform results
		const transformedConversations = conversations.map(conv => {
			const isHomeowner = conv.homeownerId === userId;
			const otherUser = isHomeowner ? conv.tradesperson : conv.homeowner;
			const lastMessage = conv.messages[0] || null;

			return {
				id: conv.id,
				jobId: conv.jobId,
				jobTitle: conv.jobTitle,
				homeownerId: conv.homeownerId,
				tradespersonId: conv.tradespersonId,
				createdAt: conv.createdAt,
				updatedAt: conv.updatedAt,
				messages: [],
				otherUser: {
					id: otherUser.id,
					name: otherUser.name,
					avatar: otherUser.avatar,
					type: otherUser.type,
					trades: otherUser.trades
				},
				lastMessage: lastMessage ? {
					id: lastMessage.id,
					senderId: lastMessage.senderId,
					senderName: lastMessage.senderName,
					content: lastMessage.content,
					timestamp: lastMessage.timestamp,
					read: lastMessage.read
				} : null,
				unreadCount: 0
			};
		});

		res.json({ conversations: transformedConversations });
	} catch (error) {
		console.error('❌ Error searching conversations:', error);
		res.status(500).json({ error: 'Failed to search conversations' });
	}
};
