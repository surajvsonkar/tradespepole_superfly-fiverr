import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
	adminLogin,
	forgotPassword,
	resetPassword,
	getAllHomeowners,
	getAllTradespeople,
	getAnalytics,
	getTransactions,
	updateUserStatus,
	deleteUser,
	updatePricing,
	getDashboardStats,
	changePassword,
	getBoostPlanPrices,
	updateBoostPlanPrices
} from '../controllers/adminController';

const router = Router();

// Public admin routes
router.post('/login', adminLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(authMiddleware);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Analytics
router.get('/analytics', getAnalytics);

// User management
router.get('/homeowners', getAllHomeowners);
router.get('/tradespeople', getAllTradespeople);
router.patch('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);

// Transactions
router.get('/transactions', getTransactions);

// Pricing
router.patch('/pricing', updatePricing);

// Password management
router.post('/change-password', changePassword);

// Boost plan prices
router.get('/boost-prices', getBoostPlanPrices);
router.patch('/boost-prices', updateBoostPlanPrices);

export default router;
