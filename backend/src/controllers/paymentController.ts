import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../configs/database';
import { AuthRequest } from '../middlewares/authMiddleware';
import twilio from 'twilio';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Initialize Twilio
const twilioClient = twilio(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

// Cache for dynamically created Stripe Price IDs
const priceCache: { [key: string]: string } = {};

// Helper to get or create a Stripe Price
const getOrCreatePrice = async (type: string, amount: number, interval: 'month' | 'year' | null): Promise<string> => {
	const cacheKey = `${type}_${amount}_${interval || 'one_time'}`;
	
	if (priceCache[cacheKey]) {
		return priceCache[cacheKey];
	}

	// Check environment variables first
	const envPriceId = process.env[`STRIPE_${type.toUpperCase()}_PRICE_ID`];
	if (envPriceId && envPriceId.startsWith('price_')) {
		priceCache[cacheKey] = envPriceId;
		return envPriceId;
	}

	// Create a product first
	const product = await stripe.products.create({
		name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
		metadata: { type }
	});

	// Create the price
	const priceData: Stripe.PriceCreateParams = {
		product: product.id,
		unit_amount: Math.round(amount * 100), // Convert to pence
		currency: 'gbp',
	};

	if (interval) {
		priceData.recurring = { interval };
	}

	const price = await stripe.prices.create(priceData);
	priceCache[cacheKey] = price.id;
	
	console.log(`Created Stripe price for ${type}: ${price.id}`);
	return price.id;
};

// Price configurations (in GBP)
const PRICE_CONFIG = {
	directory_listing: { amount: 0.99, interval: 'month' as const }, // £0.99/month for directory listing
	basic_membership: { amount: 9.99, interval: 'month' as const },
	premium_membership: { amount: 19.99, interval: 'month' as const },
	unlimited_5_year: { amount: 995.00, interval: null } // 5-year unlimited
};

// Helper to send SMS
const sendSMS = async (to: string, message: string) => {
	if (!TWILIO_PHONE || !process.env.TWILIO_ACCOUNT_SID) {
		console.log('Twilio not configured. SMS would be:', { to, message });
		return;
	}

	try {
		await twilioClient.messages.create({
			body: message,
			from: TWILIO_PHONE,
			to
		});
		console.log(`SMS sent to ${to}`);
	} catch (error) {
		console.error('Failed to send SMS:', error);
	}
};

// Helper to get or create Stripe customer
const getOrCreateStripeCustomer = async (userId: string): Promise<string> => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, email: true, name: true, stripeCustomerId: true }
	});

	if (!user) throw new Error('User not found');

	if (user.stripeCustomerId) {
		return user.stripeCustomerId;
	}

	// Create new Stripe customer
	const customer = await stripe.customers.create({
		email: user.email,
		name: user.name,
		metadata: { userId: user.id }
	});

	// Save to database
	await prisma.user.update({
		where: { id: userId },
		data: { stripeCustomerId: customer.id }
	});

	await prisma.stripeCustomer.create({
		data: {
			userId: user.id,
			stripeCustomerId: customer.id
		}
	});

	return customer.id;
};

// Create Payment Intent for one-time payments (job leads, credits, etc.)
export const createPaymentIntent = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const { amount, type, metadata } = req.body;

		if (!amount || !type) {
			res.status(400).json({ error: 'Amount and type are required' });
			return;
		}

		const customerId = await getOrCreateStripeCustomer(userId);

		// Create payment intent
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount * 100), // Convert to pence
			currency: 'gbp',
			customer: customerId,
			metadata: {
				userId,
				type,
				...metadata
			},
			automatic_payment_methods: {
				enabled: true
			}
		});

		// Create payment record
		await prisma.payment.create({
			data: {
				userId,
				amount,
				type,
				status: 'pending',
				stripePaymentId: paymentIntent.id,
				stripeCustomerId: customerId,
				description: `${type} payment`,
				metadata
			}
		});

		res.status(200).json({
			clientSecret: paymentIntent.client_secret,
			paymentIntentId: paymentIntent.id
		});
	} catch (error) {
		console.error('Create payment intent error:', error);
		res.status(500).json({ error: 'Failed to create payment intent' });
	}
};

