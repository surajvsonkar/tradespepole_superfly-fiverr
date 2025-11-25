import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { conversationService } from '../services';
import { ConversationWithUser } from '../services/conversationService';

interface ContactsListProps {
	onSelectContact: (conversation: ConversationWithUser) => void;
}

const ContactsList: React.FC<ContactsListProps> = ({ onSelectContact }) => {
	const { state } = useApp();
	const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
	const [filteredConversations, setFilteredConversations] = useState<ConversationWithUser[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch conversations on component mount
	useEffect(() => {
		const fetchConversations = async () => {
			try {
				setIsLoading(true);
				setError(null);
				console.log('📱 Fetching conversations for contacts list...');
				const data = await conversationService.getAllConversations();
				console.log('✅ Conversations loaded:', data);
				setConversations(data);
				setFilteredConversations(data);
			} catch (err) {
				console.error('❌ Failed to fetch conversations:', err);
				setError('Failed to load conversations');
			} finally {
				setIsLoading(false);
			}
		};

		fetchConversations();
	}, []);

	// Handle search
	const handleSearch = (query: string) => {
		setSearchQuery(query);

		if (!query.trim()) {
			setFilteredConversations(conversations);
			return;
		}

		const filtered = conversations.filter(conv => {
			const otherUserName = conv.otherUser?.name.toLowerCase() || '';
			const jobTitle = conv.jobTitle.toLowerCase() || '';
			const queryLower = query.toLowerCase();

			return otherUserName.includes(queryLower) || jobTitle.includes(queryLower);
		});

		setFilteredConversations(filtered);
	};

	// Format last message preview
	const getLastMessagePreview = (conv: ConversationWithUser): string => {
		if (!conv.lastMessage) return 'No messages yet';
		
		const maxLength = 50;
		let preview = conv.lastMessage.content;
		
		if (preview.length > maxLength) {
			preview = preview.substring(0, maxLength) + '...';
		}

		return preview;
	};

	// Format time
	const formatTime = (timestamp: string | undefined): string => {
		if (!timestamp) return '';

		const date = new Date(timestamp);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
		const diffInDays = diffInHours / 24;

		if (diffInHours < 1) {
			return 'Just now';
		} else if (diffInHours < 24) {
			return `${Math.floor(diffInHours)}h ago`;
		} else if (diffInDays < 7) {
			return `${Math.floor(diffInDays)}d ago`;
		} else {
			return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-full">
				<Loader className="w-8 h-8 text-blue-600 animate-spin mb-2" />
				<p className="text-gray-600">Loading conversations...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-full">
				<MessageCircle className="w-12 h-12 text-red-300 mb-4" />
				<p className="text-red-600 font-semibold">{error}</p>
				<p className="text-gray-500 text-sm mt-2">Please try again later</p>
			</div>
		);
	}

	if (conversations.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full">
				<MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
				<p className="text-gray-600 font-semibold">No conversations yet</p>
				<p className="text-gray-500 text-sm mt-2">Start messaging with other users</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			{/* Search Bar */}
			<div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
				<div className="relative">
					<Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
					<input
						type="text"
						placeholder="Search conversations..."
						value={searchQuery}
						onChange={(e) => handleSearch(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
			</div>

			{/* Contacts Grid */}
			<div className="flex-1 overflow-y-auto p-4">
				{filteredConversations.length === 0 ? (
					<div className="text-center py-12">
						<Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
						<p className="text-gray-500">No conversations found</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{filteredConversations.map((conversation) => {
							const otherUser = conversation.otherUser;
							const lastMessageTime = conversation.lastMessage?.timestamp;

							return (
								<div
									key={conversation.id}
									onClick={() => onSelectContact(conversation)}
									className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all duration-200 group"
								>
									{/* Header with avatar and unread badge */}
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center space-x-3 flex-1 min-w-0">
											{/* Avatar */}
											<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
												{otherUser?.name?.[0]?.toUpperCase() || 'U'}
											</div>

											{/* Contact Info */}
											<div className="flex-1 min-w-0">
												<h3 className="text-sm font-semibold text-gray-900 truncate">
													{otherUser?.name || 'Unknown User'}
												</h3>
												<p className="text-xs text-gray-500 truncate">
													{otherUser?.type === 'tradesperson'
														? otherUser?.trades?.join(', ') || 'Tradesperson'
														: 'Homeowner'}
												</p>
											</div>
										</div>

										{/* Unread Badge */}
										{conversation.unreadCount > 0 && (
											<div className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
												{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
											</div>
										)}
									</div>

									{/* Job Title */}
									<div className="mb-2">
										<p className="text-xs text-gray-600 truncate">
											Job: <span className="font-medium">{conversation.jobTitle}</span>
										</p>
									</div>

									{/* Last Message Preview */}
									<div className="mb-2">
										<p className="text-xs text-gray-600 line-clamp-2">
											{getLastMessagePreview(conversation)}
										</p>
									</div>

									{/* Footer with time */}
									<div className="flex items-center justify-between pt-2 border-t border-gray-100">
										<span className="text-xs text-gray-500">
											{formatTime(lastMessageTime)}
										</span>
										<MessageCircle className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default ContactsList;
