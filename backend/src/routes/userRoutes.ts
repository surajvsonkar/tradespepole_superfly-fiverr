import express from 'express';
import {
  getUserById,
  updateProfile,
  getTradespeople,
  updateMembership,
  updateCredits,
  manageDirectoryListing
} from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/tradespeople', getTradespeople);
router.get('/:id', getUserById);

// Protected routes
router.put('/profile', authenticateToken, updateProfile);
router.put('/membership', authenticateToken, updateMembership);
router.put('/credits', authenticateToken, updateCredits);
router.post('/directory/manage', authenticateToken, manageDirectoryListing);

export default router;
