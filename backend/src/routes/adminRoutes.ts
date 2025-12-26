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
	updateUser,
	getPricing,
	updatePricing,
	getDashboardStats,
	changePassword,
	getBoostPlanPrices,
	updateBoostPlanPrices,
	getDirectoryListings,
	updateDirectoryStatus,
	getSocialMediaLinks,
	updateSocialMediaLinks,
	suspendUser
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
router.patch('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.put('/users/:userId/suspend', suspendUser);

// Transactions
router.get('/transactions', getTransactions);

// Pricing
router.get('/pricing', getPricing);
router.patch('/pricing', updatePricing);

// Password management
router.post('/change-password', changePassword);

// Boost plan prices
router.get('/boost-prices', getBoostPlanPrices);
router.patch('/boost-prices', updateBoostPlanPrices);

// Directory management
router.get('/directory', getDirectoryListings);
router.patch('/directory/:userId', updateDirectoryStatus);

// Social media links
router.get('/social-links', getSocialMediaLinks);
router.patch('/social-links', updateSocialMediaLinks);

export default router;
