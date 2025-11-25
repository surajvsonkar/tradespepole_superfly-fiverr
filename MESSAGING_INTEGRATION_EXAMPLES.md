# Integration Examples - Adding Messages Button to Components

This guide shows you exactly where to add the "Messages" button in your existing components.

## 1. Header Component (Global Messages Button)

**File:** `frontend/src/components/Header.tsx`

```typescript
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import MessagingModal from './MessagingModal';

export function Header() {
	const [isMessagingOpen, setIsMessagingOpen] = useState(false);

	return (
		<>
			<header className="bg-white shadow">
				{/* ... existing header content ... */}

				{/* Add this button near other navigation */}
				<button
					onClick={() => setIsMessagingOpen(true)}
					className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition"
					title="View all conversations"
				>
					<MessageCircle className="w-5 h-5 text-blue-600" />
					<span>Messages</span>
				</button>

				{/* Add modal at the end of component */}
				<MessagingModal
					isOpen={isMessagingOpen}
					onClose={() => setIsMessagingOpen(false)}
				/>
			</header>
		</>
	);
}
```

## 2. Tradesperson Profile Component

**File:** `frontend/src/components/TradespersonProfile.tsx`

```typescript
import { useState } from 'react';
import { MessageCircle, MessageSquare } from 'lucide-react';
import MessagingModal from './MessagingModal';

export function TradespersonProfile({ tradesperson, homeownerId, jobId }) {
	const [isMessagingOpen, setIsMessagingOpen] = useState(false);
	const [isDirectChat, setIsDirectChat] = useState(false);

	const handleMessageClick = () => {
		setIsDirectChat(true); // Open chat directly with this person
		setIsMessagingOpen(true);
	};

	return (
		<div className="profile-container">
			{/* ... existing profile content ... */}

			<div className="action-buttons flex gap-3">
				{/* Existing button */}
				<button className="hire-btn">Hire Tradesperson</button>

				{/* Add Message button */}
				<button
					onClick={handleMessageClick}
					className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
				>
					<MessageSquare className="w-4 h-4" />
					Message
				</button>
			</div>

			{/* Modal for direct chat with this tradesperson */}
			{isDirectChat && (
				<MessagingModal
					isOpen={isMessagingOpen}
					onClose={() => {
						setIsMessagingOpen(false);
						setIsDirectChat(false);
					}}
					jobId={jobId}
					otherUserId={tradesperson.id}
					otherUser={tradesperson}
				/>
			)}
		</div>
	);
}
```

## 3. Homeowner Profile Component

**File:** `frontend/src/components/HomeownerProfile.tsx`

```typescript
import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import MessagingModal from './MessagingModal';

export function HomeownerProfile({ homeowner, tradespersonId, jobId }) {
	const [isMessagingOpen, setIsMessagingOpen] = useState(false);

	return (
		<div className="profile-container">
			{/* ... existing profile content ... */}

			{/* Messages Button */}
			<button
				onClick={() => setIsMessagingOpen(true)}
				className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
			>
				<Send className="w-4 h-4" />
				Message Homeowner
			</button>

			{/* Chat Modal */}
			<MessagingModal
				isOpen={isMessagingOpen}
				onClose={() => setIsMessagingOpen(false)}
				jobId={jobId}
				otherUserId={homeowner.id}
				otherUser={homeowner}
			/>
		</div>
	);
}
```

## 4. JobLeads/BrowseExperts Component

**File:** `frontend/src/components/BrowseExperts.tsx`

```typescript
import { useState } from 'react';
import { MessageCircle, MessageSquare, CheckCircle } from 'lucide-react';
import MessagingModal from './MessagingModal';

export function BrowseExperts() {
	const [selectedExpert, setSelectedExpert] = useState(null);
	const [isMessagingOpen, setIsMessagingOpen] = useState(false);

	const handleMessageClick = (expert, jobId) => {
		setSelectedExpert({ expert, jobId });
		setIsMessagingOpen(true);
	};

	return (
		<div className="experts-grid">
			{/* ... expert cards ... */}
			{experts.map((expert) => (
				<div key={expert.id} className="expert-card">
					{/* ... existing card content ... */}

					<div className="card-actions flex gap-2">
						{/* Express Interest Button */}
						<button className="express-btn">Express Interest</button>

						{/* Message Button */}
						<button
							onClick={() => handleMessageClick(expert, currentJobId)}
							className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
							title="Send message"
						>
							<MessageCircle className="w-4 h-4" />
							Message
						</button>
					</div>
				</div>
			))}

			{/* Messaging Modal for direct chat */}
			{selectedExpert && (
				<MessagingModal
					isOpen={isMessagingOpen}
					onClose={() => {
						setIsMessagingOpen(false);
						setSelectedExpert(null);
					}}
					jobId={selectedExpert.jobId}
					otherUserId={selectedExpert.expert.id}
					otherUser={selectedExpert.expert}
				/>
			)}
		</div>
	);
}
```

## 5. ConversationsList Component (Already Implemented)

**File:** `frontend/src/components/ConversationsList.tsx`

The new `ContactsList` component is already integrated into `MessagingModal`. When you open `MessagingModal` without props, it automatically shows the contacts grid.

```typescript
import { useState } from 'react';
import MessagingModal from './MessagingModal';

export function ConversationsList() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button onClick={() => setIsOpen(true)}>View All Messages</button>

			{/* Shows contacts grid automatically */}
			<MessagingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	);
}
```

## 6. My Projects Component (For Homeowners)

**File:** `frontend/src/components/MyProjects.tsx`

