import express from 'express';
import {
	getAllConversations,
	getConversation,
	getConversationByJobAndUser,
	markConversationAsRead,
	searchConversations
} from '../controllers/conversationController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

// Protect all routes with authentication
router.use(authenticateToken);

// Get all conversations for the current user
router.get('/', getAllConversations);

// Search conversations
router.get('/search', searchConversations);

// Get specific conversation by ID
router.get('/:conversationId', getConversation);

// Get conversation for a specific job and user
router.get('/job/:jobId/user/:otherUserId', getConversationByJobAndUser);

// Mark conversation as read
router.put('/:conversationId/mark-read', markConversationAsRead);

export default router;
