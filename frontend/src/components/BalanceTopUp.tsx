import { useState } from 'react';
import { X, CreditCard, Check, Loader, Lock, Euro, AlertCircle, Wallet } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentService } from '../services/paymentService';
import { useApp } from '../context/AppContext';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface BalanceTopUpProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: (newBalance: number) => void;
}

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 1000;

const TopUpForm = ({
	onSuccess,
	onClose,
	currentBalance,
}: {
	onSuccess?: (newBalance: number) => void;
	onClose: () => void;
	currentBalance: number;
}) => {
	const stripe = useStripe();
	const elements = useElements();
	const [amount, setAmount] = useState<number>(50);
	const [customAmount, setCustomAmount] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [newBalance, setNewBalance] = useState<number>(0);
	const { dispatch } = useApp();

	const handleAmountSelect = (selectedAmount: number) => {
		setAmount(selectedAmount);
		setCustomAmount('');
		setError(null);
	};

	const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setCustomAmount(value);
		const numValue = parseFloat(value);
		if (!isNaN(numValue)) {
			setAmount(numValue);
		}
		setError(null);
	};

	const validateAmount = (): boolean => {
		if (amount < MIN_AMOUNT) {
			setError(`Minimum top-up amount is €${MIN_AMOUNT}`);
			return false;
		}
		if (amount > MAX_AMOUNT) {
			setError(`Maximum top-up amount is €${MAX_AMOUNT}`);
			return false;
		}
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!stripe || !elements) {
			return;
		}

		if (!validateAmount()) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			// Create payment intent for balance top-up
			const response = await paymentService.addCredits(amount);
			const { clientSecret, paymentIntentId } = response;

			if (!clientSecret) {
				throw new Error('Failed to get payment details. Please try again.');
			}

			// Confirm card payment
			const cardElement = elements.getElement(CardElement);
			if (!cardElement) {
				throw new Error('Card element not found');
			}

			const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
				clientSecret,
				{
					payment_method: {
						card: cardElement,
					},
				}
			);

			if (stripeError) {
				setError(stripeError.message || 'Payment failed');
				return;
			}

			if (paymentIntent?.status === 'succeeded') {
				// Confirm the top-up on our backend to update the database
				try {
					const confirmResponse = await paymentService.confirmTopUp(paymentIntent.id);
					const updatedBalance = confirmResponse.newBalance;
					setNewBalance(updatedBalance);
					setSuccess(true);

					// Update user credits in app state with the confirmed balance from database
					dispatch({
						type: 'UPDATE_USER',
						payload: { credits: updatedBalance },
					});

					setTimeout(() => {
						onSuccess?.(updatedBalance);
						onClose();
					}, 2500);
				} catch (confirmError: any) {
					console.error('Confirmation error:', confirmError);
					// Payment succeeded but confirmation failed - show success anyway
					// The webhook will handle it or user can refresh
					const estimatedBalance = currentBalance + amount;
					setNewBalance(estimatedBalance);
					setSuccess(true);
					
					dispatch({
						type: 'UPDATE_USER',
						payload: { credits: estimatedBalance },
					});

					setTimeout(() => {
						onSuccess?.(estimatedBalance);
						onClose();
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
				<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<Check className="w-8 h-8 text-green-600" />
				</div>
				<h3 className="text-xl font-semibold text-gray-900 mb-2">Top-Up Successful!</h3>
				<p className="text-gray-600 mb-4">
					€{amount.toFixed(2)} has been added to your balance.
				</p>
				<div className="bg-green-50 border border-green-200 rounded-lg p-4">
					<p className="text-sm text-green-700">New Balance</p>
					<p className="text-2xl font-bold text-green-800">€{newBalance.toFixed(2)}</p>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Current Balance */}
			<div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<Wallet className="w-5 h-5 text-emerald-600 mr-2" />
						<span className="text-emerald-700 font-medium">Current Balance</span>
					</div>
					<span className="text-xl font-bold text-emerald-800">
						€{currentBalance.toFixed(2)}
					</span>
				</div>
			</div>

			{/* Amount Selection */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-3">
					Select Amount to Top Up
				</label>
				<div className="grid grid-cols-3 gap-2 mb-4">
					{QUICK_AMOUNTS.map((quickAmount) => (
						<button
							key={quickAmount}
							type="button"
							onClick={() => handleAmountSelect(quickAmount)}
							className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
								amount === quickAmount && !customAmount
									? 'border-emerald-500 bg-emerald-50 text-emerald-700'
									: 'border-gray-200 hover:border-emerald-300 text-gray-700 hover:bg-gray-50'
							}`}
						>
							€{quickAmount}
						</button>
					))}
				</div>

				{/* Custom Amount */}
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Euro className="h-5 w-5 text-gray-400" />
					</div>
					<input
						type="number"
						min={MIN_AMOUNT}
						max={MAX_AMOUNT}
						step="0.01"
						value={customAmount}
						onChange={handleCustomAmountChange}
						placeholder="Enter custom amount (€10 - €1000)"
						className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
					/>
				</div>
				<p className="mt-1 text-xs text-gray-500">
					Min: €{MIN_AMOUNT} | Max: €{MAX_AMOUNT}
				</p>
			</div>

			{/* Summary */}
			<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
				<div className="flex justify-between items-center mb-2">
					<span className="text-gray-600">Top-up amount</span>
					<span className="font-semibold text-gray-900">€{amount.toFixed(2)}</span>
				</div>
				<div className="flex justify-between items-center pt-2 border-t border-gray-200">
					<span className="text-gray-600">New balance will be</span>
					<span className="font-bold text-emerald-600">
						€{(currentBalance + amount).toFixed(2)}
					</span>
				</div>
			</div>

			{/* Card Input */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Card Details
				</label>
				<div className="border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent">
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
				<div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
					<AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
					<span className="text-red-800 text-sm">{error}</span>
				</div>
			)}

			{/* Secure Payment Notice */}
			<div className="flex items-center justify-center text-sm text-gray-500">
				<Lock className="w-4 h-4 mr-1" />
				Secured by Stripe. Your card details are encrypted.
			</div>

			{/* Submit Button */}
			<button
				type="submit"
				disabled={!stripe || loading || amount < MIN_AMOUNT || amount > MAX_AMOUNT}
				className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
			>
				{loading ? (
					<>
						<Loader className="w-5 h-5 mr-2 animate-spin" />
						Processing...
					</>
				) : (
					<>
						<CreditCard className="w-5 h-5 mr-2" />
						Top Up €{amount.toFixed(2)}
					</>
				)}
			</button>

			<p className="text-xs text-gray-500 text-center">
				Funds will be added to your balance immediately after payment.
			</p>
		</form>
	);
};

const BalanceTopUp = ({ isOpen, onClose, onSuccess }: BalanceTopUpProps) => {
	const { state } = useApp();
	const currentBalance = Number(state.currentUser?.credits || 0);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center">
							<div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
								<Wallet className="w-5 h-5 text-emerald-600" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-gray-900">Top Up Balance</h2>
								<p className="text-sm text-gray-500">Add funds to your account</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					<Elements stripe={stripePromise}>
						<TopUpForm
							onSuccess={onSuccess}
							onClose={onClose}
							currentBalance={currentBalance}
						/>
					</Elements>
				</div>
			</div>
		</div>
	);
};

export default BalanceTopUp;