```typescript
import { useState } from 'react';
import { MessageCircle, MessageSquare, User } from 'lucide-react';
import MessagingModal from './MessagingModal';

export function MyProjects() {
	const [selectedConversation, setSelectedConversation] = useState(null);
	const [isMessagingOpen, setIsMessagingOpen] = useState(false);

	const handleViewMessages = (tradesperson, jobId) => {
		setSelectedConversation({ tradesperson, jobId });
		setIsMessagingOpen(true);
	};

	return (
		<div className="projects-list">
			{/* ... existing projects ... */}
			{projects.map((project) => (
				<div key={project.id} className="project-card">
					{/* ... project details ... */}

					{/* If project is hired with tradesperson */}
					{project.hiredTradesperson && (
						<div className="tradesperson-info">
							<h4>{project.hiredTradesperson.name}</h4>

							{/* Message Tradesperson Button */}
							<button
								onClick={() =>
									handleViewMessages(project.hiredTradesperson, project.id)
								}
								className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
							>
								<MessageSquare className="w-4 h-4" />
								Chat with {project.hiredTradesperson.name}
							</button>
						</div>
					)}
				</div>
			))}

			{/* Messaging Modal */}
			{selectedConversation && (
				<MessagingModal
					isOpen={isMessagingOpen}
					onClose={() => {
						setIsMessagingOpen(false);
						setSelectedConversation(null);
					}}
					jobId={selectedConversation.jobId}
					otherUserId={selectedConversation.tradesperson.id}
					otherUser={selectedConversation.tradesperson}
				/>
			)}
		</div>
	);
}
```

## 7. JobLeads Component (For Tradespersons)

**File:** `frontend/src/components/JobLeads.tsx`

```typescript
import { useState } from 'react';
import { MessageCircle, MessageSquare, TrendingUp } from 'lucide-react';
import MessagingModal from './MessagingModal';

export function JobLeads() {
	const [selectedJob, setSelectedJob] = useState(null);
	const [isMessagingOpen, setIsMessagingOpen] = useState(false);

	const { state } = useApp();

	const handleMessageHomeowner = (jobId, homeownerId) => {
		setSelectedJob({ jobId, homeownerId });
		setIsMessagingOpen(true);
	};

	return (
		<div className="job-leads-container">
			{/* ... existing job cards ... */}
			{jobLeads.map((lead) => (
				<div key={lead.id} className="job-lead-card">
					{/* ... job details ... */}

					<div className="action-buttons">
						{/* Express Interest Button */}
						<button className="express-btn">Express Interest</button>

						{/* Message Homeowner Button */}
						<button
							onClick={() => handleMessageHomeowner(lead.id, lead.postedBy)}
							className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
						>
							<MessageSquare className="w-4 h-4" />
							Contact Homeowner
						</button>
					</div>
				</div>
			))}

			{/* Messaging Modal for direct chat with homeowner */}
			{selectedJob && (
				<MessagingModal
					isOpen={isMessagingOpen}
					onClose={() => {
						setIsMessagingOpen(false);
						setSelectedJob(null);
					}}
					jobId={selectedJob.jobId}
					otherUserId={selectedJob.homeownerId}
				/>
			)}
		</div>
	);
}
```

## Basic Template for Any Component

Use this template to add messaging to any component:

```typescript
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import MessagingModal from './MessagingModal';

export function YourComponent({ jobId, userId, user }) {
	const [isMessagingOpen, setIsMessagingOpen] = useState(false);

	return (
		<div>
			{/* Your existing content */}

			{/* Messages Button */}
			<button
				onClick={() => setIsMessagingOpen(true)}
				className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
			>
				<MessageCircle className="w-4 h-4" />
				Message
			</button>

			{/* Messaging Modal */}
			<MessagingModal
				isOpen={isMessagingOpen}
				onClose={() => setIsMessagingOpen(false)}
				jobId={jobId}
				otherUserId={userId}
				otherUser={user}
			/>
		</div>
	);
}
```

## Props Reference

### MessagingModal Props

```typescript
interface MessagingModalProps {
	// Required
	isOpen: boolean;
	onClose: () => void;

	// Optional - for direct chat with specific person
	jobId?: string;
	otherUserId?: string;
	otherUser?: User;

	// Optional - for pre-selected conversation
	conversation?: Conversation;
}
```

### Usage Patterns

**1. Show all conversations (contacts grid)**

```typescript
<MessagingModal isOpen={true} onClose={handleClose} />
```

**2. Open direct chat with specific job**

```typescript
<MessagingModal
	isOpen={true}
	onClose={handleClose}
	jobId={jobId}
	otherUserId={userId}
/>
```

**3. Open with user data**

```typescript
<MessagingModal
	isOpen={true}
	onClose={handleClose}
	jobId={jobId}
	otherUserId={userId}
	otherUser={user}
/>
```

## Styling

All components use Tailwind CSS. Adjust colors/styling as needed:

- **Blue**: `bg-blue-600 hover:bg-blue-700` - Primary action
- **Green**: `bg-green-600 hover:bg-green-700` - Secondary action
- **Gray**: `bg-gray-100 hover:bg-gray-200` - Subtle action

Example with custom styling:

```typescript
<button
  onClick={() => setIsMessagingOpen(true)}
  className="custom-message-btn"
>
  Message
</button>

<style>{`
  .custom-message-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .custom-message-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`}</style>
```

## Next Steps

1. Choose which components need the Messages button
2. Copy the integration example
3. Adjust props based on your component's context
4. Test the modal opens and shows conversations
5. Verify messages work end-to-end
