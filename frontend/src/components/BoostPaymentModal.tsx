import { useState } from 'react';
import {
	X,
	CreditCard,
	Check,
	Loader,
	Lock,
	Zap,
	TrendingUp,
	Star,
	Award,
	BarChart3,
	ChevronRight,
	Sparkles,
	Crown,
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
	Elements,
	CardElement,
	useStripe,
	useElements,
} from '@stripe/react-stripe-js';
import { paymentService } from '../services/paymentService';
import { useApp } from '../context/AppContext';

// Initialize Stripe
const stripePromise = loadStripe(
	import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

interface BoostPaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

interface BoostPlan {
	id: string;
	name: string;
	displayName: string;
	price: number;
	duration: number;
	durationLabel: string;
	leadPrice: string;
	normalLeadPrice: string;
	weeklyEquivalent?: string;
	description: string;
	features: string[];
	badge?: string;
	badgeColor?: string;
	recommended?: boolean;
	isLongTerm?: boolean;
}

const BOOST_PLANS: BoostPlan[] = [
	{
		id: '1_week_boost',
		name: '1 Week Profile Boost',
		displayName: '1 Week Boost',
		price: 19.99,
		duration: 7,
		durationLabel: '7 days',
		leadPrice: '£7.99',
		normalLeadPrice: '£9.99',
		description: 'Short-term visibility',
		features: [
			'Priority placement for 7 days',
			'Featured profile badge',
			'£7.99 per job lead while Boosted',
		],
	},
	{
		id: '1_month_boost',
		name: '1 Month Profile Boost',
		displayName: '1 Month Boost',
		price: 49.99,
		duration: 30,
		durationLabel: '30 days',
		leadPrice: '£7.99',
		normalLeadPrice: '£9.99',
		weeklyEquivalent: '£12.50/week',
		description: 'Best for steady work',
		badge: 'Most Popular',
		badgeColor: 'bg-blue-500',
		features: [
			'Consistent visibility for 30 days',
			'Priority placement throughout the month',
			'£7.99 per job lead while Boosted',
			'Equivalent to £12.50 per week',
		],
		recommended: true,
	},
	{
		id: '3_month_boost',
		name: '3 Month Profile Boost',
		displayName: '3 Month Boost',
		price: 99.99,
		duration: 90,
		durationLabel: '90 days',
		leadPrice: '£7.99',
		normalLeadPrice: '£9.99',
		weeklyEquivalent: '£8.33/week',
		description: 'Save 58% · Lowest weekly cost',
		badge: 'Best Value',
		badgeColor: 'bg-green-500',
		features: [
			'Maximum visibility over time',
			'Ideal for busy trades',
			'£7.99 per job lead while Boosted',
			'Equivalent to £8.33 per week',
		],
	},
	{
		id: '5_year_unlimited',
		name: '5-Year Profile Boost Pass',
		displayName: '5-Year Pass',
		price: 995.0,
		duration: 1825,
		durationLabel: '5 years',
		leadPrice: '£7.99',
		normalLeadPrice: '£9.99',
		description: 'One-time payment · Maximum value',
		badge: 'Long-Term',
		badgeColor: 'bg-yellow-500',
		features: [
			'Continuous Profile Boost for 5 full years',
			'Priority placement & featured badge',
			'Discounted job lead pricing while active',
			'No renewals · No contracts',
		],
		isLongTerm: true,
	},
];

const FeatureIcon = ({ feature }: { feature: string }) => {
	if (feature.includes('Priority') || feature.includes('placement'))
		return <TrendingUp className="w-4 h-4" />;
	if (feature.includes('visibility') || feature.includes('Consistent'))
		return <Star className="w-4 h-4" />;
	if (feature.includes('badge') || feature.includes('Featured'))
		return <Award className="w-4 h-4" />;
	if (feature.includes('lead') || feature.includes('£'))
		return <BarChart3 className="w-4 h-4" />;
	if (feature.includes('Continuous') || feature.includes('renewals'))
		return <Crown className="w-4 h-4" />;
	return <Check className="w-4 h-4" />;
};

const PaymentForm = ({
	plan,
	onSuccess,
	onBack,
}: {
	plan: BoostPlan;
	onSuccess?: () => void;
	onBack: () => void;
}) => {
	const stripe = useStripe();
	const elements = useElements();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const { dispatch } = useApp();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!stripe || !elements) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			// Create payment intent for boost plan
			const response = await paymentService.purchaseBoostPlan(plan.id);
			const { clientSecret } = response;

			if (!clientSecret) {
				throw new Error('Failed to get payment details. Please try again.');
			}

			// Confirm card payment
			const cardElement = elements.getElement(CardElement);
			if (!cardElement) {
				throw new Error('Card element not found');
			}

			const { error: stripeError, paymentIntent } =
				await stripe.confirmCardPayment(clientSecret, {
					payment_method: {
						card: cardElement,
					},
				});

			if (stripeError) {
				setError(stripeError.message || 'Payment failed');
				return;
			}

			if (paymentIntent?.status === 'succeeded') {
				// Confirm the boost purchase on our backend to update the database
				try {
					const confirmResponse = await paymentService.confirmBoostPurchase(
						paymentIntent.id
					);

					// Update user membership in app state with confirmed data from database
					dispatch({
						type: 'UPDATE_USER',
						payload: {
							membershipType: confirmResponse.user.membershipType as any,
							membershipExpiry: confirmResponse.user.membershipExpiry,
							verified: true,
						},
					});

					setSuccess(true);

					setTimeout(() => {
						onSuccess?.();
					}, 2500);
				} catch (confirmError: any) {
					console.error('Boost confirmation error:', confirmError);
					// Payment succeeded but confirmation failed - show success anyway
					const expiryDate = new Date();
					expiryDate.setDate(expiryDate.getDate() + plan.duration);

					dispatch({
						type: 'UPDATE_USER',
						payload: {
							membershipType: plan.id as any,
							membershipExpiry: expiryDate.toISOString(),
							verified: true,
						},
					});

					setSuccess(true);

					setTimeout(() => {
						onSuccess?.();
					}, 2500);
				}
			}
		} catch (err: any) {
			setError(err.message || 'Something went wrong');
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="text-center py-8">
				<div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
					<Check className="w-10 h-10 text-white" />
				</div>
				<h3 className="text-2xl font-bold text-gray-900 mb-2">
					🎉 Boost Activated!
				</h3>
				<p className="text-gray-600 mb-4">
					Your {plan.displayName} has been successfully activated.
				</p>
				<div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
					<p className="text-sm text-blue-700 mb-2">
						Your profile is now boosted! You'll start seeing results
						immediately.
					</p>
					<p className="text-xs text-blue-600">
						Job leads now cost {plan.leadPrice} (save £2 per lead)
					</p>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Plan Summary */}
			<div
				className={`rounded-xl p-5 ${
					plan.isLongTerm
						? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-300'
						: plan.recommended
						? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300'
						: 'bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200'
				}`}
			>
				<div className="flex justify-between items-start mb-4">
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2">
							{plan.isLongTerm && <Crown className="w-5 h-5 text-yellow-600" />}
							{plan.recommended && (
								<Sparkles className="w-5 h-5 text-blue-600" />
							)}
							<h4
								className={`font-bold text-lg ${
									plan.isLongTerm
										? 'text-yellow-800'
										: plan.recommended
										? 'text-blue-900'
										: 'text-gray-900'
								}`}
							>
								{plan.name}
							</h4>
						</div>
						{plan.badge && (
							<span
								className={`inline-block ${plan.badgeColor} text-white text-xs font-semibold px-2 py-1 rounded-full`}
							>
								{plan.badge}
							</span>
						)}
						<p className="text-sm text-gray-600 mt-2">{plan.description}</p>
					</div>
					<div className="text-right ml-4">
						<div
							className={`text-3xl font-bold ${
								plan.isLongTerm
									? 'text-yellow-700'
									: plan.recommended
									? 'text-blue-600'
									: 'text-gray-900'
							}`}
						>
							£{plan.price.toFixed(2)}
						</div>
						<div className="text-xs text-gray-500 mt-1">one-time</div>
						{plan.weeklyEquivalent && (
							<div className="text-xs text-green-600 font-medium mt-1">
								{plan.weeklyEquivalent}
							</div>
						)}
					</div>
				</div>

				<div className="border-t border-gray-300 pt-4 mt-4">
					<div className="bg-white/60 rounded-lg p-3 mb-3">
						<div className="flex items-center justify-between text-sm">
							<span className="text-gray-600">Lead price while boosted:</span>
							<div className="flex items-center gap-2">
								<span className="text-gray-400 line-through">
									{plan.normalLeadPrice}
								</span>
								<span className="text-green-600 font-bold text-lg">
									{plan.leadPrice}
								</span>
							</div>
						</div>
						<p className="text-xs text-gray-500 mt-1">Save £2 per lead</p>
					</div>

					<p className="text-xs font-medium text-gray-700 mb-2">
						What's included:
					</p>
					<div className="space-y-2">
						{plan.features.map((feature, index) => (
							<div
								key={index}
								className="flex items-start text-sm text-gray-700"
							>
								<Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
								<span>{feature}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Important Notice */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
				<p className="text-xs text-blue-800">
					<strong>Note:</strong> Boosts increase visibility and reduce lead
					prices. All job leads remain visible to all tradespeople.
				</p>
			</div>

			{/* Card Input */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Card Details
				</label>
				<div className="border border-gray-300 rounded-lg p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
					<CardElement
						options={{
							style: {
								base: {
									fontSize: '16px',
									color: '#374151',
									'::placeholder': {
										color: '#9CA3AF',
									},
								},
								invalid: {
									color: '#EF4444',
								},
							},
						}}
					/>
				</div>
			</div>

			{/* Error Message */}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
					{error}
				</div>
			)}

			{/* Secure Payment Notice */}
			<div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
				<div className="flex items-center justify-center text-sm text-gray-600 mb-2">
					<Lock className="w-4 h-4 mr-2" />
					Secured by Stripe. Your card details are encrypted.
				</div>
				<div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
					<span className="flex items-center">
						<Check className="w-3 h-3 text-green-500 mr-1" />
						No contracts
					</span>
					<span className="flex items-center">
						<Check className="w-3 h-3 text-green-500 mr-1" />
						Optional upgrade
					</span>
					<span className="flex items-center">
						<Check className="w-3 h-3 text-green-500 mr-1" />
						Transparent pricing
					</span>
				</div>
			</div>

			{/* Buttons */}
			<div className="flex gap-3">
				<button
					type="button"
					onClick={onBack}
					disabled={loading}
					className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
				>
					Back
				</button>
				<button
					type="submit"
					disabled={!stripe || loading}
					className={`flex-1 py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all ${
						plan.isLongTerm
							? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white hover:from-yellow-600 hover:via-orange-600 hover:to-red-600'
							: plan.recommended
							? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
							: 'bg-gray-900 text-white hover:bg-gray-800'
					}`}
				>
					{loading ? (
						<>
							<Loader className="w-5 h-5 mr-2 animate-spin" />
							Processing...
						</>
					) : (
						<>
							<CreditCard className="w-5 h-5 mr-2" />
							Pay £{plan.price.toFixed(2)}
						</>
					)}
				</button>
			</div>
		</form>
	);
};

