import express from 'express';
import { 
	register, 
	login, 
	getMe, 
	verifyEmail, 
	forgotPassword, 
	resetPassword, 
	googleLogin,
	facebookLogin,
	linkedinLogin,
	refreshToken,
	resendVerification
} from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-verification', resendVerification);
router.post('/refresh-token', refreshToken);

// Social login routes
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);
router.post('/linkedin', linkedinLogin);

// Protected routes
router.get('/me', authenticateToken, getMe);

export default router;
