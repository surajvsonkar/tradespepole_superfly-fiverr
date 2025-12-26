import { useState } from 'react';
import { Users, CreditCard, CheckCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { userService } from '../services/userService';
import SubscriptionModal from './SubscriptionModal';

const DirectoryPage = () => {
	const { state, dispatch } = useApp();
	const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
	const { currentUser } = state;

	if (!currentUser || currentUser.type !== 'tradesperson') {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
					<p className="text-gray-600">This page is only available for tradespeople.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<h1 className="text-2xl font-bold text-gray-900 mb-6">Directory Listing</h1>

				{/* Directory Listing Status Card */}
				<div className={`rounded-2xl p-6 text-white shadow-lg mb-8 ${
					currentUser.hasDirectoryListing 
						? 'bg-gradient-to-br from-green-500 to-emerald-600'
						: 'bg-slate-700'
				}`}>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center">
							<Users className="w-6 h-6 mr-2" />
							<span className="font-medium">Directory Status</span>
						</div>
						<span className={`text-xs px-3 py-1 rounded-full ${
							currentUser.hasDirectoryListing 
								? 'bg-white/20'
								: 'bg-red-500/80 text-white'
						}`}>
							{currentUser.hasDirectoryListing ? 'ACTIVE' : 'NOT LISTED'}
						</span>
					</div>
					<div className="text-3xl font-bold mb-2">
						{currentUser.hasDirectoryListing 
							? 'You are listed in the directory!'
							: 'Get discovered by homeowners'
						}
					</div>
					<p className="text-white/80 text-sm">
						{currentUser.hasDirectoryListing 
							? 'Homeowners can find and contact you directly'
							: 'Subscribe to appear in homeowner searches'
						}
					</p>
				</div>

				{/* Subscription Info */}
				<div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Directory Listing Subscription
					</h3>
					
					<div className="flex items-center justify-between mb-6">
						<div>
							<div className="flex items-baseline">
								<span className="text-3xl font-bold text-blue-600">£0.99</span>
							</div>
							<div className="text-gray-600 text-sm">per month</div>
						</div>
						{!currentUser.hasDirectoryListing && (
							<button
								onClick={() => setShowSubscriptionModal(true)}
								className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center"
							>
								<CreditCard className="w-5 h-5 mr-2" />
								Subscribe Now
							</button>
						)}
						{currentUser.hasDirectoryListing && (
							<button
								onClick={async () => {
									if (window.confirm('Are you sure you want to cancel your directory listing? You will no longer appear in homeowner searches.')) {
										try {
											await userService.manageDirectoryListing('cancel');
											const updatedUser = {
												...currentUser,
												hasDirectoryListing: false,
												directoryStatus: 'paused'
											} as any;
											dispatch({ type: 'SET_USER', payload: updatedUser });
											alert('Directory listing cancelled.');
										} catch (error) {
											console.error('Error cancelling listing:', error);
											alert('Failed to cancel listing.');
										}
									}
								}}
								className="bg-red-50 text-red-600 px-6 py-2.5 rounded-lg hover:bg-red-100 transition-colors font-semibold flex items-center border border-red-200"
							>
								<X className="w-5 h-5 mr-2" />
								Cancel Listing
							</button>
						)}
					</div>

					<div className="space-y-4">
						<h4 className="font-medium text-gray-900">What you get:</h4>
						{[
							'Your profile appears in homeowner searches',
							'Homeowners can contact you directly',
							'Increased visibility for job opportunities',
							'Cancel anytime - no commitment'
						].map((benefit, index) => (
							<div key={index} className="flex items-center text-gray-700">
								<CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
								<span>{benefit}</span>
							</div>
						))}
					</div>
				</div>

				{/* Why List */}
				<div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
					<h4 className="font-semibold text-blue-800 mb-2">Why list your profile?</h4>
					<p className="text-sm text-blue-700 leading-relaxed">
						When you're listed in the directory, homeowners browsing for tradespeople 
						in your area will be able to find you, view your profile, see your reviews, 
						and contact you directly for potential jobs. It's the best way to get discovered!
					</p>
				</div>
			</div>

			{/* Subscription Modal */}
			<SubscriptionModal
				isOpen={showSubscriptionModal}
				onClose={() => setShowSubscriptionModal(false)}
				type="directory_listing"
				onSuccess={() => {
					// User's directory status will be updated via dispatch in modal
					// But we can also force an update here if needed or just close modal
					setShowSubscriptionModal(false);
					// Refresh user data could be good practice
					userService.getUserById(currentUser.id).then((response) => {
						dispatch({ type: 'UPDATE_USER', payload: response.user });
					});
				}}
			/>
		</div>
	);
};

export default DirectoryPage;
