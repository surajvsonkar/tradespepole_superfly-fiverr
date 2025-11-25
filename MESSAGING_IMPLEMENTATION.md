# Messaging System Implementation Guide

## Overview

This guide explains the new messaging system that allows users to:

1. View all their conversations in a grid/list format
2. Click on a contact to open their chat history
3. Send and receive messages in real-time using WebSocket

## Architecture

### Frontend Components

#### 1. **ContactsList Component** (`src/components/ContactsList.tsx`)

Displays all conversations for the current user in a responsive grid format.

**Features:**

- Grid layout showing contact cards with:
  - User avatar (auto-generated from first letter)
  - User name and type (Tradesperson/Homeowner)
  - Job title
  - Last message preview
  - Time since last message
  - Unread message count (badge)
- Search/filter functionality
- Loading and empty states
- Real-time updates via props

**Props:**

- `onSelectContact: (conversation: ConversationWithUser) => void` - Callback when user clicks a contact

#### 2. **MessagingModal Component** (`src/components/MessagingModal.tsx`)

Updated to support two views:

- **Contacts View**: Shows all conversations in a grid
- **Chat View**: Shows individual conversation with message history

**Features:**

- Dual-view system (contacts list → chat)
- Back button to return to contacts list
- Real-time messaging via WebSocket
- Typing indicators
- Message read receipts
- Proper connection status handling

**Props:**

- `isOpen: boolean` - Control modal visibility
- `onClose: () => void` - Close handler
- `conversation?: Conversation` - Optional pre-selected conversation (for direct chat)
- `jobId?: string` - Optional job ID (for specific job chat)
- `otherUserId?: string` - Optional other user ID
- `otherUser?: User` - Optional other user data

### Frontend Services

#### ConversationService (`src/services/conversationService.ts`)

**Methods:**

```typescript
// Fetch all conversations for current user
getAllConversations(): Promise<ConversationWithUser[]>

// Fetch specific conversation with all messages
getConversation(conversationId: string): Promise<Conversation>

// Fetch conversation for specific job and user
getConversationByJobAndUser(jobId: string, otherUserId: string): Promise<Conversation>

// Mark conversation as read
markConversationAsRead(conversationId: string): Promise<void>

// Search conversations by user name or job title
searchConversations(query: string): Promise<ConversationWithUser[]>
```

**Console Logging:**
All methods include detailed console logs with emoji prefixes:

- 📨 - Fetching operations
- ✅ - Success
- ❌ - Errors
- 🔍 - Search operations
- 📱 - Component actions

### Backend API Endpoints

#### Conversation Routes (`/api/conversations`)

All endpoints require authentication via JWT token.

**1. GET `/api/conversations`**
Fetch all conversations for current user.

```typescript
Response: {
  conversations: [
    {
      id: string;
      jobId: string;
      jobTitle: string;
      homeownerId: string;
      tradespersonId: string;
      createdAt: string;
      updatedAt: string;
      messages: [];
      otherUser: {
        id: string;
        name: string;
        avatar?: string;
        type: 'homeowner' | 'tradesperson';
        trades?: string[];
      };
      lastMessage?: Message;
      unreadCount: number;
    }
  ];
}
```

**2. GET `/api/conversations/:conversationId`**
Fetch specific conversation with all messages.

```typescript
Response: {
  conversation: {
    // ... same as above with full messages array
    messages: Message[];
  };
}
```

**3. GET `/api/conversations/job/:jobId/user/:otherUserId`**
Fetch conversation for specific job and user.

**4. GET `/api/conversations/search?q=query`**
Search conversations by user name or job title.

**5. PUT `/api/conversations/:conversationId/mark-read`**
Mark all messages in conversation as read.

```typescript
Response: {
	success: boolean;
	updatedCount: number;
}
```

### Backend Controllers

#### ConversationController (`src/controllers/conversationController.ts`)

Handles all conversation-related API requests with:

- Database queries using Prisma
- User authorization checks
- Response transformation
- Comprehensive error handling
- Console logging for debugging

### Database Models

The system uses existing Prisma models:

```prisma
model Conversation {
  id              String    @id @default(uuid())
  jobId           String    @map("job_id")
  jobTitle        String    @map("job_title")
  homeownerId     String    @map("homeowner_id")
  tradespersonId  String    @map("tradesperson_id")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  job             JobLead   @relation(...)
  homeowner       User      @relation(...)
  tradesperson    User      @relation(...)
  messages        Message[]

  @@unique([jobId, homeownerId, tradespersonId])
  @@index([homeownerId])
  @@index([tradespersonId])
}

model Message {
  id             String    @id @default(uuid())
  conversationId String    @map("conversation_id")
  senderId       String    @map("sender_id")
  senderName     String    @map("sender_name")
  content        String
  read           Boolean   @default(false)
  timestamp      DateTime  @default(now())

  conversation   Conversation @relation(...)
  sender         User         @relation(...)

  @@index([conversationId])
  @@index([senderId])
  @@index([timestamp])
}
```

## Data Flow

### 1. Opening Messages Modal

When user clicks "Messages" or "View Messages" button:

