import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	ArrowLeft,
	User,
	Zap,
	Star,
	TrendingUp,
	BarChart3,
	Headphones,
	Award,
	Infinity,
	Check,
	Crown,
	Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import BoostPaymentModal from './BoostPaymentModal';
import { paymentService } from '../services/paymentService';

export default function BoostPage() {
	const navigate = useNavigate();
	const { state, dispatch } = useApp();
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [membershipStatus, setMembershipStatus] = useState<{
		membershipType: string | null;
		membershipExpiry: string | null;
		isActive: boolean;
		daysRemaining: number;
	} | null>(null);
	const [loadingStatus, setLoadingStatus] = useState(true);

	useEffect(() => {
		const fetchMembershipStatus = async () => {
			if (state.currentUser?.type === 'tradesperson') {
				try {
					const status = await paymentService.getMembershipStatus();
					setMembershipStatus(status);
				} catch (error) {
					console.error('Error fetching membership status:', error);
				} finally {
					setLoadingStatus(false);
				}
			} else {
				setLoadingStatus(false);
			}
		};
		fetchMembershipStatus();
	}, [state.currentUser]);

	// Redirect non-tradespeople
	if (!state.currentUser || state.currentUser.type !== 'tradesperson') {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-3xl mx-auto p-6 text-center">
					<div className="mb-6">
						<button
							onClick={() => navigate('/')}
							className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
						>
							<ArrowLeft className="w-5 h-5 mr-2" />
							Back to Home
						</button>
					</div>
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
						<User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
						<h1 className="text-2xl font-bold text-gray-900 mb-4">
							Tradespeople Only
						</h1>
						<p className="text-gray-600 mb-6">
							Profile boosting is exclusively available for tradespeople. Please
							sign in as a tradesperson to access this feature.
						</p>
						<div className="space-x-4">
							<button
								onClick={() =>
									dispatch({
										type: 'SHOW_AUTH_MODAL',
										payload: { mode: 'login', userType: 'tradesperson' },
									})
								}
								className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
							>
								Sign In as Tradesperson
							</button>
							<button
								onClick={() =>
									dispatch({
										type: 'SHOW_AUTH_MODAL',
										payload: { mode: 'signup', userType: 'tradesperson' },
									})
								}
								className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
							>
								Join as Tradesperson
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const handleBoostSuccess = () => {
		// Refresh membership status
		paymentService.getMembershipStatus().then(setMembershipStatus);
	};

	const features = [
		{
			icon: TrendingUp,
			title: 'Top Search Placement',
			description: 'Be the first profile clients see when searching',
			color: 'text-blue-600',
			bg: 'bg-blue-100',
		},
		{
			icon: Star,
			title: '3x More Profile Views',
			description: 'Dramatically increase your visibility to potential clients',
			color: 'text-yellow-600',
			bg: 'bg-yellow-100',
		},
		{
			icon: Award,
			title: 'Featured Profile Badge',
			description: 'Stand out with a premium badge that builds instant trust',
			color: 'text-purple-600',
			bg: 'bg-purple-100',
		},
		{
			icon: BarChart3,
			title: 'Advanced Analytics',
			description: 'Track views, clicks, and leads with detailed insights',
			color: 'text-green-600',
			bg: 'bg-green-100',
		},
		{
			icon: Headphones,
			title: 'Premium Support',
			description: 'Get priority assistance whenever you need help',
			color: 'text-indigo-600',
			bg: 'bg-indigo-100',
		},
	];

	const plans = [
		{ name: '1 Week Boost', price: '£19.99', savings: null },
		{ name: '1 Month Boost', price: '£49.99', savings: '37%' },
		{ name: '3 Month Boost', price: '£99.99', savings: '58%' },
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-8">
			<div className="max-w-4xl mx-auto p-6 space-y-8">
				{/* Back Button */}
				<button
					onClick={() => navigate('/')}
					className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
				>
					<ArrowLeft className="w-5 h-5 mr-2" />
					Back to Home
				</button>

				{/* Current Membership Status */}
				{membershipStatus?.isActive && (
					<div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
									<Crown className="w-6 h-6" />
								</div>
								<div>
									<h3 className="text-xl font-bold">
										Active Boost:{' '}
										{membershipStatus.membershipType === 'unlimited_5_year' 
											? 'VIP Member' 
											: membershipStatus.membershipType?.replace(/_/g, ' ')}
									</h3>
									<p className="text-green-100">
										{membershipStatus.daysRemaining} days remaining
									</p>
								</div>
							</div>
							<div className="text-right">
								<p className="text-sm text-green-100">Expires</p>
								<p className="font-semibold">
									{new Date(
										membershipStatus.membershipExpiry!
									).toLocaleDateString()}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Hero Section */}
				<div className="text-center">
					<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
						<Zap className="w-10 h-10 text-white" />
					</div>
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						🚀 Supercharge Your Profile
					</h1>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Get noticed, win more jobs, and grow your business faster with{' '}
						<span className="font-bold text-blue-600">BOOST</span>
					</p>
				</div>

				{/* Features Grid */}
				<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
						<Sparkles className="w-6 h-6 text-yellow-500 mr-2" />
						What You Get with BOOST
					</h2>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{features.map((feature, index) => (
							<div
								key={index}
								className="flex items-start p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
							>
								<div
									className={`w-10 h-10 ${feature.bg} rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}
								>
									<feature.icon className={`w-5 h-5 ${feature.color}`} />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-1">
										{feature.title}
									</h3>
									<p className="text-sm text-gray-600">{feature.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Pricing Table */}
				<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-6">
						💰 Simple, Flexible Pricing
					</h2>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-200">
									<th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
										Plan
									</th>
									<th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
										Price
									</th>
									<th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
										Savings
									</th>
								</tr>
							</thead>
							<tbody>
								{plans.map((plan, index) => (
									<tr
										key={index}
										className={index % 2 === 1 ? 'bg-gray-50' : ''}
									>
										<td className="px-4 py-4 font-medium text-gray-900">
											{plan.name}
										</td>
										<td className="px-4 py-4 text-blue-600 font-semibold">
											{plan.price}
										</td>
										<td className="px-4 py-4">
											{plan.savings ? (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
													Save {plan.savings}
												</span>
											) : (
												<span className="text-gray-400">—</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Special Offer */}
				<div className="relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 rounded-2xl"></div>
					<div className="relative bg-gradient-to-r from-yellow-400/90 via-orange-400/90 to-yellow-500/90 rounded-2xl p-8 shadow-2xl border-4 border-yellow-300">
						<div className="flex items-start justify-between">
							<div>
								<div className="flex items-center mb-2">
									<span className="text-3xl mr-2">🔥</span>
									<h2 className="text-2xl font-bold text-yellow-900">
										SPECIAL OFFER
									</h2>
								</div>
								<h3 className="text-3xl font-bold text-yellow-900 mb-2">
									5 YEARS. VIP MEMBER (UNLIMITED).
								</h3>
								<p className="text-4xl font-bold text-yellow-800 mb-4">
									£995{' '}
									<span className="text-lg font-normal">One-Time Payment</span>
								</p>
							</div>
							<div className="hidden md:block">
								<Infinity className="w-24 h-24 text-yellow-800/30" />
							</div>
						</div>

						<div className="grid md:grid-cols-2 gap-4 mb-6">
							<div className="flex items-center text-yellow-900">
								<Check className="w-5 h-5 mr-2 flex-shrink-0" />
								<span>No lead fees ever</span>
							</div>
							<div className="flex items-center text-yellow-900">
								<Check className="w-5 h-5 mr-2 flex-shrink-0" />
								<span>Unlimited access for 5 full years</span>
							</div>
							<div className="flex items-center text-yellow-900">
								<Check className="w-5 h-5 mr-2 flex-shrink-0" />
								<span>All premium boost features included</span>
							</div>
							<div className="flex items-center text-yellow-900">
								<Check className="w-5 h-5 mr-2 flex-shrink-0" />
								<span>Best value for serious professionals</span>
							</div>
						</div>

						<p className="text-center text-yellow-900 font-bold text-lg">
							⚡ One payment. Zero fees. Unlimited opportunities. ⚡
						</p>
					</div>
				</div>

				{/* CTA Button */}
				<div className="text-center">
					<button
						onClick={() => setShowPaymentModal(true)}
						className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
					>
						<Zap className="w-6 h-6 mr-2" />
						🚀 Boost My Profile Now
					</button>
					<p className="mt-4 text-sm text-gray-500">
						Secure payment via Stripe. Cancel anytime.
					</p>
				</div>
			</div>

			{/* Payment Modal */}
			<BoostPaymentModal
				isOpen={showPaymentModal}
				onClose={() => setShowPaymentModal(false)}
				onSuccess={handleBoostSuccess}
			/>
		</div>
	);
}
