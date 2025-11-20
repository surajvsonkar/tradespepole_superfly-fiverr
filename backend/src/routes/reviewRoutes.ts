import express from 'express';
import {
  createReview,
  getUserReviews,
  getReviewById,
  getRecentReviews
} from '../controllers/reviewController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/recent', getRecentReviews);
router.get('/user/:id', getUserReviews);
router.get('/:id', getReviewById);

// Protected routes
router.post('/', authenticateToken, createReview);

export default router;