```
User clicks button
  ↓
MessagingModal opens with view='contacts'
  ↓
ContactsList component mounted
  ↓
conversationService.getAllConversations() called
  ↓
GET /api/conversations endpoint hit
  ↓
Conversations fetched from database
  ↓
ContactsList renders grid with conversation cards
```

### 2. Selecting a Contact

When user clicks on a contact card:

```
User clicks contact card
  ↓
handleSelectContact() called
  ↓
view changes from 'contacts' to 'chat'
  ↓
currentConversation and messages are populated
  ↓
MessagingModal renders chat view
  ↓
WebSocket 'join_conversation' event sent
  ↓
Previous messages loaded and displayed
```

### 3. Sending a Message

Real-time messaging via WebSocket:

```
User types and sends message
  ↓
WebSocket 'send_message' event sent
  ↓
Backend creates Message record in database
  ↓
Message broadcast to both users
  ↓
Message appended to local messages array
  ↓
UI updates in real-time
```

## How to Use

### For Homeowners/Tradespersons

1. **Click Messages Button**

   - Opens modal with all conversations in grid format
   - Each card shows contact name, job title, last message, and time

2. **Search Contacts**

   - Use search bar to find specific conversations
   - Filters by contact name or job title in real-time

3. **Open Chat**

   - Click any contact card to open chat
   - Full message history loaded
   - Can send new messages

4. **Return to Contacts**

   - Click back arrow to return to contacts list
   - Modal stays open but switches views

5. **Close Modal**
   - Click X button to close messaging

### Implementation in Components

**Example: Adding Messages button to a component**

```typescript
import { useState } from 'react';
import MessagingModal from './MessagingModal';

export function MyComponent() {
	const [isMessagingOpen, setIsMessagingOpen] = useState(false);

	return (
		<>
			<button onClick={() => setIsMessagingOpen(true)}>View Messages</button>

			<MessagingModal
				isOpen={isMessagingOpen}
				onClose={() => setIsMessagingOpen(false)}
			/>
		</>
	);
}
```

**Example: Opening chat for specific job**

```typescript
// For a specific conversation
<MessagingModal
	isOpen={isMessagingOpen}
	onClose={() => setIsMessagingOpen(false)}
	jobId={jobId}
	otherUserId={otherUserId}
/>
```

## Debugging

### Enable Console Logs

All services include console logging. Open browser DevTools:

1. **Network Tab**: Monitor `/api/conversations/*` requests
2. **Console Tab**: View service logs with emoji prefixes:
   - 📨 Fetch operations
   - ✅ Success messages
   - ❌ Error messages
   - 🔍 Search operations
   - 📱 Component interactions

### Common Issues

**1. No Conversations Showing**

- Check if user is authenticated (JWT token)
- Verify database has conversation records
- Check browser console for API errors
- Ensure conversations exist for current user

**2. Messages Not Updating**

- Verify WebSocket connection (check SocketContext)
- Ensure user is in correct conversation room
- Check backend WebSocket logs

**3. Search Not Working**

- Verify search query format
- Check if conversations match search criteria
- Monitor API response in Network tab

## Performance Considerations

1. **Conversation List Pagination**

   - Currently loads all conversations at once
   - For large numbers, implement pagination in service

2. **Message History**

   - Limited to last 50 messages for WebSocket history
   - Full history available via REST API

3. **Unread Count**
   - Currently placeholder (0)
   - Can be calculated from Message.read field

## Future Enhancements

1. **Unread Message Badges**

   - Calculate actual unread count per conversation
   - Show badge on main messages button

2. **Conversation Pagination**

   - Load conversations in batches
   - Infinite scroll support

3. **Message Search**

   - Search within specific conversation
   - Global message search

4. **Typing Status**

   - Already implemented
   - Shows "User is typing..." indicator

5. **Message Status**

   - Already implemented
   - Shows ✓ (sent) and ✓✓ (delivered & read)

6. **Multimedia Support**

   - Support for images/files in messages
   - Preview thumbnails

7. **Conversation Actions**
   - Archive conversations
   - Mute notifications
   - Delete conversations

## Files Modified/Created

### Created Files

- `frontend/src/services/conversationService.ts` - Service for conversation API calls
- `frontend/src/components/ContactsList.tsx` - Grid component for contacts
- `backend/src/controllers/conversationController.ts` - API controllers
- `backend/src/routes/conversationRoutes.ts` - API routes

### Modified Files

- `frontend/src/components/MessagingModal.tsx` - Added dual-view system
- `frontend/src/context/AppContext.tsx` - Added conversation state management
- `frontend/src/services/index.ts` - Exported conversation service
- `backend/src/app.ts` - Registered conversation routes

## Testing the Implementation

1. **Start Backend**

   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**

   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Conversation List**

   - Open browser DevTools
   - Create accounts for 2+ users
   - Have conversations via messages
   - Click messages button
   - Verify conversations appear in grid

4. **Test Chat**

   - Click on a conversation
   - Verify messages load
   - Send test messages
   - Verify real-time delivery

5. **Test Search**

   - Use search box to filter conversations
   - Verify results update in real-time

6. **Monitor Logs**
   - Watch console for service logs
   - Check Network tab for API calls
   - Verify WebSocket events in Network → WS