const BoostPaymentModal = ({
	isOpen,
	onClose,
	onSuccess,
}: BoostPaymentModalProps) => {
	const [selectedPlan, setSelectedPlan] = useState<BoostPlan | null>(null);
	const [step, setStep] = useState<'select' | 'payment'>('select');

	const handlePlanSelect = (plan: BoostPlan) => {
		setSelectedPlan(plan);
		setStep('payment');
	};

	const handleBack = () => {
		setStep('select');
		setSelectedPlan(null);
	};

	const handleClose = () => {
		setStep('select');
		setSelectedPlan(null);
		onClose();
	};

	const handleSuccess = () => {
		onSuccess?.();
		handleClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center">
							<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
								<Zap className="w-6 h-6 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-gray-900">
									{step === 'select'
										? '🚀 Boost Your Profile'
										: 'Complete Payment'}
								</h2>
								<p className="text-sm text-gray-600">
									{step === 'select'
										? 'Get more visibility · Pay less per lead'
										: `Purchasing ${selectedPlan?.displayName}`}
								</p>
							</div>
						</div>
						<button
							onClick={handleClose}
							className="text-gray-400 hover:text-gray-600 transition-colors"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					{step === 'select' ? (
						<div className="space-y-5">
							{/* Info Banner */}
							<div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
								<p className="text-sm text-blue-800 mb-2">
									<strong>Important:</strong> All job leads are always visible
									to all tradespeople.
								</p>
								<p className="text-xs text-blue-700">
									Boosts increase visibility and reduce the price you pay per
									lead while active (£7.99 vs £9.99).
								</p>
							</div>

							{/* Standard Plans */}
							<div className="space-y-3">
								{BOOST_PLANS.filter((plan) => !plan.isLongTerm).map((plan) => (
									<button
										key={plan.id}
										onClick={() => handlePlanSelect(plan)}
										className={`w-full text-left rounded-xl p-4 border-2 transition-all hover:shadow-lg ${
											plan.recommended
												? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 hover:border-blue-500 ring-2 ring-blue-200'
												: 'bg-white border-gray-200 hover:border-blue-300'
										}`}
									>
										<div className="flex items-center justify-between mb-3">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<h3 className="font-bold text-lg text-gray-900">
														{plan.name}
													</h3>
													{plan.badge && (
														<span
															className={`${plan.badgeColor} text-white text-xs font-semibold px-2 py-1 rounded-full`}
														>
															{plan.badge}
														</span>
													)}
												</div>
												<p className="text-sm text-gray-600">
													{plan.description}
												</p>
											</div>
											<div className="flex items-center gap-3 ml-4">
												<div className="text-right">
													<div className="text-2xl font-bold text-blue-600">
														£{plan.price.toFixed(2)}
													</div>
													{plan.weeklyEquivalent && (
														<div className="text-xs text-green-600 font-medium">
															{plan.weeklyEquivalent}
														</div>
													)}
												</div>
												<ChevronRight className="w-5 h-5 text-gray-400" />
											</div>
										</div>

										{/* Lead Price Highlight */}
										<div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-600">
													Job leads while boosted:
												</span>
												<div className="flex items-center gap-2">
													<span className="text-gray-400 line-through text-xs">
														£9.99
													</span>
													<span className="text-green-700 font-bold">
														£7.99
													</span>
												</div>
											</div>
										</div>

										{/* Features */}
										<div className="grid grid-cols-2 gap-2">
											{plan.features.slice(0, 4).map((feature, index) => (
												<div
													key={index}
													className="flex items-center text-xs text-gray-600"
												>
													<FeatureIcon feature={feature} />
													<span className="ml-1.5 truncate">
														{feature.length > 30
															? feature.substring(0, 30) + '...'
															: feature}
													</span>
												</div>
											))}
										</div>
									</button>
								))}
							</div>

							{/* 5-Year Plan - Separate */}
							{BOOST_PLANS.filter((plan) => plan.isLongTerm).map((plan) => (
								<button
									key={plan.id}
									onClick={() => handlePlanSelect(plan)}
									className="w-full text-left rounded-xl p-5 border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 hover:shadow-xl transition-all"
								>
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center flex-1">
											<Crown className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" />
											<div>
												<div className="flex items-center gap-2 mb-1">
													<h3 className="font-bold text-lg text-yellow-800">
														🔥 {plan.name}
													</h3>
													<span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
														{plan.badge}
													</span>
												</div>
												<p className="text-sm text-yellow-700">
													{plan.description}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-3 ml-4">
											<div className="text-right">
												<div className="text-3xl font-bold text-yellow-800">
													£{plan.price.toFixed(0)}
												</div>
												<div className="text-xs text-yellow-600">one-time</div>
											</div>
											<ChevronRight className="w-6 h-6 text-yellow-600" />
										</div>
									</div>

									<div className="bg-white/60 rounded-lg p-3 mb-3">
										<p className="text-sm text-gray-700 mb-2">
											<strong>Best long-term value</strong> for serious
											professionals
										</p>
										<div className="flex items-center justify-between text-sm">
											<span className="text-gray-600">Lead pricing:</span>
											<span className="text-green-700 font-bold">
												£7.99 for 5 years
											</span>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-2">
										{plan.features.map((feature, index) => (
											<div
												key={index}
												className="flex items-start text-xs text-gray-700"
											>
												<FeatureIcon feature={feature} />
												<span className="ml-1.5">
													{feature.length > 35
														? feature.substring(0, 35) + '...'
														: feature}
												</span>
											</div>
										))}
									</div>
								</button>
							))}

							{/* Footer Note */}
							<div className="text-center pt-2">
								<p className="text-xs text-gray-500">
									✔ No contracts · ✔ No auto-renewal · ✔ Secure payment via
									Stripe
								</p>
							</div>
						</div>
					) : (
						selectedPlan && (
							<Elements stripe={stripePromise}>
								<PaymentForm
									plan={selectedPlan}
									onSuccess={handleSuccess}
									onBack={handleBack}
								/>
							</Elements>
						)
					)}
				</div>
			</div>
		</div>
	);
};

export default BoostPaymentModal;
