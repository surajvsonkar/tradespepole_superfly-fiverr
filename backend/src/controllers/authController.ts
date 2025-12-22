import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../configs/database';
import { AuthRequest } from '../middlewares/authMiddleware';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { isValidUKPostcode } from '../utils/geocoding';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short-lived access token
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Generate tokens
const generateTokens = (userId: string, userType: string, email: string) => {
	const accessToken = jwt.sign(
		{ userId, userType, email },
		JWT_SECRET,
		{ expiresIn: JWT_EXPIRES_IN } as SignOptions
	);
	
	const refreshToken = jwt.sign(
		{ userId, userType, email, type: 'refresh' },
		JWT_SECRET,
		{ expiresIn: JWT_REFRESH_EXPIRES_IN } as SignOptions
	);
	
	return { accessToken, refreshToken };
};

// Verify reCAPTCHA token
const verifyCaptcha = async (token: string): Promise<boolean> => {
	if (!RECAPTCHA_SECRET_KEY) {
		console.log('RECAPTCHA not configured, skipping verification');
		return true;
	}
	
	try {
		const response = await axios.post(
			'https://www.google.com/recaptcha/api/siteverify',
			null,
			{
				params: {
					secret: RECAPTCHA_SECRET_KEY,
					response: token
				}
			}
		);
		return response.data.success;
	} catch (error) {
		console.error('CAPTCHA verification error:', error);
		return false;
	}
};

