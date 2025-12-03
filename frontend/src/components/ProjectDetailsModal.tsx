// ProjectDetailsModal.tsx - Modal for viewing all responses to a project

import React from 'react';
import { X, Star, MessageCircle, UserCheck, Users } from 'lucide-react';
import { JobLead, User as AppUser } from '../types';

interface ProjectDetailsModalProps {
	project: JobLead | null;
	users: AppUser[];
	currentUserId: string;
	onClose: () => void;
	onMessage: (tradespersonId: string) => void;
	onHire: (tradespersonId: string) => void;
	onAcceptInterest: (interestId: string) => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
	project,
	users,
	currentUserId,
	onClose,
	onMessage,
	onHire,
	onAcceptInterest,
}) => {
	if (!project) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-semibold text-gray-900">
						All Responses for: {project.title}
					</h3>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				{/* Project Info */}
				<div className="bg-gray-50 rounded-lg p-4 mb-6">
					<p className="text-sm text-gray-600 mb-2">{project.description}</p>
					<div className="flex items-center justify-between text-sm text-gray-500">
						<span>
							{project.category} • {project.location}
						</span>
						<span>Budget: {project.budget}</span>
					</div>
				</div>

				{/* Purchased By Section */}
				{project.purchasedBy.length > 0 && (
					<div className="mb-6">
						<h4 className="font-semibold text-gray-800 mb-3">
							Professionals Who Purchased ({project.purchasedBy.length})
						</h4>
						<div className="space-y-3">
							{project.purchasedBy.map((tradespersonId) => {
								const tradesperson = users.find((u) => u.id === tradespersonId);
								if (!tradesperson) return null;

								return (
									<div key={tradespersonId} className="bg-blue-50 rounded-lg p-4">
										<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
											<div className="flex items-center space-x-3 min-w-0 flex-1">
												<div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
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
															? Number(tradesperson.rating).toFixed(1)
															: '0.0'}{' '}
														({tradesperson.reviews || 0} reviews)
													</div>
												</div>
											</div>
											<div className="flex space-x-2 flex-shrink-0">
												<button
													onClick={() => onMessage(tradespersonId)}
													className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm font-medium"
												>
													<MessageCircle className="w-4 h-4 mr-1" />
													Message
												</button>
												{!project.hiredTradesperson && (
													<button
														onClick={() => onHire(tradespersonId)}
														className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm font-medium"
													>
														<UserCheck className="w-4 h-4 mr-1" />
														Hire
													</button>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Interests Section */}
				{project.interests.length > 0 && (
					<div>
						<h4 className="font-semibold text-gray-800 mb-3">
							Expressions of Interest ({project.interests.length})
						</h4>
						<div className="space-y-3">
							{project.interests.map((interest) => (
								<div key={interest.id} className="bg-purple-50 rounded-lg p-4">
									<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
										<div className="min-w-0 flex-1">
											<p className="font-medium text-purple-900">
												{interest.tradespersonName}
											</p>
											<p className="text-sm text-purple-700 break-words mt-1">
												{interest.message}
											</p>
											<p className="text-xs text-purple-600 mt-1">{interest.date}</p>
										</div>
										<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
											{interest.status === 'pending' && project.isActive && (
												<button
													onClick={() => onAcceptInterest(interest.id)}
													className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 font-medium"
												>
													Accept
												</button>
											)}
											{interest.status === 'accepted' && (
												<span className="text-green-600 text-sm font-medium bg-green-100 px-3 py-2 rounded-lg">
													✓ Accepted
												</span>
											)}
											{interest.status === 'accepted' &&
												project.isActive &&
												!project.hiredTradesperson && (
													<button
														onClick={() => onHire(interest.tradespersonId)}
														className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center font-medium"
													>
														<UserCheck className="w-4 h-4 mr-1" />
														Hire
													</button>
												)}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{project.purchasedBy.length === 0 && project.interests.length === 0 && (
					<div className="text-center py-8">
						<Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
						<p className="text-gray-500">No responses yet</p>
						<p className="text-sm text-gray-400 mt-1">
							Tradespeople will appear here when they purchase or show interest in
							your project
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
