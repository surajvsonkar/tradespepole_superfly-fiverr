# WebSocket Chat - Quick Fix Guide

## Issues Fixed

### 1. **Authentication Error** ✅
**Problem**: Socket.IO was getting "Authentication error"
**Cause**: Frontend was looking for `token` in localStorage, but it's stored as `authToken`
**Fix**: Updated SocketContext.tsx to use `localStorage.getItem('authToken')`

### 2. **Port Mismatch** ✅
**Problem**: WebSocket trying to connect to port 3000, but server is on 3001
**Cause**: Hardcoded port in SocketContext
**Fix**: Updated SocketContext.tsx to use `http://localhost:3001`

### 3. **Reconnection on Login** ✅
**Problem**: Socket not connecting after user logs in
**Cause**: No event listener for login
**Fix**: 
- Added custom event dispatch in `apiClient.ts` when token is set
- Added event listener in `SocketContext.tsx` to reconnect on login

## Files Modified

1. **frontend/src/context/SocketContext.tsx**
   - Changed `localStorage.getItem('token')` → `localStorage.getItem('authToken')`
   - Changed port from 3000 → 3001
   - Added login/logout event listeners
   - Added better console logging with emojis

2. **frontend/src/lib/apiClient.ts**
   - Added `window.dispatchEvent(new CustomEvent('user-logged-in'))` in `setAuthToken()`
   - Added `window.dispatchEvent(new CustomEvent('user-logged-out'))` in `removeAuthToken()`
   - Changed default API port from 3000 → 3001

3. **frontend/src/App.tsx**
   - Removed `token` prop from SocketProvider (now gets it internally)

## How to Test

1. **Clear your browser cache and localStorage**:
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

2. **Login as a user**:
   - You should see in console: `👤 Login event detected, reconnecting socket`
   - Then: `🔌 Initializing socket connection with token`
   - Then: `✅ Socket connected successfully`

3. **Check connection status**:
   ```javascript
   // In browser console
   localStorage.getItem('authToken') // Should show your JWT token
   ```

4. **Test messaging**:
   - Login as homeowner (Browser 1)
   - Login as tradesperson (Browser 2 / Incognito)
   - Post a job as homeowner
   - Purchase lead as tradesperson
   - Click "Message Homeowner" button
   - Type a message and send
   - Should appear instantly in both windows!

## Console Logs to Look For

### ✅ Successful Connection:
```
🔌 Initializing socket connection with token
✅ Socket connected successfully
```

### ❌ If you see errors:

**"No authToken found"**:
- User is not logged in
- Check: `localStorage.getItem('authToken')`

**"Authentication error"**:
- Token is invalid or expired
- Try logging in again
- Check backend JWT_SECRET matches

**"Socket connection error"**:
- Backend server not running
- Check: Is backend running on port 3001?
- Check: `http://localhost:3001/health`

## Port Configuration

Your setup uses **PORT 3001** for the backend. If you want to change this:

### Backend (.env):
```
PORT=3001
```

### Frontend:
- Update `frontend/src/context/SocketContext.tsx` line 40
- Update `frontend/src/lib/apiClient.ts` line 1

Or use environment variables:

### Frontend (.env):
```
VITE_API_BASE_URL=http://localhost:3001/api
```

## Debugging Commands

### Check if backend is running:
```bash
curl http://localhost:3001/health
```

### Check WebSocket connection:
```javascript
// In browser console after login
const socket = io('http://localhost:3001', {
  auth: { token: localStorage.getItem('authToken') }
});
socket.on('connect', () => console.log('Connected!'));
socket.on('connect_error', (err) => console.error('Error:', err));
```

### Monitor all socket events:
```javascript
// In browser console
const originalEmit = socket.emit;
socket.emit = function(...args) {
  console.log('📤 Emitting:', args[0], args[1]);
  return originalEmit.apply(this, args);
};

socket.onAny((event, ...args) => {
  console.log('📥 Received:', event, args);
});
```

## Common Issues

### Issue: "Error: listen EADDRINUSE: address already in use :::3001"
**Cause**: The backend server is already running in another terminal window.
**Solution**:
1. Check your other terminal windows and close the extra backend server.
2. Or run this command to kill the process:
   ```bash
   npx kill-port 3001
   ```
3. Restart the server: `npm run dev`

### Issue: "PrismaClientKnownRequestError: Invalid `prisma.message.findMany()` invocation"
**Cause**: Frontend sending a temporary ID (e.g., "temp_...") instead of a valid UUID.
**Solution**: 
1. Fixed in `MessagingModal.tsx` to not join room if ID starts with "temp_".
2. Fixed in `chatSocket.ts` to validate UUID before querying database.
3. Refresh the page to load the new code.

### Issue: "Chat buttons not working"
**Solution**: 
1. Make sure you're logged in
2. Check browser console for errors
3. Verify socket is connected (look for ✅ in console)
4. Try refreshing the page

### Issue: "Messages not sending"
**Solution**:
1. Check if `isConnected` is true
2. Verify conversation exists
3. Check network tab for WebSocket frames
4. Restart backend server

### Issue: "Typing indicators not showing"
**Solution**:
1. Both users must be in the same conversation
2. Both must have active socket connections
3. Check console for socket events

## Next Steps

1. **Test the chat thoroughly**
2. **Check all "Message" buttons work**
3. **Verify typing indicators appear**
4. **Test read receipts (✓✓)**
5. **Try reconnection** (disconnect internet, reconnect)

## Need Help?

If issues persist:
1. Check browser console for errors
2. Check backend terminal for errors
3. Verify both servers are running
4. Clear localStorage and try again
5. Check if JWT token is valid

## Success Indicators

You'll know everything is working when:
- ✅ No errors in console
- ✅ See "✅ Socket connected successfully"
- ✅ Can send messages in real-time
- ✅ Typing indicators appear
- ✅ Read receipts show (✓✓)
- ✅ Messages persist after refresh