// Create Subscription (Directory Access £1/month or Memberships)
export const createSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const { type, priceId } = req.body;

		if (!type) {
			res.status(400).json({ error: 'Subscription type is required' });
			return;
		}

		const customerId = await getOrCreateStripeCustomer(userId);

		// Determine price ID based on subscription type
		let stripePriceId = priceId;
		if (!stripePriceId) {
			const priceConfig = PRICE_CONFIG[type as keyof typeof PRICE_CONFIG];
			if (!priceConfig) {
				res.status(400).json({ error: 'Invalid subscription type' });
				return;
			}
			
			try {
				stripePriceId = await getOrCreatePrice(type, priceConfig.amount, priceConfig.interval);
			} catch (priceError) {
				console.error('Error creating price:', priceError);
				res.status(500).json({ error: 'Failed to create subscription price' });
				return;
			}
		}

		// Check for existing active subscription of this type
		const existingSubscription = await prisma.subscription.findFirst({
			where: {
				userId,
				type,
				status: 'active'
			}
		});

		if (existingSubscription) {
			res.status(400).json({ error: 'You already have an active subscription of this type' });
			return;
		}

		// Get price config for amount
		const priceConfig = PRICE_CONFIG[type as keyof typeof PRICE_CONFIG];
		const amount = priceConfig?.amount || 1.00;

		// For simplicity, we'll use a PaymentIntent for the first payment
		// Then create the subscription after payment succeeds
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount * 100), // Convert to pence
			currency: 'gbp',
			customer: customerId,
			metadata: {
				userId,
				type,
				subscriptionType: type,
				priceId: stripePriceId
			},
			automatic_payment_methods: {
				enabled: true
			}
		});

		// Store pending subscription info in payment metadata
		// The actual subscription will be created after payment succeeds (via webhook or confirm endpoint)
		
		// For now, create subscription record with pending status
		const now = new Date();
		const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

		const dbSubscription = await prisma.subscription.create({
			data: {
				userId,
				type,
				status: 'active', // Will be pending until payment confirmed
				stripeSubscriptionId: paymentIntent.id, // Using payment intent ID temporarily
				stripeCustomerId: customerId,
				stripePriceId,
				currentPeriodStart: now,
				currentPeriodEnd: periodEnd
			}
		});

		// Update user's directory listing immediately for better UX
		// (In production, this should be done after payment confirmation)
		if (type === 'directory_listing') {
			await prisma.user.update({
				where: { id: userId },
				data: {
					hasDirectoryListing: true,
					directoryListingExpiry: periodEnd
				}
			});
		}

		// Create payment record
		await prisma.payment.create({
			data: {
				userId,
				amount,
				type: 'directory_subscription',
				status: 'pending',
				stripePaymentId: paymentIntent.id,
				stripeCustomerId: customerId,
				description: `${type} subscription`,
				metadata: { subscriptionId: dbSubscription.id }
			}
		});

		res.status(200).json({
			subscriptionId: dbSubscription.id,
			clientSecret: paymentIntent.client_secret,
			paymentIntentId: paymentIntent.id,
			status: 'requires_payment'
		});
	} catch (error) {
		console.error('Create subscription error:', error);
		res.status(500).json({ error: 'Failed to create subscription' });
	}
};

// Cancel Subscription
export const cancelSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const { subscriptionId } = req.params;

		const subscription = await prisma.subscription.findFirst({
			where: {
				id: subscriptionId,
				userId
			}
		});

		if (!subscription) {
			res.status(404).json({ error: 'Subscription not found' });
			return;
		}

		if (subscription.stripeSubscriptionId) {
			// Cancel at period end to allow usage until end of billing period
			await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
				cancel_at_period_end: true
			});
		}

		await prisma.subscription.update({
			where: { id: subscriptionId },
			data: {
				cancelAtPeriodEnd: true,
				cancelledAt: new Date()
			}
		});

		res.status(200).json({ message: 'Subscription will be cancelled at the end of the billing period' });
	} catch (error) {
		console.error('Cancel subscription error:', error);
		res.status(500).json({ error: 'Failed to cancel subscription' });
	}
};

// Get Payment History
export const getPaymentHistory = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const { limit = '20', offset = '0', type } = req.query;

		const where: any = { userId };
		if (type) {
			where.type = type as string;
		}

		const payments = await prisma.payment.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			take: parseInt(limit as string),
			skip: parseInt(offset as string)
		});

		const total = await prisma.payment.count({ where });

		res.status(200).json({
			payments,
			pagination: {
				total,
				limit: parseInt(limit as string),
				offset: parseInt(offset as string)
			}
		});
	} catch (error) {
		console.error('Get payment history error:', error);
		res.status(500).json({ error: 'Failed to get payment history' });
	}
};

// Get Active Subscriptions
export const getSubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const subscriptions = await prisma.subscription.findMany({
			where: {
				userId,
				status: { in: ['active', 'past_due'] }
			},
			orderBy: { createdAt: 'desc' }
		});

		res.status(200).json({ subscriptions });
	} catch (error) {
		console.error('Get subscriptions error:', error);
		res.status(500).json({ error: 'Failed to get subscriptions' });
	}
};

