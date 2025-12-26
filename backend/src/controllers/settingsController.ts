import { Response } from 'express';
import prisma from '../configs/database';
import { AuthRequest } from '../middlewares/authMiddleware';

// Helper to check admin
const isAdmin = async (req: AuthRequest): Promise<boolean> => {
	if (!req.userEmail) return false;
	const admin = await prisma.admin.findUnique({
		where: { email: req.userEmail }
	});
	return !!admin;
};

// Get a single setting by key
export const getSetting = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const { key } = req.params;

		const setting = await prisma.settings.findUnique({
			where: { key }
		});

		if (!setting) {
			res.status(404).json({ error: 'Setting not found' });
			return;
		}

		res.status(200).json({ setting });
	} catch (error) {
		console.error('Get setting error:', error);
		res.status(500).json({ error: 'Failed to get setting' });
	}
};

// Get all settings (admin only)
export const getAllSettings = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!await isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		const settings = await prisma.settings.findMany();
		
		// Convert to key-value object for easier frontend use
		const settingsObject: Record<string, any> = {};
		settings.forEach(s => {
			settingsObject[s.key] = s.value;
		});

		res.status(200).json({ settings: settingsObject });
	} catch (error) {
		console.error('Get all settings error:', error);
		res.status(500).json({ error: 'Failed to get settings' });
	}
};

// Update a setting (admin only)
export const updateSetting = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!await isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		const { key } = req.params;
		const { value } = req.body;

		if (value === undefined) {
			res.status(400).json({ error: 'Value is required' });
			return;
		}

		const setting = await prisma.settings.upsert({
			where: { key },
			update: { value },
			create: { key, value }
		});

		res.status(200).json({
			message: 'Setting updated successfully',
			setting
		});
	} catch (error) {
		console.error('Update setting error:', error);
		res.status(500).json({ error: 'Failed to update setting' });
	}
};

// Bulk update settings (admin only)
export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!await isAdmin(req)) {
			res.status(403).json({ error: 'Forbidden: Admin access required' });
			return;
		}

		const { settings } = req.body;

		if (!settings || typeof settings !== 'object') {
			res.status(400).json({ error: 'Settings object is required' });
			return;
		}

		// Update each setting
		const updates = Object.entries(settings).map(([key, value]) =>
			prisma.settings.upsert({
				where: { key },
				update: { value: value as any },
				create: { key, value: value as any }
			})
		);

		await Promise.all(updates);

		res.status(200).json({
			message: 'Settings updated successfully'
		});
	} catch (error) {
		console.error('Update settings error:', error);
		res.status(500).json({ error: 'Failed to update settings' });
	}
};

// Get public settings (no auth required)
export const getPublicSettings = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		// Only return public settings that clients need
		const publicKeys = [
			'social_media_links', 
			'directory_price', 
			'boost_plan_prices',
			'hide_boost_page',
			'boost_page_content'
		];
		
		const settings = await prisma.settings.findMany({
			where: {
				key: { in: publicKeys }
			}
		});

		const settingsObject: Record<string, any> = {};
		settings.forEach(s => {
			settingsObject[s.key] = s.value;
		});

		res.status(200).json({ settings: settingsObject });
	} catch (error) {
		console.error('Get public settings error:', error);
		res.status(500).json({ error: 'Failed to get settings' });
	}
};

// Helper function to get a setting value with default
export const getSettingValue = async (key: string, defaultValue: any = null): Promise<any> => {
	try {
		const setting = await prisma.settings.findUnique({
			where: { key }
		});
		return setting ? setting.value : defaultValue;
	} catch (error) {
		console.error(`Error getting setting ${key}:`, error);
		return defaultValue;
	}
};
