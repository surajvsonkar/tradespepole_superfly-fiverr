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
	handleWebhook,
	checkDirectoryAccess,
	createSetupIntent,
	getPaymentMethods
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
router.get('/directory-access', authenticateToken, checkDirectoryAccess);
router.post('/setup-intent', authenticateToken, createSetupIntent);
router.get('/payment-methods', authenticateToken, getPaymentMethods);

export default router;