// Helper to send email
const sendEmail = async (to: string, subject: string, text: string): Promise<boolean> => {
	if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
		console.log('\n===========================================');
		console.log('📧 EMAIL NOT SENT - SMTP NOT CONFIGURED');
		console.log('===========================================');
		console.log('To:', to);
		console.log('Subject:', subject);
		console.log('Content:', text);
		console.log('===========================================\n');
		return false; // Email not actually sent
	}
	
	try {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.SMTP_EMAIL,
				pass: process.env.SMTP_PASSWORD
			}
		});
		
		await transporter.sendMail({ from: process.env.SMTP_EMAIL, to, subject, text });
		console.log(`✅ Email sent successfully to ${to}`);
		return true;
	} catch (error) {
		console.error('❌ Failed to send email:', error);
		return false;
	}
};

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
	try {
		const { name, email, password, phone, type, location, postcode, trades, workingArea, captchaToken, hourlyRate } = req.body;

		// Validate required fields
		if (!name || !email || !password || !type) {
			res.status(400).json({ error: 'Name, email, password, and type are required' });
			return;
		}

		// Validate phone number format (basic validation)
		if (phone && !/^\+?[\d\s-]{10,}$/.test(phone)) {
			res.status(400).json({ error: 'Please enter a valid phone number' });
			return;
		}

		// Validate UK Postcode
		if (postcode && !isValidUKPostcode(postcode)) {
			res.status(400).json({ error: 'Invalid UK postcode' });
			return;
		}

		// Verify CAPTCHA
		if (captchaToken) {
			const isCaptchaValid = await verifyCaptcha(captchaToken);
			if (!isCaptchaValid) {
				res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
				return;
			}
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			res.status(409).json({ error: 'User with this email already exists' });
			return;
		}

		// Hash password
		const passwordHash = await bcrypt.hash(password, 10);

		// Generate verification token
		const emailVerificationToken = crypto.randomBytes(32).toString('hex');
		const emailVerificationExpires = new Date();
		emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hours

		// Create user
		const user = await prisma.user.create({
			data: {
				name,
				email,
				phone: phone || null,
				passwordHash,
				type,
				location,
				workPostcode: postcode || 'W1K 3DE', // Store postcode for tradespeople, use as workPostcode
				trades: trades || [],
				workingArea: workingArea || null,
				hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
				accountStatus: 'active',
				verificationStatus: 'pending',
				credits: type === 'tradesperson' ? 0 : undefined,
				membershipType: type === 'tradesperson' ? 'none' : undefined,
				emailVerificationToken,
				emailVerificationExpires,
				isEmailVerified: false
			},
			select: {
				id: true,
				name: true,
				email: true,
				type: true,
				avatar: true,
				location: true,
				trades: true,
				rating: true,
				reviews: true,
				verified: true,
				credits: true,
				membershipType: true,
				membershipExpiry: true,
				verificationStatus: true,
				accountStatus: true,
				workingArea: true,
				hasDirectoryListing: true,
				directoryListingExpiry: true,
				createdAt: true,
				isEmailVerified: true,
			},
		});

		// Send verification email
		const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${emailVerificationToken}`;
		await sendEmail(
			email,
			'Verify your email',
			`Please verify your email by clicking: ${verificationUrl}`
		);

		res.status(201).json({
			message: 'User registered successfully. Please check your email to verify your account.',
			user,
		});
	} catch (error) {
		console.error('Registration error:', error);
		res.status(500).json({ error: 'Failed to register user' });
	}
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			res.status(400).json({ error: 'Email and password are required' });
			return;
		}

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user || !user.passwordHash) {
			res.status(401).json({ error: 'Invalid email or password' });
			return;
		}

		if (user.accountStatus !== 'active') {
			res.status(403).json({ error: 'Account is not active' });
			return;
		}

		const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

		if (!isPasswordValid) {
			res.status(401).json({ error: 'Invalid email or password' });
			return;
		}

		if (!user.isEmailVerified) {
			res.status(403).json({ 
				error: 'Email not verified. Please check your email for the verification link.',
				isEmailVerified: false
			});
			return;
		}

		const { accessToken, refreshToken } = generateTokens(user.id, user.type, user.email);

		// Remove password hash from response
		const { passwordHash, emailVerificationToken, passwordResetToken, ...userWithoutSensitive } = user;

		res.status(200).json({
			message: 'Login successful',
			user: userWithoutSensitive,
			token: accessToken,
			refreshToken,
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ error: 'Failed to login' });
	}
};

// Verify Email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
	try {
		const { token } = req.body;

		const user = await prisma.user.findFirst({
			where: {
				emailVerificationToken: token,
				emailVerificationExpires: { gt: new Date() }
			}
		});

		if (!user) {
			res.status(400).json({ error: 'Invalid or expired verification token' });
			return;
		}

		await prisma.user.update({
			where: { id: user.id },
			data: {
				isEmailVerified: true,
				emailVerificationToken: null,
				emailVerificationExpires: null
			}
		});

		res.status(200).json({ message: 'Email verified successfully' });
	} catch (error) {
		console.error('Email verification error:', error);
		res.status(500).json({ error: 'Failed to verify email' });
	}
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email } = req.body;

		const user = await prisma.user.findUnique({ where: { email } });

		if (!user) {
			res.status(200).json({ message: 'If email exists, reset instructions sent.' });
			return;
		}

		const resetToken = crypto.randomBytes(32).toString('hex');
		const resetExpires = new Date();
		resetExpires.setHours(resetExpires.getHours() + 1);

		await prisma.user.update({
			where: { id: user.id },
			data: {
				passwordResetToken: resetToken,
				passwordResetExpires: resetExpires
			}
		});

		const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
		const emailSent = await sendEmail(
			email,
			'Password Reset Request',
			`Click here to reset your password: ${resetUrl}`
		);

		// In development mode (when SMTP is not configured), include the reset link in response
		const isDevelopment = !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD;
		
		res.status(200).json({ 
			message: 'If email exists, reset instructions sent.',
			...(isDevelopment && { 
				developmentNote: 'SMTP not configured. Use the link below to reset password.',
				resetUrl 
			})
		});
	} catch (error) {
		console.error('Forgot password error:', error);
		res.status(500).json({ error: 'Failed to process request' });
	}
};

// Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
	try {
		const { token, newPassword } = req.body;

		const user = await prisma.user.findFirst({
			where: {
				passwordResetToken: token,
				passwordResetExpires: { gt: new Date() }
			}
		});

		if (!user) {
			res.status(400).json({ error: 'Invalid or expired reset token' });
			return;
		}

		const passwordHash = await bcrypt.hash(newPassword, 10);

		await prisma.user.update({
			where: { id: user.id },
			data: {
				passwordHash,
				passwordResetToken: null,
				passwordResetExpires: null
			}
		});

		res.status(200).json({ message: 'Password reset successfully' });
	} catch (error) {
		console.error('Reset password error:', error);
		res.status(500).json({ error: 'Failed to reset password' });
	}
};

// Google Login
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
	try {
		const { token, userType } = req.body; // userType needed for new users

		const ticket = await googleClient.verifyIdToken({
			idToken: token,
			audience: GOOGLE_CLIENT_ID
		});

		const payload = ticket.getPayload();
		if (!payload || !payload.email) {
			res.status(400).json({ error: 'Invalid Google token' });
			return;
		}

		const { email, name, sub: googleId, picture } = payload;

		let user = await prisma.user.findUnique({ where: { email } });
		let isNewUser = false;

		if (!user) {
			// Create new user
			if (!userType) {
				res.status(400).json({ error: 'User type required for new registration' });
				return;
			}

			isNewUser = true;

			// Generate verification token
			const emailVerificationToken = crypto.randomBytes(32).toString('hex');
			const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

			user = await prisma.user.create({
				data: {
					email,
					name: name || 'User',
					googleId,
					avatar: picture,
					type: userType,
					isEmailVerified: false,
					emailVerificationToken,
					emailVerificationExpires,
					accountStatus: 'active',
					verificationStatus: 'pending',
					credits: userType === 'tradesperson' ? 0 : undefined,
					membershipType: userType === 'tradesperson' ? 'none' : undefined,
				}
			});

			// Send verification email
			const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${emailVerificationToken}`;
			await sendEmail(
				email,
				'Verify your email',
				`Please verify your email by clicking: ${verificationUrl}`
			);
		} else {
			// Link Google ID if not linked
			if (!user.googleId) {
				user = await prisma.user.update({
					where: { id: user.id },
					data: { googleId }
				});
			}
		}

		const { accessToken, refreshToken } = generateTokens(user.id, user.type, user.email);

		const { passwordHash, emailVerificationToken, passwordResetToken, ...userWithoutSensitive } = user;

		res.status(200).json({
			message: 'Login successful',
			user: userWithoutSensitive,
			token: accessToken,
			refreshToken,
			isNewUser
		});
	} catch (error) {
		console.error('Google login error:', error);
		res.status(500).json({ error: 'Failed to login with Google' });
	}
};

