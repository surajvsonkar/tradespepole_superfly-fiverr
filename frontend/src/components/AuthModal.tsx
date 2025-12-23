import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Wrench, Eye, EyeOff, Phone, MapPin, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User as UserType } from '../types';
import { authService } from '../services/authService';
import { GoogleLogin } from '@react-oauth/google';
import ReCAPTCHA from 'react-google-recaptcha';
import ProfileCompletionModal from './ProfileCompletionModal';

// Check if we have a real reCAPTCHA key (not the test key)
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const USE_RECAPTCHA = RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY !== '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

// Facebook SDK types
declare global {
	interface Window {
		FB: any;
		fbAsyncInit: () => void;
	}
}

// LinkedIn OAuth config
const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID || '';
const LINKEDIN_REDIRECT_URI = import.meta.env.VITE_LINKEDIN_REDIRECT_URI || `${window.location.origin}/`;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';

const AuthModal = () => {
	const navigate = useNavigate();
	const { state, dispatch } = useApp();
	const recaptchaRef = useRef<ReCAPTCHA>(null);

	const [view, setView] = useState<'default' | 'forgot'>('default');
	const [status, setStatus] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [fbLoaded, setFbLoaded] = useState(false);

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		phone: '',
		trades: [] as string[],
		location: '',
		postcode: 'W1K 3DE', // Default postcode
		hourlyRate: '',
	});

	const [captchaToken, setCaptchaToken] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
	const [fetchingLocation, setFetchingLocation] = useState(false);
	const [showProfileCompletion, setShowProfileCompletion] = useState(false);
	const [newGoogleUser, setNewGoogleUser] = useState<{ id: string; name: string; email: string; type: 'homeowner' | 'tradesperson' } | null>(null);

	// Initialize Facebook SDK
	useEffect(() => {
		if (FACEBOOK_APP_ID && !window.FB) {
			window.fbAsyncInit = function() {
				window.FB.init({
					appId: FACEBOOK_APP_ID,
					cookie: true,
					xfbml: true,
					version: 'v18.0'
				});
				setFbLoaded(true);
			};

			// Load the SDK asynchronously
			const script = document.createElement('script');
			script.src = 'https://connect.facebook.net/en_US/sdk.js';
			script.async = true;
			script.defer = true;
			document.body.appendChild(script);
		} else if (window.FB) {
			setFbLoaded(true);
		}
	}, []);

	// Handle LinkedIn OAuth callback
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		const linkedinState = urlParams.get('state');
		
		if (code && linkedinState === 'linkedin_auth') {
			handleLinkedInCallback(code);
			// Clear the URL params
			window.history.replaceState({}, document.title, window.location.pathname);
		}
	}, []);

	const handleLinkedInCallback = async (code: string) => {
		try {
			setIsLoading(true);
			const response = await authService.linkedinLogin(
				code,
				LINKEDIN_REDIRECT_URI,
				state.authMode === 'signup' ? state.userType : undefined
			);
			handleAuthSuccess(response);
		} catch (err: any) {
			if (err.message?.includes('User type required')) {
				setStatus({ type: 'error', text: 'Please select if you are a Homeowner or Tradesperson first' });
			} else {
				setStatus({ type: 'error', text: 'LinkedIn login failed. Please try again.' });
			}
		} finally {
			setIsLoading(false);
		}
	};

	const availableTrades = [
		'Builder', 'Electrician', 'Handyman', 'Painter & Decorator', 'Plasterer',
		'Plumber', 'Roofer', 'Carpenter & Joiner', 'Landscaper', 'Bathroom Fitter',
		'Bricklayer', 'Gas Engineer', 'Carpet Fitter', 'Kitchen Fitter', 'Cabinet Maker',
		'Tiler', 'Door Fitter', 'Glazier', 'Stove Fitter', 'Window Fitter',
		'Tree Surgeon', 'Gardener', 'Locksmith', 'Architectural Designer', 'Groundworker',
		'Stonemason', 'Heating Engineer', 'Insulation Company', 'Fencer',
		'Waste & Rubbish Clearance Company', 'Demolition Company', 'Decking Installer',
		'Extension Builder', 'Security System Installer', 'Conservatory Installer',
		'Driveways Installer', 'Flooring Fitter', 'Guttering Installer', 'Vinyl Flooring Fitter',
		'Fireplace Installer', 'Architectural Technician', 'Chimney Repair Specialist',
		'Garden Maintenance Company', 'Loft Conversion Company', 'Damp Proofer',
		'Conversion Specialist', 'Garage Conversion Specialist', 'New Home Builder',
		'Repointing Specialist', 'Fascias & Soffits Installer', 'Tarmac Driveway Company',
		'Building Restoration & Refurbishment Company',
	];

	if (!state.showAuthModal) return null;

	const handleTradeToggle = (trade: string) => {
		setFormData((prev) => ({
			...prev,
			trades: prev.trades.includes(trade)
				? prev.trades.filter((t) => t !== trade)
				: [...prev.trades, trade],
		}));
	};

	const resetForm = () => {
		setFormData({
			name: '',
			email: '',
			password: '',
			phone: '',
			trades: [],
			location: '',
			postcode: 'W1K 3DE',
			hourlyRate: '',
		});
		setView('default');
		setCaptchaToken(null);
		setDevResetUrl(null);
		if (recaptchaRef.current) recaptchaRef.current.reset();
	};

	// Fetch current location
	const handleUseCurrentLocation = () => {
		if (!navigator.geolocation) {
			setStatus({ type: 'error', text: 'Geolocation is not supported by your browser' });
			return;
		}

		setFetchingLocation(true);
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				try {
					const { latitude, longitude } = position.coords;
					// Reverse geocode to get address
					const response = await fetch(
						`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
					);
					const data = await response.json();
					
					if (data.results && data.results[0]) {
						const address = data.results[0].formatted_address;
						setFormData(prev => ({ ...prev, location: address }));
					} else {
						setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
					}
				} catch (error) {
					console.error('Error getting address:', error);
					setFormData(prev => ({ ...prev, location: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}` }));
				} finally {
					setFetchingLocation(false);
				}
			},
			(error) => {
				console.error('Geolocation error:', error);
				setStatus({ type: 'error', text: 'Unable to get your location. Please enter manually.' });
				setFetchingLocation(false);
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
		);
	};

	const closeModalDelayed = (ms = 1500) => {
		setTimeout(() => {
			dispatch({ type: 'HIDE_AUTH_MODAL' });
			setStatus(null);
			resetForm();
		}, ms);
	};

	const handleGoogleSuccess = async (credentialResponse: any) => {
		try {
			setIsLoading(true);
			const response = await authService.googleLogin(
				credentialResponse.credential,
				state.authMode === 'signup' ? state.userType : undefined
			);
			
			// If this is a new user from Google sign-up, show profile completion form
			if (response.isNewUser) {
				setNewGoogleUser({
					id: response.user.id,
					name: response.user.name,
					email: response.user.email,
					type: response.user.type,
				});
				setShowProfileCompletion(true);
			} else {
				handleAuthSuccess(response);
			}
		} catch (err: any) {
			if (err.message?.includes('User type required')) {
				setStatus({ type: 'error', text: 'Please select if you are a Homeowner or Tradesperson first' });
			} else {
				setStatus({ type: 'error', text: 'Google login failed. Please try again.' });
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleFacebookLogin = async () => {
		if (!window.FB) {
			setStatus({ type: 'error', text: 'Facebook SDK not loaded. Please try again.' });
			return;
		}

		try {
			window.FB.login(async (response: any) => {
				if (response.authResponse) {
					setIsLoading(true);
					try {
						const result = await authService.facebookLogin(
							response.authResponse.accessToken,
							state.authMode === 'signup' ? state.userType : undefined
						);
						handleAuthSuccess(result);
					} catch (err: any) {
						if (err.message?.includes('User type required')) {
							setStatus({ type: 'error', text: 'Please select if you are a Homeowner or Tradesperson first' });
						} else {
							setStatus({ type: 'error', text: 'Facebook login failed. Please try again.' });
						}
					} finally {
						setIsLoading(false);
					}
				} else {
					setStatus({ type: 'error', text: 'Facebook login was cancelled' });
				}
			}, { scope: 'email,public_profile' });
		} catch (err) {
			setStatus({ type: 'error', text: 'Facebook login failed. Please try again.' });
		}
	};

	const handleLinkedInLogin = () => {
		if (!LINKEDIN_CLIENT_ID) {
			setStatus({ type: 'error', text: 'LinkedIn login is not configured' });
			return;
		}

		const scope = 'openid profile email';
		const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&state=linkedin_auth&scope=${encodeURIComponent(scope)}`;
		window.location.href = authUrl;
	};

	const handleAuthSuccess = (response: any) => {
		if (response.user) {
			const user: UserType = {
				id: response.user.id,
				name: response.user.name,
				email: response.user.email,
				type: response.user.type,
				location: response.user.location,
				trades: response.user.trades || [],
				rating: response.user.rating || 0,
				reviews: response.user.reviews || 0,
				verified: response.user.verified || false,
				credits: response.user.credits || 0,
				membershipType: response.user.membershipType || 'none',
				membershipExpiry: response.user.membershipExpiry,
				verificationStatus: response.user.verificationStatus,
				accountStatus: response.user.accountStatus,
				workingArea: response.user.workingArea,
				hasDirectoryListing: response.user.hasDirectoryListing || false,
				directoryListingExpiry: response.user.directoryListingExpiry,
			};

			dispatch({ type: 'SET_USER', payload: user });
			if (state.authMode === 'login') {
				navigate('/');
			}
			
			// Trigger WebSocket connection
			window.dispatchEvent(new CustomEvent('user-logged-in'));

			setStatus({ type: 'success', text: 'Success!' });
			closeModalDelayed();
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus(null);

		if (state.authMode === 'signup' && USE_RECAPTCHA && !captchaToken) {
			setStatus({ type: 'error', text: 'Please complete the CAPTCHA' });
			return;
		}

		setIsLoading(true);

		try {
			if (state.authMode === 'signup') {
				if (state.userType === 'tradesperson' && formData.trades.length === 0) {
					setStatus({ type: 'error', text: 'Please select at least one trade' });
					setIsLoading(false);
					return;
				}

				const registerData = {
					name: formData.name,
					email: formData.email,
					password: formData.password,
					phone: formData.phone || undefined,
					type: state.userType,
					location: formData.location,
					postcode: formData.postcode || 'W1K 3DE',
					captchaToken: captchaToken || undefined,
					...(state.userType === 'tradesperson' && { trades: formData.trades }),
				};

				await authService.register(registerData);
				setStatus({ type: 'success', text: 'Account created! Please check your email to verify your account.' });
				closeModalDelayed(3000);
			} else {
				const response = await authService.login({
					email: formData.email,
					password: formData.password,
				});
				handleAuthSuccess(response);
			}
		} catch (err: any) {
			console.error('Auth error', err);
			setStatus({
				type: 'error',
				text: err.response?.data?.error || err.message || 'Authentication failed',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus(null);
		setDevResetUrl(null);
		setIsLoading(true);
		try {
			const response = await authService.forgotPassword(formData.email);
			if (response.resetUrl) {
				// Development mode - show the reset link directly
				setDevResetUrl(response.resetUrl);
				setStatus({ 
					type: 'success', 
					text: 'Development Mode: SMTP not configured. Use the button below to reset password.' 
				});
			} else {
				setStatus({ type: 'success', text: 'If an account exists, a reset link has been sent to your email.' });
			}
		} catch (err: any) {
			setStatus({ type: 'error', text: 'Failed to request password reset. Please try again.' });
		} finally {
			setIsLoading(false);
		}
	};

	return (
	<>
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full max-h-[95vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-gray-900">
						{view === 'forgot' ? 'Reset Password' : (state.authMode === 'login' ? 'Sign In' : 'Create Account')}
					</h2>
					<button
						onClick={() => {
							dispatch({ type: 'HIDE_AUTH_MODAL' });
							resetForm();
						}}
						className="text-gray-400 hover:text-gray-600"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				{view === 'default' && (
					<>
						<div className="flex mb-6">
							<button
								type="button"
								onClick={() =>
									dispatch({
										type: 'SHOW_AUTH_MODAL',
										payload: { mode: state.authMode, userType: 'homeowner' },
									})
								}
								className={`flex-1 p-3 text-center rounded-l-lg border transition-colors touch-manipulation ${
									state.userType === 'homeowner'
										? 'bg-blue-50 border-blue-200 text-blue-700'
										: 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
								}`}
							>
								<User className="w-5 h-5 mx-auto mb-1" />
								<span className="text-sm font-medium">Homeowner</span>
							</button>
							<button
								type="button"
								onClick={() =>
									dispatch({
										type: 'SHOW_AUTH_MODAL',
										payload: { mode: state.authMode, userType: 'tradesperson' },
									})
								}
								className={`flex-1 p-3 text-center rounded-r-lg border transition-colors touch-manipulation ${
									state.userType === 'tradesperson'
										? 'bg-blue-50 border-blue-200 text-blue-700'
										: 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
								}`}
							>
								<Wrench className="w-5 h-5 mx-auto mb-1" />
								<span className="text-sm font-medium">Tradesperson</span>
							</button>
						</div>

						{/* Social Login */}
						<div className="mb-6">
							<div className="space-y-3">
								{/* Google Login */}
								<div className="w-full flex justify-center">
									<GoogleLogin
										onSuccess={handleGoogleSuccess}
										onError={() => setStatus({ type: 'error', text: 'Google Login Failed' })}
										useOneTap
									/>
								</div>
								
								{/* Facebook Login */}
								{FACEBOOK_APP_ID && (
									<button
										type="button"
										onClick={handleFacebookLogin}
										disabled={isLoading || !fbLoaded}
										className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
											<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
										</svg>
										<span className="text-sm font-medium text-gray-700">Continue with Facebook</span>
									</button>
								)}
								
								{/* LinkedIn Login */}
								{LINKEDIN_CLIENT_ID && (
									<button
										type="button"
										onClick={handleLinkedInLogin}
										disabled={isLoading}
										className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
											<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
										</svg>
										<span className="text-sm font-medium text-gray-700">Continue with LinkedIn</span>
									</button>
								)}
							</div>
							
							<div className="relative mt-6">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white text-gray-500">Or continue with email</span>
								</div>
							</div>
						</div>
					</>
				)}

				{status && (
					<div
						className={`mb-4 p-3 rounded-lg border ${
							status.type === 'success'
								? 'bg-green-50 border-green-200 text-green-800'
								: 'bg-red-50 border-red-200 text-red-800'
						}`}
					>
						{status.text}
					</div>
				)}

				{view === 'forgot' ? (
					<form onSubmit={handleForgotPassword} className="space-y-4">
						<input
							type="email"
							placeholder="Email Address"
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
							required
						/>
						{devResetUrl && (
							<a
								href={devResetUrl}
								className="block w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center"
								onClick={() => dispatch({ type: 'HIDE_AUTH_MODAL' })}
							>
								🔗 Click to Reset Password (Dev Mode)
							</a>
						)}
						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{isLoading ? (
								<>
									<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									<span>Sending...</span>
								</>
							) : (
								'Send Reset Link'
							)}
						</button>
						<button
							type="button"
							onClick={() => setView('default')}
							className="w-full text-gray-600 py-2 hover:text-gray-800"
						>
							Back to Login
						</button>
					</form>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						{state.authMode === 'signup' && (
							<input
								type="text"
								placeholder="Full Name"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
								required
							/>
						)}

						<input
							type="email"
							placeholder="Email Address"
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
							required
						/>

						<div className="relative">
							<input
								type={showPassword ? 'text' : 'password'}
								placeholder="Password"
								value={formData.password}
								onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
								required
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
							</button>
						</div>

						{state.authMode === 'login' && (
							<div className="flex justify-end">
								<button
									type="button"
									onClick={() => setView('forgot')}
									className="text-sm text-blue-600 hover:underline"
								>
									Forgot Password?
								</button>
							</div>
						)}

						{state.authMode === 'signup' && (
							<>
								{/* Phone Number Field */}
								<div className="relative">
									<Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
									<input
										type="tel"
										placeholder="Phone Number (e.g., +353851234567)"
										value={formData.phone}
										onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
										className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
										required
									/>
								</div>

								<div className="relative">
									<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
									<input
										type="text"
										placeholder="Location"
										value={formData.location}
										onChange={(e) => setFormData({ ...formData, location: e.target.value })}
										className="w-full px-4 py-3 pl-10 pr-28 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
										required
									/>
									<button
										type="button"
										onClick={handleUseCurrentLocation}
										disabled={fetchingLocation}
										className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center gap-1"
									>
										{fetchingLocation ? (
											<>
												<Loader className="w-3 h-3 animate-spin" />
												<span>Getting...</span>
											</>
										) : (
											<>
												<MapPin className="w-3 h-3" />
												<span>Use Current</span>
											</>
										)}
									</button>
								</div>

								{state.userType === 'tradesperson' && (
									<div className="relative">
										<div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex items-center justify-center font-bold">£</div>
										<input
											type="number"
											placeholder="Hourly Rate (Optional)"
											value={(formData as any).hourlyRate}
											onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value } as any)}
											className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
										/>
									</div>
								)}

								<div className="relative">
									<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
									<input
										type="text"
										placeholder="Postcode (e.g., SW1A 1AA)"
										value={formData.postcode}
										onChange={(e) => {
											const val = e.target.value.toUpperCase();
											setFormData({ ...formData, postcode: val });
											
											// Basic UK Postcode validation
											const postcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0AA)$/i;
											if (val && !postcodeRegex.test(val)) {
												// Optional: Set a temporary visual error or toast
											}
										}}
										className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base uppercase"
										required
									/>
									<p className="mt-1 text-xs text-gray-500">
										Enter your UK postcode (e.g., SW1A 1AA)
									</p>
								</div>

								{state.userType === 'tradesperson' && (
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Select Your Trades
										</label>
										{formData.trades.length > 0 && (
											<div className="flex flex-wrap gap-2 mb-2">
												{formData.trades.map((trade) => (
													<span
														key={trade}
														className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
													>
														{trade}
														<button
															type="button"
															onClick={() => handleTradeToggle(trade)}
															className="ml-1 text-blue-600 hover:text-blue-800"
														>
															×
														</button>
													</span>
												))}
											</div>
										)}
										<div className="max-h-32 sm:max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
											{availableTrades.map((trade) => (
												<label key={trade} className="flex items-center cursor-pointer">
													<input
														type="checkbox"
														checked={formData.trades.includes(trade)}
														onChange={() => handleTradeToggle(trade)}
														className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
													/>
													<span className="text-sm text-gray-700">{trade}</span>
												</label>
											))}
										</div>
									</div>
								)}

								{USE_RECAPTCHA ? (
									<div className="flex justify-center my-4">
										<ReCAPTCHA
											ref={recaptchaRef}
											sitekey={RECAPTCHA_SITE_KEY}
											onChange={(token) => setCaptchaToken(token)}
										/>
									</div>
								) : (
									<div className="text-center text-sm text-gray-500 my-4 p-3 bg-gray-50 rounded-lg">
										<span className="text-green-600">✓</span> Development mode - CAPTCHA disabled
									</div>
								)}
							</>
						)}

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold touch-manipulation text-base min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{isLoading ? (
								<>
									<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									<span>Processing...</span>
								</>
							) : (
								state.authMode === 'login' ? 'Sign In' : 'Create Account'
							)}
						</button>
					</form>
				)}

				{view === 'default' && (
					<div className="mt-6 text-center">
						<button
							onClick={() =>
								dispatch({
									type: 'SHOW_AUTH_MODAL',
									payload: {
										mode: state.authMode === 'login' ? 'signup' : 'login',
										userType: state.userType,
									},
								})
							}
							className="text-blue-600 hover:underline touch-manipulation"
						>
							{state.authMode === 'login'
								? "Don't have an account? Sign up"
								: 'Already have an account? Sign in'}
						</button>
					</div>
				)}
			</div>
		</div>

		{/* Profile Completion Modal for Google Sign-ups */}
		{showProfileCompletion && newGoogleUser && (
			<ProfileCompletionModal
				isOpen={showProfileCompletion}
				onClose={() => setShowProfileCompletion(false)}
				user={newGoogleUser}
				onComplete={(updatedUser) => {
					// Create full user object and complete auth
					const user: UserType = {
						id: updatedUser.id,
						name: updatedUser.name,
						email: updatedUser.email,
						type: updatedUser.type,
						location: updatedUser.location,
						trades: updatedUser.trades || [],
						rating: updatedUser.rating || 0,
						reviews: updatedUser.reviews || 0,
						verified: updatedUser.verified || false,
						credits: updatedUser.credits || 0,
						membershipType: updatedUser.membershipType || 'none',
						membershipExpiry: updatedUser.membershipExpiry,
						verificationStatus: updatedUser.verificationStatus,
						accountStatus: updatedUser.accountStatus,
						workingArea: updatedUser.workingArea,
						hasDirectoryListing: updatedUser.hasDirectoryListing || false,
						directoryListingExpiry: updatedUser.directoryListingExpiry,
					};
					
					dispatch({ type: 'SET_USER', payload: user });
					window.dispatchEvent(new CustomEvent('user-logged-in'));
					setShowProfileCompletion(false);
					setNewGoogleUser(null);
					setStatus({ type: 'success', text: 'Profile completed successfully!' });
					closeModalDelayed();
				}}
			/>
		)}
	</>
	);
};

export default AuthModal;