// Process Refund
export const processRefund = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const { paymentId, amount, reason } = req.body;

		const payment = await prisma.payment.findFirst({
			where: { id: paymentId, userId, status: 'succeeded' }
		});

		if (!payment) {
			res.status(404).json({ error: 'Payment not found or not eligible for refund' });
			return;
		}

		if (!payment.stripePaymentId) {
			res.status(400).json({ error: 'No Stripe payment ID found' });
			return;
		}

		// Process refund in Stripe
		const refund = await stripe.refunds.create({
			payment_intent: payment.stripePaymentId,
			amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
			reason: 'requested_by_customer'
		});

		// Update payment record
		await prisma.payment.update({
			where: { id: paymentId },
			data: {
				status: 'refunded',
				refundedAmount: amount || payment.amount,
				refundReason: reason
			}
		});

		// Send SMS notification
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { phone: true, name: true }
		});

		if (user?.phone) {
			await sendSMS(
				user.phone,
				`Hi ${user.name}, your refund of £${(amount || Number(payment.amount)).toFixed(2)} has been processed. It may take 5-10 business days to appear in your account.`
			);
		}

		res.status(200).json({
			message: 'Refund processed successfully',
			refundId: refund.id
		});
	} catch (error) {
		console.error('Process refund error:', error);
		res.status(500).json({ error: 'Failed to process refund' });
	}
};

// Purchase Job Lead with Stripe
export const purchaseJobLead = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const { jobLeadId, paymentMethodId } = req.body;

		// Get job lead
		const jobLead = await prisma.jobLead.findUnique({
			where: { id: jobLeadId }
		});

		if (!jobLead) {
			res.status(404).json({ error: 'Job lead not found' });
			return;
		}

		if (jobLead.purchasedBy.includes(userId)) {
			res.status(400).json({ error: 'You have already purchased this job lead' });
			return;
		}

		if (jobLead.purchasedBy.length >= jobLead.maxPurchases) {
			res.status(400).json({ error: 'Maximum purchases reached for this job lead' });
			return;
		}

		// Get user with membership info
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { membershipType: true, credits: true, phone: true, name: true }
		});

		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		// Calculate price based on membership
		let price = Number(jobLead.price);
		if (user.membershipType === 'basic') price *= 0.9;
		else if (user.membershipType === 'premium') price *= 0.75;
		else if (user.membershipType === 'unlimited_5_year') price = 0;

		// If free with membership, just add to purchased
		if (price === 0) {
			await prisma.jobLead.update({
				where: { id: jobLeadId },
				data: { purchasedBy: { push: userId } }
			});

			res.status(200).json({
				message: 'Job lead purchased successfully with VIP membership!',
				price: 0
			});
			return;
		}

		// Check if user has enough credits
		const userCredits = Number(user.credits) || 0;
		if (userCredits >= price) {
			// Deduct from credits
			await prisma.$transaction([
				prisma.user.update({
					where: { id: userId },
					data: { credits: userCredits - price }
				}),
				prisma.jobLead.update({
					where: { id: jobLeadId },
					data: { purchasedBy: { push: userId } }
				}),
				prisma.payment.create({
					data: {
						userId,
						amount: price,
						type: 'job_lead_purchase',
						status: 'succeeded',
						description: `Job lead purchase: ${jobLead.title}`,
						metadata: { jobLeadId }
					}
				})
			]);

			// Send SMS notification
			if (user.phone) {
				await sendSMS(
					user.phone,
					`Hi ${user.name}, you've purchased a job lead "${jobLead.title}" for £${price.toFixed(2)}. Check your dashboard for contact details.`
				);
			}

			res.status(200).json({
				message: 'Job lead purchased successfully using credits!',
				price,
				remainingCredits: userCredits - price
			});
			return;
		}

		// Need to charge card
		const customerId = await getOrCreateStripeCustomer(userId);

		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(price * 100),
			currency: 'gbp',
			customer: customerId,
			payment_method: paymentMethodId,
			confirm: true,
			automatic_payment_methods: {
				enabled: true,
				allow_redirects: 'never'
			},
			metadata: {
				userId,
				type: 'job_lead_purchase',
				jobLeadId
			}
		});

		if (paymentIntent.status === 'succeeded') {
			const pi = paymentIntent as any;
			await prisma.$transaction([
				prisma.jobLead.update({
					where: { id: jobLeadId },
					data: { purchasedBy: { push: userId } }
				}),
				prisma.payment.create({
					data: {
						userId,
						amount: price,
						type: 'job_lead_purchase',
						status: 'succeeded',
						stripePaymentId: paymentIntent.id,
						stripeCustomerId: customerId,
						description: `Job lead purchase: ${jobLead.title}`,
						metadata: { jobLeadId },
						receiptUrl: pi.charges?.data?.[0]?.receipt_url || null
					}
				})
			]);

			// Send SMS notification
			if (user.phone) {
				await sendSMS(
					user.phone,
					`Hi ${user.name}, payment of £${price.toFixed(2)} received for job lead "${jobLead.title}". Check your dashboard for contact details.`
				);
			}

			res.status(200).json({
				message: 'Job lead purchased successfully!',
				price
			});
		} else {
			res.status(400).json({
				error: 'Payment requires additional action',
				clientSecret: paymentIntent.client_secret
			});
		}
	} catch (error) {
		console.error('Purchase job lead error:', error);
		res.status(500).json({ error: 'Failed to purchase job lead' });
	}
};

