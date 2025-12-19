import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
	Rocket,
	Star,
	BarChart3,
	Headphones,
	CheckCircle,
	Crown,
	TrendingUp,
	Award,
	Infinity,
	Zap,
	ArrowUpCircle,
	Calendar,
	Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import BoostPaymentModal from './BoostPaymentModal';
import { paymentService } from '../services/paymentService';
import { LucideIcon } from 'lucide-react';

interface PlanFeature {
	icon: LucideIcon;
	title: string;
	description: string;
	active: boolean;
	upgradeRequired?: boolean;
	highlight?: boolean;
}

interface PlanConfig {
	name: string;
	displayName: string;
	features: PlanFeature[];
	canUpgradeTo: string[];
}
const PLAN_CONFIG: Record<string, PlanConfig> = {
	basic: {
		name: '1 Week / 1 Month Boost',
		displayName: 'Boost Plan',
		features: [
			{
				icon: TrendingUp,
				title: 'Priority Placement in Search Results',
				description: 'Your profile appears at the top when homeowners search',
				active: true,
			},
			{
				icon: Star,
				title: '3x More Profile Views',
				description: 'Get significantly more visibility to potential clients',
				active: true,
			},
			{
				icon: Award,
				title: 'Featured Badge on Your Profile',
				description: 'Stand out with a premium badge that builds trust',
				active: true,
			},
			{
				icon: BarChart3,
				title: 'Advanced Analytics Dashboard',
				description: 'Track views, clicks, and lead conversion rates',
				active: true,
			},
			{
				icon: Headphones,
				title: 'Premium Customer Support',
				description: 'Get priority assistance whenever you need help',
				active: true,
			},
			{
				icon: Infinity,
				title: 'Unlimited Job Leads',
				description: 'Access unlimited leads at no extra cost',
				active: false,
				upgradeRequired: true,
			},
		],
		canUpgradeTo: ['premium', 'unlimited_5_year'],
	},
	premium: {
		name: '3 Month Boost',
		displayName: 'Premium Boost',
		features: [
			{
				icon: TrendingUp,
				title: 'Priority Placement in Search Results',
				description: 'Your profile appears at the top when homeowners search',
				active: true,
			},
			{
				icon: Star,
				title: '3x More Profile Views',
				description: 'Get significantly more visibility to potential clients',
				active: true,
			},
			{
				icon: Award,
				title: 'Featured Badge on Your Profile',
				description: 'Stand out with a premium badge that builds trust',
				active: true,
			},
			{
				icon: BarChart3,
				title: 'Advanced Analytics Dashboard',
				description: 'Track views, clicks, and lead conversion rates',
				active: true,
			},
			{
				icon: Headphones,
				title: 'Premium Customer Support',
				description: 'Get priority assistance whenever you need help',
				active: true,
			},
			{
				icon: Infinity,
				title: 'Unlimited Job Leads',
				description: 'Access unlimited leads at no extra cost',
				active: false,
				upgradeRequired: true,
			},
		],
		canUpgradeTo: ['unlimited_5_year'],
	},
	unlimited_5_year: {
		name: '5 Years Unlimited',
		displayName: 'VIP Member',
		features: [
			{
				icon: TrendingUp,
				title: 'Priority Placement in Search Results',
				description: 'Your profile appears at the top when homeowners search',
				active: true,
			},
			{
				icon: Star,
				title: '3x More Profile Views',
				description: 'Get significantly more visibility to potential clients',
				active: true,
			},
			{
				icon: Award,
				title: 'Featured Badge on Your Profile',
				description: 'Stand out with a premium badge that builds trust',
				active: true,
			},
			{
				icon: BarChart3,
				title: 'Advanced Analytics Dashboard',
				description: 'Track views, clicks, and lead conversion rates',
				active: true,
			},
			{
				icon: Headphones,
				title: 'Premium Customer Support',
				description: 'Get priority assistance whenever you need help',
				active: true,
			},
			{
				icon: Infinity,
				title: 'Unlimited Job Leads',
				description: 'Access unlimited leads at no extra cost for 5 years!',
				active: true,
				highlight: true,
			},
		],
		canUpgradeTo: [],
	},
};

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

	useEffect(() => {
		const fetchMembershipStatus = async () => {
			if (state.currentUser) {
				try {
					const status = await paymentService.getMembershipStatus();
					setMembershipStatus(status);
				} catch (error) {
					console.error('Error fetching membership status:', error);
				} finally {
					setLoading(false);
				}
			} else {
				setLoading(false);
			}
		};
		fetchMembershipStatus();
	}, [state.currentUser]);

	const handleBoostSuccess = () => {
		// Refresh membership status
		paymentService.getMembershipStatus().then(setMembershipStatus);
	};

	const currentPlanType = membershipStatus?.membershipType as keyof typeof PLAN_CONFIG;
	const currentPlan = currentPlanType && PLAN_CONFIG[currentPlanType];
	const hasActivePlan = membershipStatus?.isActive && currentPlan;

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

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<button
						onClick={() => navigate('/')}
						className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
					>
						<ArrowLeft className="w-5 h-5 mr-2" />
						Back to Home
					</button>
					<h1 className="text-3xl font-bold text-gray-900">My Membership</h1>
					<p className="text-gray-600 mt-2">
						{hasActivePlan
							? 'View your active plan features and benefits'
							: 'Boost your profile to get more leads'}
					</p>
				</div>

				{hasActivePlan ? (
					<>
						{/* Current Plan Status Card */}
						<div className={`rounded-2xl p-6 text-white shadow-xl mb-8 ${
							currentPlanType === 'unlimited_5_year'
								? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500'
								: currentPlanType === 'premium'
								? 'bg-gradient-to-r from-purple-600 to-indigo-600'
								: 'bg-gradient-to-r from-blue-600 to-cyan-600'
						}`}>
							<div className="flex items-start justify-between">
								<div className="flex items-center">
									<div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mr-4">
										{currentPlanType === 'unlimited_5_year' ? (
											<Crown className="w-7 h-7" />
										) : (
											<Zap className="w-7 h-7" />
										)}
									</div>
									<div>
										<div className="flex items-center gap-2">
											<h2 className="text-2xl font-bold">
												{currentPlan.displayName}
											</h2>
											{currentPlanType === 'unlimited_5_year' && (
												<span className="bg-white/20 text-xs px-2 py-1 rounded-full">
													VIP
												</span>
											)}
										</div>
										<p className="text-white/80 mt-1">
											{currentPlan.name}
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
										{new Date(membershipStatus.membershipExpiry!).toLocaleDateString('en-GB', {
											weekday: 'long',
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})}
									</span>
								</div>
							</div>
						</div>

						{/* Features Section */}
						<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
							<h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
								<CheckCircle className="w-6 h-6 text-green-500 mr-2" />
								Your Plan Features
							</h3>

							<div className="space-y-4">
								{(currentPlan.features as any[]).map((feature, index) => (
									<div
										key={index}
										className={`flex items-start p-4 rounded-xl transition-colors ${
											feature.active
												? feature.highlight
													? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
													: 'bg-green-50 border border-green-100'
												: 'bg-gray-50 border border-gray-200'
										}`}
									>
										<div
											className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${
												feature.active
													? feature.highlight
														? 'bg-yellow-100'
														: 'bg-green-100'
													: 'bg-gray-200'
											}`}
										>
											<feature.icon
												className={`w-5 h-5 ${
													feature.active
														? feature.highlight
															? 'text-yellow-600'
															: 'text-green-600'
														: 'text-gray-400'
												}`}
											/>
										</div>
										<div className="flex-1">
											<div className="flex items-center justify-between">
												<h4
													className={`font-semibold ${
														feature.active ? 'text-gray-900' : 'text-gray-500'
													}`}
												>
													{feature.title}
												</h4>
												{feature.active ? (
													<span className={`text-xs px-2 py-1 rounded-full ${
														feature.highlight
															? 'bg-yellow-200 text-yellow-800'
															: 'bg-green-200 text-green-800'
													}`}>
														{feature.highlight ? '⭐ Exclusive' : '✓ Active'}
													</span>
												) : (
													<span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
														🔒 Upgrade Required
													</span>
												)}
											</div>
											<p
												className={`text-sm mt-1 ${
													feature.active ? 'text-gray-600' : 'text-gray-400'
												}`}
											>
												{feature.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Upgrade Section */}
						{currentPlan.canUpgradeTo.length > 0 && (
							<div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 p-8">
								<div className="flex items-start">
									<div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
										<ArrowUpCircle className="w-6 h-6 text-purple-600" />
									</div>
									<div className="flex-1">
										<h3 className="text-xl font-bold text-gray-900 mb-2">
											Upgrade Your Plan
										</h3>
										<p className="text-gray-600 mb-4">
											{currentPlanType === 'basic'
												? 'Upgrade to get longer boost duration or unlock unlimited leads!'
												: 'Upgrade to our VIP plan for unlimited job leads!'}
										</p>

										{currentPlan.canUpgradeTo.includes('unlimited_5_year') && (
											<div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-xl p-4 mb-4">
												<div className="flex items-center justify-between">
													<div>
														<h4 className="font-bold text-yellow-800 flex items-center">
															<Infinity className="w-5 h-5 mr-2" />
															5 Years Unlimited Leads
														</h4>
														<p className="text-sm text-yellow-700 mt-1">
															No lead fees for 5 full years!
														</p>
													</div>
													<div className="text-right">
														<span className="text-2xl font-bold text-yellow-800">
															£995
														</span>
														<p className="text-xs text-yellow-600">one-time</p>
													</div>
												</div>
											</div>
										)}

										<button
											onClick={() => setShowBoostModal(true)}
											className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center"
										>
											<ArrowUpCircle className="w-5 h-5 mr-2" />
											View Upgrade Options
										</button>
									</div>
								</div>
							</div>
						)}

						{/* VIP Badge for unlimited users */}
						{currentPlanType === 'unlimited_5_year' && (
							<div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-300 p-8 text-center">
								<Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
								<h3 className="text-2xl font-bold text-gray-900 mb-2">
									You're a VIP Member! 🎉
								</h3>
								<p className="text-gray-600">
									You have access to all premium features including unlimited job leads.
									Thank you for being a valued member!
								</p>
							</div>
						)}
					</>
				) : (
					/* No Active Plan - Show options to purchase */
					<>
						<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
							<div className="text-center mb-8">
								<div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<Rocket className="w-10 h-10 text-blue-600" />
								</div>
								<h2 className="text-2xl font-bold text-gray-900 mb-2">
									No Active Membership
								</h2>
								<p className="text-gray-600">
									Boost your profile to get more visibility and win more jobs!
								</p>
							</div>

							<div className="mb-8">
								<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
									<Star className="w-5 h-5 text-yellow-500 mr-2" />
									What You'll Get with a Boost Plan:
								</h3>
								<div className="grid md:grid-cols-2 gap-4">
									{[
										{ icon: TrendingUp, title: 'Priority placement in search results' },
										{ icon: Star, title: '3x more profile views' },
										{ icon: Award, title: 'Featured badge on your profile' },
										{ icon: BarChart3, title: 'Advanced analytics dashboard' },
										{ icon: Headphones, title: 'Premium customer support' },
									].map((feature, index) => (
										<div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
											<feature.icon className="w-5 h-5 text-blue-600 mr-3" />
											<span className="text-gray-700">{feature.title}</span>
										</div>
									))}
								</div>
							</div>

							<button
								onClick={() => setShowBoostModal(true)}
								className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center"
							>
								<Zap className="w-6 h-6 mr-2" />
								🚀 Get Started - View Plans
							</button>
						</div>

						{/* Special Offer Banner */}
						<div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 rounded-2xl p-6 text-center shadow-xl">
							<h3 className="text-xl font-bold text-yellow-900 mb-2">
								🔥 SPECIAL OFFER: 5 Years Unlimited Leads
							</h3>
							<p className="text-3xl font-black text-yellow-800 mb-2">£995</p>
							<p className="text-yellow-800">
								One payment. Zero lead fees. Unlimited opportunities for 5 full years!
							</p>
						</div>
					</>
				)}
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
