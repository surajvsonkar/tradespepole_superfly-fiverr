import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import jobRoutes from './routes/jobRoutes';
import reviewRoutes from './routes/reviewRoutes';
import quoteRoutes from './routes/quoteRoutes';
import conversationRoutes from './routes/conversationRoutes';
import adminRoutes from './routes/adminRoutes';
import paymentRoutes from './routes/paymentRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import settingsRoutes from './routes/settingsRoutes';
import ChatServer from './websocket/chatServer';

const allowedOrigins = [
	'http://localhost:3000',
	'http://localhost:5173',
	'https://www.247tradespeople.com',
];

// Load environment variables
dotenv.config();

const app: Application = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

const chatServer = new ChatServer(server);

// Middleware
app.use(
	cors({
		origin: (origin, callback) => {
			// Allow Postman / server-to-server
			if (!origin) return callback(null, true);

			if (allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error('CORS not allowed'));
			}
		},
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	})
);

// IMPORTANT for preflight
app.options(/.*/, cors());

// Stripe webhook needs raw body - must be before json middleware
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
	next();
});

// Health check route
app.get('/', (req: Request, res: Response) => {
	res.json({
		message: '24/7 Tradespeople API',
		version: '1.0.0',
		status: 'running',
	});
});

app.get('/health', (req: Request, res: Response) => {
	res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
	res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
	console.error('Error:', err);
	res.status(err.status || 500).json({
		error: err.message || 'Internal server error',
	});
});

// Start server
server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`WebSocket server initialized`);
	console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
