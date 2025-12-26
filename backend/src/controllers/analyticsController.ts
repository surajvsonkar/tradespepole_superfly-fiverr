import { Response } from 'express';
import prisma from '../configs/database';
import { AuthRequest } from '../middlewares/authMiddleware';

export const trackView = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const { type, targetId, metadata } = req.body;
		const userId = req.userId;
		const ipAddress = req.ip || req.connection.remoteAddress;

		// If boost page view
		if (type === 'boost_page_view') {
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			await prisma.boostAnalytics.upsert({
				where: { date: today },
				update: { views: { increment: 1 } },
				create: { date: today, views: 1 }
			});
		}
		
		// If profile view (tradesperson)
		if (type === 'profile_view' && targetId) {
			await prisma.profileView.create({
				data: {
					tradespersonId: targetId,
					viewerId: userId || null,
					ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress || null
				}
			});
		}

		res.status(200).json({ success: true });
	} catch (error) {
		console.error('Track view error:', error);
		res.status(500).json({ error: 'Failed to track view' });
	}
};

export const getProfileStats = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const today = new Date();
		const last7Days = new Date(today);
		last7Days.setDate(last7Days.getDate() - 7);

		const views = await prisma.profileView.count({
			where: {
				tradespersonId: userId,
				viewedAt: {
					gte: last7Days
				}
			}
		});

		// Group by day for the last 7 days (requires raw query or processing)
		// For simplicity, just return total for now, or 7-day breakdown if needed.
		// Using raw query for daily breakdown
		const dailyViews = await prisma.$queryRaw`
			SELECT DATE(viewed_at) as date, COUNT(*) as count 
			FROM profile_views 
			WHERE tradesperson_id = ${userId}::uuid 
			AND viewed_at >= ${last7Days}
			GROUP BY DATE(viewed_at)
			ORDER BY date ASC
		`;

		res.status(200).json({ 
			totalViews7Days: views,
			dailyViews
		});
	} catch (error) {
		console.error('Get profile stats error:', error);
		res.status(500).json({ error: 'Failed to get profile stats' });
	}
};