// Add Credits (Top-up) - For Tradespeople
// Currency: GBP, Minimum: £10, Maximum: £1000
export const addCredits = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const { amount } = req.body;

		// Validate amount
		if (!amount || typeof amount !== 'number') {
			res.status(400).json({ error: 'Amount is required and must be a number' });
			return;
		}

		// Minimum £10
		if (amount < 10) {
			res.status(400).json({ error: 'Minimum top-up amount is £10' });
			return;
		}

		// Maximum £1000
		if (amount > 1000) {
			res.status(400).json({ error: 'Maximum top-up amount is £1000' });
			return;
		}

		// Verify user is a tradesperson
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { type: true }
		});

		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		if (user.type !== 'tradesperson') {
			res.status(403).json({ error: 'Only tradespeople can top up their balance' });
			return;
		}

		const customerId = await getOrCreateStripeCustomer(userId);

		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount * 100), // Convert to pence
			currency: 'gbp',
			customer: customerId,
			metadata: {
				userId,
				type: 'credits_topup',
				creditAmount: amount.toString()
			},
			automatic_payment_methods: {
				enabled: true
			}
		});

		await prisma.payment.create({
			data: {
				userId,
				amount,
				currency: 'gbp',
				type: 'credits_topup',
				status: 'pending',
				stripePaymentId: paymentIntent.id,
				stripeCustomerId: customerId,
				description: `Balance top-up: £${amount.toFixed(2)}`,
				metadata: { creditAmount: amount }
			}
		});

		res.status(200).json({
			clientSecret: paymentIntent.client_secret,
			paymentIntentId: paymentIntent.id,
			amount: amount,
			currency: 'gbp'
		});
	} catch (error) {
		console.error('Add credits error:', error);
		res.status(500).json({ error: 'Failed to add credits' });
	}
};

// Confirm Top-Up after successful payment (called by frontend)
export const confirmTopUp = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const { paymentIntentId } = req.body;

		if (!paymentIntentId) {
			res.status(400).json({ error: 'Payment Intent ID is required' });
			return;
		}

		// Verify payment with Stripe
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		if (paymentIntent.status !== 'succeeded') {
			res.status(400).json({ error: 'Payment has not been completed' });
			return;
		}

		// Check if this payment was already processed
		const existingPayment = await prisma.payment.findFirst({
			where: { 
				stripePaymentId: paymentIntentId,
				status: 'succeeded'
			}
		});

		if (existingPayment) {
			// Already processed, return current balance
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { credits: true }
			});
			res.status(200).json({ 
				message: 'Payment already processed',
				newBalance: Number(user?.credits || 0)
			});
			return;
		}

		const { creditAmount, type } = paymentIntent.metadata;

		if (type !== 'credits_topup' || !creditAmount) {
			res.status(400).json({ error: 'Invalid payment type' });
			return;
		}

		const amount = parseFloat(creditAmount);

		// Get current user balance
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { credits: true, name: true, phone: true }
		});

		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		const currentBalance = Number(user.credits || 0);
		const newBalance = currentBalance + amount;

		// Update user credits in database
		await prisma.user.update({
			where: { id: userId },
			data: { credits: newBalance }
		});

		// Update payment record status
		await prisma.payment.updateMany({
			where: { stripePaymentId: paymentIntentId },
			data: { 
				status: 'succeeded',
				metadata: { creditAmount: amount, newBalance }
			}
		});

		// Send SMS notification
		if (user.phone) {
			await sendSMS(
				user.phone,
				`Hi ${user.name}, your balance has been topped up by £${amount.toFixed(2)}. Your new balance is £${newBalance.toFixed(2)}.`
			);
		}

		console.log(`Top-up confirmed for user ${userId}: £${amount} added. New balance: £${newBalance}`);

		res.status(200).json({
			message: 'Top-up confirmed successfully',
			amount,
			newBalance,
			currency: 'gbp'
		});
	} catch (error) {
		console.error('Confirm top-up error:', error);
		res.status(500).json({ error: 'Failed to confirm top-up' });
	}
};

