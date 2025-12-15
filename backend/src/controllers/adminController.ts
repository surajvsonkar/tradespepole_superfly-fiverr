import { Response } from 'express';
import prisma from '../configs/database';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Admin middleware check
const isAdmin = async (req: AuthRequest): Promise<boolean> => {
	if (!req.userEmail) return false;
	
	// Check if user exists in Admin table
	const admin = await prisma.admin.findUnique({
		where: { email: req.userEmail }
	});
	
	return !!admin;
};

// Admin Login
export const adminLogin = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			res.status(400).json({ error: 'Email and password are required' });
			return;
		}

		const admin = await prisma.admin.findUnique({
			where: { email }
		});

		if (!admin) {
			res.status(401).json({ error: 'Invalid credentials' });
			return;
		}

		const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

		if (!isPasswordValid) {
			res.status(401).json({ error: 'Invalid credentials' });
			return;
		}

		// Update last login
		await prisma.admin.update({
			where: { id: admin.id },
			data: { lastLogin: new Date() }
		});

		const token = jwt.sign(
			{ 
				userId: admin.id, 
				email: admin.email,
				isAdmin: true 
			}, 
			JWT_SECRET,
			{ expiresIn: '1d' }
		);

		res.status(200).json({
			message: 'Login successful',
			token,
			admin: {
				id: admin.id,
				email: admin.email,
				name: admin.name
			}
		});
	} catch (error) {
		console.error('Admin login error:', error);
		res.status(500).json({ error: 'Failed to login' });
	}
};

// Forgot Password - Send OTP
export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const { email } = req.body;

		if (!email) {
			res.status(400).json({ error: 'Email is required' });
			return;
		}

		const admin = await prisma.admin.findUnique({
			where: { email }
		});

		if (!admin) {
			// Don't reveal if email exists
			res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
			return;
		}

		// Generate 6-digit OTP
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpExpiry = new Date();
		otpExpiry.setMinutes(otpExpiry.getMinutes() + 15); // Valid for 15 mins

		await prisma.admin.update({
			where: { id: admin.id },
			data: {
				resetOtp: otp,
				resetOtpExpiry: otpExpiry
			}
		});

		// Send email
		// Note: Configure nodemailer with your SMTP settings in .env
		const transporter = nodemailer.createTransport({
			service: 'gmail', // Or use your SMTP provider
			auth: {
				user: process.env.SMTP_EMAIL,
				pass: process.env.SMTP_PASSWORD
			}
		});

		await transporter.sendMail({
			from: process.env.SMTP_EMAIL,
			to: email,
			subject: 'Admin Password Reset OTP',
			text: `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`
		});

		res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
	} catch (error) {
		console.error('Forgot password error:', error);
		res.status(500).json({ error: 'Failed to process request' });
	}
};

// Reset Password with OTP
export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const { email, otp, newPassword } = req.body;

		if (!email || !otp || !newPassword) {
			res.status(400).json({ error: 'Email, OTP, and new password are required' });
			return;
		}

		const admin = await prisma.admin.findUnique({
			where: { email }
		});

		if (!admin || !admin.resetOtp || !admin.resetOtpExpiry) {
			res.status(400).json({ error: 'Invalid request' });
			return;
		}

		if (admin.resetOtp !== otp) {
			res.status(400).json({ error: 'Invalid OTP' });
			return;
		}

		if (new Date() > admin.resetOtpExpiry) {
			res.status(400).json({ error: 'OTP expired' });
			return;
		}

		const passwordHash = await bcrypt.hash(newPassword, 10);

		await prisma.admin.update({
			where: { id: admin.id },
			data: {
				passwordHash,
				resetOtp: null,
				resetOtpExpiry: null
			}
		});

		res.status(200).json({ message: 'Password reset successfully' });
	} catch (error) {
		console.error('Reset password error:', error);
		res.status(500).json({ error: 'Failed to reset password' });
	}
};

