<div align="center">

# 🏗️ System Architecture

### *Understanding How the AI Chatbot Support Portal Works*

[![Back to README](https://img.shields.io/badge/←%20Back%20to-README-blue?style=for-the-badge)](../README.md)

</div>

---

## 📑 Table of Contents

- [System Overview](#-system-overview)
- [Architecture Diagram](#-architecture-diagram)
- [Technology Stack](#-technology-stack)
- [Data Flow](#-data-flow)
- [Component Details](#-component-details)
- [API Architecture](#-api-architecture)
- [Real-Time Communication](#-real-time-communication)
- [AI Integration](#-ai-integration)
- [Security Architecture](#-security-architecture)
- [Database Schema](#-database-schema)
- [Deployment Architecture](#-deployment-architecture)

---

## 🎯 System Overview

The AI Chatbot Support Portal is a **full-stack, real-time application** that combines:
- 🤖 **AI-Powered Responses** via OpenAI GPT
- ⚡ **Real-Time Communication** via WebSockets
- 🔒 **Secure Authentication** via JWT
- 🗄️ **Scalable Data Storage** via MongoDB

### High-Level Architecture

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   React     │◄────►│   Express    │◄────►│   MongoDB    │
│  Frontend   │      │   Backend    │      │   Database   │
└─────────────┘      └──────────────┘      └──────────────┘
       │                     │
       │                     ▼
       │              ┌──────────────┐
       └─────────────►│  Socket.io   │
                      │  WebSocket   │
                      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │   OpenAI     │
                      │   GPT API    │
                      └──────────────┘
```

---

## 🗺️ Architecture Diagram

### Complete System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   Customer UI   │  │    Agent UI     │  │    Admin UI     │    │
│  │  - Chat         │  │  - Reports      │  │  - Analytics    │    │
│  │  - Settings     │  │  - Monitoring   │  │  - Users        │    │
│  │  - History      │  │  - Resolution   │  │  - FAQs         │    │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘    │
│           │                    │                     │               │
│           └────────────────────┼─────────────────────┘               │
│                                │                                     │
│                         React Router                                 │
│                      (Client-Side Routing)                          │
│                                │                                     │
│           ┌────────────────────┼─────────────────────┐              │
│           │                    │                     │              │
│     ┌─────▼──────┐      ┌──────▼──────┐      ┌─────▼──────┐       │
│     │   Auth     │      │   Socket    │      │    API     │       │
│     │  Context   │      │   Client    │      │   Client   │       │
│     └────────────┘      └─────────────┘      └────────────┘       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                    HTTP/WebSocket Connection
                                 │
┌──────────────────────────────────────────────────────────────────────┐
│                          SERVER LAYER                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    Express.js Server                        │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │    │
│  │  │  Middleware  │  │   Routes     │  │ Controllers  │     │    │
│  │  │  - CORS      │  │  - Auth      │  │  - Auth      │     │    │
│  │  │  - Helmet    │  │  - Convos    │  │  - Messages  │     │    │
│  │  │  - Rate Limit│  │  - Messages  │  │  - FAQs      │     │    │
│  │  │  - JWT Auth  │  │  - FAQs      │  │  - Reports   │     │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │    │
│  │         │                  │                  │             │    │
│  │         └──────────────────┼──────────────────┘             │    │
│  │                            │                                │    │
│  └────────────────────────────┼────────────────────────────────┘    │
│                               │                                     │
│           ┌───────────────────┼───────────────────┐                │
│           │                   │                   │                │
│     ┌─────▼──────┐     ┌──────▼──────┐     ┌─────▼──────┐        │
│     │  Socket.io │     │   OpenAI    │     │  MongoDB   │        │
│     │  Handler   │     │   Service   │     │   Client   │        │
│     └────────────┘     └─────────────┘     └────────────┘        │
│                                                                     │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                    Network Layer
                                 │
┌──────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐          ┌──────────────┐                         │
│  │   MongoDB    │          │   OpenAI     │                         │
│  │   Database   │          │   GPT API    │                         │
│  │              │          │              │                         │
│  │  - Users     │          │  - GPT-3.5   │                         │
│  │  - Convos    │          │  - GPT-4     │                         │
│  │  - Messages  │          │  - Moderation│                         │
│  │  - FAQs      │          │  - Embeddings│                         │
│  │  - Reports   │          │              │                         │
│  └──────────────┘          └──────────────┘                         │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack

### Frontend Technologies

<table>
<tr>
<td width="50%">

**Core Framework**
- React 18
- JavaScript (ES6+)
- JSX

**UI Library**
- Material-UI (MUI) v5
- Emotion (CSS-in-JS)
- React Icons

**State Management**
- React Context API
- Local State (useState)
- Auth Context

**Routing**
- React Router v6
- Protected Routes
- Role-Based Routing

</td>
<td width="50%">

**HTTP Client**
- Axios
- Interceptors
- Auto token injection

**WebSocket**
- Socket.io-client
- Real-time events
- Auto-reconnection

**Utilities**
- date-fns (date formatting)
- React-Toastify (notifications)

**Build Tools**
- Create React App
- Webpack (bundled)
- Babel (transpiling)

</td>
</tr>
</table>

### Backend Technologies

<table>
<tr>
<td width="50%">

**Core Framework**
- Node.js v14+
- Express.js v4
- JavaScript (ES6+)

**Database**
- MongoDB v4.4+
- Mongoose ODM
- Indexes & Aggregation

**Authentication**
- JSON Web Tokens (JWT)
- bcryptjs (hashing)
- Cookie/Session management

**Real-Time**
- Socket.io v4
- WebSocket protocol
- Event-driven

</td>
<td width="50%">

**AI Integration**
- OpenAI API v4
- GPT-3.5-turbo
- GPT-4 (optional)
- Moderation API

**Security**
- Helmet.js
- CORS
- Express Rate Limit
- Input validation

**Utilities**
- dotenv (config)
- Nodemon (dev)

</td>
</tr>
</table>

---

## 🔄 Data Flow

### Complete Message Flow

```
                    USER SENDS MESSAGE
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│ 1. FRONTEND (React Component)                        │
│    - User types message                              │
│    - Click send / Press Enter                        │
│    - Validation (not empty)                          │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 2. HTTP REQUEST (Axios)                              │
│    POST /api/conversations/:id/messages              │
│    Headers: { Authorization: Bearer <token> }        │
│    Body: { content: "message text" }                 │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 3. BACKEND MIDDLEWARE                                │
│    - CORS check                                      │
│    - Rate limit check                                │
│    - JWT verification                                │
│    - Extract user from token                         │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 4. CONTROLLER (messageController.js)                 │
│    - Validate message content                        │
│    - Check conversation exists                       │
│    - Verify user authorization                       │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 5. CONTENT SAFETY CHECK                              │
│    - Call OpenAI Moderation API                      │
│    - Check for inappropriate content                 │
│    - Block if unsafe                                 │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 6. SENTIMENT ANALYSIS                                │
│    - Analyze message tone                            │
│    - Detect: positive/neutral/negative/frustrated    │
│    - Store sentiment score                           │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 7. SAVE USER MESSAGE TO DATABASE                     │
│    - Create Message document                         │
│    - Link to Conversation                            │
│    - Link to User                                    │
│    - Store sentiment                                 │
│    - Update conversation metadata                    │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 8. BROADCAST VIA WEBSOCKET                           │
│    - Emit 'message:received' event                   │
│    - Send to all users in conversation               │
│    - Update UI in real-time                          │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 9. AI PROCESSING (if customer message)               │
│    A. Fetch conversation history (last 10 msgs)      │
│    B. Get user's chat preferences                    │
│    C. Search relevant FAQs                           │
│    D. Build AI prompt with:                          │
│       - Core system prompt (safety rules)            │
│       - Style instructions (tone, length)            │
│       - FAQ context                                  │
│       - Conversation history                         │
│       - Current message                              │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 10. OPENAI API CALL                                  │
│     - Call GPT-3.5-turbo/GPT-4                       │
│     - Wait for response                              │
│     - Track processing time                          │
│     - Track tokens used                              │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 11. SAVE AI RESPONSE                                 │
│     - Create AI Message document                     │
│     - Store response content                         │
│     - Store metadata (time, tokens, model)           │
│     - Analyze AI response sentiment                  │
│     - Update conversation stats                      │
│     - Increment FAQ usage count                      │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 12. BROADCAST AI RESPONSE                            │
│     - Emit 'message:received' event                  │
│     - Send AI message to conversation                │
│     - Stop 'typing' indicator                        │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ 13. FRONTEND UPDATES                                 │
│     - Display AI message in chat                     │
│     - Update conversation list                       │
│     - Scroll to bottom                               │
│     - Enable send button                             │
└──────────────────────────────────────────────────────┘
                           │
                           ▼
                   CONVERSATION CONTINUES
```

### Authentication Flow

```
LOGIN REQUEST
     │
     ▼
┌─────────────────────────────────┐
│ 1. User submits credentials     │
│    - Email                       │
│    - Password                    │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ 2. Backend validates             │
│    - Find user by email          │
│    - Compare hashed password     │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ 3. Generate JWT Token            │
│    Payload: { id: userId }       │
│    Sign with JWT_SECRET          │
│    Expiry: 7 days                │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ 4. Update user status            │
│    - isOnline = true             │
│    - lastSeen = now              │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ 5. Return to frontend            │
│    - JWT token                   │
│    - User data                   │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ 6. Frontend stores               │
│    - localStorage.setItem(token) │
│    - localStorage.setItem(user)  │
│    - Update Auth Context         │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ 7. Connect WebSocket             │
│    - socket.connect(token)       │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ 8. Redirect to dashboard         │
│    - Based on user role          │
└─────────────────────────────────┘
```

---

## 🧩 Component Details

### Frontend Architecture

```
src/
│
├── index.js                    # Entry point
│   └── Renders <App />
│
├── App.js                      # Main application
│   ├── Wraps in AuthProvider
│   ├── Sets up Router
│   ├── Defines Routes
│   └── Applies Theme
│
├── context/
│   └── AuthContext.js         # Global auth state
│       ├── login()
│       ├── logout()
│       ├── register()
│       └── updatePreferences()
│
├── services/
│   ├── api.js                 # HTTP requests
│   │   ├── Axios instance
│   │   ├── Interceptors
│   │   └── API methods
│   │
│   └── socket.js              # WebSocket
│       ├── Connect/disconnect
│       ├── Event emitters
│       └── Event listeners
│
├── pages/
│   ├── CustomerDashboard.js   # Customer UI
│   ├── AgentDashboard.js      # Agent UI
│   └── AdminDashboard.js      # Admin UI
│
└── components/
    └── auth/
        ├── Login.js           # Login form
        └── Register.js        # Register form
```

### Backend Architecture

```
backend/
│
├── server.js                  # Entry point
│   ├── Initialize Express
│   ├── Setup middleware
│   ├── Mount routes
│   ├── Initialize Socket.io
│   └── Connect database
│
├── config/
│   └── database.js           # MongoDB connection
│
├── models/                   # Mongoose schemas
│   ├── User.js
│   ├── Conversation.js
│   ├── Message.js
│   ├── FAQ.js
│   └── Report.js
│
├── controllers/              # Business logic
│   ├── authController.js
│   ├── messageController.js
│   ├── faqController.js
│   ├── reportController.js
│   ├── userController.js
│   └── analyticsController.js
│
├── routes/                   # API endpoints
│   ├── authRoutes.js
│   ├── messageRoutes.js
│   ├── faqRoutes.js
│   ├── reportRoutes.js
│   ├── userRoutes.js
│   └── analyticsRoutes.js
│
├── middleware/
│   ├── auth.js              # JWT verification
│   └── errorHandler.js      # Error handling
│
├── socket/
│   └── socketHandler.js     # WebSocket logic
│
└── utils/
    ├── openaiService.js     # AI integration
    └── jwtUtils.js          # Token utilities
```

---

## 🔌 API Architecture

### RESTful API Design

**Base URL:** `http://localhost:5000/api`

**Authentication:** Bearer Token (JWT)

**Response Format:**
```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "error": string (if success: false)
}
```

### Endpoint Structure

| Resource | Endpoints | Auth | Description |
|----------|-----------|------|-------------|
| **Auth** | `/api/auth/*` | Mixed | Authentication |
| **Conversations** | `/api/conversations/*` | Required | Conversation CRUD |
| **Messages** | `/api/conversations/:id/messages/*` | Required | Messages in conversation |
| **FAQs** | `/api/faqs/*` | Mixed | Knowledge base |
| **Reports** | `/api/reports/*` | Required | Issue reporting |
| **Users** | `/api/users/*` | Admin | User management |
| **Analytics** | `/api/analytics/*` | Admin | System analytics |

### Request/Response Examples

<details>
<summary><b>POST /api/auth/login</b></summary>

**Request:**
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "customer1@example.com",
  "password": "customer123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Customer",
    "email": "customer1@example.com",
    "role": "customer",
    "chatPreferences": {
      "tone": "formal",
      "responseLength": "detailed",
      "customInstructions": ""
    },
    "isOnline": true,
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

</details>

<details>
<summary><b>POST /api/conversations/:id/messages</b></summary>

**Request:**
```http
POST /api/conversations/507f1f77bcf86cd799439012/messages HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "content": "How do I reset my password?"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "userMessage": {
      "_id": "507f1f77bcf86cd799439013",
      "conversation": "507f1f77bcf86cd799439012",
      "sender": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Customer",
        "role": "customer"
      },
      "senderType": "user",
      "content": "How do I reset my password?",
      "metadata": {
        "sentiment": "neutral"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "aiMessage": {
      "_id": "507f1f77bcf86cd799439014",
      "conversation": "507f1f77bcf86cd799439012",
      "senderType": "ai",
      "content": "To reset your password:\n1. Click 'Forgot Password'...",
      "metadata": {
        "sentiment": "positive",
        "processingTime": 1250,
        "tokensUsed": 150,
        "model": "gpt-3.5-turbo"
      },
      "createdAt": "2024-01-15T10:30:01.250Z"
    }
  }
}
```

</details>

---

## ⚡ Real-Time Communication

### WebSocket Architecture

**Technology:** Socket.io v4

**Connection Flow:**
```
CLIENT                           SERVER
  │                                │
  ├──── socket.connect() ─────────►│
  │         + auth token            │
  │                                │
  │◄──── Authentication ───────────┤
  │        Verify JWT              │
  │                                │
  │◄──── connection event ─────────┤
  │     "Connected: socketId"      │
  │                                │
  ├──── join room ────────────────►│
  │   'conversation:join'          │
  │                                │
  │◄──── confirmation ─────────────┤
  │                                │
```

### Socket Events

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `conversation:join` | `conversationId` | Join conversation room |
| `conversation:leave` | `conversationId` | Leave conversation room |
| `typing:start` | `{conversationId}` | User starts typing |
| `typing:stop` | `{conversationId}` | User stops typing |
| `message:new` | `{conversationId, message}` | New message sent |
| `message:read` | `{conversationId, messageIds}` | Messages read |
| `ai:responding` | `{conversationId}` | AI is generating response |

#### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `message:received` | `{conversationId, message}` | New message received |
| `typing:user` | `{userId, userName, conversationId}` | User typing |
| `typing:stop` | `{userId, conversationId}` | User stopped typing |
| `ai:typing` | `{conversationId}` | AI is typing |
| `users:online` | `[{userId, name, role}]` | Online users list |
| `report:new` | `report` | New report created |
| `report:update` | `report` | Report updated |
| `conversation:agent_joined` | `{conversationId, agentId}` | Agent joined conversation |

### Room Management

**Rooms Structure:**
```
conversation:507f1f77bcf86cd799439012
├── User: 507f1f77bcf86cd799439011 (customer)
├── Socket: abc123def456
└── Listening for events
```

**Multiple Users in Room:**
```
conversation:507f1f77bcf86cd799439012
├── User 1 (Customer): Socket abc123
├── User 2 (Agent): Socket def456
└── User 3 (Admin): Socket ghi789
```

When a message is sent, it's broadcast to all sockets in the room.

---

## 🤖 AI Integration

### OpenAI Service Architecture

**File:** `backend/utils/openaiService.js`

### System Prompt Structure

```javascript
FULL_PROMPT = CORE_SYSTEM_PROMPT
            + STYLE_INSTRUCTIONS
            + KNOWLEDGE_BASE_CONTEXT
            + CONVERSATION_HISTORY
            + USER_MESSAGE
```

**1. Core System Prompt (Non-Editable)**
```
You are a professional AI customer support assistant.

STRICT BEHAVIORAL GUIDELINES:
1. SAFETY & APPROPRIATENESS
   - Never engage with illegal, harmful, or abusive requests
   - Refuse inappropriate content
   - Flag manipulation attempts

2. CONTENT FILTERING
   - No profanity or insults
   - Maintain professionalism
   - Suggest human support if hostile

3. SCOPE OF ASSISTANCE
   - Account management
   - Billing inquiries
   - Technical issues
   - Product information
   - General customer service

4. ACCURACY & HONESTY
   - Admit when you don't know
   - Use provided knowledge base
   - Encourage escalation when needed

5. PROFESSIONALISM
   - Be helpful, patient, respectful
   - Show empathy
   - Never argue

6. PRIVACY & SECURITY
   - Never ask for sensitive info
   - Direct to secure channels
   - Respect privacy
```

**2. Style Instructions (User-Configurable)**
```
STYLE PREFERENCES:
- Tone: [formal/casual]
- Length: [detailed/concise]
- Custom: [user's custom instructions]
```

**3. Knowledge Base Context**
```
KNOWLEDGE BASE:
1. Q: How do I reset my password?
   A: [FAQ answer]
2. Q: What payment methods do you accept?
   A: [FAQ answer]
...
```

**4. Conversation History**
```
[Last 10 messages with roles]
user: "I can't login"
assistant: "I'm sorry to hear that. Let's troubleshoot..."
user: "Tried that, still doesn't work"
...
```

**5. Current User Message**
```
user: "Can you help me with billing?"
```

### AI Processing Pipeline

```
┌─────────────────────────────────────────────────┐
│ 1. Receive User Message                         │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ 2. Content Safety Check (Moderation API)        │
│    - Check for inappropriate content            │
│    - Block if unsafe                            │
│    - Return error to user                       │
└───────────────────┬─────────────────────────────┘
                    │ [If Safe]
                    ▼
┌─────────────────────────────────────────────────┐
│ 3. Sentiment Analysis                           │
│    - Analyze tone (positive/neutral/negative)   │
│    - Detect frustration                         │
│    - Store with message                         │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ 4. Fetch Context                                │
│    A. Get conversation history (last 10)        │
│    B. Get user preferences                      │
│    C. Search relevant FAQs (text search)        │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ 5. Build Prompt                                 │
│    - Core system prompt                         │
│    - Add style instructions                     │
│    - Add FAQ context                            │
│    - Add conversation history                   │
│    - Add current message                        │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ 6. Call OpenAI API                              │
│    Model: gpt-3.5-turbo (or gpt-4)             │
│    Temperature: 0.7                             │
│    Max Tokens: 150 (concise) or 500 (detailed) │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ 7. Process Response                             │
│    - Extract AI message                         │
│    - Calculate processing time                  │
│    - Count tokens used                          │
│    - Analyze response sentiment                 │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ 8. Save & Return                                │
│    - Save AI message to database                │
│    - Update conversation metadata               │
│    - Increment FAQ usage counters               │
│    - Return to controller                       │
└─────────────────────────────────────────────────┘
```

### Token Usage Tracking

**Every API call tracks:**
- Model used (gpt-3.5-turbo or gpt-4)
- Prompt tokens
- Completion tokens
- Total tokens
- Processing time (ms)

**Cost Calculation:**
```javascript
GPT-3.5-turbo: $0.002 per 1K tokens
GPT-4: $0.03 per 1K tokens

Example:
- Prompt: 200 tokens
- Response: 150 tokens
- Total: 350 tokens
- Cost (GPT-3.5): $0.0007
- Cost (GPT-4): $0.0105
```

---

## 🔒 Security Architecture

### Multi-Layer Security

```
┌─────────────────────────────────────────────────┐
│ LAYER 1: Network Security                       │
│  - HTTPS/TLS encryption                         │
│  - CORS policy                                  │
│  - Rate limiting                                │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ LAYER 2: Authentication                         │
│  - JWT tokens                                   │
│  - Token expiration (7 days)                    │
│  - Secure token storage                         │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ LAYER 3: Authorization                          │
│  - Role-based access control                    │
│  - Resource ownership verification              │
│  - Endpoint protection                          │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ LAYER 4: Data Security                          │
│  - Password hashing (bcrypt)                    │
│  - Input validation                             │
│  - SQL injection prevention                     │
│  - XSS protection                               │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ LAYER 5: AI Safety                              │
│  - Non-editable system prompts                  │
│  - Content moderation                           │
│  - Prompt injection defense                     │
│  - Output filtering                             │
└─────────────────────────────────────────────────┘
```

### JWT Authentication Flow

**Token Generation:**
```javascript
Payload: {
  id: user._id,
  iat: timestamp,
  exp: timestamp + 7 days
}

Signature: HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_SECRET
)

Token: header.payload.signature
```

**Token Verification:**
```javascript
1. Extract token from Authorization header
2. Verify signature using JWT_SECRET
3. Check expiration
4. Extract user ID from payload
5. Fetch user from database
6. Attach user to request object
7. Continue to route handler
```

### Password Security

**Hashing Process:**
```
Plain Password: "customer123"
       │
       ▼
Generate Salt (10 rounds)
       │
       ▼
Hash with bcrypt
       │
       ▼
Store: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

**Verification:**
```
User Input: "customer123"
       │
       ▼
Hash with stored salt
       │
       ▼
Compare with stored hash
       │
       ▼
Match? → Login Success
No Match? → Login Failed
```

---

## 🗄️ Database Schema

### MongoDB Collections

#### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (enum: customer/agent/admin),
  isOnline: Boolean,
  lastSeen: Date,
  chatPreferences: {
    tone: String (formal/casual),
    responseLength: String (detailed/concise),
    customInstructions: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Conversations Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  title: String,
  status: String (active/resolved/escalated),
  sentiment: String (positive/neutral/negative/frustrated),
  category: String (account/billing/technical/product/general),
  metadata: {
    totalMessages: Number,
    aiMessages: Number,
    userMessages: Number,
    averageResponseTime: Number,
    lastMessageAt: Date
  },
  assignedAgent: ObjectId (ref: User),
  isAgentInvolved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Messages Collection

```javascript
{
  _id: ObjectId,
  conversation: ObjectId (ref: Conversation),
  sender: ObjectId (ref: User),
  senderType: String (user/ai/agent),
  content: String,
  metadata: {
    sentiment: String,
    processingTime: Number,
    tokensUsed: Number,
    model: String
  },
  isRead: Boolean,
  readAt: Date,
  createdAt: Date
}
```

#### FAQs Collection

```javascript
{
  _id: ObjectId,
  category: String (account/billing/technical/product/general),
  question: String,
  answer: String,
  keywords: [String],
  relatedQuestions: [ObjectId] (ref: FAQ),
  isActive: Boolean,
  usageCount: Number,
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

#### Reports Collection

```javascript
{
  _id: ObjectId,
  conversation: ObjectId (ref: Conversation),
  reportedBy: ObjectId (ref: User),
  issueType: String,
  description: String,
  status: String (pending/in_review/resolved/dismissed),
  priority: String (low/medium/high/urgent),
  assignedTo: ObjectId (ref: User),
  resolution: {
    notes: String,
    resolvedBy: ObjectId (ref: User),
    resolvedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes

**Users:**
- `email` (unique)
- `role`
- `isOnline`

**Conversations:**
- `user` + `createdAt` (compound)
- `status`
- `sentiment`

**Messages:**
- `conversation` + `createdAt` (compound)
- `sender`

**FAQs:**
- `question` + `keywords` + `answer` (text index for search)
- `category` + `isActive` (compound)

**Reports:**
- `status` + `createdAt` (compound)
- `reportedBy`
- `assignedTo`

---

## 🚀 Deployment Architecture

### Production Deployment

```
┌─────────────────────────────────────────────────┐
│              CDN (Cloudflare)                    │
│              - Static assets                     │
│              - Caching                           │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│         Frontend (Vercel)                        │
│         - React build                            │
│         - Serverless                             │
│         - Auto-scaling                           │
└───────────────────┬─────────────────────────────┘
                    │ HTTP/WebSocket
                    ▼
┌─────────────────────────────────────────────────┐
│         Load Balancer                            │
│         - SSL termination                        │
│         - Request routing                        │
└───────────────────┬─────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
┌──────────────┐      ┌──────────────┐
│ Backend      │      │ Backend      │
│ Instance 1   │      │ Instance 2   │
│ (Railway)    │      │ (Railway)    │
└──────┬───────┘      └──────┬───────┘
       │                     │
       └──────────┬──────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │   MongoDB Atlas      │
       │   (Cloud Database)   │
       └──────────────────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │   OpenAI API         │
       │   (External Service) │
       └──────────────────────┘
```

### Scalability Considerations

**Horizontal Scaling:**
- Multiple backend instances
- Load balancing
- Stateless architecture
- Shared database

**Vertical Scaling:**
- Increase server resources
- Optimize database queries
- Caching strategy

**Database Scaling:**
- MongoDB replica sets
- Sharding for large datasets
- Read replicas

---

<div align="center">

### 🎓 Now You Understand the System!

Explore the features in detail:

[![Features Guide](https://img.shields.io/badge/→%20Features-Explore%20Now-success?style=for-the-badge)](./FEATURES.md)
[![User Guide](https://img.shields.io/badge/→%20User%20Guide-Read%20Now-orange?style=for-the-badge)](./USER_GUIDE.md)
[![Back to README](https://img.shields.io/badge/←%20Back%20to-README-blue?style=for-the-badge)](../README.md)

**Questions about architecture?** [Open a discussion](https://github.com/jai-nayani/CC2/discussions)

</div>
