import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
	getSetting,
	getAllSettings,
	updateSetting,
	updateSettings,
	getPublicSettings
} from '../controllers/settingsController';

const router = Router();

// Public routes
router.get('/public', getPublicSettings);

// Protected routes (admin only)
router.use(authMiddleware);
router.get('/', getAllSettings);
router.get('/:key', getSetting);
router.patch('/:key', updateSetting);
router.patch('/', updateSettings);

export default router;