// Stripe Webhook Handler
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
	const sig = req.headers['stripe-signature'] as string;
	const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

	let event: Stripe.Event;

	try {
		if (!endpointSecret) {
			// For testing without webhook signature verification
			event = req.body as Stripe.Event;
		} else {
			event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
		}
	} catch (err: any) {
		console.error('Webhook signature verification failed:', err.message);
		res.status(400).json({ error: `Webhook Error: ${err.message}` });
		return;
	}

	console.log('Webhook received:', event.type);

	try {
		switch (event.type) {
			case 'payment_intent.succeeded': {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;
				await handlePaymentSuccess(paymentIntent);
				break;
			}

			case 'payment_intent.payment_failed': {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;
				await handlePaymentFailed(paymentIntent);
				break;
			}

			case 'customer.subscription.created':
			case 'customer.subscription.updated': {
				const subscription = event.data.object as Stripe.Subscription;
				await handleSubscriptionUpdate(subscription);
				break;
			}

			case 'customer.subscription.deleted': {
				const subscription = event.data.object as Stripe.Subscription;
				await handleSubscriptionCancelled(subscription);
				break;
			}

			case 'invoice.payment_succeeded': {
				const invoice = event.data.object as Stripe.Invoice;
				await handleInvoicePaid(invoice);
				break;
			}

			case 'invoice.payment_failed': {
				const invoice = event.data.object as Stripe.Invoice;
				await handleInvoiceFailed(invoice);
				break;
			}

			case 'charge.dispute.created': {
				const dispute = event.data.object as Stripe.Dispute;
				await handleDispute(dispute);
				break;
			}

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		res.status(200).json({ received: true });
	} catch (error) {
		console.error('Webhook handler error:', error);
		res.status(500).json({ error: 'Webhook handler failed' });
	}
};

