// src/components/ChatModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';
import { useApp } from '../context/AppContext';
import { Conversation } from '../types';

interface ChatModalProps {
	isOpen: boolean;
	onClose: () => void;
	conversation?: Conversation;
	otherUserId?: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
	isOpen,
	onClose,
	conversation,
	otherUserId: propOtherUserId,
}) => {
	const { state } = useApp();

	// Extract required data from conversation or props
	const currentUserId = state.currentUser?.id || '';
	const conversationId = conversation?.id || '';

	// Determine the other user ID based on current user type
	let otherUserId = propOtherUserId || '';
	if (!otherUserId && conversation) {
		// If current user is homeowner, other user is tradesperson and vice versa
		if (state.currentUser?.type === 'homeowner') {
			otherUserId = conversation.tradespersonId;
		} else if (state.currentUser?.type === 'tradesperson') {
			otherUserId = conversation.homeownerId;
		}
	}

	// Don't render if we don't have the required data
	if (!currentUserId || !conversationId || !otherUserId) {
		// console.warn('⚠️ Missing required data for ChatModal:', {
		// 	currentUserId,
		// 	conversationId,
		// 	otherUserId,
		// 	hasConversation: !!conversation,
		// });

		if (isOpen) {
			return (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
						<div className="text-center">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Unable to Open Chat
							</h2>
							<p className="text-gray-600 mb-6">
								Missing required information to start the conversation. Please
								try again.
							</p>
							<button
								onClick={onClose}
								className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			);
		}
		return null;
	}
	const {
		isConnected,
		connect,
		disconnect,
		sendMessage,
		messages,
		sendTyping,
		stopTyping,
		isTyping,
		error,
		otherUser,
	} = useChatContext();

	const [inputValue, setInputValue] = useState('');
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const typingTimeoutRef = useRef<NodeJS.Timeout>();

	// ========================================================================
	// EFFECTS
	// ========================================================================

	// Connect when modal opens
	useEffect(() => {
		if (isOpen) {
			connect(currentUserId, conversationId);
		}
		return () => {
			if (isOpen) {
				disconnect();
			}
		};
	}, [isOpen, currentUserId, conversationId, connect, disconnect]);

	// Auto-scroll to bottom
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	// ========================================================================
	// HANDLERS
	// ========================================================================

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);

		// Send typing indicator
		sendTyping();

		// Clear previous timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		// Stop typing after 2 seconds of inactivity
		typingTimeoutRef.current = setTimeout(() => {
			stopTyping();
		}, 2000);
	};

	const handleSend = (e: React.FormEvent) => {
		e.preventDefault();

		if (!inputValue.trim()) return;

		sendMessage(otherUserId, inputValue.trim());
		setInputValue('');
		stopTyping();

		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}
	};

	if (!isOpen) return null;

	// ========================================================================
	// RENDER
	// ========================================================================

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<div>
						<h2 className="font-semibold">{otherUser?.name || 'Chat'}</h2>
						<p className="text-sm text-gray-500">
							{isConnected ? (
								otherUser?.isOnline ? (
									<span className="text-green-600">● Online</span>
								) : (
									<span className="text-gray-500">● Offline</span>
								)
							) : (
								<span className="text-red-600">● Disconnected</span>
							)}
						</p>
					</div>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						✕
					</button>
				</div>

				{/* Error */}
				{error && (
					<div className="bg-red-50 border-l-4 border-red-500 p-3 m-4">
						<p className="text-sm text-red-700">{error}</p>
					</div>
				)}

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-4 space-y-3">
					{messages.map((msg) => {
						const isMine = msg.senderId === currentUserId;
						return (
							<div
								key={msg.id}
								className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
							>
								<div
									className={`max-w-[70%] rounded-lg px-4 py-2 ${
										isMine
											? 'bg-blue-500 text-white'
											: 'bg-gray-100 text-gray-900'
									}`}
								>
									<p className="text-sm">{msg.content}</p>
									<p className="text-xs mt-1 opacity-70">
										{new Date(msg.timestamp).toLocaleString()}
									</p>
								</div>
							</div>
						);
					})}
					<div ref={messagesEndRef} />
				</div>

				{/* Typing Indicator */}
				{isTyping && (
					<div className="px-4 py-2 text-sm text-gray-500 italic">
						Typing...
					</div>
				)}

				{/* Input */}
				<form onSubmit={handleSend} className="p-4 border-t">
					<div className="flex gap-2">
						<input
							type="text"
							value={inputValue}
							onChange={handleInputChange}
							placeholder="Type your message..."
							className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							disabled={!isConnected}
						/>
						<button
							type="submit"
							disabled={!isConnected || !inputValue.trim()}
							className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Send
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
