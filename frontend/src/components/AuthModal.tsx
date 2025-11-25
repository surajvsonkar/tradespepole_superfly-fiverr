import React, { useState } from 'react';
import { X, User, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User as UserType } from '../types';
import { authService } from '../services/authService';

const AuthModal = () => {
	const { state, dispatch } = useApp();

	const [status, setStatus] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		trades: [] as string[],
		location: '',
	});

	const availableTrades = [
		'Builder',
		'Electrician',
		'Handyman',
		'Painter & Decorator',
		'Plasterer',
		'Plumber',
		'Roofer',
		'Carpenter & Joiner',
		'Landscaper',
		'Bathroom Fitter',
		'Bricklayer',
		'Gas Engineer',
		'Carpet Fitter',
		'Kitchen Fitter',
		'Cabinet Maker',
		'Tiler',
		'Door Fitter',
		'Glazier',
		'Stove Fitter',
		'Window Fitter',
		'Tree Surgeon',
		'Gardener',
		'Locksmith',
		'Architectural Designer',
		'Groundworker',
		'Stonemason',
		'Heating Engineer',
		'Insulation Company',
		'Fencer',
		'Waste & Rubbish Clearance Company',
		'Demolition Company',
		'Decking Installer',
		'Extension Builder',
		'Security System Installer',
		'Conservatory Installer',
		'Driveways Installer',
		'Flooring Fitter',
		'Guttering Installer',
		'Vinyl Flooring Fitter',
		'Fireplace Installer',
		'Architectural Technician',
		'Chimney Repair Specialist',
		'Garden Maintenance Company',
		'Loft Conversion Company',
		'Damp Proofer',
		'Conversion Specialist',
		'Garage Conversion Specialist',
		'New Home Builder',
		'Repointing Specialist',
		'Fascias & Soffits Installer',
		'Tarmac Driveway Company',
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
			trades: [],
			location: '',
		});
	};

	const closeModalDelayed = (ms = 1500) => {
		setTimeout(() => {
			dispatch({ type: 'HIDE_AUTH_MODAL' });
			setStatus(null);
		}, ms);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus(null);

		try {
			if (state.authMode === 'signup') {
				if (state.userType === 'tradesperson' && formData.trades.length === 0) {
					setStatus({
						type: 'error',
						text: 'Please select at least one trade',
					});
					return;
				}

				const registerData = {
					name: formData.name,
					email: formData.email,
					password: formData.password,
					type: state.userType,
					location: formData.location,
					...(state.userType === 'tradesperson' && { trades: formData.trades }),
				};

				const response = await authService.register(registerData);

				if (response.user) {
					const newUser: UserType = {
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
					};

					dispatch({ type: 'SET_USER', payload: newUser });
				}

				setStatus({ type: 'success', text: 'Account created successfully' });
				
				// Trigger WebSocket connection
				window.dispatchEvent(new CustomEvent('user-logged-in'));
				
				resetForm();
				closeModalDelayed(1800);
			} else {
				const response = await authService.login({
					email: formData.email,
					password: formData.password,
				});

				if (response.user) {
					const existingUser: UserType = {
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
					};

					dispatch({ type: 'SET_USER', payload: existingUser });
					dispatch({ type: 'SET_VIEW', payload: 'home' });

					// Trigger WebSocket connection
					window.dispatchEvent(new CustomEvent('user-logged-in'));

					setStatus({
						type: 'success',
						text: 'Signed in successfully',
					});
					resetForm();
					closeModalDelayed(1200);
				}
			}
		} catch (err: any) {
			console.error('Auth error', err);
			setStatus({
				type: 'error',
				text: err?.message || 'Authentication failed. Please try again.',
			});
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full max-h-[95vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-gray-900">
						{state.authMode === 'login' ? 'Sign In' : 'Create Account'}
					</h2>
					<button
						onClick={() => dispatch({ type: 'HIDE_AUTH_MODAL' })}
						className="text-gray-400 hover:text-gray-600"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

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

				<form onSubmit={handleSubmit} className="space-y-4">
					{state.authMode === 'signup' && (
						<input
							type="text"
							placeholder="Full Name"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
							autoComplete="name"
							required
						/>
					)}

					<input
						type="email"
						placeholder="Email Address"
						value={formData.email}
						onChange={(e) =>
							setFormData({ ...formData, email: e.target.value })
						}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
						autoComplete="email"
						required
					/>

					<input
						type="password"
						placeholder="Password"
						value={formData.password}
						onChange={(e) =>
							setFormData({ ...formData, password: e.target.value })
						}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
						autoComplete={
							state.authMode === 'login' ? 'current-password' : 'new-password'
						}
						required
					/>

					{state.authMode === 'signup' && (
						<>
							<input
								type="text"
								placeholder="Location"
								value={formData.location}
								onChange={(e) =>
									setFormData({ ...formData, location: e.target.value })
								}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
								autoComplete="address-level2"
								required
							/>

							{state.userType === 'tradesperson' && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Select Your Trades (choose all that apply)
									</label>
									<div className="max-h-32 sm:max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
										{availableTrades.map((trade) => (
											<label key={trade} className="flex items-center">
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
									{formData.trades.length === 0 && (
										<p className="text-sm text-red-600 mt-1">
											Please select at least one trade
										</p>
									)}
								</div>
							)}
						</>
					)}

					<button
						type="submit"
						className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold touch-manipulation text-base min-h-[48px]"
					>
						{state.authMode === 'login' ? 'Sign In' : 'Create Account'}
					</button>
				</form>

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
			</div>
		</div>
	);
};

export default AuthModal;
