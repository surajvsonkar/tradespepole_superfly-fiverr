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

// Stripe Price IDs (create these in Stripe Dashboard)
const PRICE_IDS = {
	DIRECTORY_SUBSCRIPTION: process.env.STRIPE_DIRECTORY_PRICE_ID || 'price_directory_monthly',
	BASIC_MEMBERSHIP: process.env.STRIPE_BASIC_MEMBERSHIP_PRICE_ID || 'price_basic_monthly',
	PREMIUM_MEMBERSHIP: process.env.STRIPE_PREMIUM_MEMBERSHIP_PRICE_ID || 'price_premium_monthly',
	UNLIMITED_5_YEAR: process.env.STRIPE_UNLIMITED_PRICE_ID || 'price_unlimited_5year'
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
			switch (type) {
				case 'directory_access':
					stripePriceId = PRICE_IDS.DIRECTORY_SUBSCRIPTION;
					break;
				case 'basic_membership':
					stripePriceId = PRICE_IDS.BASIC_MEMBERSHIP;
					break;
				case 'premium_membership':
					stripePriceId = PRICE_IDS.PREMIUM_MEMBERSHIP;
					break;
				case 'unlimited_5_year':
					stripePriceId = PRICE_IDS.UNLIMITED_5_YEAR;
					break;
				default:
					res.status(400).json({ error: 'Invalid subscription type' });
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

		// Create Stripe subscription
		const subscription = await stripe.subscriptions.create({
			customer: customerId,
			items: [{ price: stripePriceId }],
			payment_behavior: 'default_incomplete',
			payment_settings: { save_default_payment_method: 'on_subscription' },
			expand: ['latest_invoice.payment_intent'],
			metadata: {
				userId,
				type
			}
		});

		const invoice = subscription.latest_invoice as any;
		const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent | null;

		// Create subscription record
		await prisma.subscription.create({
			data: {
				userId,
				type,
				status: 'active',
				stripeSubscriptionId: subscription.id,
				stripeCustomerId: customerId,
				stripePriceId,
				currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
				currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
			}
		});

		res.status(200).json({
			subscriptionId: subscription.id,
			clientSecret: paymentIntent?.client_secret || null,
			status: subscription.status
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

// Add Credits (Top-up)
export const addCredits = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const { amount } = req.body;

		if (!amount || amount < 5) {
			res.status(400).json({ error: 'Minimum top-up amount is £5' });
			return;
		}

		const customerId = await getOrCreateStripeCustomer(userId);

		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount * 100),
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
				type: 'credits_topup',
				status: 'pending',
				stripePaymentId: paymentIntent.id,
				stripeCustomerId: customerId,
				description: `Credits top-up: £${amount}`,
				metadata: { creditAmount: amount }
			}
		});

		res.status(200).json({
			clientSecret: paymentIntent.client_secret,
			paymentIntentId: paymentIntent.id
		});
	} catch (error) {
		console.error('Add credits error:', error);
		res.status(500).json({ error: 'Failed to add credits' });
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
			await prisma.user.update({
				where: { id: userId },
				data: { credits: Number(user.credits || 0) + amount }
			});

			if (user.phone) {
				await sendSMS(
					user.phone,
					`Hi ${user.name}, your credits have been topped up by £${amount.toFixed(2)}. Your new balance is £${(Number(user.credits || 0) + amount).toFixed(2)}.`
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

	// Update user's directory access if it's a directory subscription
	if (type === 'directory_access' && subscription.status === 'active') {
		await prisma.user.update({
			where: { id: userId },
			data: {
				hasDirectoryAccess: true,
				directorySubscriptionExpiry: new Date(sub.current_period_end * 1000)
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

	// Remove directory access if it's a directory subscription
	if (type === 'directory_access') {
		await prisma.user.update({
			where: { id: userId },
			data: {
				hasDirectoryAccess: false,
				directorySubscriptionExpiry: null
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

// Check Directory Access
export const checkDirectoryAccess = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				hasDirectoryAccess: true,
				directorySubscriptionExpiry: true,
				type: true
			}
		});

		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		// Tradespeople always have access (they ARE the directory)
		if (user.type === 'tradesperson') {
			res.status(200).json({ hasAccess: true, reason: 'tradesperson' });
			return;
		}

		// Check subscription status
		const hasAccess = user.hasDirectoryAccess && 
			user.directorySubscriptionExpiry && 
			new Date(user.directorySubscriptionExpiry) > new Date();

		res.status(200).json({
			hasAccess,
			expiryDate: user.directorySubscriptionExpiry,
			subscriptionPrice: '£1/month'
		});
	} catch (error) {
		console.error('Check directory access error:', error);
		res.status(500).json({ error: 'Failed to check directory access' });
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

