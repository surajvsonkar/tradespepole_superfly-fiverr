# Chat Feature Enhancement Implementation Plan

## Objectives
1. Store all chat messages in the database
2. Fetch and display user names in the messaging modal
3. Show online/offline status for users

## Implementation Steps

### 1. Backend - WebSocket Server Updates
- [ ] Import Prisma client in chatServer.ts
- [ ] Save messages to database when sent
- [ ] Track online users (userId -> socketIds mapping)
- [ ] Broadcast online status changes
- [ ] Add method to get online users list

### 2. Backend - API Updates
- [ ] Add endpoint to get conversation with messages
- [ ] Ensure conversation controller returns user details

### 3. Frontend - ChatContext Updates
- [ ] Add method to load previous messages from API
- [ ] Track online users from WebSocket
- [ ] Add online status to context

### 4. Frontend - MessagingModal Updates
- [ ] Fetch conversation details with user info on open
- [ ] Display other user's name in header
- [ ] Show online/offline indicator
- [ ] Load previous messages when modal opens

### 5. Frontend - ConversationsList Updates
- [ ] Show online status indicator for each conversation

## Database Schema
Already exists:
- Conversation model (with homeowner and tradesperson relations)
- Message model (with sender relation)

## WebSocket Message Types to Add
- `user_online` - Broadcast when user connects
- `user_offline` - Broadcast when user disconnects
- `online_users` - Send list of online users
- `message_history` - Send previous messages (optional, using HTTP instead)

## API Endpoints to Use
- GET `/conversations/:conversationId` - Get conversation with messages and user details