// Get all homeowners
export const getAllHomeowners = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!await isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		const { search, limit = '50', offset = '0' } = req.query;

		const where: Prisma.UserWhereInput = {
			type: 'homeowner'
		};

		if (search) {
			where.OR = [
				{ name: { contains: search as string, mode: 'insensitive' } },
				{ email: { contains: search as string, mode: 'insensitive' } },
				{ location: { contains: search as string, mode: 'insensitive' } }
			];
		}

		const homeowners = await prisma.user.findMany({
			where,
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				location: true,
				workPostcode: true,
				type: true,
				accountStatus: true,
				verificationStatus: true,
				createdAt: true,
				postedJobLeads: {
					select: {
						id: true,
						title: true,
						price: true,
						purchasedBy: true,
						createdAt: true
					}
				}
			},
			orderBy: { createdAt: 'desc' },
			take: parseInt(limit as string),
			skip: parseInt(offset as string)
		});

		const total = await prisma.user.count({ where });

		res.status(200).json({
			homeowners,
			pagination: {
				total,
				limit: parseInt(limit as string),
				offset: parseInt(offset as string)
			}
		});
	} catch (error) {
		console.error('Get homeowners error:', error);
		res.status(500).json({ error: 'Failed to get homeowners' });
	}
};

// Get all tradespeople
export const getAllTradespeople = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!await isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		const { search, limit = '50', offset = '0' } = req.query;

		const where: Prisma.UserWhereInput = {
			type: 'tradesperson'
		};

		if (search) {
			where.OR = [
				{ name: { contains: search as string, mode: 'insensitive' } },
				{ email: { contains: search as string, mode: 'insensitive' } },
				{ location: { contains: search as string, mode: 'insensitive' } }
			];
		}

		const tradespeople = await prisma.user.findMany({
			where,
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				location: true,
				workPostcode: true,
				type: true,
				trades: true,
				workingArea: true,
				jobRadius: true,
				rating: true,
				reviews: true,
				verified: true,
				membershipType: true,
				accountStatus: true,
				verificationStatus: true,
				credits: true,
				createdAt: true
			},
			orderBy: { createdAt: 'desc' },
			take: parseInt(limit as string),
			skip: parseInt(offset as string)
		});

		const total = await prisma.user.count({ where });

		res.status(200).json({
			tradespeople,
			pagination: {
				total,
				limit: parseInt(limit as string),
				offset: parseInt(offset as string)
			}
		});
	} catch (error) {
		console.error('Get tradespeople error:', error);
		res.status(500).json({ error: 'Failed to get tradespeople' });
	}
};

// Get analytics
export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		// Get user counts
		const totalHomeowners = await prisma.user.count({ where: { type: 'homeowner' } });
		const totalTradespeople = await prisma.user.count({ where: { type: 'tradesperson' } });
		const activeHomeowners = await prisma.user.count({ 
			where: { type: 'homeowner', accountStatus: 'active' } 
		});
		const activeTradespeople = await prisma.user.count({ 
			where: { type: 'tradesperson', accountStatus: 'active' } 
		});

		// Get job counts
		const totalJobs = await prisma.jobLead.count();
		const activeJobs = await prisma.jobLead.count({ where: { isActive: true } });

		// Calculate revenue from job purchases
		const allJobs = await prisma.jobLead.findMany({
			select: {
				price: true,
				purchasedBy: true
			}
		});

		let totalRevenue = 0;
		allJobs.forEach(job => {
			const purchases = job.purchasedBy.length;
			const price = parseFloat(job.price.toString());
			totalRevenue += purchases * price;
		});

		// Get recent signups (last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const recentSignups = await prisma.user.count({
			where: {
				createdAt: {
					gte: thirtyDaysAgo
				}
			}
		});

		// Get membership distribution
		const membershipStats = await prisma.user.groupBy({
			by: ['membershipType'],
			where: { type: 'tradesperson' },
			_count: true
		});

		res.status(200).json({
			users: {
				totalHomeowners,
				totalTradespeople,
				activeHomeowners,
				activeTradespeople,
				recentSignups
			},
			jobs: {
				totalJobs,
				activeJobs
			},
			revenue: {
				total: totalRevenue.toFixed(2),
				currency: 'GBP'
			},
			memberships: membershipStats
		});
	} catch (error) {
		console.error('Get analytics error:', error);
		res.status(500).json({ error: 'Failed to get analytics' });
	}
};

