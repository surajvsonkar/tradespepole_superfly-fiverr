import React, { useState } from 'react';
import { MapPin, Loader, Check } from 'lucide-react';
import { userService } from '../services/userService';

interface ProfileCompletionModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: {
		id: string;
		name: string;
		email: string;
		type: 'homeowner' | 'tradesperson';
	};
	onComplete: (updatedUser: any) => void;
}

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

// UK Postcode validation regex
const UK_POSTCODE_REGEX = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0AA)$/i;

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
	isOpen,
	onClose,
	user,
	onComplete
}) => {
	const [formData, setFormData] = useState({
		name: user.name || '',
		phone: '',
		location: '',
		postcode: '',
		trades: [] as string[],
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fetchingLocation, setFetchingLocation] = useState(false);

	const handleTradeToggle = (trade: string) => {
		setFormData((prev) => ({
			...prev,
			trades: prev.trades.includes(trade)
				? prev.trades.filter((t) => t !== trade)
				: [...prev.trades, trade],
		}));
	};

	const handleUseCurrentLocation = () => {
		if (!navigator.geolocation) {
			setError('Geolocation is not supported by your browser');
			return;
		}

		setFetchingLocation(true);
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				try {
					const { latitude, longitude } = position.coords;
					const response = await fetch(
						`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
					);
					const data = await response.json();
					
					if (data.display_name) {
						setFormData(prev => ({ ...prev, location: data.display_name }));
					}
					if (data.address?.postcode) {
						setFormData(prev => ({ ...prev, postcode: data.address.postcode }));
					}
				} catch (error) {
					console.error('Error getting address:', error);
				} finally {
					setFetchingLocation(false);
				}
			},
			(error) => {
				console.error('Geolocation error:', error);
				setError('Unable to get your location. Please enter manually.');
				setFetchingLocation(false);
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
		);
	};

	const validatePostcode = (postcode: string): boolean => {
		return UK_POSTCODE_REGEX.test(postcode.trim());
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validation
		if (!formData.name.trim()) {
			setError('Please enter your name');
			return;
		}

		if (!formData.location.trim()) {
			setError('Please enter your location');
			return;
		}

		if (!formData.postcode.trim() || !validatePostcode(formData.postcode)) {
			setError('Please enter a valid UK postcode (e.g., SW1A 1AA)');
			return;
		}

		if (user.type === 'tradesperson' && formData.trades.length === 0) {
			setError('Please select at least one trade');
			return;
		}

		setIsLoading(true);

		try {
			const updateData: any = {
				name: formData.name,
				location: formData.location,
				workPostcode: formData.postcode.toUpperCase(),
			};

			if (formData.phone) {
				updateData.phone = formData.phone;
			}

			if (user.type === 'tradesperson') {
				updateData.trades = formData.trades;
			}

			const response = await userService.updateProfile(updateData);
			onComplete(response.user);
		} catch (err: any) {
			console.error('Profile update error:', err);
			setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full max-h-[95vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-gray-900">
						Complete Your Profile
					</h2>
				</div>

				<p className="text-gray-600 mb-6">
					Please provide a few more details to complete your registration.
				</p>

				{error && (
					<div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Full Name */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Full Name *
						</label>
						<input
							type="text"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Enter your full name"
							required
						/>
					</div>

					{/* Phone */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Phone Number
						</label>
						<input
							type="tel"
							value={formData.phone}
							onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="+44 7700 900000"
						/>
					</div>

					{/* Location */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Location *
						</label>
						<div className="relative">
							<input
								type="text"
								value={formData.location}
								onChange={(e) => setFormData({ ...formData, location: e.target.value })}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-24"
								placeholder="e.g., London, UK"
								required
							/>
							<button
								type="button"
								onClick={handleUseCurrentLocation}
								disabled={fetchingLocation}
								className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 text-sm flex items-center"
							>
								{fetchingLocation ? (
									<Loader className="w-4 h-4 animate-spin mr-1" />
								) : (
									<MapPin className="w-4 h-4 mr-1" />
								)}
								{fetchingLocation ? 'Getting...' : 'Use GPS'}
							</button>
						</div>
					</div>

					{/* Postcode */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Postcode * (UK format)
						</label>
						<input
							type="text"
							value={formData.postcode}
							onChange={(e) => setFormData({ ...formData, postcode: e.target.value.toUpperCase() })}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="e.g., SW1A 1AA"
							required
						/>
					</div>

					{/* Trades Selection (for tradesperson only) */}
					{user.type === 'tradesperson' && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Select Your Trades * (choose all that apply)
							</label>
							<div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
								<div className="grid grid-cols-2 gap-2">
									{availableTrades.map((trade) => (
										<button
											key={trade}
											type="button"
											onClick={() => handleTradeToggle(trade)}
											className={`flex items-center p-2 text-left text-sm rounded-lg transition-colors ${
												formData.trades.includes(trade)
													? 'bg-blue-100 text-blue-800 border border-blue-300'
													: 'bg-gray-50 hover:bg-gray-100 border border-transparent'
											}`}
										>
											{formData.trades.includes(trade) && (
												<Check className="w-4 h-4 mr-1 flex-shrink-0" />
											)}
											<span className="truncate">{trade}</span>
										</button>
									))}
								</div>
							</div>
							{formData.trades.length > 0 && (
								<p className="text-sm text-gray-500 mt-2">
									Selected: {formData.trades.length} trade(s)
								</p>
							)}
						</div>
					)}

					<button
						type="submit"
						disabled={isLoading}
						className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? 'Saving...' : 'Complete Registration'}
					</button>
				</form>
			</div>
		</div>
	);
};

export default ProfileCompletionModal;
