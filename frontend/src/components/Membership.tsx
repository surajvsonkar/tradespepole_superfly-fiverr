import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	ArrowLeft,
	Rocket,
	Star,
	BarChart3,
	CheckCircle,
	TrendingUp,
	Award,
	Zap,
	Calendar,
	Shield,
	Info,
	Crown,
	Sparkles,
	Headphones,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import BoostPaymentModal from './BoostPaymentModal';
import { paymentService } from '../services/paymentService';
import { settingsService } from '../services';
import { LucideIcon } from 'lucide-react';

interface BoostFeature {
	icon: LucideIcon;
	title: string;
	description: string;
}

interface PlanConfig {
	id: string;
	name: string;
	price: string;
	duration: string;
	badge?: string;
	badgeColor?: string;
	leadPrice: string;
	weeklyEquivalent?: string;
	description: string;
	features: string[];
	recommended?: boolean;
	isLongTerm?: boolean;
}

const BOOST_PLANS: PlanConfig[] = [
	{
		id: 'basic',
		name: '1 Week Profile Boost',
		price: '£19.99',
		duration: '7 days',
		leadPrice: '£7.99',
		description: 'Short-term visibility',
		features: [
			'Priority placement for 7 days',
			'Featured profile badge',
			'£7.99 per job lead while Boosted',
		],
		recommended: false,
	},
	{
		id: 'premium',
		name: '1 Month Profile Boost',
		price: '£49.99',
		duration: '30 days',
		badge: 'Most Popular',
		badgeColor: 'bg-blue-500',
		leadPrice: '£7.99',
		weeklyEquivalent: '£12.50 per week',
		description: 'Best for steady work',
		features: [
			'Consistent visibility for 30 days',
			'Priority placement throughout the month',
			'£7.99 per job lead while Boosted',
			'Equivalent to £12.50 per week',
		],
		recommended: true,
	},
	{
		id: 'premium_3_month',
		name: '3 Month Profile Boost',
		price: '£99.99',
		duration: '90 days',
		badge: 'Best Value',
		badgeColor: 'bg-green-500',
		leadPrice: '£7.99',
		weeklyEquivalent: '£8.33 per week',
		description: 'Save 58% · Lowest weekly cost',
		features: [
			'Maximum visibility over time',
			'Ideal for busy trades',
			'£7.99 per job lead while Boosted',
			'Equivalent to £8.33 per week',
		],
		recommended: false,
	},
	{
		id: 'unlimited_5_year',
		name: '5-Year Profile Boost Pass',
		price: '£995',
		duration: '5 years',
		badge: 'Long-Term',
		badgeColor: 'bg-yellow-500',
		leadPrice: '£7.99',
		description: 'One-time payment · Maximum value',
		features: [
			'Continuous Profile Boost for 5 full years',
			'Priority placement & featured badge',
			'Discounted job lead pricing while active',
			'No renewals · No contracts',
		],
		recommended: false,
		isLongTerm: true,
	},
];

