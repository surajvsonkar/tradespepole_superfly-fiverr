import { Response } from 'express';
import prisma from '../configs/database';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Prisma } from '@prisma/client';

// Admin middleware check (you can enhance this with a proper admin role)
const isAdmin = (req: AuthRequest): boolean => {
	// For now, check if user email is admin (you can add admin role to User model later)
	// This is a simple check - in production, use proper role-based access control
	return req.userEmail === process.env.ADMIN_EMAIL || false;
};

// Get all homeowners
export const getAllHomeowners = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!isAdmin(req)) {
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
				location: true,
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
		if (!isAdmin(req)) {
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
				location: true,
				trades: true,
				workingArea: true,
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

// Get all transactions
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		const { limit = '50', offset = '0' } = req.query;

		// Get all job purchases
		const jobs = await prisma.jobLead.findMany({
			where: {
				purchasedBy: {
					isEmpty: false
				}
			},
			select: {
				id: true,
				title: true,
				price: true,
				purchasedBy: true,
				createdAt: true,
				poster: {
					select: {
						id: true,
						name: true,
						email: true
					}
				}
			},
			orderBy: { createdAt: 'desc' },
			take: parseInt(limit as string),
			skip: parseInt(offset as string)
		});

		// Transform to transaction format
		const transactions = [];
		for (const job of jobs) {
			for (const tradespersonId of job.purchasedBy) {
				const tradesperson = await prisma.user.findUnique({
					where: { id: tradespersonId },
					select: {
						id: true,
						name: true,
						email: true
					}
				});

				transactions.push({
					id: `${job.id}-${tradespersonId}`,
					jobId: job.id,
					jobTitle: job.title,
					amount: parseFloat(job.price.toString()),
					homeowner: job.poster,
					tradesperson: tradesperson,
					date: job.createdAt,
					type: 'lead_purchase'
				});
			}
		}

		const total = transactions.length;

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

// Update user account status
export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!isAdmin(req)) {
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
		if (!isAdmin(req)) {
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

// Update pricing
export const updatePricing = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!isAdmin(req)) {
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
		if (!isAdmin(req)) {
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
