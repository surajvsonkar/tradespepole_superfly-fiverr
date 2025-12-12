import { useState } from 'react';
import {
	X,
	CreditCard,
	Check,
	Loader,
	Lock,
	Zap,
	Star,
	TrendingUp,
	BarChart3,
	Headphones,
	Award,
	Infinity,
	ChevronRight,
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
	price: number;
	duration: number;
	features: string[];
	savings?: string | null;
	popular?: boolean;
	special?: boolean;
}

const BOOST_PLANS: BoostPlan[] = [
	{
		id: '1_week_boost',
		name: '1 Week Boost',
		price: 19.99,
		duration: 7,
		features: [
			'Priority placement in search results',
			'3x more profile views',
			'Featured badge on your profile',
			'Advanced analytics dashboard',
			'Premium customer support',
		],
	},
	{
		id: '1_month_boost',
		name: '1 Month Boost',
		price: 49.99,
		duration: 30,
		features: [
			'Priority placement in search results',
			'3x more profile views',
			'Featured badge on your profile',
			'Advanced analytics dashboard',
			'Premium customer support',
		],
		savings: '37%',
		popular: true,
	},
	{
		id: '3_month_boost',
		name: '3 Month Boost',
		price: 99.99,
		duration: 90,
		features: [
			'Priority placement in search results',
			'3x more profile views',
			'Featured badge on your profile',
			'Advanced analytics dashboard',
			'Premium customer support',
		],
		savings: '58%',
	},
	{
		id: '5_year_unlimited',
		name: '5 Years Unlimited Leads',
		price: 995.0,
		duration: 1825,
		features: [
			'Priority placement in search results',
			'3x more profile views',
			'Featured badge on your profile',
			'Advanced analytics dashboard',
			'Premium customer support',
			'Unlimited job leads at no extra cost',
		],
		special: true,
	},
];

const FeatureIcon = ({ feature }: { feature: string }) => {
	if (feature.includes('Priority')) return <TrendingUp className="w-4 h-4" />;
	if (feature.includes('views')) return <Star className="w-4 h-4" />;
	if (feature.includes('badge')) return <Award className="w-4 h-4" />;
	if (feature.includes('analytics')) return <BarChart3 className="w-4 h-4" />;
	if (feature.includes('support')) return <Headphones className="w-4 h-4" />;
	if (feature.includes('Unlimited')) return <Infinity className="w-4 h-4" />;
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
					const confirmResponse = await paymentService.confirmBoostPurchase(paymentIntent.id);
					
					// Update user membership in app state with confirmed data from database
					dispatch({
						type: 'UPDATE_USER',
						payload: {
							membershipType: confirmResponse.user.membershipType,
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
					// Use estimated values
					const expiryDate = new Date();
					expiryDate.setDate(expiryDate.getDate() + plan.duration);

					dispatch({
						type: 'UPDATE_USER',
						payload: {
							membershipType:
								plan.id === '5_year_unlimited'
									? 'unlimited_5_year'
									: plan.id === '3_month_boost'
									? 'premium'
									: 'basic',
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
					Your {plan.name} has been successfully activated.
				</p>
				<div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
					<p className="text-sm text-blue-700">
						Your profile is now boosted and you'll start seeing results
						immediately!
					</p>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Plan Summary */}
			<div
				className={`rounded-xl p-4 ${
					plan.special
						? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300'
						: 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
				}`}
			>
				<div className="flex justify-between items-center mb-3">
					<div>
						<h4
							className={`font-bold text-lg ${
								plan.special ? 'text-yellow-800' : 'text-blue-900'
							}`}
						>
							{plan.special && '🔥 '}
							{plan.name}
						</h4>
						{plan.savings && (
							<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
								Save {plan.savings}
							</span>
						)}
					</div>
					<div className="text-right">
						<div
							className={`text-2xl font-bold ${
								plan.special ? 'text-yellow-700' : 'text-blue-600'
							}`}
						>
							£{plan.price.toFixed(2)}
						</div>
						<div className="text-xs text-gray-500">
							{plan.id === '5_year_unlimited' ? 'one-time' : 'one-time payment'}
						</div>
					</div>
				</div>

				<div className="border-t border-gray-200 pt-3 mt-3">
					<p className="text-xs text-gray-600 mb-2">What you'll get:</p>
					<div className="grid grid-cols-1 gap-1">
						{plan.features.slice(0, 3).map((feature, index) => (
							<div
								key={index}
								className="flex items-center text-xs text-gray-700"
							>
								<Check className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
								<span className="truncate">{feature}</span>
							</div>
						))}
						{plan.features.length > 3 && (
							<div className="text-xs text-blue-600">
								+{plan.features.length - 3} more benefits
							</div>
						)}
					</div>
				</div>
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
			<div className="flex items-center justify-center text-sm text-gray-500">
				<Lock className="w-4 h-4 mr-1" />
				Secured by Stripe. Your card details are encrypted.
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
					className={`flex-1 py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors ${
						plan.special
							? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
							: 'bg-blue-600 text-white hover:bg-blue-700'
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
			<div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center">
							<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
								<Zap className="w-6 h-6 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-gray-900">
									{step === 'select' ? 'Choose Your Boost Plan' : 'Complete Payment'}
								</h2>
								<p className="text-sm text-gray-500">
									{step === 'select'
										? 'Supercharge your profile visibility'
										: `Purchasing ${selectedPlan?.name}`}
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
						<div className="space-y-4">
							{BOOST_PLANS.map((plan) => (
								<button
									key={plan.id}
									onClick={() => handlePlanSelect(plan)}
									className={`w-full text-left rounded-xl p-4 border-2 transition-all hover:shadow-md ${
										plan.special
											? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 hover:border-yellow-400'
											: plan.popular
											? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 hover:border-blue-400'
											: 'bg-white border-gray-200 hover:border-blue-300'
									}`}
								>
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<h3
													className={`font-bold ${
														plan.special ? 'text-yellow-800' : 'text-gray-900'
													}`}
												>
													{plan.special && '🔥 '}
													{plan.name}
												</h3>
												{plan.popular && (
													<span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
														Popular
													</span>
												)}
												{plan.savings && (
													<span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
														Save {plan.savings}
													</span>
												)}
											</div>
											<div className="flex items-center gap-4 text-sm text-gray-600">
												<span>
													{plan.duration < 30
														? `${plan.duration} days`
														: plan.duration < 365
														? `${Math.round(plan.duration / 30)} month${
																plan.duration >= 60 ? 's' : ''
														  }`
														: '5 years'}
												</span>
												<span>•</span>
												<span>{plan.features.length} benefits</span>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<div className="text-right">
												<div
													className={`text-xl font-bold ${
														plan.special ? 'text-yellow-700' : 'text-blue-600'
													}`}
												>
													£{plan.price.toFixed(2)}
												</div>
											</div>
											<ChevronRight className="w-5 h-5 text-gray-400" />
										</div>
									</div>

									{/* Features Preview */}
									<div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2">
										{plan.features.map((feature, index) => (
											<div
												key={index}
												className="flex items-center text-xs text-gray-600"
											>
												<FeatureIcon feature={feature} />
												<span className="ml-1.5 truncate">{feature}</span>
											</div>
										))}
									</div>
								</button>
							))}

							<p className="text-xs text-gray-500 text-center mt-4">
								All plans include instant activation. One-time payment, no
								recurring charges.
							</p>
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