const BOOST_BENEFITS: BoostFeature[] = [
	{
		icon: TrendingUp,
		title: 'Higher in search results',
		description: 'Your profile appears higher in search results',
	},
	{
		icon: Star,
		title: 'Customers see you sooner',
		description: 'Get noticed before non-boosted profiles',
	},
	{
		icon: Award,
		title: 'Featured profile badge',
		description: 'Stand out with a premium badge',
	},
	{
		icon: BarChart3,
		title: 'Lower lead price',
		description: 'Pay £7.99 per job lead while Boosted',
	},
];

	const Membership = () => {
	const navigate = useNavigate();
	const { state } = useApp();
	const [showBoostModal, setShowBoostModal] = useState(false);
	const [membershipStatus, setMembershipStatus] = useState<{
		membershipType: string | null;
		membershipExpiry: string | null;
		isActive: boolean;
		daysRemaining: number;
		verified: boolean;
	} | null>(null);
	const [loading, setLoading] = useState(true);
	const [pageSettings, setPageSettings] = useState<any>(null);

	useEffect(() => {
		const fetchStatusAndSettings = async () => {
			try {
				const [status, response] = await Promise.all([
					state.currentUser ? paymentService.getMembershipStatus() : Promise.resolve(null),
					settingsService.getPublicSettings()
				]);
				
				if (status) setMembershipStatus(status);
				setPageSettings(response.settings || {});
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchStatusAndSettings();
	}, [state.currentUser]);

	// Redirect if page is hidden by admin
	if (!loading && (pageSettings?.hide_boost_page === 'true' || pageSettings?.hide_boost_page === true)) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Page Unavailable</h2>
					<p className="text-gray-600 mb-6">The membership and boost features are currently unavailable.</p>
					<button onClick={() => navigate('/')} className="text-blue-600 font-medium">Back to Home</button>
				</div>
			</div>
		);
	}

	const handleBoostSuccess = () => {
		paymentService.getMembershipStatus().then(setMembershipStatus);
	};

	const hasActiveBoost = membershipStatus?.isActive;

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading membership details...</p>
				</div>
			</div>
		);
	}

	// Use dynamic prices from settings if available
	const plans = BOOST_PLANS.map(plan => {
		const dynamicPrice = pageSettings?.boost_plan_prices?.[plan.id]?.price;
		if (dynamicPrice !== undefined) {
			return { ...plan, price: `£${dynamicPrice}` };
		}
		return plan;
	});

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-8">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<button
						onClick={() => navigate('/')}
						className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
					>
						<ArrowLeft className="w-5 h-5 mr-2" />
						Back to Home
					</button>
					<div className="flex items-center gap-3 mb-3">
						<Rocket className="w-8 h-8 text-blue-600" />
						<h1 className="text-3xl font-bold text-gray-900">
							{pageSettings?.boost_page_content?.title || 'Boost Your Profile'}
						</h1>
						<span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">
							Optional
						</span>
					</div>
					<p className="text-lg text-gray-700 mb-2">
						{pageSettings?.boost_page_content?.subtitle || 'Get more visibility. Pay less per lead while Boosted.'}
					</p>
					<p className="text-gray-600">
						Boosts help your profile stand out to customers and give you
						priority placement — while keeping job leads fair and open to
						everyone.
					</p>
				</div>

				{/* Active Boost Status */}
				{hasActiveBoost && (
					<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl mb-8">
						<div className="flex items-start justify-between">
							<div className="flex items-center">
								<div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mr-4">
									<Zap className="w-7 h-7" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<h2 className="text-2xl font-bold">Active Boost</h2>
										<Sparkles className="w-5 h-5" />
									</div>
									<p className="text-white/80 mt-1">
										{membershipStatus.membershipType === 'unlimited_5_year'
											? '5-Year Profile Boost Pass'
											: membershipStatus.membershipType === 'premium_3_month'
											? '3 Month Profile Boost'
											: membershipStatus.membershipType === 'premium'
											? '1 Month Profile Boost'
											: '1 Week Profile Boost'}
									</p>
								</div>
							</div>
							<div className="text-right">
								<div className="flex items-center justify-end mb-1">
									<Shield className="w-4 h-4 mr-1" />
									<span className="text-sm">Active</span>
								</div>
								<div className="flex items-center text-white/80 text-sm">
									<Calendar className="w-4 h-4 mr-1" />
									{membershipStatus.daysRemaining} days left
								</div>
							</div>
						</div>

						<div className="mt-4 pt-4 border-t border-white/20">
							<div className="flex items-center justify-between text-sm">
								<span className="text-white/80">Expires on</span>
								<span className="font-semibold">
									{new Date(
										membershipStatus.membershipExpiry!
									).toLocaleDateString('en-GB', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}
								</span>
							</div>
						</div>

						<div className="mt-4 bg-white/10 rounded-lg p-3">
							<p className="text-sm text-white/90 flex items-center">
								<Info className="w-4 h-4 mr-2" />
								You're currently paying <strong className="mx-1">
									£7.99
								</strong>{' '}
								per job lead (£2 savings per lead)
							</p>
						</div>
					</div>
				)}

				{/* Important to Know Section */}
				<div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
					<h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
						<CheckCircle className="w-6 h-6 text-blue-600 mr-2" />
						Important to know
					</h2>
					<ul className="space-y-3">
						<li className="flex items-start">
							<span className="text-green-600 mr-3 text-xl">✅</span>
							<span className="text-gray-700">
								All job leads are{' '}
								<strong>always visible to all tradespeople</strong>
							</span>
						</li>
						<li className="flex items-start">
							<span className="text-green-600 mr-3 text-xl">✅</span>
							<span className="text-gray-700">
								Job leads normally cost <strong>£9.99</strong>
							</span>
						</li>
						<li className="flex items-start">
							<span className="text-green-600 mr-3 text-xl">✅</span>
							<span className="text-gray-700">
								Boosts are <strong>optional</strong>
							</span>
						</li>
						<li className="flex items-start">
							<span className="text-green-600 mr-3 text-xl">✅</span>
							<span className="text-gray-700">
								Boosts do not <strong>guarantee work</strong>
							</span>
						</li>
					</ul>
					<div className="mt-4 pt-4 border-t border-blue-200">
						<p className="text-gray-700 font-medium">
							Boosts increase visibility and reduce the price you pay per lead
							while active.
						</p>
					</div>
				</div>

				{/* What a Profile Boost Does */}
				<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
						<Star className="w-7 h-7 text-yellow-500 mr-3" />
						What a Profile Boost does
					</h2>
					<p className="text-gray-600 mb-6">When your profile is Boosted:</p>

					<div className="grid md:grid-cols-2 gap-4 mb-6">
						{(pageSettings?.boost_page_content?.features?.map((f: any, i: number) => ({
							...f,
							icon: [TrendingUp, Star, Award, BarChart3, Headphones][i] || Sparkles
						})) || BOOST_BENEFITS).map((benefit: any, index: number) => (
							<div
								key={index}
								className="flex items-start p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100"
							>
								<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
									<benefit.icon className="w-5 h-5 text-blue-600" />
								</div>
								<div>
									<h4 className="font-semibold text-gray-900 mb-1">
										{benefit.title}
									</h4>
									<p className="text-sm text-gray-600">{benefit.description}</p>
								</div>
							</div>
						))}
					</div>

					<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
						<p className="text-gray-700 flex items-start">
							<span className="text-xl mr-3">💬</span>
							<span>
								Many trades use Boosts when they want more exposure or when work
								is busy.
							</span>
						</p>
					</div>
				</div>

				{/* Pricing Plans */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
						<BarChart3 className="w-7 h-7 text-blue-600 mr-3" />
						Choose Your Boost
					</h2>

					<div className="grid md:grid-cols-2 gap-6 mb-6">
						{plans.filter((plan) => !plan.isLongTerm).map((plan) => (
							<div
								key={plan.id}
								className={`bg-white rounded-2xl shadow-lg border-2 p-6 transition-all hover:shadow-xl ${
									plan.recommended
										? 'border-blue-500 ring-2 ring-blue-200'
										: 'border-gray-200'
								}`}
							>
								{/* Plan Header */}
								<div className="mb-4">
									{plan.badge && (
										<span
											className={`inline-block ${plan.badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full mb-3`}
										>
											{plan.badge}
										</span>
									)}
									<h3 className="text-xl font-bold text-gray-900 mb-1">
										{plan.name}
									</h3>
									<p className="text-gray-600 text-sm">{plan.description}</p>
								</div>

								{/* Price */}
								<div className="mb-4">
									<div className="flex items-baseline">
										<span className="text-4xl font-black text-gray-900">
											{plan.price}
										</span>
									</div>
									{plan.weeklyEquivalent && (
										<p className="text-sm text-gray-500 mt-1">
											{plan.weeklyEquivalent}
										</p>
									)}
								</div>

								{/* Features */}
								<ul className="space-y-3 mb-6">
									{plan.features.map((feature, index) => (
										<li key={index} className="flex items-start text-sm">
											<CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
											<span className="text-gray-700">{feature}</span>
										</li>
									))}
								</ul>

								{/* CTA */}
								<button
									onClick={() => setShowBoostModal(true)}
									className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
										plan.recommended
											? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
											: 'bg-gray-900 text-white hover:bg-gray-800'
									}`}
								>
									Boost My Profile for {plan.duration.split(' ')[0]}{' '}
									{plan.duration.split(' ')[1]}
								</button>

								{plan.recommended && (
									<p className="text-center text-xs text-blue-600 mt-3 font-medium">
										👉 Best for steady work
									</p>
								)}
							</div>
						))}
					</div>

					{/* 5-Year Pass - Separate Card */}
					<div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl shadow-xl border-2 border-yellow-300 p-8">
						<div className="flex items-start justify-between mb-4">
							<div className="flex items-center">
								<Crown className="w-10 h-10 text-yellow-600 mr-3" />
								<div>
									<span className="inline-block bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">
										🔥 Long-Term Option
									</span>
									<h3 className="text-2xl font-bold text-gray-900">
										5-Year Profile Boost Pass
									</h3>
									<p className="text-gray-600 mt-1">
										For established trades planning long-term visibility
									</p>
								</div>
							</div>
							<div className="text-right">
								<div className="text-4xl font-black text-yellow-800">
									{plans.find(p => p.id === 'unlimited_5_year')?.price || '£995'}
								</div>
								<p className="text-sm text-yellow-700">One-time payment</p>
							</div>
						</div>

						<div className="bg-white/60 rounded-xl p-6 mb-6">
							<h4 className="font-bold text-gray-900 mb-4">Includes:</h4>
							<ul className="space-y-3">
								{plans.find((p) => p.isLongTerm)?.features.map(
									(feature, index) => (
										<li key={index} className="flex items-start">
											<CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
											<span className="text-gray-700">{feature}</span>
										</li>
									)
								)}
							</ul>
						</div>

						<div className="bg-yellow-100 rounded-lg p-4 mb-6 border border-yellow-300">
							<p className="text-sm text-yellow-900 flex items-start">
								<span className="text-xl mr-3">💬</span>
								<span>Best long-term value for serious professionals.</span>
							</p>
						</div>

						<button
							onClick={() => setShowBoostModal(true)}
							className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 transition-all"
						>
							Activate 5-Year Boost Pass
						</button>
					</div>
				</div>

				{/* Clarification Box */}
				<div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
					<h3 className="text-lg font-bold text-red-900 mb-3 flex items-center">
						<Info className="w-5 h-5 mr-2" />
						Clear clarification
					</h3>
					<ul className="space-y-2 text-gray-700">
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>
								Boosts improve visibility and reduce the price you pay per job
								lead while active.
							</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>
								All job leads remain visible to all tradespeople at all times.
							</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>Work is never guaranteed.</span>
						</li>
					</ul>
				</div>

				{/* FAQs */}
				<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-6">Boost FAQs</h2>
					<div className="space-y-6">
						<div>
							<h4 className="font-bold text-gray-900 mb-2">
								Do I need a Boost to see job leads?
							</h4>
							<p className="text-gray-600">
								No. All job leads are visible to everyone.
							</p>
						</div>
						<div>
							<h4 className="font-bold text-gray-900 mb-2">
								Do Boosts change lead prices?
							</h4>
							<p className="text-gray-600">
								Yes. While Boosted, job leads cost £7.99 instead of £9.99.
							</p>
						</div>
						<div>
							<h4 className="font-bold text-gray-900 mb-2">
								Can I stop a Boost early?
							</h4>
							<p className="text-gray-600">
								Boosts run for the selected time period and don't auto-renew
								unless stated.
							</p>
						</div>
						<div>
							<h4 className="font-bold text-gray-900 mb-2">
								Is the 5-Year Pass a membership?
							</h4>
							<p className="text-gray-600">
								No. It's a one-time purchase that keeps your profile Boosted for
								5 years.
							</p>
						</div>
					</div>
				</div>

				{/* Checkout Reassurance */}
				<div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center">
					<h3 className="font-bold text-gray-900 mb-4">
						🔒 Checkout Reassurance
					</h3>
					<div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700">
						<span className="flex items-center">
							<CheckCircle className="w-4 h-4 text-green-500 mr-1" />
							No contracts
						</span>
						<span className="flex items-center">
							<CheckCircle className="w-4 h-4 text-green-500 mr-1" />
							Optional upgrade
						</span>
						<span className="flex items-center">
							<CheckCircle className="w-4 h-4 text-green-500 mr-1" />
							Secure payment via Stripe
						</span>
						<span className="flex items-center">
							<CheckCircle className="w-4 h-4 text-green-500 mr-1" />
							Transparent pricing
						</span>
						<span className="flex items-center">
							<CheckCircle className="w-4 h-4 text-green-500 mr-1" />
							Built for UK tradespeople
						</span>
					</div>
				</div>
			</div>

			{/* Boost Payment Modal */}
			<BoostPaymentModal
				isOpen={showBoostModal}
				onClose={() => setShowBoostModal(false)}
				onSuccess={handleBoostSuccess}
			/>
		</div>
	);
};

export default Membership;
