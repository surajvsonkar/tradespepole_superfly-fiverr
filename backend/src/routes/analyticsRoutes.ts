import express from 'express';
import { trackView, getProfileStats } from '../controllers/analyticsController';
import { optionalAuth } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/track-view', optionalAuth, trackView);
router.get('/profile-stats', optionalAuth, getProfileStats);

export default router;