// Get all transactions (from Payment table)
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!await isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		const { limit = '100', offset = '0', type, search } = req.query;

		const where: any = {};
		
		if (type && type !== 'all') {
			where.type = type;
		}

		// Get all payments with user information
		const payments = await prisma.payment.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			take: parseInt(limit as string),
			skip: parseInt(offset as string)
		});

		// Fetch user details for each payment
		const transactions = await Promise.all(payments.map(async (payment) => {
			const user = await prisma.user.findUnique({
				where: { id: payment.userId },
				select: {
					id: true,
					name: true,
					email: true,
					type: true
				}
			});

			// Parse metadata for additional info
			const metadata = payment.metadata as any || {};

			return {
				id: payment.id,
				date: payment.createdAt,
				user: user,
				userType: user?.type || 'unknown',
				amount: parseFloat(payment.amount.toString()),
				currency: payment.currency.toUpperCase(),
				type: payment.type,
				status: payment.status,
				description: payment.description || getTransactionDescription(payment.type, metadata),
				stripePaymentId: payment.stripePaymentId,
				metadata
			};
		}));

		const total = await prisma.payment.count({ where });

		res.status(200).json({
			transactions,
			pagination: {
				total,
				limit: parseInt(limit as string),
				offset: parseInt(offset as string)
			}
		});
	} catch (error) {
		console.error('Get transactions error:', error);
		res.status(500).json({ error: 'Failed to get transactions' });
	}
};

// Helper function to generate transaction description
const getTransactionDescription = (type: string, metadata: any): string => {
	switch (type) {
		case 'credits_topup':
			return `Balance top-up of €${metadata.amount || 'N/A'}`;
		case 'job_lead_purchase':
			return `Job lead purchase: ${metadata.jobTitle || 'N/A'}`;
		case 'membership_purchase':
			return `Membership purchase: ${metadata.planId || 'N/A'}`;
		case 'directory_subscription':
			return 'Directory access subscription';
		case 'interest_fee':
			return 'Interest fee payment';
		default:
			return type.replace(/_/g, ' ');
	}
};

// Change admin password
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!await isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			res.status(400).json({ error: 'Current password and new password are required' });
			return;
		}

		if (newPassword.length < 8) {
			res.status(400).json({ error: 'New password must be at least 8 characters long' });
			return;
		}

		// Get admin user
		const admin = await prisma.admin.findUnique({
			where: { email: req.userEmail! }
		});

		if (!admin) {
			res.status(404).json({ error: 'Admin not found' });
			return;
		}

		// Verify current password
		const isPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);
		if (!isPasswordValid) {
			res.status(400).json({ error: 'Current password is incorrect' });
			return;
		}

		// Hash and update new password
		const passwordHash = await bcrypt.hash(newPassword, 10);
		await prisma.admin.update({
			where: { id: admin.id },
			data: { passwordHash }
		});

		res.status(200).json({ message: 'Password changed successfully' });
	} catch (error) {
		console.error('Change password error:', error);
		res.status(500).json({ error: 'Failed to change password' });
	}
};

// Get boost plan prices (stored in Settings or from config)
export const getBoostPlanPrices = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!await isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		// Default boost plan prices
		const defaultPrices = {
			'1_week_boost': { name: '1 Week Boost', price: 19.99, duration: 7 },
			'1_month_boost': { name: '1 Month Boost', price: 49.99, duration: 30 },
			'3_month_boost': { name: '3 Month Boost', price: 99.99, duration: 90 },
			'5_year_unlimited': { name: '5 Year Unlimited Leads', price: 499.99, duration: 1825 }
		};

		// In production, you'd fetch these from a Settings table
		// For now, return the default prices
		res.status(200).json({ prices: defaultPrices });
	} catch (error) {
		console.error('Get boost plan prices error:', error);
		res.status(500).json({ error: 'Failed to get boost plan prices' });
	}
};

// Update boost plan prices
export const updateBoostPlanPrices = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!await isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		const { prices } = req.body;

		if (!prices || typeof prices !== 'object') {
			res.status(400).json({ error: 'Invalid prices format' });
			return;
		}

		// Validate all prices are positive numbers
		for (const [planId, planData] of Object.entries(prices)) {
			const data = planData as any;
			if (typeof data.price !== 'number' || data.price < 0) {
				res.status(400).json({ error: `Invalid price for ${planId}` });
				return;
			}
		}

		// In production, you'd save these to a Settings table
		// For now, just return success
		// Note: To make this persistent, you'd need to:
		// 1. Create a Settings model in prisma
		// 2. Store these prices there
		// 3. Update the payment controller to read from Settings

		console.log('Boost plan prices updated:', prices);

		res.status(200).json({ 
			message: 'Boost plan prices updated successfully',
			prices 
		});
	} catch (error) {
		console.error('Update boost plan prices error:', error);
		res.status(500).json({ error: 'Failed to update boost plan prices' });
	}
};

