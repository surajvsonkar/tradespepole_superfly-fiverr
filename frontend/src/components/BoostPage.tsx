import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	ArrowLeft,
	Zap,
	Star,
	TrendingUp,
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
import { settingsService, analyticsService } from '../services';

export default function BoostPage() {
	const navigate = useNavigate();
	const { state } = useApp();
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [membershipStatus, setMembershipStatus] = useState<{
		membershipType: string | null;
		membershipExpiry: string | null;
		isActive: boolean;
		daysRemaining: number;
	} | null>(null);

	useEffect(() => {
		// Track view
		analyticsService.trackView('boost_page_view');

		const fetchMembershipStatus = async () => {
			if (state.currentUser?.type === 'tradesperson') {
				try {
					const status = await paymentService.getMembershipStatus();
					setMembershipStatus(status);
				} catch (error) {
					console.error('Error fetching membership status:', error);
				}
			}
		};

		const fetchPrices = async () => {
			try {
				const response = await settingsService.getPublicSettings();
				if (response.settings?.boost_plan_prices) {
					const prices = response.settings.boost_plan_prices;
					
					// Update local plans state based on fetched prices
					const newPlans = [
						{ 
							name: prices['1_week_boost']?.name || '1 Week Boost', 
							price: `£${prices['1_week_boost']?.price || '19.99'}`, 
							savings: null 
						},
						{ 
							name: prices['1_month_boost']?.name || '1 Month Boost', 
							price: `£${prices['1_month_boost']?.price || '49.99'}`, 
							savings: '37%' // Should calculate this dynamically if possible, roughly valid
						},
						{ 
							name: prices['3_month_boost']?.name || '3 Month Boost', 
							price: `£${prices['3_month_boost']?.price || '99.99'}`, 
							savings: '58%'
						},
					];
					setPlanData(newPlans);
					
					if (prices['5_year_unlimited']) {
						setUnlimitedPrice(prices['5_year_unlimited'].price);
					}
				}
			} catch (error) {
				console.error('Error fetching boost prices:', error);
			}
		};

		fetchMembershipStatus();
		fetchPrices();
	}, [state.currentUser]);

	const [planData, setPlanData] = useState([
		{ name: '1 Week Boost', price: '£19.99', savings: null },
		{ name: '1 Month Boost', price: '£49.99', savings: '37%' },
		{ name: '3 Month Boost', price: '£99.99', savings: '58%' },
	]);
	const [unlimitedPrice, setUnlimitedPrice] = useState(995);
	const [pageSettings, setPageSettings] = useState<any>(null);

	useEffect(() => {
		// Track view
		analyticsService.trackView('boost_page_view');

		const fetchMembershipStatus = async () => {
			if (state.currentUser?.type === 'tradesperson') {
				try {
					const status = await paymentService.getMembershipStatus();
					setMembershipStatus(status);
				} catch (error) {
					console.error('Error fetching membership status:', error);
				}
			}
		};

		const fetchPricesAndSettings = async () => {
			try {
				const response = await settingsService.getPublicSettings();
				const settings = response.settings || {};
				setPageSettings(settings);

				if (settings.boost_plan_prices) {
					const prices = settings.boost_plan_prices;
					
					// Update local plans state based on fetched prices
					const newPlans = [
						{ 
							name: prices['1_week_boost']?.name || '1 Week Boost', 
							price: `£${prices['1_week_boost']?.price || '19.99'}`, 
							savings: null 
						},
						{ 
							name: prices['1_month_boost']?.name || '1 Month Boost', 
							price: `£${prices['1_month_boost']?.price || '49.99'}`, 
							savings: '37%' 
						},
						{ 
							name: prices['3_month_boost']?.name || '3 Month Boost', 
							price: `£${prices['3_month_boost']?.price || '99.99'}`, 
							savings: '58%'
						},
					];
					setPlanData(newPlans);
					
					if (prices['5_year_unlimited']) {
						setUnlimitedPrice(prices['5_year_unlimited'].price);
					}
				}
			} catch (error) {
				console.error('Error fetching boost prices:', error);
			}
		};

		fetchMembershipStatus();
		fetchPricesAndSettings();
	}, [state.currentUser]);

	// Redirect if page is hidden by admin
	if (pageSettings?.hide_boost_page === 'true' || pageSettings?.hide_boost_page === true) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Page Unavailable</h2>
					<p className="text-gray-600 mb-6">The boost profile feature is currently unavailable.</p>
					<button onClick={() => navigate('/')} className="text-blue-600 font-medium">Back to Home</button>
				</div>
			</div>
		);
	}

	const handleBoostSuccess = () => {
		// Refresh membership status
		paymentService.getMembershipStatus().then(setMembershipStatus);
	};

	const features = pageSettings?.boost_page_content?.features?.map((f: any, i: number) => ({
		...f,
		icon: [TrendingUp, Star, Award, Zap, Headphones][i] || Sparkles,
		color: ['text-blue-600', 'text-yellow-600', 'text-purple-600', 'text-green-600', 'text-indigo-600'][i] || 'text-gray-600',
		bg: ['bg-blue-100', 'bg-yellow-100', 'bg-purple-100', 'bg-green-100', 'bg-indigo-100'][i] || 'bg-gray-100',
	})) || [
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
			icon: Zap,
			title: '20% Cheaper Job Leads',
			description: 'Pay less for every job lead you purchase while boosted',
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
						{pageSettings?.boost_page_content?.title || '🚀 Supercharge Your Profile'}
					</h1>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						{pageSettings?.boost_page_content?.subtitle || 'Get more leads and grow your business faster with BOOST'}
					</p>
				</div>

				{/* Features Grid */}
				<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
						<Sparkles className="w-6 h-6 text-yellow-500 mr-2" />
						What You Get with BOOST
					</h2>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{features.map((feature: any, index: number) => (
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
								{planData.map((plan, index) => (
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
									£{unlimitedPrice}{' '}
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
