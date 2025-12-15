import { apiClient } from '../lib/apiClient';
import { Conversation, Message, User } from '../types';

export interface ConversationWithUser extends Conversation {
	otherUser?: User;
	lastMessage?: Message;
	unreadCount: number;
}

export const conversationService = {
	// Create a new conversation (or get existing one)
	createConversation: async (data: {
		jobId: string;
		homeownerId: string;
		tradespersonId: string;
	}): Promise<{ conversation: ConversationWithUser; isNew: boolean }> => {
		try {
			console.log('📨 Creating conversation...', data);
			const response = await apiClient.post('/conversations', data);
			console.log('✅ Conversation created:', response);
			return response;
		} catch (error) {
			console.error('❌ Error creating conversation:', error);
			throw error;
		}
	},

	// Fetch all conversations for the current user
	getAllConversations: async (): Promise<ConversationWithUser[]> => {
		try {
			console.log('📨 Fetching all conversations...');
			const response = await apiClient.get('/conversations');
			console.log('✅ Conversations fetched:', response);
			return response.conversations || [];
		} catch (error) {
			console.error('❌ Error fetching conversations:', error);
			throw error;
		}
	},

	// Fetch a specific conversation with all messages
	getConversation: async (conversationId: string): Promise<Conversation> => {
		try {
			console.log(`📨 Fetching conversation: ${conversationId}`);
			const response = await apiClient.get(`/conversations/${conversationId}`);
			console.log('✅ Conversation fetched:', response);
			return response.conversation;
		} catch (error) {
			console.error(`❌ Error fetching conversation ${conversationId}:`, error);
			throw error;
		}
	},

	// Get conversations with a specific user for a specific job
	getConversationByJobAndUser: async (
		jobId: string,
		otherUserId: string
	): Promise<Conversation> => {
		try {
			console.log(`📨 Fetching conversation for job ${jobId} and user ${otherUserId}`);
			const response = await apiClient.get(
				`/conversations/job/${jobId}/user/${otherUserId}`
			);
			console.log('✅ Conversation fetched:', response);
			return response.conversation;
		} catch (error) {
			console.error('❌ Error fetching conversation:', error);
			throw error;
		}
	},

	// Mark conversation as read
	markConversationAsRead: async (conversationId: string): Promise<void> => {
		try {
			console.log(`📨 Marking conversation as read: ${conversationId}`);
			await apiClient.put(`/conversations/${conversationId}/mark-read`);
			console.log('✅ Conversation marked as read');
		} catch (error) {
			console.error('❌ Error marking conversation as read:', error);
			throw error;
		}
	},

	// Search conversations by user name
	searchConversations: async (query: string): Promise<ConversationWithUser[]> => {
		try {
			console.log(`🔍 Searching conversations: ${query}`);
			const response = await apiClient.get(`/conversations/search?q=${encodeURIComponent(query)}`);
			console.log('✅ Search results:', response);
			return response.conversations || [];
		} catch (error) {
			console.error('❌ Error searching conversations:', error);
			throw error;
		}
	},
};
