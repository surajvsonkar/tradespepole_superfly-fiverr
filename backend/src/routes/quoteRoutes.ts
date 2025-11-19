import express from 'express';
import {
  createQuoteRequest,
  getQuoteRequests,
  getQuoteRequestById,
  getMyQuoteRequests,
  submitQuoteResponse,
  updateQuoteResponseStatus,
  deleteQuoteRequest
} from '../controllers/quoteController';
import { authenticateToken, requireHomeowner, requireTradesperson } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getQuoteRequests);
router.get('/:id', getQuoteRequestById);

// Protected routes - Homeowner
router.post('/', authenticateToken, requireHomeowner, createQuoteRequest);
router.get('/my/requests', authenticateToken, requireHomeowner, getMyQuoteRequests);
router.delete('/:id', authenticateToken, requireHomeowner, deleteQuoteRequest);
router.put('/:quoteId/responses/:responseId/status', authenticateToken, requireHomeowner, updateQuoteResponseStatus);

// Protected routes - Tradesperson
router.post('/:id/respond', authenticateToken, requireTradesperson, submitQuoteResponse);

export default router;
