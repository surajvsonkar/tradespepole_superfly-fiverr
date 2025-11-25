# Message Display Visual Reference

## Chat Interface Layout

```
┌─────────────────────────────────────────────────────────┐
│  ← [Message Icon]  John Doe                       [X]   │  ← Header with connection status
│      Kitchen Renovation                                  │
│      🟢 Connected                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Messages Area - Auto scrolls to latest]              │
│                                                          │
│  Green message (Left)        John Doe  ← Received      │
│  ┌─────────────────┐         12:45 PM                   │
│  │ Hey, when can   │                                    │
│  │ you start?      │                                    │
│  └─────────────────┘                                    │
│                                                          │
│                      You  ← Sent                        │
│                   ┌──────────────────┐                  │
│                   │ Next week should  │  12:46 PM  ✓✓   │
│                   │ work fine!        │                  │
│                   └──────────────────┘                  │
│                        (Blue message)                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  [Message Input Area]                                   │
│  ┌─────────────────────────────────────┐  ┌──────┐    │
│  │ Type your message...                │  │ Send │    │
│  │                                     │  └──────┘    │
│  └─────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

## Message Styling Details

### RECEIVED MESSAGE (Green - Left Aligned)

```
┌─ Sender Name (Gray text, xs size)
│
│ John Doe
│ Hey, when can you start?
│ 12:45 PM
│
└─ Container: bg-green-100, text-gray-900, max-w-xs
   Position: justify-start (left side)
   Padding: px-4 py-2, rounded-lg
```

**CSS Classes**:

```css
.message-received {
	background-color: #dcfce7; /* bg-green-100 */
	color: #111827; /* text-gray-900 */
	align-self: flex-start; /* left alignment */
	max-width: 85%; /* max-w-xs lg:max-w-md */
}
```

### SENT MESSAGE (Blue - Right Aligned)

```
                                You
                         ┌─ Sender Name (Lighter text)
                         │
                    ┌────────────────────────┐
                    │ Next week should work  │
                    │ fine!                  │
                    ├────────────────────────┤
                    │ 12:46 PM           ✓✓ │ ← Read receipts
                    └────────────────────────┘
```

**CSS Classes**:

```css
.message-sent {
	background-color: #2563eb; /* bg-blue-600 */
	color: #ffffff; /* text-white */
	align-self: flex-end; /* right alignment */
	max-width: 85%; /* max-w-xs lg:max-w-md */
}

.message-sent .timestamp {
	color: #dbeafe; /* text-blue-100 */
}

.message-sent .read-status {
	color: #dbeafe; /* text-blue-100 */
}
```

## Connection Status Indicators

### CONNECTED STATE (Green)

```
┌────────────────────────────────┐
│ ← [Icon]  John Doe        [X]  │
│    Kitchen Renovation          │
│    🟢 Connected                │  ← Green dot + green text
└────────────────────────────────┘

CSS:
    dot: bg-green-500 (w-2 h-2 rounded-full)
    text: text-green-600 (text-xs)
    button: enabled (bg-blue-600)
    input: enabled
```

### CONNECTING STATE (Red)

```
┌────────────────────────────────┐
│ ← [Icon]  John Doe        [X]  │
│    Kitchen Renovation          │
│    🔴 Connecting...            │  ← Red dot + red text
└────────────────────────────────┘

CSS:
    dot: bg-red-500 (w-2 h-2 rounded-full)
    text: text-red-500 (text-xs)
    button: disabled (bg-gray-400)
    input: disabled (bg-gray-100)
    placeholder: "Connecting... please wait"
```

## Complete Message Component Breakdown

```tsx
// Message Container
<div className="flex justify-start|end">
	{' '}
	// justify-start (receive) or justify-end (send) // Message Box
	<div
		className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                   bg-green-100|blue-600
                   text-gray-900|white"
	>
		// Sender Name
		<p className="text-xs opacity-75 mb-1">{message.senderName}</p>
		// Message Content
		<p className="text-sm">{message.content}</p>
		// Timestamp + Read Status
		<div
			className="flex items-center mt-1 text-xs
                    text-gray-500|blue-100"
		>
			<Clock className="w-3 h-3 mr-1" />
			{formatTime(message.timestamp)}

			{isOwnMessage && message.read && <span className="ml-2">✓✓</span>}
		</div>
	</div>