// Update user account status
export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!await isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		const { userId } = req.params;
		const { accountStatus, verificationStatus } = req.body;

		const updateData: any = {};

		if (accountStatus) {
			if (!['active', 'parked', 'deleted'].includes(accountStatus)) {
				res.status(400).json({ error: 'Invalid account status' });
				return;
			}
			updateData.accountStatus = accountStatus;
		}

		if (verificationStatus) {
			if (!['pending', 'verified', 'rejected'].includes(verificationStatus)) {
				res.status(400).json({ error: 'Invalid verification status' });
				return;
			}
			updateData.verificationStatus = verificationStatus;
			if (verificationStatus === 'verified') {
				updateData.verified = true;
			}
		}

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: updateData,
			select: {
				id: true,
				name: true,
				email: true,
				accountStatus: true,
				verificationStatus: true,
				verified: true
			}
		});

		res.status(200).json({
			message: 'User status updated successfully',
			user: updatedUser
		});
	} catch (error) {
		console.error('Update user status error:', error);
		res.status(500).json({ error: 'Failed to update user status' });
	}
};

// Delete user permanently
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!await isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		const { userId } = req.params;

		await prisma.user.delete({
			where: { id: userId }
		});

		res.status(200).json({
			message: 'User deleted successfully'
		});
	} catch (error) {
		console.error('Delete user error:', error);
		res.status(500).json({ error: 'Failed to delete user' });
	}
};

// Update user data (all fields)
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!await isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		const { userId } = req.params;
		const {
			name,
			email,
			phone,
			location,
			postcode,
			trades,
			workingArea,
			jobRadius,
			workPostcode
		} = req.body;

		const updateData: any = {};

		if (name !== undefined) updateData.name = name;
		if (email !== undefined) updateData.email = email;
		if (phone !== undefined) updateData.phone = phone;
		if (location !== undefined) updateData.location = location;
		if (postcode !== undefined) updateData.workPostcode = postcode; // For homeowners, store in workPostcode
		if (workPostcode !== undefined) updateData.workPostcode = workPostcode;
		if (trades !== undefined) updateData.trades = trades;
		if (workingArea !== undefined) updateData.workingArea = workingArea;
		if (jobRadius !== undefined) updateData.jobRadius = parseInt(jobRadius);

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: updateData,
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				location: true,
				workPostcode: true,
				trades: true,
				workingArea: true,
				jobRadius: true,
				accountStatus: true,
				verificationStatus: true
			}
		});

		res.status(200).json({
			message: 'User updated successfully',
			user: updatedUser
		});
	} catch (error) {
		console.error('Update user error:', error);
		res.status(500).json({ error: 'Failed to update user' });
	}
};

// Update pricing
export const updatePricing = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!await isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		const { defaultLeadPrice } = req.body;

		if (!defaultLeadPrice || isNaN(parseFloat(defaultLeadPrice))) {
			res.status(400).json({ error: 'Invalid price' });
			return;
		}

		// This would update a settings table in production
		// For now, we'll just return success
		// You can add a Settings model to store this

		res.status(200).json({
			message: 'Pricing updated successfully',
			defaultLeadPrice: parseFloat(defaultLeadPrice)
		});
	} catch (error) {
		console.error('Update pricing error:', error);
		res.status(500).json({ error: 'Failed to update pricing' });
	}
};

// Get dashboard stats
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!await isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		const totalUsers = await prisma.user.count();
		const totalJobs = await prisma.jobLead.count();
		const totalReviews = await prisma.review.count();
		const totalConversations = await prisma.conversation.count();

		// Get recent activity
		const recentJobs = await prisma.jobLead.findMany({
			take: 5,
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				title: true,
				createdAt: true,
				poster: {
					select: {
						name: true
					}
				}
			}
		});

		const recentUsers = await prisma.user.findMany({
			take: 5,
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				email: true,
				type: true,
				createdAt: true
			}
		});

		res.status(200).json({
			stats: {
				totalUsers,
				totalJobs,
				totalReviews,
				totalConversations
			},
			recentActivity: {
				jobs: recentJobs,
				users: recentUsers
			}
		});
	} catch (error) {
		console.error('Get dashboard stats error:', error);
		res.status(500).json({ error: 'Failed to get dashboard stats' });
	}
};
