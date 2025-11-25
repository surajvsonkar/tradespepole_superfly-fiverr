# WebSocket Connection Fix & Message Display Guide

## Problem & Solution

### Issue 1: "Cannot send message: WebSocket not connected"

**Cause**: The WebSocket connection to the backend wasn't established before trying to send messages.

**Solutions Implemented**:

1. ✅ Messages now load from the conversation immediately (no need to wait for WebSocket)
2. ✅ Connection status indicator in chat header (green = connected, red = connecting)
3. ✅ Better error handling with user-friendly alerts
4. ✅ Input disabled until connection is established
5. ✅ Console logging for debugging

### Issue 2: Messages not displaying with proper styling

**Cause**: Messages weren't being loaded into the state when opening a conversation.

**Solution Implemented**:

1. ✅ Messages now load from `conversation.messages` array immediately
2. ✅ Blue background (right-aligned) for **sent messages** (current user)
3. ✅ Green background (left-aligned) for **received messages** (other user)
4. ✅ Sender name, content, timestamp, and read receipts (✓✓) all display correctly

---

## Updated Features

### 1. Connection Status Indicator

In the chat header, you'll now see:

- **Green dot + "Connected"** - WebSocket is ready
- **Red dot + "Connecting..."** - Waiting for connection

```tsx
<div className="flex items-center space-x-2 mt-1">
	<div
		className={`w-2 h-2 rounded-full ${
			isConnected ? 'bg-green-500' : 'bg-red-500'
		}`}
	></div>
	<p className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
		{isConnected ? 'Connected' : 'Connecting...'}
	</p>
</div>
```

### 2. Improved Error Handling

When trying to send a message without connection:

```
Alert: "Connection lost. Please wait for reconnection..."
Console: "❌ WebSocket not connected. Cannot send message."
```

### 3. Message Display Styling

**Sent Messages (Current User)**

- Background: Blue (`bg-blue-600`)
- Text Color: White
- Alignment: Right side
- Read status: Shows ✓✓ when read

**Received Messages (Other User)**

- Background: Green (`bg-green-100`)
- Text Color: Dark gray (`text-gray-900`)
- Alignment: Left side

**Message Structure**:

```
[Sender Name]
[Message Content]
[Time] [Read Status]
```

---

## Troubleshooting Steps

### Step 1: Verify Backend WebSocket Server is Running

```bash
# Check if WebSocket server is running on port 8080
netstat -an | grep 8080

# Or use lsof on macOS/Linux
lsof -i :8080
```

**Expected**: Should show listening connection on 8080

### Step 2: Start Backend Properly

```bash
# Navigate to backend folder
cd backend

# Install dependencies (first time only)
npm install

# Start with development server
npm run dev

# Expected output:
# ✅ WebSocket server listening on port 8080
# ✅ API server listening on port 3000
```

### Step 3: Check Browser Console Logs

Open DevTools (F12) → Console tab and look for:

**On Initial Load:**

```
🔌 Connecting to WebSocket: ws://localhost:8080?token=...
✅ WebSocket Connected
```

**When Opening Chat:**

```
📨 Loading messages from conversation: [...]
🔌 Joining conversation: conv-id-123
```

**When Sending Message:**

```
📤 Sending message...
✅ [Backend response indicating success]
```

**If Error:**

```
⚠️ Cannot send message: WebSocket not connected
❌ WebSocket not connected. Cannot send message.
```

### Step 4: Network Tab Inspection

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter for **WS** (WebSocket)
4. You should see:
   - Connection: `ws://localhost:8080?token=...`
   - Status: **101 Web Socket Protocol Handshake**
   - State: **OPEN**

### Step 5: Backend Configuration

Check your backend environment variables:

```bash
# In backend/.env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
WS_PORT=8080  # Or ensure port 8080 is free
API_PORT=3000
```

---

## Message Flow Architecture

```
User Opens Chat Modal
    ↓
ContactsList fetches conversations from API
    ↓
User clicks on a conversation
    ↓
ConversationWithUser object passes to MessagingModal
    ↓
MessagingModal loads messages from conversation.messages array
    ↓
Messages display with correct styling (blue/green)
    ↓
WebSocket connects in background
    ↓
"join_conversation" event sent to subscribe to real-time updates
    ↓
User types message
    ↓
"send_message" event sent via WebSocket
    ↓
Backend broadcasts to other user
    ↓
"new_message" event received
    ↓
Message added to UI with smooth scroll
```

---

## Data Structure for Messages

```typescript
interface Message {
	id: string;
	conversationId: string;
	senderId: string;
	senderName: string;
	content: string;
	timestamp: string;
	read: boolean;
}

interface ConversationWithUser {
	id: string;
	jobId: string;
	jobTitle: string;
	otherUser: User;
	lastMessage: Message;
	messages: Message[]; // ← Loaded here
	createdAt: string;
	unreadCount: number;
}
```

---

## Testing the Fix

### Test 1: Message Display Styling

