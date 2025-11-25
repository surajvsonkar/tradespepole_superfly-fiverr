# Testing WebSocket Chat with Postman

Since your backend uses **Socket.IO** (not raw WebSockets), you need to use Postman's specific **Socket.IO Request** feature.

## Prerequisites

1.  **Postman v10+** (Ensure you have the latest version).
2.  **Backend Server Running**: Ensure your backend is running on `http://localhost:3001`.
3.  **JWT Token**: You need a valid JWT token from a logged-in user.
    *   **How to get it**: Log in to your app in the browser, open DevTools (F12) -> Application -> Local Storage -> Copy the value of `authToken`.

## Step-by-Step Instructions

### 1. Create a Socket.IO Request
1.  Open Postman.
2.  Click **"New"** (top left) -> Select **"Socket.IO"**.
3.  Enter the URL: `ws://localhost:8080`
    *   *Note: Use `ws://` for WebSocket.*

### 2. Configure Authentication
Since your Postman version doesn't show a "Handshake" tab, we'll use **Query Parameters**.

1.  Click on the **"Params"** tab (next to Headers).
2.  Add a new parameter:
    *   **Key**: `token`
    *   **Value**: `Paste_Your_JWT_Token_Here`
3.  This will change your URL to something like: `ws://localhost:8080?token=eyJhbG...`

*Note: I updated the backend to accept the token from query parameters as well!*

### 3. Connect
1.  Click the blue **"Connect"** button.
2.  You should see:
    *   `Connected to http://localhost:3001`
    *   `✓ Handshake successful`
    *   If it fails, check your token and ensure the server is running.

### 4. Listen for Events
To see messages coming from the server, you need to add listeners.

1.  In the **"Events"** tab (bottom section), add these event names to listen for:
    *   `new_message`
    *   `conversation_history`
    *   `user_typing`
    *   `error`
2.  Toggle the "Listen" switch to **ON** for each.

### 5. Test: Join a Conversation
You need a valid `conversationId` (UUID) to test this. You can get one from your database or create one via the app first.

1.  In the **"Message"** tab (input area):
2.  **Event Name**: `join_conversation`
3.  **Arguments** (select JSON):
    ```json
    {
      "conversationId": "YOUR_CONVERSATION_UUID_HERE"
    }
    ```
4.  Click **"Send"**.
5.  **Check Output**: You should see a `conversation_history` event received in the "Events" pane below.

### 6. Test: Send a Message
To send a message, you need the IDs for the conversation, job, and receiver.

1.  **Event Name**: `send_message`
2.  **Arguments** (JSON):
    ```json
    {
      "conversationId": "YOUR_CONVERSATION_UUID",
      "jobId": "YOUR_JOB_UUID",
      "receiverId": "RECEIVER_USER_UUID",
      "content": "Hello from Postman!"
    }
    ```
3.  Click **"Send"**.
4.  **Check Output**:
    *   You should see `Ack` (Acknowledgement) if configured.
    *   If you have another client connected (e.g., browser), they should receive the message instantly.

### 7. Test: Typing Indicators
1.  **Event Name**: `typing`
2.  **Arguments** (JSON):
    ```json
    {
      "conversationId": "YOUR_CONVERSATION_UUID",
      "receiverId": "RECEIVER_USER_UUID"
    }
    ```
3.  Click **"Send"**.
4.  The other user should see the typing indicator.

## Troubleshooting

*   **"Authentication error"**: Your token is invalid or expired. Get a new one from the browser.
*   **"Failed to join conversation"**: The `conversationId` you used is invalid or doesn't exist.
*   **No response**: Make sure you added the Event Listeners (Step 4) before sending events.