// Facebook Login
export const facebookLogin = async (req: Request, res: Response): Promise<void> => {
	try {
		const { accessToken: fbAccessToken, userType } = req.body;

		if (!fbAccessToken) {
			res.status(400).json({ error: 'Facebook access token required' });
			return;
		}

		// Verify Facebook token and get user info
		const fbResponse = await axios.get(
			`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${fbAccessToken}`
		);

		const { id: facebookId, name, email, picture } = fbResponse.data;

		if (!email) {
			res.status(400).json({ error: 'Email permission is required for Facebook login' });
			return;
		}

		let user = await prisma.user.findUnique({ where: { email } });

		if (!user) {
			// Check if user exists with Facebook ID
			user = await prisma.user.findFirst({ where: { facebookId } });
		}

		if (!user) {
			// Create new user
			if (!userType) {
				res.status(400).json({ error: 'User type required for new registration', requiresUserType: true });
				return;
			}

			// Generate verification token
			const emailVerificationToken = crypto.randomBytes(32).toString('hex');
			const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

			user = await prisma.user.create({
				data: {
					email,
					name: name || 'User',
					facebookId,
					avatar: picture?.data?.url,
					type: userType,
					isEmailVerified: false,
					emailVerificationToken,
					emailVerificationExpires,
					accountStatus: 'active',
					verificationStatus: 'pending',
					credits: userType === 'tradesperson' ? 0 : undefined,
					membershipType: userType === 'tradesperson' ? 'none' : undefined,
				}
			});

			// Send verification email
			const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${emailVerificationToken}`;
			await sendEmail(
				email,
				'Verify your email',
				`Please verify your email by clicking: ${verificationUrl}`
			);
		} else {
			// Link Facebook ID if not linked
			if (!user.facebookId) {
				user = await prisma.user.update({
					where: { id: user.id },
					data: { facebookId }
				});
			}
		}

		if (user.accountStatus !== 'active') {
			res.status(403).json({ error: 'Account is not active' });
			return;
		}

		const { accessToken, refreshToken } = generateTokens(user.id, user.type, user.email);

		const { passwordHash, emailVerificationToken, passwordResetToken, ...userWithoutSensitive } = user;

		res.status(200).json({
			message: 'Login successful',
			user: userWithoutSensitive,
			token: accessToken,
			refreshToken
		});
	} catch (error: any) {
		console.error('Facebook login error:', error.response?.data || error);
		res.status(500).json({ error: 'Failed to login with Facebook' });
	}
};

// LinkedIn Login
export const linkedinLogin = async (req: Request, res: Response): Promise<void> => {
	try {
		const { code, redirectUri, userType } = req.body;

		if (!code) {
			res.status(400).json({ error: 'LinkedIn authorization code required' });
			return;
		}

		// Exchange code for access token
		const tokenResponse = await axios.post(
			'https://www.linkedin.com/oauth/v2/accessToken',
			null,
			{
				params: {
					grant_type: 'authorization_code',
					code,
					redirect_uri: redirectUri,
					client_id: LINKEDIN_CLIENT_ID,
					client_secret: LINKEDIN_CLIENT_SECRET
				},
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}
		);

		const linkedinAccessToken = tokenResponse.data.access_token;

		// Get user profile
		const profileResponse = await axios.get(
			'https://api.linkedin.com/v2/userinfo',
			{
				headers: {
					Authorization: `Bearer ${linkedinAccessToken}`
				}
			}
		);

		const { sub: linkedinId, name, email, picture } = profileResponse.data;

		if (!email) {
			res.status(400).json({ error: 'Email permission is required for LinkedIn login' });
			return;
		}

		let user = await prisma.user.findUnique({ where: { email } });

		if (!user) {
			// Check if user exists with LinkedIn ID
			user = await prisma.user.findFirst({ where: { linkedinId } });
		}

		if (!user) {
			// Create new user
			if (!userType) {
				res.status(400).json({ error: 'User type required for new registration', requiresUserType: true });
				return;
			}

			// Generate verification token
			const emailVerificationToken = crypto.randomBytes(32).toString('hex');
			const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

			user = await prisma.user.create({
				data: {
					email,
					name: name || 'User',
					linkedinId,
					avatar: picture,
					type: userType,
					isEmailVerified: false,
					emailVerificationToken,
					emailVerificationExpires,
					accountStatus: 'active',
					verificationStatus: 'pending',
					credits: userType === 'tradesperson' ? 0 : undefined,
					membershipType: userType === 'tradesperson' ? 'none' : undefined,
				}
			});

			// Send verification email
			const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${emailVerificationToken}`;
			await sendEmail(
				email,
				'Verify your email',
				`Please verify your email by clicking: ${verificationUrl}`
			);
		} else {
			// Link LinkedIn ID if not linked
			if (!user.linkedinId) {
				user = await prisma.user.update({
					where: { id: user.id },
					data: { linkedinId }
				});
			}
		}

		if (user.accountStatus !== 'active') {
			res.status(403).json({ error: 'Account is not active' });
			return;
		}

		const { accessToken, refreshToken } = generateTokens(user.id, user.type, user.email);

		const { passwordHash, emailVerificationToken, passwordResetToken, ...userWithoutSensitive } = user;

		res.status(200).json({
			message: 'Login successful',
			user: userWithoutSensitive,
			token: accessToken,
			refreshToken
		});
	} catch (error: any) {
		console.error('LinkedIn login error:', error.response?.data || error);
		res.status(500).json({ error: 'Failed to login with LinkedIn' });
	}
};

