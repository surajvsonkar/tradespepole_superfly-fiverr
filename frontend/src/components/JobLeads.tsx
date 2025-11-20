import { useState, useEffect } from 'react';
import {
	ArrowLeft,
	MapPin,
	Calendar,
	DollarSign,
	Users,
	Heart,
	CreditCard,
	CheckCircle,
	Clock,
	AlertTriangle,
	Filter,
	UserCheck,
	Star,
	X,
	MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Interest, Review, Conversation, JobLead } from '../types';
import MapView from './MapView';
import MessagingModal from './MessagingModal';
import ConversationsList from './ConversationsList';
import { jobService } from '../services/jobService';

const JobLeads = () => {
	const { state, dispatch } = useApp();

	const [selectedLead, setSelectedLead] = useState<string | null>(null);
	const [interestMessage, setInterestMessage] = useState('');
	const [showInterestModal, setShowInterestModal] = useState(false);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [reviewData, setReviewData] = useState({
		jobId: '',
		tradespersonId: '',
		rating: 5,
		comment: '',
	});
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
	const [showDismissConfirm, setShowDismissConfirm] = useState(false);
	const [selectedJobToDismiss, setSelectedJobToDismiss] = useState<
		string | null
	>(null);
	const [showConversationsList, setShowConversationsList] = useState(false);
	const [showMessaging, setShowMessaging] = useState(false);
	const [selectedConversation, setSelectedConversation] =
		useState<Conversation | null>(null);
	const [jobLeads, setJobLeads] = useState<JobLead[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch job leads from API
	useEffect(() => {
		const fetchJobLeads = async () => {
			if (!state.currentUser) {
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);
			try {
				let leads: JobLead[];
				if (state.currentUser.type === 'homeowner') {
					// Fetch homeowner's own jobs
					const response = await jobService.getMyJobs();
					leads = response.jobLeads; // Backend returns 'jobLeads' not 'jobs'
				} else {
					// Fetch available job leads for tradespeople
					const response = await jobService.getJobLeads();
					leads = response.jobLeads; // Backend returns 'jobLeads' not 'jobs'
				}
				console.log('Fetched job leads:', leads); // Debug log
				setJobLeads(leads);
				// Also update global state
				dispatch({ type: 'UPDATE_JOB_LEADS', payload: leads });
			} catch (err) {
				console.error('Failed to fetch job leads:', err);
				setError('Failed to load job leads. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		fetchJobLeads();
	}, [state.currentUser, dispatch]);

	// Show different content for homeowners vs tradespeople
	const isHomeowner = state.currentUser?.type === 'homeowner';

	// Calculate pricing based on membership
	const calculateLeadPrice = (membershipType: string = 'none') => {
		const basePrice = 9.99; // Flat price for all

		let discount = 0;
		let finalPrice = basePrice;

		switch (membershipType) {
			case 'basic':
				discount = 0.1; // 10% discount
				finalPrice = basePrice * (1 - discount);
				break;
			case 'premium':
				discount = 0.25; // 25% discount
				finalPrice = basePrice * (1 - discount);
				break;
			case 'unlimited_5_year':
				discount = 1; // 100% discount (free)
				finalPrice = 0;
				break;
			default:
				discount = 0;
				finalPrice = basePrice;
		}

		return {
			basePrice,
			discount: discount * 100,
			finalPrice,
			membershipType,
		};
	};

	const calculateInterestPrice = (membershipType: string = 'none') => {
		const basePrice = 5.99; // Flat price for all

		let discount = 0;
		let finalPrice = basePrice;

		switch (membershipType) {
			case 'basic':
				discount = 0.1; // 10% discount
				finalPrice = basePrice * (1 - discount);
				break;
			case 'premium':
				discount = 0.25; // 25% discount
				finalPrice = basePrice * (1 - discount);
				break;
			case 'unlimited_5_year':
				discount = 1; // 100% discount (free)
				finalPrice = 0;
				break;
			default:
				discount = 0;
				finalPrice = basePrice;
		}

		return {
			basePrice,
			discount: discount * 100,
			finalPrice,
			membershipType,
		};
	};

	// Filter job leads based on user's trades if they're a tradesperson
	const filteredJobLeads = (jobLeads || []).filter(lead => {
		if (isHomeowner) {
			// For homeowners, show only their own jobs
			return lead.postedBy === state.currentUser?.id;
		} else {
			// For tradespeople, filter out inactive jobs and dismissed jobs
			if (!lead.isActive) {
				return false;
			}
			
			// Filter out dismissed jobs
			if (lead.dismissedBy?.includes(state.currentUser?.id || '')) {
				return false;
			}
			
			// Filter out jobs they've already purchased
			if (lead.purchasedBy.includes(state.currentUser?.id || '')) {
				return false;
			}
			
			// Filter out jobs they've already expressed interest in
			if (lead.interests.some(interest => interest.tradespersonId === state.currentUser?.id)) {
				return false;
			}
		}
		
		
		if (categoryFilter === 'all') {
			return true;
		}
		return lead.category === categoryFilter;
	});

	// Get unique categories for filter dropdown
	const availableCategories = ['all', ...Array.from(new Set((jobLeads || []).map(lead => lead.category)))];

	const handlePurchaseLead = (leadId: string) => {
		if (!state.currentUser) {
			dispatch({
				type: 'SHOW_AUTH_MODAL',
				payload: { mode: 'signup', userType: 'tradesperson' },
			});
			return;
		}

		if (state.currentUser.type !== 'tradesperson') {
			alert('Only tradespeople can purchase leads');
			return;
		}

		const pricing = calculateLeadPrice(state.currentUser.membershipType);

		if (
			pricing.finalPrice > 0 &&
			(!state.currentUser.credits ||
				state.currentUser.credits < pricing.finalPrice)
		) {
			alert(
				`Insufficient credits. You need £${pricing.finalPrice.toFixed(
					2
				)} to purchase this lead.`
			);
			return;
		}

		dispatch({
			type: 'PURCHASE_LEAD',
			payload: {
				leadId,
				tradespersonId: state.currentUser.id,
				price: pricing.finalPrice,
			},
		});

		// Force a small delay to ensure state updates, then show confirmation
		setTimeout(() => {
			if (pricing.finalPrice === 0) {
				alert(
					'Lead purchased successfully with your VIP membership! No credits deducted. Contact details are now available.'
				);
			} else {
				alert(
					`Lead purchased successfully! £${pricing.finalPrice.toFixed(
						2
					)} has been deducted from your credits. Contact details are now available.`
				);
			}
		}, 100);
	};

	const handleExpressInterest = (leadId: string) => {
		if (!state.currentUser) {
			dispatch({
				type: 'SHOW_AUTH_MODAL',
				payload: { mode: 'signup', userType: 'tradesperson' },
			});
			return;
		}

		if (state.currentUser.type !== 'tradesperson') {
			alert('Only tradespeople can express interest');
			return;
		}

		setSelectedLead(leadId);
		setShowInterestModal(true);
	};

	const submitInterest = () => {
		if (!selectedLead || !state.currentUser) return;

		const pricing = calculateInterestPrice(state.currentUser.membershipType);

		const interest: Interest = {
			id: `int_${Date.now()}`,
			tradespersonId: state.currentUser.id,
			tradespersonName: state.currentUser.name,
			message: interestMessage,
			date: new Date().toISOString().split('T')[0],
			status: 'pending',
			price: pricing.finalPrice,
		};

		dispatch({
			type: 'EXPRESS_INTEREST',
			payload: {
				leadId: selectedLead,
				tradespersonId: state.currentUser.id,
				message: interestMessage,
				price: pricing.finalPrice,
			},
		});
		setShowInterestModal(false);
		setInterestMessage('');
		setSelectedLead(null);

		if (pricing.finalPrice === 0) {
			alert(
				'Interest expressed successfully with your VIP membership! No charge if accepted.'
			);
		} else {
			alert(
				`Interest expressed successfully! You will be charged £${pricing.finalPrice.toFixed(
					2
				)} if the homeowner accepts.`
			);
		}
	};

	const handleAcceptInterest = (leadId: string, interestId: string) => {
		dispatch({ type: 'ACCEPT_INTEREST', payload: { leadId, interestId } });

		// Create conversation when interest is accepted
		const lead = state.jobLeads.find((l) => l.id === leadId);
		const interest = lead?.interests.find((i) => i.id === interestId);

		if (lead && interest && state.currentUser) {
			setTimeout(() => {
				dispatch({
					type: 'CREATE_CONVERSATION',
					payload: {
						jobId: leadId,
						homeownerId: state.currentUser!.id,
						tradespersonId: interest.tradespersonId,
					},
				});
			}, 100);
		}

		if (interest?.price === 0) {
			alert(
				'Interest accepted! No charge for VIP member. The tradesperson now has access to your contact details.'
			);
		} else {
			alert(
				`Interest accepted! The tradesperson has been charged £${
					interest?.price.toFixed(2) || '5.99'
				} and now has access to your contact details.`
			);
		}
	};

	const handleHireTradesperson = (jobId: string, tradespersonId: string) => {
		if (!state.currentUser || state.currentUser.type !== 'homeowner') {
			alert('Only homeowners can hire tradespeople');
			return;
		}

		const job = state.jobLeads.find((lead) => lead.id === jobId);
		const tradesperson = state.users.find((user) => user.id === tradespersonId);

		if (!job || !tradesperson) {
			alert('Job or tradesperson not found');
			return;
		}

		dispatch({ type: 'HIRE_TRADESPERSON', payload: { jobId, tradespersonId } });
		alert(
			`You have hired ${tradesperson.name} for this job! The job is now closed to other applicants.`
		);
	};

	const handleLeaveReview = (jobId: string, tradespersonId: string) => {
		setReviewData({
			jobId,
			tradespersonId,
			rating: 5,
			comment: '',
		});
		setShowReviewModal(true);
	};

	const submitReview = () => {
		if (!state.currentUser || !reviewData.comment.trim()) {
			alert('Please fill in all fields');
			return;
		}

		const review: Review = {
			id: `review_${Date.now()}`,
			jobId: reviewData.jobId,
			tradespersonId: reviewData.tradespersonId,
			homeownerId: state.currentUser.id,
			rating: reviewData.rating,
			comment: reviewData.comment,
			createdAt: new Date().toISOString(),
		};

		dispatch({ type: 'ADD_REVIEW', payload: review });
		setShowReviewModal(false);
		setReviewData({ jobId: '', tradespersonId: '', rating: 5, comment: '' });
		alert('Review submitted successfully!');
	};

	const handleDismissJob = (jobId: string) => {
		setSelectedJobToDismiss(jobId);
		setShowDismissConfirm(true);
	};

	const confirmDismissJob = () => {
		if (!selectedJobToDismiss || !state.currentUser) return;

		dispatch({
			type: 'DISMISS_JOB',
			payload: {
				jobId: selectedJobToDismiss,
				tradespersonId: state.currentUser.id,
			},
		});

		setShowDismissConfirm(false);
		setSelectedJobToDismiss(null);
		alert('Job dismissed successfully. It will no longer appear in your feed.');
	};

	const handleSelectConversation = (conversation: Conversation) => {
		setSelectedConversation(conversation);
		setShowConversationsList(false);
		setShowMessaging(true);
	};

	const getUrgencyColor = (urgency: string) => {
		switch (urgency) {
			case 'High':
				return 'text-red-600 bg-red-50';
			case 'Medium':
				return 'text-yellow-600 bg-yellow-50';
			case 'Low':
				return 'text-green-600 bg-green-50';
			default:
				return 'text-gray-600 bg-gray-50';
		}
	};

	const getUrgencyIcon = (urgency: string) => {
		switch (urgency) {
			case 'High':
				return <AlertTriangle className="w-4 h-4" />;
			case 'Medium':
				return <Clock className="w-4 h-4" />;
			case 'Low':
				return <CheckCircle className="w-4 h-4" />;
			default:
				return <Clock className="w-4 h-4" />;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-6">
					<button
						onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}
						className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
					>
						<ArrowLeft className="w-5 h-5 mr-2" />
						Back to Home
					</button>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								{isHomeowner ? 'My Posted Jobs' : 'Available Job Leads'}
							</h1>
							<p className="text-gray-600 mt-2">
								{isHomeowner
									? 'Manage your posted projects and hire professionals'
									: 'Browse and purchase leads or express interest'}
							</p>
						</div>
						<div className="mt-4 md:mt-0 flex items-center space-x-2">
							<div className="flex bg-gray-100 rounded-lg p-1">
								<button
									onClick={() => setViewMode('list')}
									className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										viewMode === 'list'
											? 'bg-white text-gray-900 shadow-sm'
											: 'text-gray-600 hover:text-gray-900'
									}`}
								>
									List View
								</button>
								<button
									onClick={() => setViewMode('map')}
									className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										viewMode === 'map'
											? 'bg-white text-gray-900 shadow-sm'
											: 'text-gray-600 hover:text-gray-900'
									}`}
								>
									Map View
								</button>
							</div>
							<button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
								<Filter className="w-4 h-4 mr-2" />
								Filters
							</button>
						</div>
					</div>
				</div>

				{/* Category Filter */}
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Filter by Category
					</label>
					<select
						value={categoryFilter}
						onChange={(e) => setCategoryFilter(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						{availableCategories.map((category) => (
							<option key={category} value={category}>
								{category === 'all' ? 'All Categories' : category}
							</option>
						))}
					</select>
				</div>

				{/* Loading State */}
				{loading ? (
					<div className="flex justify-center items-center py-20">
						<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
					</div>
				) : error ? (
					<div className="text-center py-20">
						<p className="text-red-600 mb-4">{error}</p>
						<button
							onClick={() => window.location.reload()}
							className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
						>
							Retry
						</button>
					</div>
				) : viewMode === 'map' ? (
					<div className="h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
						<MapView viewType="jobs" />
					</div>
				) : filteredJobLeads.length === 0 ? (
					<div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
						<p className="text-gray-600 text-lg mb-4">
							{isHomeowner 
								? "You haven't posted any jobs yet." 
								: "No job leads available at the moment."}
						</p>
						{isHomeowner && (
							<button
								onClick={() => dispatch({ type: 'SET_VIEW', payload: 'submit-project' })}
								className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
							>
								Post a Job
							</button>
						)}
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{filteredJobLeads.map((lead) => {
							const canPurchase = lead.purchasedBy.length < lead.maxPurchases;
							const hasPurchased =
								state.currentUser &&
								lead.purchasedBy.includes(state.currentUser.id);
							const hasExpressedInterest =
								state.currentUser &&
								lead.interests.some(
									(interest) =>
										interest.tradespersonId === state.currentUser!.id
								);
							const isOwner =
								state.currentUser && lead.postedBy === state.currentUser.id;
							const hiredTradesperson = lead.hiredTradesperson
								? state.users.find((u) => u.id === lead.hiredTradesperson)
								: null;

							return (
								<div
									key={lead.id}
									className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative"
								>
									{/* DISMISS BUTTON - VERY VISIBLE */}
									{!isHomeowner && lead.isActive && (
										<button
											onClick={() => handleDismissJob(lead.id)}
											className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg z-20 transition-colors"
											title="Not interested - hide this job"
										>
											<X className="w-4 h-4" />
										</button>
									)}

									<div className="flex justify-between items-start mb-4">
										<h3 className="text-xl font-semibold text-gray-900">
											{lead.title}
										</h3>
										<div className="flex items-center space-x-2">
											{!lead.isActive && (
												<span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
													Job Completed
												</span>
											)}
											<div
												className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getUrgencyColor(
													lead.urgency
												)}`}
											>
												{getUrgencyIcon(lead.urgency)}
												<span className="ml-1">{lead.urgency}</span>
											</div>
										</div>
									</div>

									<p className="text-gray-600 mb-4 line-clamp-3">
										{lead.description}
									</p>

									<div className="space-y-2 mb-4">
										<div className="flex items-center text-sm text-gray-500">
											<MapPin className="w-4 h-4 mr-2" />
											{lead.location}
										</div>
										<div className="flex items-center text-sm text-gray-500">
											<DollarSign className="w-4 h-4 mr-2" />
											{lead.budget}
										</div>
										<div className="flex items-center text-sm text-gray-500">
											<Calendar className="w-4 h-4 mr-2" />
											Posted {lead.postedDate}
										</div>
										<div className="flex items-center text-sm text-gray-500">
											<Users className="w-4 h-4 mr-2" />
											{lead.purchasedBy.length}/{lead.maxPurchases} purchases
										</div>
									</div>

									<div className="flex items-center justify-between mb-4">
										<span className="text-lg font-bold text-blue-600">
											£{lead.price}
										</span>
										<span className="text-sm text-gray-500">
											{lead.category}
										</span>
									</div>

									{hasPurchased && (
										<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
											<h4 className="font-semibold text-green-800 mb-2">
												Contact Details
											</h4>
											<div className="text-sm text-green-700">
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
										</div>
									)}

									{/* Show hired tradesperson info */}
									{hiredTradesperson && (
										<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
											<div className="flex items-center justify-between">
												<div>
													<h4 className="font-semibold text-green-800 mb-1">
														Hired Tradesperson
													</h4>
													<p className="text-green-700">
														{hiredTradesperson.name}
													</p>
													<p className="text-sm text-green-600">
														{hiredTradesperson.trades?.join(', ')}
													</p>
												</div>
												{isOwner && (
													<button
														onClick={() =>
															handleLeaveReview(lead.id, hiredTradesperson.id)
														}
														className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
													>
														<Star className="w-4 h-4 mr-1" />
														Leave Review
													</button>
												)}
											</div>
										</div>
									)}

									{/* Show purchased leads (for homeowners) */}
									{isOwner && lead.purchasedBy.length > 0 && (
										<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
											<h4 className="font-semibold text-blue-800 mb-2">
												Tradespeople who purchased this lead
											</h4>
											{lead.purchasedBy.map((tradespersonId) => {
												const tradesperson = state.users.find(
													(u) => u.id === tradespersonId
												);
												if (!tradesperson) return null;

												return (
													<div
														key={tradespersonId}
														className="flex items-center justify-between bg-white rounded-lg p-3 mb-2 last:mb-0"
													>
														<div>
															<p className="font-medium text-gray-900">
																{tradesperson.name}
															</p>
															<p className="text-sm text-gray-600">
																{tradesperson.trades?.join(', ')}
															</p>
															<div className="flex items-center text-sm text-gray-500">
																<Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
																{tradesperson.rating
																	? Number(tradesperson.rating).toFixed(1)
																	: '0.0'}{' '}
																({tradesperson.reviews || 0} reviews)
															</div>
														</div>
														{lead.isActive && !lead.hiredTradesperson && (
															<button
																onClick={() =>
																	handleHireTradesperson(
																		lead.id,
																		tradespersonId
																	)
																}
																className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
															>
																<UserCheck className="w-4 h-4 mr-1" />
																Hire
															</button>
														)}
													</div>
												);
											})}
										</div>
									)}

									{lead.interests.length > 0 && (
										<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
											<h4 className="font-semibold text-blue-800 mb-2">
												Expressed Interests
											</h4>
											{lead.interests.map((interest) => (
												<div
													key={interest.id}
													className="text-sm text-blue-700 mb-2 last:mb-0"
												>
													<div className="flex justify-between items-start">
														<div>
															<p>
																<strong>{interest.tradespersonName}</strong>
															</p>
															<p className="text-blue-600">
																{interest.message}
															</p>
															<p className="text-xs text-blue-500">
																{interest.date}
															</p>
														</div>
														<div className="flex space-x-2">
															{isOwner &&
																interest.status === 'pending' &&
																lead.isActive && (
																	<button
																		onClick={() =>
																			handleAcceptInterest(lead.id, interest.id)
																		}
																		className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
																	>
																		Accept
																	</button>
																)}
															{isOwner &&
																interest.status === 'accepted' &&
																lead.isActive &&
																!lead.hiredTradesperson && (
																	<button
																		onClick={() =>
																			handleHireTradesperson(
																				lead.id,
																				interest.tradespersonId
																			)
																		}
																		className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center"
																	>
																		<UserCheck className="w-3 h-3 mr-1" />
																		Hire
																	</button>
																)}
															{interest.status === 'accepted' && (
																<span className="text-green-600 text-xs font-medium">
																	Accepted
																</span>
															)}
															{/* Message button for accepted interests */}
															{!isHomeowner &&
																interest.tradespersonId ===
																	state.currentUser?.id &&
																interest.status === 'accepted' && (
																	<button
																		onClick={() => {
																			const homeowner = state.users.find(
																				(u) => u.id === lead.postedBy
																			);
																			if (!homeowner) return;

																			// Create conversation and open messaging
																			const existingConv =
																				state.conversations.find(
																					(c) =>
																						c.jobId === lead.id &&
																						c.homeownerId === lead.postedBy &&
																						c.tradespersonId ===
																							state.currentUser!.id
																				);

																			if (existingConv) {
																				setSelectedConversation(existingConv);
																				setShowMessaging(true);
																			} else {
																				dispatch({
																					type: 'CREATE_CONVERSATION',
																					payload: {
																						jobId: lead.id,
																						homeownerId: lead.postedBy,
																						tradespersonId:
																							state.currentUser!.id,
																					},
																				});

																				// Open messaging modal with temp conversation
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
																				setShowMessaging(true);
																			}
																		}}
																		className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center"
																	>
																		<MessageCircle className="w-3 h-3 mr-1" />
																		Message
																	</button>
																)}
														</div>
													</div>
												</div>
											))}
										</div>
									)}

									<div className="flex space-x-3">
										{/* Purchase Lead Button */}
										{!isHomeowner &&
											!hasPurchased &&
											canPurchase &&
											lead.isActive && (
												<>
													{state.currentUser?.membershipType ===
													'unlimited_5_year' ? (
														<button
															onClick={() => handlePurchaseLead(lead.id)}
															className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center font-semibold"
														>
															<CreditCard className="w-4 h-4 mr-2" />
															Buy Job Lead - VIP FREE
														</button>
													) : (
														<button
															onClick={() => handlePurchaseLead(lead.id)}
															className={`flex-1 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
																state.currentUser?.membershipType &&
																state.currentUser?.membershipType !== 'none'
																	? 'bg-green-600 hover:bg-green-700'
																	: 'bg-blue-600 hover:bg-blue-700'
															}`}
														>
															<CreditCard className="w-4 h-4 mr-2" />
															Purchase Lead £
															{calculateLeadPrice(
																state.currentUser?.membershipType
															).finalPrice.toFixed(2)}
															{state.currentUser?.membershipType &&
																state.currentUser?.membershipType !== 'none' && (
																	<span className="ml-1 text-xs">
																		(Save{' '}
																		{
																			calculateLeadPrice(
																				state.currentUser.membershipType
																			).discount
																		}
																		%)
																	</span>
																)}
														</button>
													)}
												</>
											)}

										{/* Express Interest Button */}
										{!isHomeowner && !hasExpressedInterest && lead.isActive && (
											<>
												{state.currentUser.membershipType ===
												'unlimited_5_year' ? (
													<button
														onClick={() => handleExpressInterest(lead.id)}
														className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors flex items-center justify-center font-semibold"
													>
														<Heart className="w-4 h-4 mr-2" />
														Express Interest - VIP FREE
													</button>
												) : (
													<button
														onClick={() => handleExpressInterest(lead.id)}
														className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
													>
														<Heart className="w-4 h-4 mr-2" />
														Express Interest
													</button>
												)}
											</>
										)}

										{/* Status Messages */}
										{!canPurchase && !hasPurchased && lead.isActive && (
											<div className="flex-1 bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-center">
												Sold Out
											</div>
										)}

										{!lead.isActive && (
											<div className="flex-1 bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-center">
												Job Completed
											</div>
										)}

										{hasPurchased && (
											<div className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-center font-medium">
												Purchased
											</div>
										)}

										{/* Message Homeowner Button for purchased leads */}
										{!isHomeowner && hasPurchased && (
											<button
												onClick={() => {
													const homeowner = state.users.find(
														(u) => u.id === lead.postedBy
													);
													if (!homeowner) return;

													// Create conversation and open messaging
													const existingConv = state.conversations.find(
														(c) =>
															c.jobId === lead.id &&
															c.homeownerId === lead.postedBy &&
															c.tradespersonId === state.currentUser!.id
													);

													if (existingConv) {
														setSelectedConversation(existingConv);
														setShowMessaging(true);
													} else {
														dispatch({
															type: 'CREATE_CONVERSATION',
															payload: {
																jobId: lead.id,
																homeownerId: lead.postedBy,
																tradespersonId: state.currentUser!.id,
															},
														});

														// Open messaging modal with temp conversation
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
														setShowMessaging(true);
													}
												}}
												className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
											>
												<MessageCircle className="w-4 h-4 mr-2" />
												Message Homeowner
											</button>
										)}

										{/* Show buttons for non-tradespeople */}
										{!state.currentUser && !isHomeowner && lead.isActive && (
											<button
												onClick={() =>
													dispatch({
														type: 'SHOW_AUTH_MODAL',
														payload: {
															mode: 'signup',
															userType: 'tradesperson',
														},
													})
												}
												className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
											>
												Sign Up to Purchase
											</button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* Interest Modal */}
				{showInterestModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
							<h3 className="text-lg font-semibold mb-4">Express Interest</h3>

							{state.currentUser && (
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
									<div className="text-sm">
										<p className="font-medium text-blue-800">
											Interest Expression Fee:
										</p>
										<div className="text-blue-700">
											{state.currentUser.membershipType ===
											'unlimited_5_year' ? (
												<p className="font-bold text-lg text-green-600">
													FREE with your VIP membership!
												</p>
											) : (
												<p className="font-bold text-lg">£5.99 if accepted</p>
											)}
										</div>
									</div>
								</div>
							)}

							<p className="text-sm text-gray-600 mb-4">
								Send a message to the homeowner explaining why you're the right
								person for this job.
							</p>

							<textarea
								value={interestMessage}
								onChange={(e) => setInterestMessage(e.target.value)}
								placeholder="Tell the homeowner why you're the right person for this job..."
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								rows={4}
								required
							/>
							<div className="flex justify-end space-x-3 mt-4">
								<button
									onClick={() => setShowInterestModal(false)}
									className="px-4 py-2 text-gray-600 hover:text-gray-800"
								>
									Cancel
								</button>
								<button
									onClick={submitInterest}
									className={`px-4 py-2 rounded-lg font-medium ${
										state.currentUser?.membershipType === 'unlimited_5_year'
											? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
											: 'bg-blue-600 text-white hover:bg-blue-700'
									}`}
									disabled={!interestMessage.trim()}
								>
									{state.currentUser?.membershipType === 'unlimited_5_year'
										? 'Send Interest - VIP FREE'
										: 'Send Interest'}
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Review Modal */}
				{showReviewModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
							<h3 className="text-lg font-semibold mb-4">Leave a Review</h3>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Rating
									</label>
									<div className="flex space-x-1">
										{[1, 2, 3, 4, 5].map((star) => (
											<button
												key={star}
												onClick={() =>
													setReviewData({ ...reviewData, rating: star })
												}
												className={`w-8 h-8 ${
													star <= reviewData.rating
														? 'text-yellow-400'
														: 'text-gray-300'
												}`}
											>
												<Star className="w-full h-full fill-current" />
											</button>
										))}
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Review Comment
									</label>
									<textarea
										value={reviewData.comment}
										onChange={(e) =>
											setReviewData({ ...reviewData, comment: e.target.value })
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
										rows={4}
										placeholder="Share your experience working with this tradesperson..."
										required
									/>
								</div>
							</div>
							<div className="flex justify-end space-x-3 mt-6">
								<button
									onClick={() => setShowReviewModal(false)}
									className="px-4 py-2 text-gray-600 hover:text-gray-800"
								>
									Cancel
								</button>
								<button
									onClick={submitReview}
									className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
									disabled={!reviewData.comment.trim()}
								>
									Submit Review
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Dismiss Job Confirmation Modal */}
				{showDismissConfirm && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
							<div className="flex items-center mb-4">
								<X className="w-6 h-6 text-red-600 mr-2" />
								<h3 className="text-lg font-semibold text-gray-900">
									Dismiss Job
								</h3>
							</div>
							<p className="text-gray-600 mb-6">
								Are you sure you want to dismiss this job? It will be
								permanently hidden from your job feed and you won't be able to
								see it again.
							</p>
							<div className="flex justify-end space-x-3">
								<button
									onClick={() => setShowDismissConfirm(false)}
									className="px-4 py-2 text-gray-600 hover:text-gray-800"
								>
									Cancel
								</button>
								<button
									onClick={confirmDismissJob}
									className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
								>
									Yes, Dismiss Job
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Conversations List Modal */}
				{showConversationsList && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-lg font-semibold text-gray-900">
									Your Conversations
								</h3>
								<button
									onClick={() => setShowConversationsList(false)}
									className="text-gray-400 hover:text-gray-600"
								>
									<X className="w-6 h-6" />
								</button>
							</div>
							<ConversationsList
								onSelectConversation={handleSelectConversation}
							/>
						</div>
					</div>
				)}

				{/* Messaging Modal */}
				<MessagingModal
					isOpen={showMessaging}
					onClose={() => setShowMessaging(false)}
					conversation={
						selectedConversation?.id ? selectedConversation : undefined
					}
					jobId={selectedConversation?.jobId}
					otherUserId={selectedConversation?.otherUserId}
				/>
			</div>
		</div>
	);
};

export default JobLeads;
