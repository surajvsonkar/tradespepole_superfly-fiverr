import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../configs/database';
import { AuthRequest } from '../middlewares/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
	try {
		const { name, email, password, type, location, trades, workingArea } =
			req.body;

		// Validate required fields
		if (!name || !email || !password || !type) {
			res
				.status(400)
				.json({ error: 'Name, email, password, and type are required' });
			return;
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

		// Create user
		const user = await prisma.user.create({
			data: {
				name,
				email,
				passwordHash,
				type,
				location,
				trades: trades || [],
				workingArea: workingArea || null,
				accountStatus: 'active',
				verificationStatus: 'pending',
				credits: type === 'tradesperson' ? 0 : undefined,
				membershipType: type === 'tradesperson' ? 'none' : undefined,
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
				createdAt: true,
			},
		});

		res.status(201).json({
			message: 'User registered successfully',
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

		// Validate required fields
		if (!email || !password) {
			res.status(400).json({ error: 'Email and password are required' });
			return;
		}

		// Find user
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				name: true,
				email: true,
				passwordHash: true,
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
				createdAt: true,
			},
		});

		if (!user) {
			res.status(401).json({ error: 'Invalid email or password' });
			return;
		}

		// Check if account is active
		if (user.accountStatus !== 'active') {
			res.status(403).json({ error: 'Account is not active' });
			return;
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

		if (!isPasswordValid) {
			res.status(401).json({ error: 'Invalid email or password' });
			return;
		}

        const token = jwt.sign({ userId: user.id, userType: user.type }, JWT_SECRET);

		// Remove password hash from response
		const { passwordHash, ...userWithoutPassword } = user;

		res.status(200).json({
			message: 'Login successful',
			user: userWithoutPassword,
			token,
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ error: 'Failed to login' });
	}
};

// Get current user profile
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
				parkedDate: true,
				reactivatedDate: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		res.status(200).json({ user });
	} catch (error) {
		console.error('Get me error:', error);
		res.status(500).json({ error: 'Failed to get user profile' });
	}
};