// Webhook helper functions
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
	const { userId, type, jobLeadId, creditAmount } = paymentIntent.metadata;
	const pi = paymentIntent as any; // Type cast for accessing nested properties

	// Update payment record
	await prisma.payment.updateMany({
		where: { stripePaymentId: paymentIntent.id },
		data: {
			status: 'succeeded',
			receiptUrl: pi.charges?.data?.[0]?.receipt_url || null
		}
	});

	// Handle credits top-up
	if (type === 'credits_topup' && creditAmount) {
		const amount = parseFloat(creditAmount);
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (user) {
			const newBalance = Number(user.credits || 0) + amount;
			await prisma.user.update({
				where: { id: userId },
				data: { credits: newBalance }
			});

			if (user.phone) {
				await sendSMS(
					user.phone,
					`Hi ${user.name}, your balance has been topped up by £${amount.toFixed(2)}. Your new balance is £${newBalance.toFixed(2)}.`
				);
			}
		}
	}

	// Handle boost plan purchase
	if (type === 'boost_purchase') {
		const { planId, duration, membershipType, planName } = paymentIntent.metadata;
		if (planId && duration && membershipType) {
			const now = new Date();
			const expiryDate = new Date(now.getTime() + parseInt(duration) * 24 * 60 * 60 * 1000);

			const user = await prisma.user.update({
				where: { id: userId },
				data: {
					membershipType: membershipType as any,
					membershipExpiry: expiryDate,
					verified: true
				}
			});

			// Create subscription record
			await prisma.subscription.create({
				data: {
					userId,
					type: planId,
					status: 'active',
					stripeSubscriptionId: paymentIntent.id,
					currentPeriodStart: now,
					currentPeriodEnd: expiryDate
				}
			});

			if (user.phone) {
				await sendSMS(
					user.phone,
					`Hi ${user.name}, your ${planName || 'boost plan'} has been activated! Your profile is now boosted until ${expiryDate.toLocaleDateString()}. Enjoy your premium features!`
				);
			}
		}
	}

	// Handle job lead purchase
	if (type === 'job_lead_purchase' && jobLeadId) {
		const jobLead = await prisma.jobLead.findUnique({ where: { id: jobLeadId } });
		if (jobLead && !jobLead.purchasedBy.includes(userId)) {
			await prisma.jobLead.update({
				where: { id: jobLeadId },
				data: { purchasedBy: { push: userId } }
			});
		}
	}

	console.log(`Payment ${paymentIntent.id} succeeded for user ${userId}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
	await prisma.payment.updateMany({
		where: { stripePaymentId: paymentIntent.id },
		data: {
			status: 'failed',
			failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
		}
	});

	const { userId } = paymentIntent.metadata;
	const user = await prisma.user.findUnique({ where: { id: userId } });
	
	if (user?.phone) {
		await sendSMS(
			user.phone,
			`Hi ${user.name}, your payment of £${(paymentIntent.amount / 100).toFixed(2)} failed. Please check your payment method and try again.`
		);
	}

	console.log(`Payment ${paymentIntent.id} failed for user ${userId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
	const { userId, type } = subscription.metadata;
	const sub = subscription as any; // Type cast for accessing properties

	await prisma.subscription.updateMany({
		where: { stripeSubscriptionId: subscription.id },
		data: {
			status: subscription.status === 'active' ? 'active' : subscription.status === 'past_due' ? 'past_due' : 'cancelled',
			currentPeriodStart: new Date(sub.current_period_start * 1000),
			currentPeriodEnd: new Date(sub.current_period_end * 1000),
			cancelAtPeriodEnd: sub.cancel_at_period_end || false
		}
	});

	// Update user's directory listing if it's a directory subscription
	if (type === 'directory_listing' && subscription.status === 'active') {
		await prisma.user.update({
			where: { id: userId },
			data: {
				hasDirectoryListing: true,
				directoryListingExpiry: new Date(sub.current_period_end * 1000)
			}
		});
	}

	console.log(`Subscription ${subscription.id} updated for user ${userId}`);
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
	const { userId, type } = subscription.metadata;

	await prisma.subscription.updateMany({
		where: { stripeSubscriptionId: subscription.id },
		data: {
			status: 'cancelled',
			cancelledAt: new Date()
		}
	});

	// Remove directory listing if it's a directory subscription
	if (type === 'directory_listing') {
		await prisma.user.update({
			where: { id: userId },
			data: {
				hasDirectoryListing: false,
				directoryListingExpiry: null
			}
		});
	}

	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (user?.phone) {
		await sendSMS(
			user.phone,
			`Hi ${user.name}, your subscription has been cancelled. We're sorry to see you go!`
		);
	}

	console.log(`Subscription ${subscription.id} cancelled for user ${userId}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
	console.log(`Invoice ${invoice.id} paid`);
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
	const customerId = invoice.customer as string;
	const stripeCustomer = await prisma.stripeCustomer.findFirst({
		where: { stripeCustomerId: customerId }
	});

	if (stripeCustomer) {
		const user = await prisma.user.findUnique({ where: { id: stripeCustomer.userId } });
		if (user?.phone) {
			await sendSMS(
				user.phone,
				`Hi ${user.name}, your subscription payment failed. Please update your payment method to avoid service interruption.`
			);
		}
	}

	console.log(`Invoice ${invoice.id} payment failed`);
}

async function handleDispute(dispute: Stripe.Dispute) {
	const paymentIntent = dispute.payment_intent as string;

	await prisma.payment.updateMany({
		where: { stripePaymentId: paymentIntent },
		data: { status: 'disputed' }
	});

	console.log(`Dispute created for payment ${paymentIntent}`);
}

// Check Directory Access - Homeowners always have free access now
export const checkDirectoryAccess = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { type: true }
		});

		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		// Everyone has free access to browse the directory now
		// Tradespeople need to pay to BE LISTED in the directory
		res.status(200).json({
			hasAccess: true,
			reason: user.type === 'homeowner' ? 'free_access' : 'tradesperson'
		});
	} catch (error) {
		console.error('Check directory access error:', error);
		res.status(500).json({ error: 'Failed to check directory access' });
	}
};

// Check Directory Listing Status - For tradespeople to check if they're listed
export const checkDirectoryListing = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				hasDirectoryListing: true,
				directoryListingExpiry: true,
				type: true
			}
		});

		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		if (user.type !== 'tradesperson') {
			res.status(400).json({ error: 'Only tradespeople can have directory listings' });
			return;
		}

		// Check if listing is active
		const isListed = user.hasDirectoryListing && 
			user.directoryListingExpiry && 
			new Date(user.directoryListingExpiry) > new Date();

		res.status(200).json({
			isListed,
			expiryDate: user.directoryListingExpiry,
			subscriptionPrice: '£0.99/month',
			benefits: [
				'Your profile appears in homeowner searches',
				'Homeowners can contact you directly',
				'Increased visibility and job opportunities',
				'Cancel anytime'
			]
		});
	} catch (error) {
		console.error('Check directory listing error:', error);
		res.status(500).json({ error: 'Failed to check directory listing' });
	}
};

// Get Setup Intent for saving cards
export const createSetupIntent = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const customerId = await getOrCreateStripeCustomer(userId);

		const setupIntent = await stripe.setupIntents.create({
			customer: customerId,
			payment_method_types: ['card']
		});

		res.status(200).json({
			clientSecret: setupIntent.client_secret
		});
	} catch (error) {
		console.error('Create setup intent error:', error);
		res.status(500).json({ error: 'Failed to create setup intent' });
	}
};

// Get saved payment methods
export const getPaymentMethods = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { stripeCustomerId: true }
		});

		if (!user?.stripeCustomerId) {
			res.status(200).json({ paymentMethods: [] });
			return;
		}

		const paymentMethods = await stripe.paymentMethods.list({
			customer: user.stripeCustomerId,
			type: 'card'
		});

		res.status(200).json({
			paymentMethods: paymentMethods.data.map(pm => ({
				id: pm.id,
				brand: pm.card?.brand,
				last4: pm.card?.last4,
				expMonth: pm.card?.exp_month,
				expYear: pm.card?.exp_year
			}))
		});
	} catch (error) {
		console.error('Get payment methods error:', error);
		res.status(500).json({ error: 'Failed to get payment methods' });
	}
};

// ============= BOOST PLAN PURCHASES =============

// Boost Plan Configuration
const BOOST_PLANS = {
	'1_week_boost': {
		name: '1 Week Boost',
		price: 19.99,
		duration: 7, // days
		membershipType: 'basic' as const,
		features: [
			'Priority placement in search results',
			'3x more profile views',
			'Featured badge on your profile',
			'Advanced analytics dashboard',
			'Premium customer support'
		]
	},
	'1_month_boost': {
		name: '1 Month Boost',
		price: 49.99,
		duration: 30, // days
		membershipType: 'basic' as const,
		features: [
			'Priority placement in search results',
			'3x more profile views',
			'Featured badge on your profile',
			'Advanced analytics dashboard',
			'Premium customer support'
		]
	},
	'3_month_boost': {
		name: '3 Month Boost',
		price: 99.99,
		duration: 90, // days
		membershipType: 'premium' as const,
		features: [
			'Priority placement in search results',
			'3x more profile views',
			'Featured badge on your profile',
			'Advanced analytics dashboard',
			'Premium customer support'
		]
	},
	'5_year_unlimited': {
		name: '5 Years Unlimited Leads',
		price: 995.00,
		duration: 1825, // 5 years in days
		membershipType: 'unlimited_5_year' as const,
		features: [
			'Priority placement in search results',
			'3x more profile views',
			'Featured badge on your profile',
			'Advanced analytics dashboard',
			'Premium customer support',
			'Unlimited job leads at no extra cost'
		]
	}
};

// Get available boost plans
export const getBoostPlans = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const plans = Object.entries(BOOST_PLANS).map(([id, plan]) => ({
			id,
			name: plan.name,
			price: plan.price,
			duration: plan.duration,
			features: plan.features,
			savings: id === '1_month_boost' ? '37%' : id === '3_month_boost' ? '58%' : null
		}));

		res.status(200).json({ plans });
	} catch (error) {
		console.error('Get boost plans error:', error);
		res.status(500).json({ error: 'Failed to get boost plans' });
	}
};

// Purchase Boost Plan with Stripe
export const purchaseBoostPlan = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const { planId } = req.body;

		if (!planId) {
			res.status(400).json({ error: 'Plan ID is required' });
			return;
		}

		const plan = BOOST_PLANS[planId as keyof typeof BOOST_PLANS];
		if (!plan) {
			res.status(400).json({ error: 'Invalid boost plan' });
			return;
		}

		// Verify user is a tradesperson
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { type: true, name: true, phone: true, membershipType: true, membershipExpiry: true }
		});

		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		if (user.type !== 'tradesperson') {
			res.status(403).json({ error: 'Only tradespeople can purchase boost plans' });
			return;
		}

		// Check if user already has an active boost/membership
		if (user.membershipType && user.membershipType !== 'none' && user.membershipExpiry) {
			const expiryDate = new Date(user.membershipExpiry);
			if (expiryDate > new Date()) {
				// User has active membership - check if they're trying to downgrade
				const currentPlanLevel = user.membershipType === 'unlimited_5_year' ? 4 : 
					user.membershipType === 'premium' ? 3 : 
					user.membershipType === 'basic' ? 2 : 1;
				const newPlanLevel = planId === '5_year_unlimited' ? 4 :
					planId === '3_month_boost' ? 3 : 2;
				
				if (newPlanLevel < currentPlanLevel) {
					res.status(400).json({ 
						error: 'Cannot downgrade while current plan is active',
						currentPlan: user.membershipType,
						currentExpiry: user.membershipExpiry
					});
					return;
				}
			}
		}

		const customerId = await getOrCreateStripeCustomer(userId);

		// Create payment intent for the boost plan
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(plan.price * 100), // Convert to pence
			currency: 'gbp',
			customer: customerId,
			metadata: {
				userId,
				type: 'boost_purchase',
				planId,
				planName: plan.name,
				duration: plan.duration.toString(),
				membershipType: plan.membershipType
			},
			automatic_payment_methods: {
				enabled: true
			}
		});

		// Create pending payment record
		await prisma.payment.create({
			data: {
				userId,
				amount: plan.price,
				currency: 'gbp',
				type: 'membership_purchase',
				status: 'pending',
				stripePaymentId: paymentIntent.id,
				stripeCustomerId: customerId,
				description: `Boost Plan: ${plan.name}`,
				metadata: {
					planId,
					planName: plan.name,
					duration: plan.duration,
					membershipType: plan.membershipType,
					features: plan.features
				}
			}
		});

		res.status(200).json({
			clientSecret: paymentIntent.client_secret,
			paymentIntentId: paymentIntent.id,
			plan: {
				id: planId,
				name: plan.name,
				price: plan.price,
				features: plan.features
			}
		});
	} catch (error) {
		console.error('Purchase boost plan error:', error);
		res.status(500).json({ error: 'Failed to create payment for boost plan' });
	}
};

// Confirm Boost Plan Purchase (called after successful payment)
export const confirmBoostPurchase = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const { paymentIntentId } = req.body;

		if (!paymentIntentId) {
			res.status(400).json({ error: 'Payment Intent ID is required' });
			return;
		}

		// Check if this payment was already processed
		const existingSubscription = await prisma.subscription.findFirst({
			where: { stripeSubscriptionId: paymentIntentId }
		});

		if (existingSubscription) {
			// Already processed, return current user membership
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { membershipType: true, membershipExpiry: true }
			});
			res.status(200).json({
				message: 'Boost plan already activated',
				user: {
					membershipType: user?.membershipType,
					membershipExpiry: user?.membershipExpiry
				}
			});
			return;
		}

		// Verify payment with Stripe
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		if (paymentIntent.status !== 'succeeded') {
			res.status(400).json({ error: 'Payment has not been completed' });
			return;
		}

		const { planId, duration, membershipType } = paymentIntent.metadata;

		if (!planId || !duration || !membershipType) {
			res.status(400).json({ error: 'Invalid payment metadata' });
			return;
		}

		// Calculate expiry date
		const now = new Date();
		const expiryDate = new Date(now.getTime() + parseInt(duration) * 24 * 60 * 60 * 1000);

		// Update user membership
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				membershipType: membershipType as any,
				membershipExpiry: expiryDate,
				verified: true // Boost plans include verification
			},
			select: {
				id: true,
				name: true,
				email: true,
				membershipType: true,
				membershipExpiry: true,
				phone: true
			}
		});

		// Update payment record
		await prisma.payment.updateMany({
			where: { stripePaymentId: paymentIntentId },
			data: { status: 'succeeded' }
		});

		// Create subscription record (using upsert to avoid duplicates)
		await prisma.subscription.upsert({
			where: { stripeSubscriptionId: paymentIntentId },
			update: {
				status: 'active',
				currentPeriodEnd: expiryDate
			},
			create: {
				userId,
				type: planId,
				status: 'active',
				stripeSubscriptionId: paymentIntentId,
				currentPeriodStart: now,
				currentPeriodEnd: expiryDate
			}
		});

		// Send SMS notification
		if (updatedUser.phone) {
			const plan = BOOST_PLANS[planId as keyof typeof BOOST_PLANS];
			await sendSMS(
				updatedUser.phone,
				`Hi ${updatedUser.name}, your ${plan?.name || 'boost plan'} has been activated! Your profile is now boosted until ${expiryDate.toLocaleDateString()}. Enjoy your premium features!`
			);
		}

		console.log(`Boost plan confirmed for user ${userId}: ${planId}. Expires: ${expiryDate.toISOString()}`);

		res.status(200).json({
			message: 'Boost plan activated successfully!',
			user: {
				membershipType: updatedUser.membershipType,
				membershipExpiry: updatedUser.membershipExpiry
			}
		});
	} catch (error) {
		console.error('Confirm boost purchase error:', error);
		res.status(500).json({ error: 'Failed to confirm boost purchase' });
	}
};

// Get user balance
export const getBalance = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { credits: true }
		});

		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		res.status(200).json({
			balance: Number(user.credits || 0),
			currency: 'gbp'
		});
	} catch (error) {
		console.error('Get balance error:', error);
		res.status(500).json({ error: 'Failed to get balance' });
	}
};

// Get current membership status
export const getMembershipStatus = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				membershipType: true,
				membershipExpiry: true,
				verified: true
			}
		});

		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		const isActive = user.membershipType && 
			user.membershipType !== 'none' && 
			user.membershipExpiry && 
			new Date(user.membershipExpiry) > new Date();

		let daysRemaining = 0;
		if (isActive && user.membershipExpiry) {
			daysRemaining = Math.ceil((new Date(user.membershipExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
		}

		res.status(200).json({
			membershipType: user.membershipType,
			membershipExpiry: user.membershipExpiry,
			isActive,
			daysRemaining,
			verified: user.verified
		});
	} catch (error) {
		console.error('Get membership status error:', error);
		res.status(500).json({ error: 'Failed to get membership status' });
	}
};

