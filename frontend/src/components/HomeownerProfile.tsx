import React, { useState, useEffect } from 'react';
import {
	ArrowLeft,
	User,
	Mail,
	MapPin,
	Calendar,
	Edit2,
	Save,
	X,
	Pause,
	Play,
	Trash2,
	Zap,
	AlertTriangle,
	UserCheck,
	Star,
	MessageCircle,
	Heart,
	Users,
	Eye,
	CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Review, Conversation, JobLead, User as AppUser } from '../types';
import {ChatModal as MessagingModal} from './MessagingModal';
import ContactsList from './ContactsList';
import { jobService } from '../services/jobService';
import { userService } from '../services/userService';
import { reviewService } from '../services/reviewService';

const HomeownerProfile = () => {
	const { state, dispatch } = useApp();
	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [myProjects, setMyProjects] = useState<JobLead[]>([]);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showParkConfirm, setShowParkConfirm] = useState(false);
	const [selectedJobToCancel, setSelectedJobToCancel] = useState<string | null>(
		null
	);
	const [showCancelJobConfirm, setShowCancelJobConfirm] = useState(false);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [showConversationsList, setShowConversationsList] = useState(false);
	const [showMessaging, setShowMessaging] = useState(false);
	const [selectedConversation, setSelectedConversation] =
		useState<Conversation | null>(null);
	const [conversationsLoading, setConversationsLoading] = useState(false);
	const [selectedProjectForDetails, setSelectedProjectForDetails] =
		useState<JobLead | null>(null);
	const [selectedTradesperson, setSelectedTradesperson] =
		useState<AppUser | null>(null);
	const [selectedChatUser, setSelectedChatUser] = useState<AppUser | null>(
		null
	);

	const [editData, setEditData] = useState({
		name: state.currentUser?.name || '',
		email: state.currentUser?.email || '',
		location: state.currentUser?.location || '',
	});

	const [reviewData, setReviewData] = useState({
		jobId: '',
		tradespersonId: '',
		rating: 5,
		comment: '',
	});

	useEffect(() => {
		const fetchMyData = async () => {
			if (!state.currentUser) return;

			setLoading(true);
			try {
				const response = await jobService.getMyJobs();
				setMyProjects(response.jobLeads || []);
			} catch (err) {
				console.error('Failed to fetch my jobs:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchMyData();
	}, [state.currentUser]);

	useEffect(() => {
		const fetchTradespeople = async () => {
			if (state.users.length === 0) {
				try {
					const response = await userService.getTradespeople();
					if (response.users) {
						dispatch({ type: 'SET_USERS', payload: response.users });
					}
				} catch (error) {
					console.error('Failed to fetch tradespeople:', error);
				}
			}
		};
		fetchTradespeople();
	}, [state.users.length, dispatch]);

	if (!state.currentUser || state.currentUser.type !== 'homeowner') {
		return null;
	}

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

	const handleLeaveReview = (jobId: string, tradespersonId: string) => {
		setReviewData({
			jobId,
			tradespersonId,
			rating: 5,
			comment: '',
		});
		setShowReviewModal(true);
	};

	const submitReview = async () => {
		if (!state.currentUser || !reviewData.comment.trim()) {
			alert('Please fill in all fields');
			return;
		}

		try {
			const review = await reviewService.createReview({
				jobId: reviewData.jobId,
				tradespersonId: reviewData.tradespersonId,
				rating: reviewData.rating,
				comment: reviewData.comment,
			});

			dispatch({ type: 'ADD_REVIEW', payload: review.review });
			setShowReviewModal(false);
			setReviewData({ jobId: '', tradespersonId: '', rating: 5, comment: '' });
			alert('Review submitted successfully!');
		} catch (error) {
			console.error('Failed to submit review:', error);
			alert('Failed to submit review');
		}
	};

	const handleSave = async () => {
		try {
			const response = await userService.updateProfile({
				name: editData.name,
				location: editData.location,
			});

			dispatch({ type: 'SET_USER', payload: response.user });
			setIsEditing(false);
			alert('Profile updated successfully!');
		} catch (error) {
			console.error('Failed to update profile:', error);
			alert('Failed to update profile');
		}
	};

	const handleCancel = () => {
		setEditData({
			name: state.currentUser?.name || '',
			email: state.currentUser?.email || '',
			location: state.currentUser?.location || '',
		});
		setIsEditing(false);
	};

	const handleParkAccount = async () => {
		try {
			dispatch({ type: 'PARK_ACCOUNT', payload: state.currentUser!.id });
			setShowParkConfirm(false);
			alert(
				'Account parked successfully. You can reactivate anytime from your profile.'
			);
		} catch (error) {
			console.error('Failed to park account:', error);
			alert('Failed to park account');
		}
	};

	const handleReactivateAccount = async () => {
		try {
			dispatch({ type: 'REACTIVATE_ACCOUNT', payload: state.currentUser!.id });
			alert("Account reactivated successfully! You're now live again.");
		} catch (error) {
			console.error('Failed to reactivate account:', error);
			alert('Failed to reactivate account');
		}
	};

	const handleDeleteAccount = () => {
		dispatch({ type: 'DELETE_ACCOUNT', payload: state.currentUser!.id });
		setShowDeleteConfirm(false);
		alert('Account deleted successfully.');
	};

	const handleBoostProfile = () => {
		dispatch({ type: 'SET_VIEW', payload: 'boost' });
	};

	const handleCancelJob = (jobId: string) => {
		setSelectedJobToCancel(jobId);
		setShowCancelJobConfirm(true);
	};

	const confirmCancelJob = async () => {
		if (!selectedJobToCancel) return;

		try {
			await jobService.deleteJobLead(selectedJobToCancel);

			setMyProjects((prev) =>
				prev.map((lead) =>
					lead.id === selectedJobToCancel
						? {
								...lead,
								isActive: false,
								cancelledAt: new Date().toISOString(),
						  }
						: lead
				)
			);

			const updatedJobLeads = state.jobLeads.map((lead) =>
				lead.id === selectedJobToCancel
					? { ...lead, isActive: false, cancelledAt: new Date().toISOString() }
					: lead
			);
			dispatch({ type: 'UPDATE_JOB_LEADS', payload: updatedJobLeads });

			setShowCancelJobConfirm(false);
			setSelectedJobToCancel(null);
			alert(
				'Job cancelled successfully. It will no longer be visible to tradespeople.'
			);
		} catch (error) {
			console.error('Failed to cancel job:', error);
			alert('Failed to cancel job');
		}
	};

	const handleHireTradesperson = async (
		jobId: string,
		tradespersonId: string
	) => {
		const job = myProjects.find((lead) => lead.id === jobId);
		const tradesperson = state.users.find((user) => user.id === tradespersonId);

		if (!job) {
			alert('Job not found');
			return;
		}

		try {
			await jobService.updateJobLead(jobId, {
				hiredTradesperson: tradespersonId,
				isActive: false,
			});

			dispatch({
				type: 'HIRE_TRADESPERSON',
				payload: { jobId, tradespersonId },
			});

			setMyProjects((prev) =>
				prev.map((lead) =>
					lead.id === jobId
						? { ...lead, hiredTradesperson: tradespersonId, isActive: false }
						: lead
				)
			);

			alert(
				`You have hired ${
					tradesperson?.name || 'the tradesperson'
				} for this job! The job is now closed to other applicants.`
			);
		} catch (error) {
			console.error('Failed to hire tradesperson:', error);
			alert('Failed to hire tradesperson');
		}
	};

	const handleAcceptInterest = async (leadId: string, interestId: string) => {
		try {
			await jobService.updateInterestStatus(leadId, interestId, 'accepted');

			dispatch({ type: 'ACCEPT_INTEREST', payload: { leadId, interestId } });

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

			alert(
				'Interest accepted! The tradesperson now has access to your contact details and can message you about the project.'
			);
		} catch (error) {
			console.error('Failed to accept interest:', error);
			alert('Failed to accept interest');
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-6">
					<button
						onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}
						className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
					>
						<ArrowLeft className="w-5 h-5 mr-2" />
						Back to Home
					</button>
					<h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
					<p className="text-gray-600 mt-2">
						Manage your account and view your projects
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Profile Information */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold text-gray-900">
									Profile Information
								</h2>
								{!isEditing ? (
									<button
										onClick={() => setIsEditing(true)}
										className="text-blue-600 hover:text-blue-700"
									>
										<Edit2 className="w-5 h-5" />
									</button>
								) : (
									<div className="flex space-x-2">
										<button
											onClick={handleSave}
											className="text-green-600 hover:text-green-700"
										>
											<Save className="w-5 h-5" />
										</button>
										<button
											onClick={handleCancel}
											className="text-gray-600 hover:text-gray-700"
										>
											<X className="w-5 h-5" />
										</button>
									</div>
								)}
							</div>

							<div className="space-y-4">
								<div className="flex items-center">
									<User className="w-5 h-5 text-gray-400 mr-3" />
									{isEditing ? (
										<input
											type="text"
											value={editData.name}
											onChange={(e) =>
												setEditData({ ...editData, name: e.target.value })
											}
											className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									) : (
										<span className="text-gray-900">
											{state.currentUser.name}
										</span>
									)}
								</div>

								<div className="flex items-center">
									<Mail className="w-5 h-5 text-gray-400 mr-3" />
									{isEditing ? (
										<input
											type="email"
											value={editData.email}
											onChange={(e) =>
												setEditData({ ...editData, email: e.target.value })
											}
											className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									) : (
										<span className="text-gray-900">
											{state.currentUser.email}
										</span>
									)}
								</div>

								<div className="flex items-center">
									<MapPin className="w-5 h-5 text-gray-400 mr-3" />
									{isEditing ? (
										<input
											type="text"
											value={editData.location}
											onChange={(e) =>
												setEditData({ ...editData, location: e.target.value })
											}
											className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="Your location"
										/>
									) : (
										<span className="text-gray-900">
											{state.currentUser.location || 'Not specified'}
										</span>
									)}
								</div>

								<div className="flex items-center">
									<Calendar className="w-5 h-5 text-gray-400 mr-3" />
									<span className="text-gray-900">Member since 2024</span>
								</div>
							</div>
						</div>
					</div>

					{/* My Projects */}
					<div className="lg:col-span-2">
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold text-gray-900">
									My Projects
								</h2>
								<div className="flex space-x-3">
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
												Messages
											</>
										)}
									</button>
									<button
										onClick={() =>
											dispatch({ type: 'SET_VIEW', payload: 'submit-project' })
										}
										className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
									>
										Post New Project
									</button>
								</div>
							</div>

							{loading ? (
								<div className="flex justify-center py-12">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
								</div>
							) : myProjects.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-gray-500 mb-4">
										You haven't posted any projects yet
									</p>
									<button
										onClick={() =>
											dispatch({ type: 'SET_VIEW', payload: 'submit-project' })
										}
										className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
									>
										Post Your First Project
									</button>
								</div>
							) : (
								<div className="space-y-4">
									{myProjects.map((project) => {
										const hiredTradesperson = project.hiredTradesperson
											? state.users.find(
													(u) => u.id === project.hiredTradesperson
											  )
											: null;

										return (
											<div
												key={project.id}
												className="border border-gray-200 rounded-lg p-4 relative"
											>
												{project.isActive !== false && (
													<button
														onClick={() => handleCancelJob(project.id)}
														className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg z-50 transition-colors"
														title="Cancel this job"
													>
														<X className="w-4 h-4" />
													</button>
												)}

												<div className="flex justify-between items-start mb-2">
													<h3 className="text-lg font-semibold text-gray-900">
														{project.title}
													</h3>
													<div className="flex items-center space-x-2">
														{!project.isActive && (
															<span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
																Job Completed
															</span>
														)}
														<span
															className={`px-3 py-1 rounded-full text-sm font-medium ${
																project.urgency === 'High'
																	? 'bg-red-100 text-red-800'
																	: project.urgency === 'Medium'
																	? 'bg-yellow-100 text-yellow-800'
																	: 'bg-green-100 text-green-800'
															}`}
														>
															{project.urgency} Priority
														</span>
													</div>
												</div>
												<p className="text-gray-600 mb-3">
													{project.description}
												</p>
												<div className="flex items-center justify-between text-sm text-gray-500">
													<span>
														{project.category} • {project.location}
													</span>
													<span>Budget: {project.budget}</span>
												</div>
												<div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
													<span className="text-sm text-gray-500">
														{project.interests.length} interest
														{project.interests.length !== 1 ? 's' : ''} •
														{project.purchasedBy.length} purchase
														{project.purchasedBy.length !== 1 ? 's' : ''}
													</span>
													<span className="text-sm text-gray-500">
														Posted {project.postedDate}
													</span>
												</div>

												{project.purchasedBy.length > 0 &&
													project.isActive &&
													!project.hiredTradesperson && (
														<div className="mt-4 pt-4 border-t border-gray-100">
															<h4 className="font-semibold text-gray-800 mb-3">
																Professionals Available to Hire
															</h4>
															<div className="space-y-2">
																{project.purchasedBy.map((tradespersonId) => {
																	const tradesperson = state.users.find(
																		(u) => u.id === tradespersonId
																	);
																	if (!tradesperson) return null;

																	return (
																		<div
																			key={tradespersonId}
																			className="bg-blue-50 rounded-lg p-4"
																		>
																			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
																				<div className="flex items-center space-x-3 min-w-0 flex-1">
																					<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
																						{tradesperson.name.charAt(0)}
																					</div>
																					<div className="min-w-0 flex-1">
																						<p className="font-medium text-gray-900 truncate">
																							{tradesperson.name}
																						</p>
																						<p className="text-sm text-gray-600 truncate">
																							{tradesperson.trades?.join(', ')}
																						</p>
																						<div className="flex items-center text-sm text-gray-500">
																							<Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
																							{tradesperson.rating
																								? Number(
																										tradesperson.rating
																								  ).toFixed(1)
																								: '0.0'}{' '}
																							({tradesperson.reviews || 0}{' '}
																							reviews)
																						</div>
																					</div>
																				</div>
																				<div className="flex space-x-2 flex-shrink-0">
																					<button
																						onClick={() => {
																							setShowMessaging(true);
																							setSelectedConversation({
																								id: `temp_${project.id}_${tradespersonId}`,
																								jobId: project.id,
																								jobTitle: project.title,
																								homeownerId:
																									state.currentUser!.id,
																								tradespersonId: tradespersonId,
																								otherUserId: tradespersonId,
																								messages: [],
																								createdAt:
																									new Date().toISOString(),
																								unreadCount: 0,
																							});
																						}}
																						className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm font-medium"
																					>
																						<MessageCircle className="w-4 h-4 mr-1" />
																						Message
																					</button>
																					<button
																						onClick={() =>
																							handleHireTradesperson(
																								project.id,
																								tradespersonId
																							)
																						}
																						className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm font-medium"
																					>
																						<UserCheck className="w-4 h-4 mr-1" />
																						Hire
																					</button>
																				</div>
																			</div>
																		</div>
																	);
																})}
															</div>
														</div>
													)}

												{hiredTradesperson && (
													<div className="mt-4 pt-4 border-t border-gray-100">
														<div className="bg-green-50 border border-green-200 rounded-lg p-4">
															<h4 className="font-semibold text-green-800 mb-2">
																✓ Professional Hired
															</h4>
															<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
																<div className="min-w-0 flex-1">
																	<p className="font-medium text-green-900">
																		{hiredTradesperson.name}
																	</p>
																	<p className="text-sm text-green-700">
																		{hiredTradesperson.trades?.join(', ')}
																	</p>
																</div>
																<div className="flex space-x-2">
																	<button
																		onClick={() => {
																			setShowMessaging(true);
																			setSelectedConversation({
																				id: `temp_${project.id}_${hiredTradesperson.id}`,
																				jobId: project.id,
																				jobTitle: project.title,
																				homeownerId: state.currentUser!.id,
																				tradespersonId: hiredTradesperson.id,
																				otherUserId: hiredTradesperson.id,
																				messages: [],
																				createdAt: new Date().toISOString(),
																				unreadCount: 0,
																			});
																		}}
																		className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm font-medium"
																	>
																		<MessageCircle className="w-4 h-4 mr-1" />
																		Message
																	</button>
																	<button
																		onClick={() =>
																			handleLeaveReview(
																				project.id,
																				hiredTradesperson.id
																			)
																		}
																		className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center text-sm font-medium"
																	>
																		<Star className="w-4 h-4 mr-1" />
																		Review
																	</button>
																</div>
															</div>
														</div>
													</div>
												)}

												{project.interests.length > 0 && (
													<div className="mt-3 pt-3 border-t border-gray-100">
														<p className="text-sm font-medium text-gray-700 mb-2">
															Recent Interests:
														</p>
														{project.interests.slice(0, 2).map((interest) => (
															<div
																key={interest.id}
																className="bg-purple-50 rounded-lg p-4 mb-2"
															>
																<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
																	<div className="min-w-0 flex-1">
																		<p className="font-medium text-purple-900">
																			{interest.tradespersonName}
																		</p>
																		<p className="text-sm text-purple-700 break-words">
																			{interest.message.substring(0, 100)}...
																		</p>
																		<p className="text-xs text-purple-600">
																			{interest.date}
																		</p>
																	</div>
																	<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
																		{interest.status === 'pending' &&
																			project.isActive && (
																				<button
																					onClick={() =>
																						handleAcceptInterest(
																							project.id,
																							interest.id
																						)
																					}
																					className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 font-medium"
																				>
																					Accept
																				</button>
																			)}
																		{interest.status === 'accepted' &&
																			project.isActive &&
																			!project.hiredTradesperson && (
																				<button
																					onClick={() =>
																						handleHireTradesperson(
																							project.id,
																							interest.tradespersonId
																						)
																					}
																					className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center font-medium"
																				>
																					<UserCheck className="w-4 h-4 mr-1" />
																					Hire
																				</button>
																			)}
																		{interest.status === 'accepted' && (
																			<span className="text-green-600 text-sm font-medium bg-green-100 px-3 py-2 rounded-lg">
																				✓ Accepted
																			</span>
																		)}
																	</div>
																</div>
															</div>
														))}
													</div>
												)}

												<button
													onClick={() => setSelectedProjectForDetails(project)}
													className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center"
												>
													<Users className="w-4 h-4 mr-2" />
													View All Responses (
													{project.purchasedBy.length +
														project.interests.length}
													)
												</button>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Account Management Section */}
				<div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-6">
						Account Management
					</h2>

					{state.currentUser.accountStatus === 'parked' && (
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
							<div className="flex items-center">
								<Pause className="w-5 h-5 text-yellow-600 mr-2" />
								<span className="text-yellow-800 font-medium">
									Your account is currently parked
								</span>
							</div>
							<p className="text-yellow-700 text-sm mt-1">
								Parked on{' '}
								{new Date(state.currentUser.parkedDate!).toLocaleDateString()}.
								Reactivate to start receiving quotes again.
							</p>
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{state.currentUser.accountStatus !== 'parked' ? (
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
							onClick={handleBoostProfile}
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

					<div className="mt-4 text-sm text-gray-500">
						<p>
							<strong>Park Account:</strong> Temporarily hide your profile while
							keeping all data safe
						</p>
						<p>
							<strong>Boost Profile:</strong> Increase visibility to get more
							quotes from tradespeople
						</p>
						<p>
							<strong>Delete Account:</strong> Permanently remove your account
							and all associated data
						</p>
					</div>
				</div>

				{/* Modals */}
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
								tradespeople. You can reactivate anytime and go live instantly.
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
								projects, messages, and account data will be permanently
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

				{showCancelJobConfirm && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
							<div className="flex items-center mb-4">
								<X className="w-6 h-6 text-red-600 mr-2" />
								<h3 className="text-lg font-semibold text-gray-900">
									Cancel Job
								</h3>
							</div>
							<p className="text-gray-600 mb-6">
								Are you sure you want to cancel this job? This will:
							</p>
							<ul className="text-sm text-gray-600 mb-6 list-disc list-inside space-y-1">
								<li>Hide the job from all tradespeople</li>
								<li>Stop new applications and purchases</li>
								<li>Mark the job as cancelled</li>
								<li>This action cannot be undone</li>
							</ul>
							<div className="flex justify-end space-x-3">
								<button
									onClick={() => setShowCancelJobConfirm(false)}
									className="px-4 py-2 text-gray-600 hover:text-gray-800"
								>
									Keep Job Active
								</button>
								<button
									onClick={confirmCancelJob}
									className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
								>
									Yes, Cancel Job
								</button>
							</div>
						</div>
					</div>
				)}

				{showReviewModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Leave a Review
							</h3>

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
										placeholder="Share your experience working with this professional..."
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

				{showConversationsList && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-lg font-semibold text-gray-900">
									Your Conversations
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
					otherUserId={selectedConversation?.otherUserId}
				/>
			</div>
		</div>
	);
};

export default HomeownerProfile;