</div>
```

## Message Colors & Backgrounds

| Element      | RECEIVED                  | SENT                      |
| ------------ | ------------------------- | ------------------------- |
| Background   | `bg-green-100` (#dcfce7)  | `bg-blue-600` (#2563eb)   |
| Text Content | `text-gray-900` (#111827) | `text-white` (#ffffff)    |
| Sender Name  | `opacity-75`              | `opacity-75`              |
| Timestamp    | `text-gray-500` (#6b7280) | `text-blue-100` (#dbeafe) |
| Read Icon    | N/A                       | `text-blue-100` (#dbeafe) |
| Alignment    | Left                      | Right                     |

## Responsive Behavior

### Desktop (> 768px)

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Green message  (max-w-md ≈ 448px)                     │
│  ┌──────────────────────┐                              │
│  │ Previous message...  │                              │
│  └──────────────────────┘                              │
│                                                          │
│                      Blue message (max-w-md)            │
│                  ┌──────────────────────┐               │
│                  │ Sent message reply.. │               │
│                  └──────────────────────┘               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Mobile (< 768px)

```
┌─────────────────────────┐
│                         │
│  Green message (90%)    │
│  ┌───────────────────┐  │
│  │ Longer message    │  │
│  │ might wrap here   │  │
│  └───────────────────┘  │
│                         │
│      Blue message       │
│  ┌───────────────────┐  │
│  │ Reply wraps too   │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

## Empty State

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│                      [Message Icon]                     │
│                                                          │
│                   No messages yet.                      │
│              Start the conversation!                    │
│                                                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Typing Indicator

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  John Doe is typing...                                 │
│  ┌──────────────┐                                       │
│  │ • • •        │  ← Animated bounce                    │
│  └──────────────┘                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘

CSS:
  dot: w-2 h-2 rounded-full bg-gray-500 animate-bounce
  container: bg-gray-100 px-4 py-2 rounded-lg
```

## Input Area States

### CONNECTED & READY

```
┌────────────────────────────────────────┬─────────┐
│ Type your message...                   │ [Send]  │  ← Button enabled
│                                        │ enabled │
└────────────────────────────────────────┴─────────┘
```

### NOT CONNECTED / DISABLED

```
┌────────────────────────────────────────┬─────────┐
│ Connecting... please wait (disabled)   │ [Send]  │  ← Button disabled
│ (gray background)                      │disabled │
└────────────────────────────────────────┴─────────┘
```

## Animation States

### Auto-scroll on New Message

```
Old messages...

│
│
▼ (smooth scroll)

[NEW MESSAGE]
```

### Typing Indicator

```
Dot 1: animate-bounce (delay: 0s)
Dot 2: animate-bounce (delay: 0.1s)
Dot 3: animate-bounce (delay: 0.2s)
```

Result: Sequential bouncing animation

## Accessibility Features

- Sender name identifies who sent the message
- Timestamps help understand message order
- Read receipts (✓✓) show message confirmation
- Color contrast meets WCAG AA standards
- Clear distinction between sent/received

---

## Summary

**The messaging system displays**:

1. ✅ **Green bubble, left-aligned** = You received this message
2. ✅ **Blue bubble, right-aligned** = You sent this message
3. ✅ **Sender name** = Who wrote it
4. ✅ **Timestamp** = When it was sent
5. ✅ **Read receipts** = ✓✓ when message is read
6. ✅ **Connection status** = 🟢 Connected / 🔴 Connecting...
7. ✅ **Auto-scroll** = Always shows latest message
8. ✅ **Typing indicator** = Shows when other person is typing

This matches WhatsApp/Instagram/professional messaging apps! 🎉
