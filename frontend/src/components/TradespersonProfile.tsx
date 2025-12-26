import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	ArrowLeft,
	User,
	Building,
	Star,
	FileText,
	Shield,
	CreditCard,
	Settings,
	MapPin,
	Users,
	Bell,
	HelpCircle,
	LogOut,
	Save,
	X,
	MessageCircle,
	Calendar,
	DollarSign,
	AlertTriangle,
	Pause,
	Play,
	Trash2,
	Zap,
	Upload,
	Heart,
	CheckCircle,
	Loader,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PortfolioItem, Conversation, Review, User as UserType } from '../types';
import IDVerification from './IDVerification';
import WorkingAreaSelector, { WorkingAreaData } from './WorkingAreaSelector';
import { ChatModal as MessagingModal } from './MessagingModal';
import ContactsList from './ContactsList';
import QuoteRequest from './QuoteRequest';
import BalanceTopUp from './BalanceTopUp';
import SubscriptionModal from './SubscriptionModal';
import { userService } from '../services/userService';
import { reviewService } from '../services/reviewService';
import { paymentService } from '../services/paymentService';
import { conversationService } from '../services/conversationService';
import ProfilePhotoUpload from './ProfilePhotoUpload';

const TradespersonProfile = () => {
	const navigate = useNavigate();
	const { state, dispatch } = useApp();

	if (!state.currentUser) {
		return null;
	}

	const currentUser = state.currentUser!;

	const [activeTab, setActiveTab] = useState('company-description');
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [companyDescription, setCompanyDescription] = useState(
		state.currentUser?.companyDescription ||
			'20 plus years in home renovations, we supply and fit materials at below only jobs domestic and commercial.'
	);
	const [guarantee, setGuarantee] = useState('yes');
	const [showIDVerification, setShowIDVerification] = useState(false);
	const [showWorkingAreaSelector, setShowWorkingAreaSelector] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showParkConfirm, setShowParkConfirm] = useState(false);
	const [selectedTrades, setSelectedTrades] = useState<string[]>(
		state.currentUser?.trades || []
	);
	const [selectedServices, setSelectedServices] = useState<string[]>(
		state.currentUser?.trades || []
	);
	const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
	const [subscriptionType, setSubscriptionType] = useState<'directory_listing' | 'basic' | 'premium' | 'unlimited'>('directory_listing');
	const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
	const [showPortfolioModal, setShowPortfolioModal] = useState(false);
	const [showConversationsList, setShowConversationsList] = useState(false);
	const [showMessaging, setShowMessaging] = useState(false);
	const [selectedConversation, setSelectedConversation] =
		useState<Conversation | null>(null);
	const [conversationsLoading, setConversationsLoading] = useState(false);
	const [showBalanceTopUp, setShowBalanceTopUp] = useState(false);
	const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
	const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(false);
	const [hasFetchedBalance, setHasFetchedBalance] = useState(false);
	const [portfolioData, setPortfolioData] = useState({
		title: '',
		description: '',
		category: '',
		image: null as File | null,
	});
	const [contactData, setContactData] = useState({
		name: state.currentUser?.name || '',
		email: state.currentUser?.email || '',
		phone: state.currentUser?.phone || '',
		businessName: state.currentUser?.businessName || '',
		hourlyRate: state.currentUser?.hourlyRate?.toString() || '',
	});
	const [reviews, setReviews] = useState<Review[]>([]);

	useEffect(() => {
		const fetchProfileData = async () => {
			if (state.currentUser?.id) {
				try {
					// Fetch reviews
					const reviewsResponse = await reviewService.getUserReviews(
						state.currentUser.id
					);
					setReviews(reviewsResponse.reviews || []);

					// Fetch latest user details
					const userResponse = await userService.getUserById(
						state.currentUser.id
					);
						dispatch({ type: 'UPDATE_USER', payload: userResponse.user });
				} catch (error) {
					console.error('Error fetching profile data:', error);
				}
			}
		};


		fetchProfileData();
	}, [state.currentUser?.id]);

	// Update local state when currentUser changes
	useEffect(() => {
		if (state.currentUser) {
			setContactData({
				name: state.currentUser.name || '',
				email: state.currentUser.email || '',
				phone: state.currentUser.phone || '',
				businessName: state.currentUser.businessName || '',
				hourlyRate: state.currentUser.hourlyRate?.toString() || '',
			});
			setCompanyDescription(state.currentUser.companyDescription || '');
			setSelectedTrades(state.currentUser.trades || []);
		}
	}, [state.currentUser]);

	// Fetch balance and payment history when balance tab is active
	useEffect(() => {
		if (activeTab === 'balance' && !hasFetchedBalance) {
			const fetchBalanceData = async () => {
				try {
					const balanceResponse = await paymentService.getBalance();
					if (balanceResponse.balance !== Number(state.currentUser?.credits || 0)) {
						dispatch({
							type: 'UPDATE_USER',
							payload: { credits: balanceResponse.balance },
						});
					}
				} catch (error) {
					console.error('Error fetching balance:', error);
				}

				if (paymentHistory.length === 0 && !loadingPaymentHistory) {
					setLoadingPaymentHistory(true);
					try {
						const response = await paymentService.getPaymentHistory({ limit: 10, type: 'credits_topup' });
						setPaymentHistory(response.payments || []);
					} catch (error) {
						console.error('Error fetching payment history:', error);
					} finally {
						setLoadingPaymentHistory(false);
					}
				}

				setHasFetchedBalance(true);
			};
			fetchBalanceData();
		}
	}, [activeTab, hasFetchedBalance]);

	const navigationItems = [
		{
			id: 'job-leads',
			label: 'New leads',
			action: () => dispatch({ type: 'SET_VIEW', payload: 'job-leads' }),
		},
		{
			id: 'purchased-leads',
			label: 'Purchased leads',
			action: () => setActiveTab('purchased-leads'),
		},
		{
			id: 'activity',
			label: 'Activity',
			action: () => setActiveTab('activity'),
		},
		{
			id: 'quote-requests',
			label: 'Quote Requests',
			action: () => setActiveTab('quote-requests'),
		},
		{
			id: 'contacts',
			label: 'Contacts',
			action: () => setShowConversationsList(true),
		},
		{
			id: 'account',
			label: 'My account',
			action: () => setActiveTab('manage-account'),
		},
	];

	const handleNavClick = (item: (typeof navigationItems)[0]) => {
		item.action();
		setIsMobileMenuOpen(false);
	};

	// Get jobs where this tradesperson was hired
	const jobsWon = state.jobLeads.filter(
		(lead) => lead.hiredTradesperson === currentUser?.id
	);
	console.log('Jobs won:', jobsWon.length);

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
							This profile is exclusively for tradespeople. Please sign in as a
							tradesperson to access this feature.
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

	const sidebarItems = [
		{
			id: 'home-counties',
			label:
				state.currentUser!.businessName || state.currentUser!.name.toUpperCase(),
			icon: Building,
			type: 'header',
		},
		{
			id: 'company-description',
			label: 'Company description',
			icon: FileText,
			type: 'nav',
		},
		{
			id: 'reviews',
			label: 'Reviews',
			icon: Star,
			type: 'nav',
		},
		{
			id: 'portfolio',
			label: 'Portfolio',
			icon: User,
			type: 'nav',
		},
		{
			id: 'purchased-leads',
			label: 'Purchased leads',
			icon: FileText,
			type: 'nav',
		},
		{
			id: 'activity',
			label: 'Activity',
			icon: Users,
			type: 'nav',
		},
		{
			id: 'account',
			label: 'Account',
			icon: Settings,
			type: 'section',
		},
		{
			id: 'contact-details',
			label: 'Contact details',
			icon: User,
			type: 'nav',
		},
		{
			id: 'manage-account',
			label: 'Manage account',
			icon: Settings,
			type: 'nav',
		},
		{
			id: 'lead-settings',
			label: 'Lead settings',
			icon: Settings,
			type: 'section',
		},
		{
			id: 'work-area',
			label: 'Work area',
			icon: MapPin,
			type: 'nav',
		},
		{
			id: 'services',
			label: 'Services',
			icon: Users,
			type: 'nav',
		},
		{
			id: 'notifications',
			label: 'Notifications',
			icon: Bell,
			type: 'nav',
		},
		{
			id: 'payments',
			label: 'Payments',
			icon: CreditCard,
			type: 'section',
		},
		{
			id: 'balance',
			label: 'Balance',
			icon: CreditCard,
			type: 'nav',
		},
		{
			id: 'directory-listing',
			label: 'Directory Listing',
			icon: Users,
			type: 'nav',
		},
		{
			id: 'support',
			label: 'Support',
			icon: HelpCircle,
			type: 'section',
		},
		{
			id: 'support-centre',
			label: 'Support centre',
			icon: HelpCircle,
			type: 'nav',
		},
		{
			id: 'log-out',
			label: 'Log out',
			icon: LogOut,
			type: 'nav',
		},
	];

	const handleTabClick = (tabId: string) => {
		if (tabId === 'log-out') {
			dispatch({ type: 'SET_USER', payload: null });
			dispatch({ type: 'SET_VIEW', payload: 'home' });
			return;
		}
		setActiveTab(tabId);
	};

	const handleSaveCompanyDescription = async () => {
		if (currentUser) {
			try {
				await userService.updateProfile({ companyDescription });
				const updatedUser = {
					...currentUser,
					companyDescription: companyDescription,
				};
				dispatch({ type: 'SET_USER', payload: updatedUser });
				alert('Company description saved successfully!');
			} catch (error) {
				console.error('Error saving company description:', error);
				alert('Failed to save company description. Please try again.');
			}
		}
	};

	const handleSaveContactDetails = async () => {
		if (currentUser) {
			try {
				await userService.updateProfile({
					name: contactData.name,
					phone: contactData.phone,
					businessName: contactData.businessName,
					hourlyRate: contactData.hourlyRate,
				});
				const updatedUser: UserType = {
					...currentUser,
					name: contactData.name,
					email: contactData.email,
					phone: contactData.phone,
					businessName: contactData.businessName,
					hourlyRate: contactData.hourlyRate ? parseFloat(contactData.hourlyRate) : null,
				};
				dispatch({ type: 'SET_USER', payload: updatedUser });
				alert('Contact details saved successfully!');
			} catch (error) {
				console.error('Error saving contact details:', error);
				alert('Failed to save contact details. Please try again.');
			}
		}
	};

	const handleIDVerificationComplete = (verificationData: any) => {
		if (state.currentUser) {
			const updatedUser = {
				...state.currentUser,
				verified: true,
				verificationData: verificationData,
			};
			dispatch({ type: 'SET_USER', payload: updatedUser });
		}
		setShowIDVerification(false);
	};

	const handleWorkingAreaSave = async (workingArea: WorkingAreaData) => {
		if (state.currentUser) {
			try {
				// FIX: Also update workPostcode when saving working area
				// Extract postcode from centerLocation if it looks like a UK postcode
				const postcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0AA)$/i;
				const workPostcode = postcodeRegex.test(workingArea.centerLocation.trim()) 
					? workingArea.centerLocation.trim().toUpperCase()
					: undefined;
				
				await userService.updateProfile({ 
					workingArea,
					...(workPostcode && { workPostcode })
				});
				dispatch({ 
					type: 'UPDATE_USER', 
					payload: { 
						workingArea,
						...(workPostcode && { workPostcode })
					} 
				});
				alert('Working area saved successfully!');
			} catch (error) {
				console.error('Error saving working area:', error);
				alert('Failed to save working area.');
			}
		}
	};

	const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !currentUser) return;

		setUploadingAvatar(true);
		try {
			// In a real app, you'd upload to ImageKit/S3 here
			// For now, we'll simulate it with a FileReader or a placeholder
			const reader = new FileReader();
			reader.onloadend = async () => {
				const base64String = reader.result as string;
				try {
					await userService.updateProfile({ avatar: base64String });
					dispatch({
						type: 'UPDATE_USER',
						payload: { avatar: base64String },
					});
					alert('Profile picture updated successfully!');
				} catch (error) {
					console.error('Error updating avatar:', error);
					alert('Failed to update profile picture.');
				} finally {
					setUploadingAvatar(false);
				}
			};
			reader.readAsDataURL(file);
		} catch (error) {
			console.error('Avatar upload error:', error);
			alert('Failed to upload image.');
			setUploadingAvatar(false);
		}
	};

	const handleAddPortfolioItem = () => {
		if (
			!portfolioData.title ||
			!portfolioData.description ||
			!portfolioData.image
		) {
			alert('Please fill in all fields and select an image');
			return;
		}

		const newPortfolioItem: PortfolioItem = {
			title: portfolioData.title,
			description: portfolioData.description,
			category: portfolioData.category,
			imageUrl: URL.createObjectURL(portfolioData.image),
			createdAt: new Date().toISOString(),
		};

		if (currentUser) {
			const updatedUser = {
				...currentUser,
				portfolio: [...(currentUser.portfolio || []), newPortfolioItem],
			};
			dispatch({ type: 'SET_USER', payload: updatedUser });
		}

		setShowPortfolioModal(false);
		setPortfolioData({ title: '', description: '', category: '', image: null });
		alert('Portfolio item added successfully!');
	};

	const handleSelectConversation = (conversation: any) => {
		setSelectedConversation(conversation);
		setShowConversationsList(false);
		setShowMessaging(true);
	};

	const handleOpenMessages = async () => {
		setConversationsLoading(true);
		try {
			console.log('📨 Opening messages modal - fetching conversations...');
			setShowConversationsList(true);
		} catch (error) {
			console.error('❌ Error opening messages:', error);
		} finally {
			setConversationsLoading(false);
		}
	};

	const handleParkAccount = () => {
		dispatch({ type: 'PARK_ACCOUNT', payload: currentUser!.id });
		setShowParkConfirm(false);
		alert(
			'Account parked successfully. You can reactivate anytime from your profile.'
		);
	};

	const handleReactivateAccount = () => {
		dispatch({ type: 'REACTIVATE_ACCOUNT', payload: currentUser!.id });
		alert("Account reactivated successfully! You're now live again.");
	};

	const handleDeleteAccount = () => {
		dispatch({ type: 'DELETE_ACCOUNT', payload: currentUser!.id });
		setShowDeleteConfirm(false);
		alert('Account deleted successfully.');
	};

	const handleTradeToggle = (trade: string, type: 'leads' | 'services') => {
		if (type === 'leads') {
			setSelectedTrades((prev) =>
				prev.includes(trade)
					? prev.filter((t) => t !== trade)
					: [...prev, trade]
			);
		} else {
			setSelectedServices((prev) =>
				prev.includes(trade)
					? prev.filter((t) => t !== trade)
					: [...prev, trade]
			);
		}
	};

	const handleSaveTrades = async (type: 'leads' | 'services') => {
		if (!state.currentUser) return;
		
		const trades = type === 'leads' ? selectedTrades : selectedServices;
		
		try {
			// Save to backend
			await userService.updateProfile({ trades });
			
			// Update local state
			const updatedUser = {
				...state.currentUser,
				trades: trades,
			};
			dispatch({ type: 'SET_USER', payload: updatedUser });
			
			alert(
				`${type === 'leads' ? 'Lead settings' : 'Services'} updated successfully! Jobs will now be filtered based on your selected trades.`
			);
		} catch (error) {
			console.error('Failed to save trades:', error);
			alert('Failed to save trades. Please try again.');
		}
	};

	// Get user's reviews (use fetched reviews)
	const userReviews = reviews;

	// Filter purchased leads to show both purchased and accepted interests
	const purchasedLeads = state.jobLeads.filter((lead) => {
		if (!currentUser) return false;

		// Check if user purchased the lead
		const hasPurchased = lead.purchasedBy.includes(currentUser.id);

		// Check if user has an accepted interest
		const hasAcceptedInterest = lead.interests.some(
			(interest) =>
				interest.tradespersonId === currentUser.id &&
				interest.status === 'accepted'
		);

		console.log(
			`Lead ${lead.id}: purchased=${hasPurchased}, acceptedInterest=${hasAcceptedInterest}`
		);

		return hasPurchased || hasAcceptedInterest;
	});

	// Get accepted interest leads
	const acceptedInterestLeads = state.jobLeads.filter((lead) =>
		lead.interests.some(
			(interest) =>
				interest.tradespersonId === currentUser.id &&
				interest.status === 'accepted'
		)
	);

	// Get activity data
	const expressedInterests = state.jobLeads.flatMap((lead) =>
		lead.interests.filter(
			(interest) => interest.tradespersonId === currentUser.id
		)
	);

	const hiredJobs = state.jobLeads.filter(
		(lead) => lead.hiredTradesperson === currentUser.id
	);

	const dismissedJobs = state.jobLeads.filter((lead) =>
		lead.dismissedBy?.includes(currentUser.id)
	);

	const renderContent = () => {
		switch (activeTab) {
			case 'quote-requests':
				return <QuoteRequest />;

			case 'company-description':
				return (
					<div className="space-y-6">
						<div>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-semibold text-gray-900">
									Company description
								</h2>
								<button
									onClick={handleSaveCompanyDescription}
									className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
								>
									<Save className="w-4 h-4 mr-1" />
									Save
								</button>
							</div>

							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									About your company
								</label>
								<textarea
									value={companyDescription}
									onChange={(e) => setCompanyDescription(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									rows={4}
									placeholder="Tell customers about your company..."
								/>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									Guarantee
								</h3>
								<p className="text-sm text-gray-600 mb-4">
									Increase your chances of getting hired by offering a guarantee
								</p>

								<div className="space-y-3">
									<label className="flex items-start">
										<input
											type="radio"
											name="guarantee"
											value="yes"
											checked={guarantee === 'yes'}
											onChange={(e) => setGuarantee(e.target.value)}
											className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
										/>
										<div>
											<div className="font-medium text-gray-900">
												Yes, I offer a guarantee
											</div>
											<div className="text-sm text-gray-600">
												Homeowners are more likely to hire professionals who
												offer guarantees
											</div>
										</div>
									</label>

									<label className="flex items-start">
										<input
											type="radio"
											name="guarantee"
											value="no"
											checked={guarantee === 'no'}
											onChange={(e) => setGuarantee(e.target.value)}
											className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
										/>
										<div>
											<div className="font-medium text-gray-900">
												No, I do not offer a guarantee
											</div>
										</div>
									</label>
								</div>
							</div>
						</div>
					</div>
				);

			case 'reviews':
				return (
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
							<div className="flex items-center">
								{[1, 2, 3, 4, 5].map((star) => (
									<Star
										key={star}
										className={`w-4 h-4 ${
											star <= (state.currentUser?.rating || 0)
												? 'text-yellow-400 fill-current'
												: 'text-gray-300'
										}`}
									/>
								))}
								<span className="ml-2 text-sm font-medium text-gray-700">
									{state.currentUser?.rating
										? Number(state.currentUser.rating).toFixed(1)
										: '0.0'}
								</span>
								<span className="text-gray-500 ml-1">
									({userReviews.length} reviews)
								</span>
							</div>
						</div>
						<div>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
								<div className="flex items-center">
									<div className="flex items-center mr-2">
										{[...Array(5)].map((_, i) => (
											<Star
												key={i}
												className={`w-4 h-4 ${
													i < Math.floor(currentUser.rating || 0)
														? 'text-yellow-400 fill-current'
														: 'text-gray-300'
												}`}
											/>
										))}
									</div>
									<span className="text-sm font-medium text-gray-700">
										{currentUser.rating
											? Number(currentUser.rating).toFixed(1)
											: '0.0'}{' '}
										({userReviews.length} reviews)
									</span>
								</div>
							</div>

							{userReviews.length === 0 ? (
								<div className="bg-gray-50 rounded-lg p-8 text-center">
									<Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<p className="text-gray-600">No reviews yet</p>
									<p className="text-sm text-gray-500 mt-2">
										Reviews from customers will appear here
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{userReviews.map((review) => {
										return (
											<div
												key={review.id}
												className="bg-white border border-gray-200 rounded-lg p-6"
											>
												<div className="flex items-start justify-between mb-4">
													<div className="flex items-center">
														<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
															{(review.homeowner?.name || 'U').charAt(0)}
														</div>
														<div>
															<h4 className="font-semibold text-gray-900">
																{review.homeowner?.name || 'Anonymous'}
															</h4>
															<p className="text-sm text-gray-500">
																{review.job?.title || 'Project'}
															</p>
														</div>
													</div>
													<div className="text-right">
														<div className="flex items-center mb-1">
															{[...Array(5)].map((_, i) => (
																<Star
																	key={i}
																	className={`w-4 h-4 ${
																		i < review.rating
																			? 'text-yellow-400 fill-current'
																			: 'text-gray-300'
																	}`}
																/>
															))}
														</div>
														<p className="text-xs text-gray-500">
															{new Date(review.createdAt).toLocaleDateString()}
														</p>
													</div>
												</div>
												<p className="text-gray-700 leading-relaxed">
													{review.comment}
												</p>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</div>
				);

			case 'portfolio':
				return (
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold text-gray-900">Portfolio</h2>
							<button
								onClick={() => setShowPortfolioModal(true)}
								className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
							>
								Add Portfolio Item
							</button>
						</div>

						{!currentUser.portfolio ||
						currentUser.portfolio.length === 0 ? (
							<div className="bg-gray-50 rounded-lg p-8 text-center">
								<User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600">No portfolio items yet</p>
								<p className="text-sm text-gray-500 mt-2">
									Add photos of your work to showcase your skills
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{currentUser.portfolio.map((item, index) => (
									<div
										key={index}
										className="bg-white border border-gray-200 rounded-lg overflow-hidden"
									>
										<img
											src={item.imageUrl}
											alt={item.title}
											className="w-full h-48 object-cover"
										/>
										<div className="p-4">
											<h3 className="font-semibold text-gray-900 mb-1">
												{item.title}
											</h3>
											<p className="text-sm text-gray-600 mb-2">
												{item.description}
											</p>
											<span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
												{item.category}
											</span>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				);

			case 'purchased-leads':
				return (
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold text-gray-900">
								Purchased leads
							</h2>
							<button
								onClick={handleOpenMessages}
								disabled={conversationsLoading}
								className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{conversationsLoading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Loading...
									</>
								) : (
									<>
										<MessageCircle className="w-4 h-4 mr-2" />
										View Messages
									</>
								)}
							</button>
						</div>

						<div className="space-y-4">
							{/* Show accepted interest leads first */}
							{acceptedInterestLeads.map((lead) => {
												const myInterest = lead.interests.find(
													(interest) =>
														interest.tradespersonId === currentUser.id &&
														interest.status === 'accepted'
												);

								return (
									<div
										key={`interest-${lead.id}`}
										className="border border-green-200 rounded-lg p-4 bg-green-50"
									>
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center">
												<h3 className="text-lg font-semibold text-gray-900">
													{lead.title}
												</h3>
												<span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
													Interest Accepted
												</span>
											</div>
											<span
												className={`px-3 py-1 rounded-full text-sm font-medium ${
													lead.urgency === 'High'
														? 'bg-red-100 text-red-800'
														: lead.urgency === 'Medium'
														? 'bg-yellow-100 text-yellow-800'
														: 'bg-green-100 text-green-800'
												}`}
											>
												{lead.urgency} Priority
											</span>
										</div>

										<p className="text-gray-600 mb-3">{lead.description}</p>

										<div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
											<div className="flex items-center">
												<MapPin className="w-4 h-4 mr-1" />
												{lead.location}
											</div>
											<div className="flex items-center">
												<DollarSign className="w-4 h-4 mr-1" />
												{lead.budget}
											</div>
											<div className="flex items-center">
												<Calendar className="w-4 h-4 mr-1" />
												Posted {lead.postedDate}
											</div>
											<div className="flex items-center">
												<Heart className="w-4 h-4 mr-1 text-green-600" />
												Interest Fee: £
												{myInterest?.price
													? Number(myInterest.price).toFixed(2)
													: '0.00'}
											</div>
										</div>

										{/* Contact Details - Now Unlocked */}
										<div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
											<h4 className="font-semibold text-green-800 mb-2">
												✅ Contact Details Unlocked
											</h4>
											<div className="text-sm text-green-700 space-y-1">
												<p>
													<strong>Name:</strong> {lead.contactDetails.name}
												</p>
												<p>
													<strong>Email:</strong> {lead.contactDetails.email}
												</p>
												<p>
													<strong>Phone:</strong> {lead.contactDetails.phone}
												</p>
											</div>
											<p className="text-xs text-green-600 mt-2">
												Access granted via accepted interest
											</p>
										</div>

										<div className="flex space-x-3">
											<button
												onClick={() => {
													// Create conversation and open messaging
													dispatch({
														type: 'CREATE_CONVERSATION',
														payload: {
															jobId: lead.id,
															homeownerId: lead.postedBy,
															tradespersonId: state.currentUser!.id,
														},
													});

													// Open messaging modal
													setShowMessaging(true);
													setSelectedConversation({
														id: `temp_${lead.id}_${lead.postedBy}`,
														jobId: lead.id,
														jobTitle: lead.title,
														homeownerId: lead.postedBy,
														tradespersonId: state.currentUser!.id,
														messages: [],
														createdAt: new Date().toISOString(),
														unreadCount: 0,
													});
												}}
												className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
											>
												<MessageCircle className="w-4 h-4 mr-2" />
												Message Homeowner
											</button>
										</div>
									</div>
								);
							})}

							{/* Show purchased leads */}
							{purchasedLeads.map((lead) => {
								const hasAcceptedInterest = lead.interests.some(
									(interest) =>
										interest.tradespersonId === currentUser.id &&
										interest.status === 'accepted'
								);
								const wasPurchased = lead.purchasedBy.includes(
									currentUser.id || ''
								);

								return (
									<div
										key={lead.id}
										className={`border rounded-lg p-4 ${
											hasAcceptedInterest && !wasPurchased
												? 'bg-green-50 border-green-200'
												: 'bg-blue-50 border-blue-200'
										}`}
									>
										<div className="flex justify-between items-start mb-3">
											<div>
												<h4 className="font-semibold text-gray-900 mb-2">
													{lead.title}
												</h4>
												<p className="text-sm text-gray-600 mb-2">
													{lead.description.substring(0, 100)}...
												</p>
												<div className="flex items-center space-x-4 text-sm text-gray-500">
													<span>{lead.category}</span>
													<span>{lead.location}</span>
													<span>{lead.budget}</span>
												</div>
											</div>
											<div className="text-right">
												{(() => {
													const hasPurchased = lead.purchasedBy.includes(
														state.currentUser!.id
													);
													const hasAcceptedInterest = lead.interests.some(
														(interest) =>
															interest.tradespersonId ===
																state.currentUser!.id &&
															interest.status === 'accepted'
													);

													if (hasPurchased) {
														return (
															<span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
																Purchased Lead
															</span>
														);
													} else if (hasAcceptedInterest) {
														return (
															<span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
																Interest Accepted
															</span>
														);
													}
													return null;
												})()}
											</div>
										</div>

										{/* Contact Details */}
										{(() => {
											const hasPurchased = lead.purchasedBy.includes(
												state.currentUser!.id
											);
											const hasAcceptedInterest = lead.interests.some(
												(interest) =>
													interest.tradespersonId === state.currentUser!.id &&
													interest.status === 'accepted'
											);

											if (hasPurchased || hasAcceptedInterest) {
												return (
													<div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
														<h4 className="font-semibold text-green-800 mb-2">
															Contact Details{' '}
															{hasAcceptedInterest &&
																!hasPurchased &&
																'(Unlocked via Interest)'}
														</h4>
														<div className="text-sm text-green-700">
															<p>
																<strong>Name:</strong>{' '}
																{lead.contactDetails.name}
															</p>
															<p>
																<strong>Email:</strong>{' '}
																{lead.contactDetails.email}
															</p>
															<p>
																<strong>Phone:</strong>{' '}
																{lead.contactDetails.phone}
															</p>
														</div>
													</div>
												);
											}
											return null;
										})()}

										{/* Message Button */}
										<div className="mt-4">
											<button
												onClick={async () => {
													console.log(
														'Creating conversation for lead:',
														lead.id
													);
													try {
														// Create conversation via API (or get existing)
														const response = await conversationService.createConversation({
															jobId: lead.id,
															homeownerId: lead.postedBy,
															tradespersonId: state.currentUser!.id,
														});

														console.log('Conversation created/retrieved:', response.conversation.id);
														setSelectedConversation(response.conversation);
														setShowMessaging(true);
													} catch (error) {
														console.error('Failed to create conversation:', error);
														alert('Failed to start conversation. Please try again.');
													}
												}}
												className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
											>
												<MessageCircle className="w-4 h-4 mr-2" />
												Message Homeowner
											</button>
										</div>
									</div>
								);
							})}

							{purchasedLeads.length === 0 &&
								acceptedInterestLeads.length === 0 && (
									<div className="bg-gray-50 rounded-lg p-8 text-center">
										<FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
										<p className="text-gray-600">No purchased leads yet</p>
										<p className="text-sm text-gray-500 mt-2">
											Leads you purchase will appear here with contact details
										</p>
									</div>
								)}
						</div>
					</div>
				);

			case 'activity':
				return (
					<div className="space-y-6">
						<h2 className="text-xl font-semibold text-gray-900">Activity</h2>

						{/* Activity Summary */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
								<div className="text-2xl font-bold text-blue-600">
									{purchasedLeads.length}
								</div>
								<div className="text-sm text-blue-800">Purchased Leads</div>
							</div>
							<div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
								<div className="text-2xl font-bold text-purple-600">
									{expressedInterests.length}
								</div>
								<div className="text-sm text-purple-800">
									Expressed Interests
								</div>
							</div>
							<div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
								<div className="text-2xl font-bold text-green-600">
									{hiredJobs.length}
								</div>
								<div className="text-sm text-green-800">Jobs Won</div>
							</div>
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
								<div className="text-2xl font-bold text-gray-600">
									{dismissedJobs.length}
								</div>
								<div className="text-sm text-gray-800">Dismissed</div>
							</div>
						</div>

						{/* Activity Feed */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-gray-900">
								Recent Activity
							</h3>

							{/* Hired Jobs */}
							{hiredJobs.map((job) => (
								<div
									key={`hired-${job.id}`}
									className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
								>
									<div className="flex items-start justify-between">
										<div className="flex items-start space-x-3">
											<div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
											<div>
												<h4 className="font-semibold text-gray-900">
													Hired for: {job.title}
												</h4>
												<p className="text-sm text-gray-600">
													{job.location} • {job.budget}
												</p>
												<p className="text-xs text-gray-500">
													Posted {job.postedDate}
												</p>
											</div>
										</div>
										<span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
											Hired
										</span>
									</div>
								</div>
							))}

							{/* Purchased Leads */}
							{purchasedLeads.map((lead) => (
								<div
									key={`purchased-${lead.id}`}
									className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
								>
									<div className="flex items-start justify-between">
										<div className="flex items-start space-x-3">
											<div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
											<div>
												<h4 className="font-semibold text-gray-900">
													Purchased: {lead.title}
												</h4>
												<p className="text-sm text-gray-600">
													{lead.location} • {lead.budget}
												</p>
												<p className="text-xs text-gray-500">
													Posted {lead.postedDate}
												</p>
											</div>
										</div>
										<span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
											£{lead.price}
										</span>
									</div>
								</div>
							))}

							{/* Expressed Interests */}
							{expressedInterests.map((interest) => {
								const job = state.jobLeads.find((j) =>
									j.interests.some((i) => i.id === interest.id)
								);
								return (
									<div
										key={`interest-${interest.id}`}
										className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
									>
										<div className="flex items-start justify-between">
											<div className="flex items-start space-x-3">
												<div className="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
												<div>
													<h4 className="font-semibold text-gray-900">
														Interest: {job?.title}
													</h4>
													<p className="text-sm text-gray-600">
														{job?.location} • {job?.budget}
													</p>
													<p className="text-xs text-gray-500">
														Expressed {interest.date}
													</p>
												</div>
											</div>
											<span
												className={`px-2 py-1 text-xs rounded-full ${
													interest.status === 'accepted'
														? 'bg-green-100 text-green-800'
														: interest.status === 'rejected'
														? 'bg-red-100 text-red-800'
														: 'bg-yellow-100 text-yellow-800'
												}`}
											>
												{interest.status}
											</span>
										</div>
									</div>
								);
							})}

							{/* Dismissed Jobs */}
							{dismissedJobs.map((job) => (
								<div
									key={`dismissed-${job.id}`}
									className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer opacity-75"
								>
									<div className="flex items-start justify-between">
										<div className="flex items-start space-x-3">
											<div className="w-3 h-3 bg-gray-400 rounded-full mt-2"></div>
											<div>
												<h4 className="font-semibold text-gray-900">
													Dismissed: {job.title}
												</h4>
												<p className="text-sm text-gray-600">
													{job.location} • {job.budget}
												</p>
												<p className="text-xs text-gray-500">
													Posted {job.postedDate}
												</p>
											</div>
										</div>
										<span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
											Dismissed
										</span>
									</div>
								</div>
							))}

							{/* No Activity */}
							{purchasedLeads.length === 0 &&
								expressedInterests.length === 0 &&
								hiredJobs.length === 0 &&
								dismissedJobs.length === 0 && (
									<div className="bg-gray-50 rounded-lg p-8 text-center">
										<Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
										<p className="text-gray-600">No activity yet</p>
										<p className="text-sm text-gray-500 mt-2">
											Your job activity will appear here
										</p>
									</div>
								)}
						</div>
					</div>
				);

			case 'contact-details':
				return (
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold text-gray-900">
								Contact details
							</h2>
							<button
								onClick={handleSaveContactDetails}
								className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
							>
								<Save className="w-4 h-4 mr-1" />
								Save
							</button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Business name
								</label>
								<input
									type="text"
									value={contactData.businessName}
									onChange={(e) =>
										setContactData({
											...contactData,
											businessName: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Contact name
								</label>
								<input
									type="text"
									value={contactData.name}
									onChange={(e) =>
										setContactData({ ...contactData, name: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Hourly rate (£)
								</label>
								<input
									type="number"
									value={contactData.hourlyRate}
									onChange={(e) =>
										setContactData({
											...contactData,
											hourlyRate: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									placeholder="e.g. 50"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Email
								</label>
								<input
									type="email"
									value={contactData.email}
									onChange={(e) =>
										setContactData({ ...contactData, email: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Phone
								</label>
								<input
									type="tel"
									value={contactData.phone}
									onChange={(e) =>
										setContactData({ ...contactData, phone: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						</div>
					</div>
				);

			case 'manage-account':
				return (
					<div className="space-y-6">
						<h2 className="text-xl font-semibold text-gray-900">
							Manage account
						</h2>

						{/* Profile Photo Upload */}
						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Profile Photo
							</h3>
							<ProfilePhotoUpload currentAvatar={currentUser.avatar} />
						</div>

						{/* Verification Status */}
						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Verification Status
							</h3>
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<Shield
										className={`w-6 h-6 mr-3 ${
											currentUser.verified
												? 'text-green-600'
												: 'text-gray-400'
										}`}
									/>
									<div>
										<p className="font-medium text-gray-900">
											{currentUser.verified
												? 'Verified Professional'
												: 'Verification Pending'}
										</p>
										<p className="text-sm text-gray-600">
											{currentUser.verified
												? 'Your identity has been verified'
												: 'Complete ID verification to build trust with customers'}
										</p>
									</div>
								</div>
								{!state.currentUser.verified && (
									<button
										onClick={() => setShowIDVerification(true)}
										className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
									>
										Verify ID
									</button>
								)}
							</div>
						</div>

						{/* Account Status */}
						{currentUser.accountStatus === 'parked' && (
							<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
								<div className="flex items-center">
									<Pause className="w-5 h-5 text-yellow-600 mr-2" />
									<span className="text-yellow-800 font-medium">
										Your account is currently parked
									</span>
								</div>
								<p className="text-yellow-700 text-sm mt-1">
									Parked on{' '}
									{new Date(currentUser.parkedDate!).toLocaleDateString()}
									. Reactivate to start receiving leads again.
								</p>
							</div>
						)}

						{purchasedLeads.length === 0 &&
						acceptedInterestLeads.length === 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{currentUser.accountStatus !== 'parked' ? (
									<button
										onClick={() => setShowParkConfirm(true)}
										className="flex items-center justify-center px-4 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
									>
										<Pause className="w-5 h-5 mr-2" />
										Park Account
									</button>
								) : (
									<button
										onClick={handleReactivateAccount}
										className="flex items-center justify-center px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
									>
										<Play className="w-5 h-5 mr-2" />
										Reactivate Account
									</button>
								)}

								<button
									onClick={() =>
										navigate('/membership')
									}
									className="flex items-center justify-center px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
								>
									<Zap className="w-5 h-5 mr-2" />
									Boost Profile
								</button>

								<button
									onClick={() => setShowDeleteConfirm(true)}
									className="flex items-center justify-center px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
								>
									<Trash2 className="w-5 h-5 mr-2" />
									Delete Account
								</button>
							</div>
						) : (
							<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
								<div className="flex items-center">
									<AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
									<span className="text-yellow-800 font-medium">
										Account management restricted
									</span>
								</div>
								<p className="text-yellow-700 text-sm mt-1">
									You have active leads or ongoing projects. Complete or resolve
									these before managing your account.
								</p>
							</div>
						)}
					</div>
				);

			case 'work-area':
				return (
					<div className="space-y-6">
						<h2 className="text-xl font-semibold text-gray-900">Work area</h2>
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
							<h3 className="font-semibold text-blue-800 mb-2">
								Set your work area
							</h3>
							<p className="text-blue-700 mb-4">
								Define where you're willing to travel for jobs
							</p>
							{state.currentUser.workingArea && (
								<div className="mb-4 text-sm text-blue-700">
									<p>
										<strong>Current area:</strong>{' '}
										{state.currentUser.workingArea.centerLocation}
									</p>
									<p>
										<strong>Radius:</strong>{' '}
										{state.currentUser.workingArea.radius} miles
									</p>
								</div>
							)}
							<button
								onClick={() => setShowWorkingAreaSelector(true)}
								className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
							>
								{state.currentUser.workingArea
									? 'Update Work Area'
									: 'Set Work Area'}
							</button>
						</div>
					</div>
				);

			case 'lead-settings':
				return (
					<div className="space-y-6">
						<h2 className="text-xl font-semibold text-gray-900">
							Lead Settings
						</h2>

						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Select Trades for Lead Notifications
							</h3>
							<p className="text-gray-600 mb-4">
								Choose which types of jobs you want to receive notifications for.
							</p>
							
							{selectedTrades.length > 0 && (
								<div className="mb-4">
									<div className="flex flex-wrap gap-2">
										{selectedTrades.map((trade) => (
											<span
												key={trade}
												className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
											>
												{trade}
												<button
													type="button"
													onClick={() => handleTradeToggle(trade, 'leads')}
													className="ml-2 text-blue-600 hover:text-blue-800"
												>
													×
												</button>
											</span>
										))}
									</div>
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
								{availableTrades.map((trade) => {
									const isSelected = selectedTrades.includes(trade);
									return (
										<label
											key={trade}
											className={`flex items-center p-3 border rounded-lg cursor-pointer ${
												isSelected
													? 'border-blue-300 bg-blue-50'
													: 'border-gray-200 hover:bg-gray-50'
											}`}
										>
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => handleTradeToggle(trade, 'leads')}
												className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
											/>
											<span className="text-sm text-gray-700">{trade}</span>
										</label>
									);
								})}
							</div>

							<div className="flex items-center justify-between">
								<p className="text-sm text-gray-500">
									{selectedTrades.length} trade
									{selectedTrades.length !== 1 ? 's' : ''} selected
								</p>
								<button
									onClick={() => handleSaveTrades('leads')}
									className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
								>
									Save Lead Settings
								</button>
							</div>
						</div>
					</div>
				);

			case 'services':
				return (
					<div className="space-y-6">
						<h2 className="text-xl font-semibold text-gray-900">Services</h2>

						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Your Service Offerings
							</h3>
							<p className="text-gray-600 mb-4">
								Select the services you provide to customers.
							</p>

							{selectedServices.length > 0 && (
								<div className="mb-4">
									<div className="flex flex-wrap gap-2">
										{selectedServices.map((trade) => (
											<span
												key={trade}
												className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
											>
												{trade}
												<button
													type="button"
													onClick={() => handleTradeToggle(trade, 'services')}
													className="ml-2 text-blue-600 hover:text-blue-800"
												>
													×
												</button>
											</span>
										))}
									</div>
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
								{availableTrades.map((trade) => {
									const isSelected = selectedServices.includes(trade);
									return (
										<label
											key={trade}
											className={`flex items-center p-3 border rounded-lg cursor-pointer ${
												isSelected
													? 'border-blue-300 bg-blue-50'
													: 'border-gray-200 hover:bg-gray-50'
											}`}
										>
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => handleTradeToggle(trade, 'services')}
												className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
											/>
											<span className="text-sm text-gray-700">{trade}</span>
										</label>
									);
								})}
							</div>

							<div className="flex items-center justify-between">
								<p className="text-sm text-gray-500">
									{selectedServices.length} service
									{selectedServices.length !== 1 ? 's' : ''} selected
								</p>
								<button
									onClick={() => handleSaveTrades('services')}
									className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
								>
									Save Services
								</button>
							</div>
						</div>
					</div>
				);

			case 'balance':
				return (
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold text-gray-900">Balance</h2>
						</div>

						{/* Balance Card */}
						<div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center">
									<CreditCard className="w-6 h-6 mr-2" />
									<span className="font-medium">Available Balance</span>
								</div>
								<span className="text-xs bg-white/20 px-2 py-1 rounded-full">
									GBP
								</span>
							</div>
							<div className="text-4xl font-bold mb-6">
								£{state.currentUser.credits
									? Number(state.currentUser.credits).toFixed(2)
									: '0.00'}
							</div>
							<button
								onClick={() => setShowBalanceTopUp(true)}
								className="w-full bg-white text-emerald-600 py-3 px-4 rounded-xl font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center"
							>
								<DollarSign className="w-5 h-5 mr-2" />
								Top Up Balance
							</button>
						</div>

						{/* Top-up Info */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<h4 className="font-semibold text-blue-800 mb-2">About Balance Top-Up</h4>
							<ul className="text-sm text-blue-700 space-y-1">
								<li>• Minimum top-up: £10</li>
								<li>• Maximum top-up: £1,000</li>
								<li>• Use your balance to purchase job leads</li>
								<li>• Secure payment via Stripe</li>
							</ul>
						</div>

						{/* Payment History */}
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Top-Ups</h3>
							{loadingPaymentHistory ? (
								<div className="text-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
									<p className="text-gray-500 mt-2">Loading...</p>
								</div>
							) : paymentHistory.length === 0 ? (
								<div className="bg-gray-50 rounded-lg p-8 text-center">
									<CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<p className="text-gray-600">No top-up history yet</p>
									<p className="text-sm text-gray-500 mt-2">
										Your balance top-up transactions will appear here
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{paymentHistory.map((payment) => (
										<div
											key={payment.id}
											className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
										>
											<div className="flex items-center">
												<div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
													payment.status === 'succeeded'
														? 'bg-green-100'
														: payment.status === 'pending'
														? 'bg-yellow-100'
														: 'bg-red-100'
												}`}>
													<DollarSign className={`w-5 h-5 ${
														payment.status === 'succeeded'
															? 'text-green-600'
															: payment.status === 'pending'
															? 'text-yellow-600'
															: 'text-red-600'
													}`} />
												</div>
												<div>
													<p className="font-medium text-gray-900">Balance Top-Up</p>
													<p className="text-sm text-gray-500">
														{new Date(payment.createdAt).toLocaleDateString('en-GB', {
															day: 'numeric',
															month: 'short',
															year: 'numeric',
															hour: '2-digit',
															minute: '2-digit'
														})}
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="font-semibold text-green-600">
													+£{Number(payment.amount).toFixed(2)}
												</p>
												<span className={`text-xs px-2 py-1 rounded-full ${
													payment.status === 'succeeded'
														? 'bg-green-100 text-green-800'
														: payment.status === 'pending'
														? 'bg-yellow-100 text-yellow-800'
														: 'bg-red-100 text-red-800'
												}`}>
													{payment.status}
												</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				);

			case 'directory-listing':
				return (
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold text-gray-900">Directory Listing</h2>
						</div>

						{/* Directory Listing Status Card */}
						<div className={`rounded-2xl p-6 text-white shadow-lg ${
							state.currentUser?.hasDirectoryListing 
								? 'bg-gradient-to-br from-green-500 to-emerald-600'
								: 'bg-gradient-to-br from-gray-500 to-gray-600'
						}`}>
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center">
									<Users className="w-6 h-6 mr-2" />
									<span className="font-medium">Directory Status</span>
								</div>
								<span className={`text-xs px-3 py-1 rounded-full ${
									state.currentUser?.hasDirectoryListing 
										? 'bg-white/20'
										: 'bg-red-500/50'
								}`}>
									{state.currentUser?.hasDirectoryListing ? 'ACTIVE' : 'NOT LISTED'}
								</span>
							</div>
							<div className="text-3xl font-bold mb-2">
								{state.currentUser?.hasDirectoryListing 
									? 'You are listed in the directory!'
									: 'Get discovered by homeowners'
								}
							</div>
							<p className="text-white/80 text-sm">
								{state.currentUser?.hasDirectoryListing 
									? 'Homeowners can find and contact you directly'
									: 'Subscribe to appear in homeowner searches'
								}
							</p>
						</div>

						{/* Subscription Info */}
						<div className="bg-white border border-gray-200 rounded-xl p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Directory Listing Subscription
							</h3>
							
							<div className="flex items-center justify-between mb-6">
								<div>
									<div className="text-3xl font-bold text-blue-600">£0.99</div>
									<div className="text-gray-600">per month</div>
								</div>
								{!state.currentUser?.hasDirectoryListing && (
									<button
										onClick={() => {
											setSubscriptionType('directory_listing');
											setShowSubscriptionModal(true);
										}}
										className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center"
									>
										<CreditCard className="w-5 h-5 mr-2" />
										Subscribe Now
									</button>
								)}
								{state.currentUser?.hasDirectoryListing && (
									<button
										onClick={async () => {
											if (window.confirm('Are you sure you want to cancel your directory listing? You will no longer appear in homeowner searches.')) {
												try {
													await userService.manageDirectoryListing('cancel');
													dispatch({ type: 'UPDATE_USER', payload: { hasDirectoryListing: false, directoryStatus: 'paused' } });
													alert('Directory listing cancelled.');
												} catch (error) {
													console.error('Error cancelling listing:', error);
													alert('Failed to cancel listing.');
												}
											}
										}}
										className="bg-red-100 text-red-600 px-6 py-3 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center"
									>
										<X className="w-5 h-5 mr-2" />
										Cancel Listing
									</button>
								)}
							</div>

							<div className="space-y-3">
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
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<h4 className="font-semibold text-blue-800 mb-2">Why list your profile?</h4>
							<p className="text-sm text-blue-700">
								When you're listed in the directory, homeowners browsing for tradespeople 
								in your area will be able to find you, view your profile, see your reviews, 
								and contact you directly for potential jobs. It's the best way to get discovered!
							</p>
						</div>
					</div>
				);

			case 'notifications':
				return (
					<div className="space-y-6">
						<h2 className="text-xl font-semibold text-gray-900">
							Notifications
						</h2>
						<div className="space-y-4">
							{[
								'Email notifications',
								'SMS notifications',
								'Push notifications',
							].map((type) => (
								<label
									key={type}
									className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
								>
									<span className="text-gray-700">{type}</span>
									<input
										type="checkbox"
										defaultChecked
										className="text-blue-600 focus:ring-blue-500"
									/>
								</label>
							))}
						</div>
					</div>
				);

			default:
				return (
					<div className="space-y-6">
						<h2 className="text-xl font-semibold text-gray-900">
							{activeTab
								.replace('-', ' ')
								.replace(/\b\w/g, (l) => l.toUpperCase())}
						</h2>
						<div className="bg-gray-50 rounded-lg p-8 text-center">
							<p className="text-gray-600">This section is under development</p>
						</div>
					</div>
				);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 px-4 py-3">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="flex items-center">
						<button
							onClick={() => navigate('/')}
							className="flex items-center text-blue-600 hover:text-blue-700 mr-6"
						>
							<ArrowLeft className="w-5 h-5 mr-2" />
							Back to Home
						</button>
						<div className="flex items-center">
							<div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-2">
								<span className="text-white font-bold text-sm">2</span>
							</div>
							<span className="text-xl font-bold text-gray-900">
								24/7 Tradespeople
							</span>
						</div>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
						{navigationItems.map((item) => (
							<button
								key={item.id}
								onClick={() => item.action()}
								className="hover:text-gray-900 transition-colors"
							>
								{item.label}
							</button>
						))}
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
					>
						{isMobileMenuOpen ? (
							<X className="w-6 h-6 text-gray-700" />
						) : (
							<svg
								className="w-6 h-6 text-gray-700"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						)}
					</button>
				</div>

				{/* Mobile Menu Dropdown */}
				{isMobileMenuOpen && (
					<div className="md:hidden border-t border-gray-200 bg-white">
						<div className="px-4 py-2 space-y-1">
							{navigationItems.map((item) => (
								<button
									key={item.id}
									onClick={() => handleNavClick(item)}
									className="block w-full text-left px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
								>
									{item.label}
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			<div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
				{/* Sidebar */}
				<div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 lg:min-h-screen">
					<div className="p-4">
						<h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">
							Profile
						</h1>
						<nav className="space-y-1">
							{sidebarItems.map((item) => {
								if (item.type === 'header') {
									return (
										<div
											key={item.id}
											className="flex items-center py-3 px-3 bg-gray-50 rounded-lg mb-4 lg:mb-4 group cursor-pointer"
											onClick={() => document.getElementById('avatar-upload')?.click()}
										>
											<div className="relative w-10 h-10 mr-3">
												{state.currentUser.avatar ? (
													<img
														src={state.currentUser.avatar}
														alt={state.currentUser.name}
														className="w-full h-full rounded-full object-cover"
													/>
												) : (
													<div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center">
														<span className="text-white font-bold text-base">
															{state.currentUser.name.charAt(0)}
														</span>
													</div>
												)}
												<div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
													{uploadingAvatar ? (
														<Loader className="w-4 h-4 text-white animate-spin" />
													) : (
														<Upload className="w-4 h-4 text-white" />
													)}
												</div>
												<input
													id="avatar-upload"
													type="file"
													className="hidden"
													accept="image/*"
													onChange={handleAvatarUpload}
												/>
											</div>
											<div>
												<div className="font-semibold text-gray-900 text-sm truncate">
													{item.label}
												</div>
												<div className="text-xs text-gray-500">
													Click to change picture
												</div>
											</div>
										</div>
									);
								}

								if (item.type === 'section') {
									return (
										<div key={item.id} className="pt-4 lg:pt-6 pb-2">
											<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
												{item.label}
											</h3>
										</div>
									);
								}

								return (
									<button
										key={item.id}
										onClick={() => handleTabClick(item.id)}
										className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
											activeTab === item.id
												? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
												: 'text-gray-700 hover:bg-gray-50'
										}`}
									>
										<item.icon className="w-4 h-4 mr-3" />
										<span className="text-sm truncate">{item.label}</span>
									</button>
								);
							})}
						</nav>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex-1 p-4 lg:p-8">{renderContent()}</div>
			</div>

			{/* Portfolio Modal */}
			{showPortfolioModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Add Portfolio Item
						</h3>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Project Title
								</label>
								<input
									type="text"
									value={portfolioData.title}
									onChange={(e) =>
										setPortfolioData({
											...portfolioData,
											title: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									placeholder="e.g., Kitchen Renovation"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Description
								</label>
								<textarea
									value={portfolioData.description}
									onChange={(e) =>
										setPortfolioData({
											...portfolioData,
											description: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									rows={3}
									placeholder="Describe the project..."
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Category
								</label>
								<select
									value={portfolioData.category}
									onChange={(e) =>
										setPortfolioData({
											...portfolioData,
											category: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								>
									<option value="">Select category</option>
									<option value="Kitchen">Kitchen</option>
									<option value="Bathroom">Bathroom</option>
									<option value="Electrical">Electrical</option>
									<option value="Plumbing">Plumbing</option>
									<option value="Construction">Construction</option>
									<option value="Other">Other</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Project Image
								</label>
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
									{portfolioData.image ? (
										<div>
											<img
												src={URL.createObjectURL(portfolioData.image)}
												alt="Preview"
												className="w-full h-40 object-cover rounded-lg mb-2"
											/>
											<p className="text-sm text-gray-600">
												{portfolioData.image.name}
											</p>
											<button
												onClick={() =>
													setPortfolioData({ ...portfolioData, image: null })
												}
												className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
											>
												Remove image
											</button>
										</div>
									) : (
										<>
											<Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
											<p className="text-gray-600 mb-2">Upload project image</p>
											<input
												type="file"
												accept="image/*"
												onChange={(e) => {
													const file = e.target.files?.[0];
													if (file) {
														setPortfolioData({ ...portfolioData, image: file });
													}
												}}
												className="hidden"
												id="portfolio-image"
											/>
											<label
												htmlFor="portfolio-image"
												className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm"
											>
												Choose File
											</label>
										</>
									)}
								</div>
							</div>
						</div>

						<div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 bg-white sticky bottom-0">
							<button
								onClick={() => {
									setShowPortfolioModal(false);
									setPortfolioData({
										title: '',
										description: '',
										category: '',
										image: null,
									});
								}}
								className="px-4 py-2 text-gray-600 hover:text-gray-800"
							>
								Cancel
							</button>
							<button
								onClick={handleAddPortfolioItem}
								className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
							>
								Add Item
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ID Verification Modal */}
			<IDVerification
				isOpen={showIDVerification}
				onClose={() => setShowIDVerification(false)}
				onComplete={handleIDVerificationComplete}
				userName={state.currentUser.name}
			/>

			{/* Working Area Selector */}
			<WorkingAreaSelector
				isOpen={showWorkingAreaSelector}
				onClose={() => setShowWorkingAreaSelector(false)}
				onSave={handleWorkingAreaSave}
				currentWorkingArea={state.currentUser.workingArea}
			/>

			{/* Conversations List Modal */}
			{showConversationsList && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-gray-900">
								Your Messages
							</h3>
							<button
								onClick={() => setShowConversationsList(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X className="w-6 h-6" />
							</button>
						</div>
						<ContactsList onSelectContact={handleSelectConversation} />
					</div>
				</div>
			)}

			{/* Messaging Modal */}
			<MessagingModal
				isOpen={showMessaging}
				onClose={() => {
					setShowMessaging(false);
					setSelectedConversation(null);
				}}
				conversation={
					selectedConversation?.id ? selectedConversation : undefined
				}
				otherUserId={selectedConversation?.homeownerId}
			/>

			{/* Park Account Confirmation Modal */}
			{showParkConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
						<div className="flex items-center mb-4">
							<Pause className="w-6 h-6 text-yellow-600 mr-2" />
							<h3 className="text-lg font-semibold text-gray-900">
								Park Your Account
							</h3>
						</div>
						<p className="text-gray-600 mb-6">
							Parking your account will temporarily hide your profile from
							homeowners. You can reactivate anytime and go live instantly.
						</p>
						<div className="flex justify-end space-x-3">
							<button
								onClick={() => setShowParkConfirm(false)}
								className="px-4 py-2 text-gray-600 hover:text-gray-800"
							>
								Cancel
							</button>
							<button
								onClick={handleParkAccount}
								className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
							>
								Park Account
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Account Confirmation Modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
						<div className="flex items-center mb-4">
							<AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
							<h3 className="text-lg font-semibold text-gray-900">
								Delete Your Account
							</h3>
						</div>
						<p className="text-gray-600 mb-6">
							<strong>Warning:</strong> This action cannot be undone. All your
							data, messages, and account information will be permanently
							deleted.
						</p>
						<div className="flex justify-end space-x-3">
							<button
								onClick={() => setShowDeleteConfirm(false)}
								className="px-4 py-2 text-gray-600 hover:text-gray-800"
							>
								Cancel
							</button>
							<button
								onClick={handleDeleteAccount}
								className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
							>
								Delete Forever
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Balance Top-Up Modal */}
			<BalanceTopUp
				isOpen={showBalanceTopUp}
				onClose={() => setShowBalanceTopUp(false)}
				onSuccess={(newBalance) => {
					// Update the user's credits in state
						dispatch({ type: 'UPDATE_USER', payload: { credits: newBalance } });
					// Refresh payment history
					setPaymentHistory([]);
				}}
			/>

			{/* Subscription Modal */}
			<SubscriptionModal
				isOpen={showSubscriptionModal}
				onClose={() => setShowSubscriptionModal(false)}
				type={subscriptionType}
				onSuccess={() => {
					// User's directory status will be updated via dispatch in modal
					setShowSubscriptionModal(false);
				}}
			/>
		</div>
	);
};

export default TradespersonProfile;