1. Open HomeownerProfile
2. Click "Messages" button
3. Click on any conversation
4. Verify:
   - ✅ Previous messages load immediately
   - ✅ Your messages appear blue on right
   - ✅ Other user's messages appear green on left
   - ✅ Connection status shows in header

### Test 2: WebSocket Connection

1. Open chat
2. Wait 2-3 seconds
3. Look for "Connected" status (green dot)
4. Type a message
5. Verify:
   - ✅ Send button is enabled
   - ✅ Message sends without error
   - ✅ Console shows "📤 Sending message..."

### Test 3: Connection Failure Recovery

1. Open chat
2. Stop backend server
3. Try to send message
4. Should see:
   - ❌ "Connection lost. Please wait for reconnection..."
   - Input disabled
   - Red dot in header
5. Restart backend
6. Connection should auto-reconnect
7. Send button should enable

### Test 4: Message Persistence

1. Open chat (messages load from API)
2. Close modal
3. Reopen chat
4. Verify:
   - ✅ Same messages still visible
   - ✅ No duplicate messages
   - ✅ Correct order preserved

---

## Code Changes Summary

### Files Modified

**1. `MessagingModal.tsx`**

```diff
- Load messages only from WebSocket
+ Load messages from conversation.messages immediately
+ Better error handling in send message
+ Connection status indicator in header
+ Improved input feedback when not connected
```

**2. Message Styling (Already Correct)**

- Sent: `bg-blue-600 text-white` (right-aligned)
- Received: `bg-green-100 text-gray-900` (left-aligned)

---

## Performance Optimization

The current implementation:

1. ✅ Loads historical messages from conversation object (fast)
2. ✅ Connects WebSocket in parallel (non-blocking)
3. ✅ Uses real-time updates only for new messages
4. ✅ Prevents message duplication with ID checking
5. ✅ Auto-scrolls to latest message

---

## Console Logs Reference

| Log                        | Meaning                | Action                |
| -------------------------- | ---------------------- | --------------------- |
| 🔌 Connecting to WebSocket | Starting connection    | Wait 1-2s             |
| ✅ WebSocket Connected     | Ready to send          | Can proceed           |
| 📨 Loading messages        | Fetching history       | Messages appear       |
| 🔌 Joining conversation    | Subscribing to updates | Real-time enabled     |
| 📤 Sending message         | Message in transit     | Wait for response     |
| 📥 WS Message: new_message | New message received   | Added to UI           |
| ⚠️ Cannot send message     | No connection          | Wait for 🔌 Connected |
| ❌ WebSocket not connected | Error on send          | Refresh page          |

---

## Next Steps

1. **Start your servers**:

   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Test the messaging flow**:

   - Login as user 1
   - Navigate to HomeownerProfile
   - Click "Messages"
   - Click a conversation
   - Verify messages display with correct styling
   - Send a test message

3. **Monitor console**:

   - Open DevTools (F12)
   - Go to Console tab
   - Look for connection and messaging logs

4. **Check Network tab**:
   - Filter for WS
   - Verify WebSocket connection shows "101" status
   - Watch for message events

---

## Common Issues & Fixes

| Issue                       | Cause                        | Fix                                 |
| --------------------------- | ---------------------------- | ----------------------------------- |
| Red "Connecting..." stays   | Backend not running          | Start backend `npm run dev`         |
| "Cannot send message" alert | No WebSocket connection      | Check if backend running on 8080    |
| Messages don't appear       | API not returning data       | Check `/api/conversations` endpoint |
| Duplicate messages          | Message handling bug         | Hard refresh (Ctrl+Shift+R)         |
| Input stays disabled        | Connection never established | Check browser console for errors    |

---

## Questions to Debug With

When troubleshooting, check:

1. **Is backend running?**

   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Is WebSocket port available?**

   ```bash
   lsof -i :8080
   ```

3. **Is token valid?**

   - Open DevTools
   - Console: `localStorage.getItem('authToken')`
   - Should return a JWT token

4. **Are messages in database?**

   ```sql
   SELECT * FROM messages LIMIT 5;
   ```

5. **Is conversation ID correct?**
   - Check Console logs
   - Look for "Joining conversation: [ID]"
   - Verify ID matches conversation in database

---

## Success Indicators

✅ You know the fix is working when:

1. **Chat Header**

   - Shows contact name
   - Shows job title
   - Shows **green dot + "Connected"**

2. **Messages Display**

   - Previous messages load immediately
   - Your messages: blue background, right-aligned
   - Their messages: green background, left-aligned
   - All messages have sender name, content, time

3. **Sending Messages**

   - Type message → send button enables
   - Click send → message appears immediately
   - Other user sees it in real-time
   - No "Cannot send message" error

4. **Console Output**
   - ✅ WebSocket Connected
   - 📨 Loading messages from conversation
   - 📤 Sending message
   - No red error messages

That's it! Your messaging system should now work perfectly! 🎉
