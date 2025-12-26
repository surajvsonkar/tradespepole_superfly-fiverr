import { Request, Response } from 'express';
import prisma from '../configs/database';

// Create a new conversation (or return existing one)
export const createConversation = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const { jobId, homeownerId, tradespersonId } = req.body;

		console.log(`📨 Creating conversation for job ${jobId} between ${homeownerId} and ${tradespersonId}`);

		if (!jobId || !homeownerId || !tradespersonId) {
			return res.status(400).json({ error: 'jobId, homeownerId, and tradespersonId are required' });
		}

		// Verify user is part of this conversation
		if (userId !== homeownerId && userId !== tradespersonId) {
			return res.status(403).json({ error: 'Unauthorized to create this conversation' });
		}

		// Check if conversation already exists
		const existingConversation = await prisma.conversation.findFirst({
			where: {
				jobId,
				homeownerId,
				tradespersonId
			},
			include: {
				messages: {
					orderBy: { timestamp: 'desc' },
					take: 1
				},
				homeowner: true,
				tradesperson: true
			}
		});

		if (existingConversation) {
			console.log(`✅ Found existing conversation: ${existingConversation.id}`);
			const isHomeowner = existingConversation.homeownerId === userId;
			const otherUser = isHomeowner ? existingConversation.tradesperson : existingConversation.homeowner;

			return res.status(200).json({
				conversation: {
					id: existingConversation.id,
					jobId: existingConversation.jobId,
					jobTitle: existingConversation.jobTitle,
					homeownerId: existingConversation.homeownerId,
					tradespersonId: existingConversation.tradespersonId,
					createdAt: existingConversation.createdAt,
					updatedAt: existingConversation.updatedAt,
					messages: existingConversation.messages,
					otherUser: {
						id: otherUser.id,
						name: otherUser.name,
						avatar: otherUser.avatar,
						type: otherUser.type,
						trades: otherUser.trades
					},
					unreadCount: 0
				},
				isNew: false
			});
		}

		// Get job details for the title - first check JobLead, then QuoteRequest
		let jobTitle: string | null = null;
		let isQuote = false;
		
		const job = await prisma.jobLead.findUnique({
			where: { id: jobId },
			select: { title: true }
		});

		if (job) {
			jobTitle = job.title;
		} else {
			// Check if it's a quote request instead
			const quote = await prisma.quoteRequest.findUnique({
				where: { id: jobId },
				select: { projectTitle: true }
			});
			
			if (quote) {
				jobTitle = quote.projectTitle;
				isQuote = true;
			}
		}

		if (!jobTitle) {
			return res.status(404).json({ error: 'Job or Quote not found' });
		}

		// Verify both users exist
		const [homeowner, tradesperson] = await Promise.all([
			prisma.user.findUnique({ where: { id: homeownerId } }),
			prisma.user.findUnique({ where: { id: tradespersonId } })
		]);

		if (!homeowner || !tradesperson) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Create new conversation - use jobId or quoteId based on what we found
		const newConversation = await prisma.conversation.create({
			data: {
				jobId: isQuote ? null : jobId,
				quoteId: isQuote ? jobId : null,
				jobTitle,
				homeownerId,
				tradespersonId
			},
			include: {
				homeowner: true,
				tradesperson: true
			}
		});

		console.log(`✅ Created new conversation: ${newConversation.id}`);

		const isHomeowner = newConversation.homeownerId === userId;
		const otherUser = isHomeowner ? newConversation.tradesperson : newConversation.homeowner;

		res.status(201).json({
			conversation: {
				id: newConversation.id,
				jobId: newConversation.jobId,
				jobTitle: newConversation.jobTitle,
				homeownerId: newConversation.homeownerId,
				tradespersonId: newConversation.tradespersonId,
				createdAt: newConversation.createdAt,
				updatedAt: newConversation.updatedAt,
				messages: [],
				otherUser: {
					id: otherUser.id,
					name: otherUser.name,
					avatar: otherUser.avatar,
					type: otherUser.type,
					trades: otherUser.trades
				},
				unreadCount: 0
			},
			isNew: true
		});
	} catch (error) {
		console.error('❌ Error creating conversation:', error);
		res.status(500).json({ error: 'Failed to create conversation' });
	}
};

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