// Refresh Token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
	try {
		const { refreshToken: token } = req.body;

		if (!token) {
			res.status(400).json({ error: 'Refresh token required' });
			return;
		}

		try {
			const decoded = jwt.verify(token, JWT_SECRET) as {
				userId: string;
				userType: string;
				email: string;
				type: string;
			};

			if (decoded.type !== 'refresh') {
				res.status(401).json({ error: 'Invalid token type' });
				return;
			}

			// Check if user still exists and is active
			const user = await prisma.user.findUnique({
				where: { id: decoded.userId }
			});

			if (!user || user.accountStatus !== 'active') {
				res.status(401).json({ error: 'User not found or inactive' });
				return;
			}

			const { accessToken, refreshToken: newRefreshToken } = generateTokens(
				user.id,
				user.type,
				user.email
			);

			res.status(200).json({
				token: accessToken,
				refreshToken: newRefreshToken
			});
		} catch (jwtError) {
			res.status(401).json({ error: 'Invalid or expired refresh token' });
			return;
		}
	} catch (error) {
		console.error('Refresh token error:', error);
		res.status(500).json({ error: 'Failed to refresh token' });
	}
};

// Resend verification email
export const resendVerification = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email } = req.body;

		const user = await prisma.user.findUnique({ where: { email } });

		if (!user) {
			// Don't reveal if user exists
			res.status(200).json({ message: 'If the email exists, a verification link has been sent.' });
			return;
		}

		if (user.isEmailVerified) {
			res.status(400).json({ error: 'Email is already verified' });
			return;
		}

		// Generate new verification token
		const emailVerificationToken = crypto.randomBytes(32).toString('hex');
		const emailVerificationExpires = new Date();
		emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24);

		await prisma.user.update({
			where: { id: user.id },
			data: {
				emailVerificationToken,
				emailVerificationExpires
			}
		});

		const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${emailVerificationToken}`;
		await sendEmail(
			email,
			'Verify your email',
			`Please verify your email by clicking: ${verificationUrl}`
		);

		res.status(200).json({ message: 'If the email exists, a verification link has been sent.' });
	} catch (error) {
		console.error('Resend verification error:', error);
		res.status(500).json({ error: 'Failed to send verification email' });
	}
};

// Get current user
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const userId = req.userId;

		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				name: true,
				email: true,
				type: true,
				avatar: true,
				location: true,
				trades: true,
				rating: true,
				reviews: true,
				verified: true,
				credits: true,
				membershipType: true,
				membershipExpiry: true,
				verificationStatus: true,
				accountStatus: true,
				workingArea: true,
				hasDirectoryListing: true,
				directoryListingExpiry: true,
				createdAt: true,
			},
		});

		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		res.status(200).json({ user });
	} catch (error) {
		console.error('Get me error:', error);
		res.status(500).json({ error: 'Failed to get user' });
	}
};
