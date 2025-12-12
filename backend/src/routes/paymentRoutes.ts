import express from 'express';
import {
	createPaymentIntent,
	createSubscription,
	cancelSubscription,
	getPaymentHistory,
	getSubscriptions,
	processRefund,
	purchaseJobLead,
	addCredits,
	confirmTopUp,
	handleWebhook,
	checkDirectoryAccess,
	checkDirectoryListing,
	createSetupIntent,
	getPaymentMethods,
	getBoostPlans,
	purchaseBoostPlan,
	confirmBoostPurchase,
	getMembershipStatus,
	getBalance
} from '../controllers/paymentController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

// Webhook endpoint (must be before JSON parsing middleware for raw body)
// Note: This route needs raw body, so it should be handled specially in app.ts
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.post('/create-payment-intent', authenticateToken, createPaymentIntent);
router.post('/create-subscription', authenticateToken, createSubscription);
router.delete('/subscriptions/:subscriptionId', authenticateToken, cancelSubscription);
router.get('/history', authenticateToken, getPaymentHistory);
router.get('/subscriptions', authenticateToken, getSubscriptions);
router.post('/refund', authenticateToken, processRefund);
router.post('/purchase-job-lead', authenticateToken, purchaseJobLead);
router.post('/add-credits', authenticateToken, addCredits);
router.post('/confirm-topup', authenticateToken, confirmTopUp);
router.get('/directory-access', authenticateToken, checkDirectoryAccess);
router.get('/directory-listing', authenticateToken, checkDirectoryListing);
router.post('/setup-intent', authenticateToken, createSetupIntent);
router.get('/payment-methods', authenticateToken, getPaymentMethods);

// Boost Plan Routes
router.get('/boost-plans', getBoostPlans); // Public - can view plans without auth
router.post('/purchase-boost', authenticateToken, purchaseBoostPlan);
router.post('/confirm-boost', authenticateToken, confirmBoostPurchase);
router.get('/membership-status', authenticateToken, getMembershipStatus);

// Balance Route
router.get('/balance', authenticateToken, getBalance);

export default router;

