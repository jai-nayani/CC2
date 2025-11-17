<div align="center">

# 🔧 Complete Setup Guide

### *Step-by-Step Installation & Configuration*

[![Back to README](https://img.shields.io/badge/←%20Back%20to-README-blue?style=for-the-badge)](../README.md)

</div>

---

## 📑 Table of Contents

- [System Requirements](#-system-requirements)
- [Installation Steps](#-installation-steps)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Verification](#-verification)
- [Troubleshooting](#-troubleshooting)
- [Next Steps](#-next-steps)

---

## 💻 System Requirements

### Minimum Requirements

| Component | Requirement | Recommended |
|-----------|------------|-------------|
| **OS** | Windows 10, macOS 10.14+, Ubuntu 18.04+ | Latest version |
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4 GB | 8+ GB |
| **Storage** | 2 GB free space | 5+ GB |
| **Internet** | Stable connection | High-speed |

### Software Requirements

<details>
<summary><b>📦 Node.js & npm</b></summary>

**Version:** Node.js v14.0.0 or higher

**Installation:**

```bash
# Check if installed
node --version
npm --version

# Install on macOS (via Homebrew)
brew install node

# Install on Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install on Windows
# Download from: https://nodejs.org/en/download/
```

**Verify Installation:**
```bash
node --version  # Should show v14.0.0 or higher
npm --version   # Should show 6.0.0 or higher
```

</details>

<details>
<summary><b>🍃 MongoDB</b></summary>

**Version:** MongoDB v4.4 or higher

**Installation:**

**macOS:**
```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0
```

**Ubuntu/Linux:**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
1. Download MongoDB from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer
3. MongoDB will run as a Windows Service automatically

**Verify Installation:**
```bash
mongosh --version  # Should connect successfully
```

</details>

<details>
<summary><b>🔑 OpenAI API Key</b></summary>

**Required:** Yes - The application cannot function without this

**How to Get:**

1. Visit [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy and save the key immediately (you won't be able to see it again!)

**Pricing:**
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- GPT-4: ~$0.03 per 1K tokens
- Check current pricing: [openai.com/pricing](https://openai.com/pricing)

**Free Credits:**
- New accounts get $5 free credits
- Valid for 3 months

</details>

---

## 🚀 Installation Steps

### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/jai-nayani/CC2.git

# Or clone via SSH
git clone git@github.com:jai-nayani/CC2.git

# Navigate to project directory
cd CC2
```

**Verify:**
```bash
ls -la
# You should see: backend/, frontend/, README.md, etc.
```

---

### Step 2: Backend Installation

<details open>
<summary><b>📦 Install Dependencies</b></summary>

```bash
# Navigate to backend folder
cd backend

# Install all dependencies
npm install

# This will install:
# - Express.js
# - MongoDB/Mongoose
# - Socket.io
# - OpenAI SDK
# - JWT libraries
# - And more...
```

**Expected Output:**
```
added 150+ packages in 30s
```

**If you encounter errors:**
```bash
# Clear npm cache
npm cache clean --force

# Try again with legacy peer deps
npm install --legacy-peer-deps
```

</details>

<details open>
<summary><b>⚙️ Create Environment File</b></summary>

```bash
# Copy the example file
cp .env.example .env

# Open for editing
nano .env
# or
code .env  # if using VS Code
```

</details>

---

### Step 3: Frontend Installation

```bash
# Navigate to frontend folder (from project root)
cd ../frontend

# Install all dependencies
npm install

# This will install:
# - React & React DOM
# - Material-UI
# - Socket.io client
# - Axios
# - React Router
# - And more...
```

**Expected Output:**
```
added 200+ packages in 45s
```

---

## ⚙️ Configuration

### Backend Configuration (`.env`)

<details open>
<summary><b>📝 Complete Configuration Guide</b></summary>

Edit `backend/.env` with the following settings:

```env
# ====================================
# SERVER CONFIGURATION
# ====================================
PORT=5000
NODE_ENV=development

# ====================================
# DATABASE CONFIGURATION
# ====================================
# Local MongoDB (default)
MONGODB_URI=mongodb://localhost:27017/ai-chatbot-support

# MongoDB Atlas (cloud - optional)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-chatbot-support

# ====================================
# JWT CONFIGURATION
# ====================================
# IMPORTANT: Change this in production!
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRE=7d

# ====================================
# OPENAI CONFIGURATION
# ====================================
# REQUIRED: Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# ====================================
# CORS CONFIGURATION
# ====================================
FRONTEND_URL=http://localhost:3000
```

**Configuration Details:**

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | `5000` | ✅ Yes |
| `NODE_ENV` | Environment mode | `development` or `production` | ✅ Yes |
| `MONGODB_URI` | MongoDB connection string | See above | ✅ Yes |
| `JWT_SECRET` | Secret for JWT tokens | Min 32 chars, random | ✅ Yes |
| `JWT_EXPIRE` | Token expiration | `7d`, `24h`, etc. | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` | ✅ Yes |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | ✅ Yes |

</details>

<details>
<summary><b>🔐 Generating a Secure JWT Secret</b></summary>

**Option 1: Using OpenSSL**
```bash
openssl rand -base64 32
```

**Option 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 3: Online Generator**
- Visit [randomkeygen.com](https://randomkeygen.com/)
- Use a "CodeIgniter Encryption Key" (256-bit)

</details>

<details>
<summary><b>☁️ Using MongoDB Atlas (Cloud Database)</b></summary>

If you prefer a cloud database instead of local MongoDB:

1. **Create Account:** [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. **Create Cluster:** Free tier available (M0 Sandbox)
3. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
4. **Update `.env`:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-chatbot-support
   ```
5. **Whitelist IP:** Add your IP address in Atlas Security settings

</details>

### Frontend Configuration (`.env`)

The frontend `.env` file is already configured for local development:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

**Only modify these when deploying to production!**

---

## 🗄️ Database Setup

### Seed Sample Data

<details open>
<summary><b>🌱 Running the Seed Script</b></summary>

```bash
# Navigate to backend (if not already there)
cd backend

# Run the seed script
npm run seed
```

**Expected Output:**
```
🗑️  Clearing existing data...
👥 Creating users...
✅ Created 5 users
📚 Creating FAQs...
✅ Created 30 FAQs

╔════════════════════════════════════════════════════╗
║          Database Seeded Successfully!            ║
╚════════════════════════════════════════════════════╝

📊 Summary:
   - Users: 5
   - FAQs: 30
   - Categories: Account, Billing, Technical, Product, General

👤 Test Users:
   Admin:
     Email: admin@example.com
     Password: admin123

   Agent:
     Email: agent1@example.com
     Password: agent123

   Customer:
     Email: customer1@example.com
     Password: customer123
```

</details>

<details>
<summary><b>📋 What Gets Created</b></summary>

**Users (5 total):**
- 1 Admin user (full access)
- 2 Support Agents
- 2 Customers

**FAQs (30+ total):**
- **Account Category:** 5 FAQs
  - Creating accounts
  - Password reset
  - Profile updates
  - Account deletion
  - Email changes

- **Billing Category:** 6 FAQs
  - Payment methods
  - Billing history
  - Updating payment info
  - Refund policy
  - Discounts
  - Payment failures

- **Technical Category:** 6 FAQs
  - Chat loading issues
  - Browser support
  - Notifications
  - Performance
  - Bug reporting
  - Data security

- **Product Category:** 6 FAQs
  - Free plan features
  - AI functionality
  - Customization options
  - Plan comparisons
  - Integrations
  - Accuracy

- **General Category:** 6 FAQs
  - Contact support
  - Support hours
  - Training/tutorials
  - Providing feedback
  - Mobile app
  - Subscription changes

</details>

---

## 🏃 Running the Application

### Development Mode (Recommended)

**You need TWO terminal windows:**

<details open>
<summary><b>Terminal 1: Backend Server</b></summary>

```bash
# Navigate to backend
cd backend

# Start development server with auto-reload
npm run dev
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   AI Chatbot Support Portal - Backend Server          ║
║                                                        ║
║   Server running on port: 5000                        ║
║   Environment: development                             ║
║   Socket.io: Enabled                                   ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

MongoDB Connected: localhost:27017
```

**What's Running:**
- ✅ Express.js REST API
- ✅ Socket.io WebSocket server
- ✅ MongoDB connection
- ✅ Auto-reload on file changes (via nodemon)

</details>

<details open>
<summary><b>Terminal 2: Frontend Application</b></summary>

```bash
# Navigate to frontend (from project root)
cd frontend

# Start React development server
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view ai-chatbot-support-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
```

**What's Running:**
- ✅ React development server
- ✅ Hot module replacement
- ✅ Automatic browser refresh
- ✅ Opens browser automatically to `http://localhost:3000`

</details>

### Production Mode

<details>
<summary><b>🚀 Running in Production</b></summary>

**Backend:**
```bash
cd backend
npm start  # Uses node instead of nodemon
```

**Frontend:**
```bash
cd frontend
npm run build  # Creates optimized build
```

Then serve the `build/` folder with a static server (nginx, serve, etc.)

</details>

---

## ✅ Verification

### Check if Everything Works

<details open>
<summary><b>1️⃣ Verify Backend is Running</b></summary>

**Browser Test:**
Visit: [http://localhost:5000/health](http://localhost:5000/health)

**Expected Response:**
```json
{
  "success": true,
  "message": "AI Chatbot Support Portal API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Terminal Test:**
```bash
curl http://localhost:5000/health
```

</details>

<details open>
<summary><b>2️⃣ Verify Frontend is Running</b></summary>

**Browser should automatically open to:**
[http://localhost:3000](http://localhost:3000)

**You should see:**
- ✅ Login page with AI Chatbot Support Portal title
- ✅ Email and Password fields
- ✅ Demo credentials displayed
- ✅ Register link
- ✅ No console errors (check browser DevTools)

</details>

<details open>
<summary><b>3️⃣ Verify Database Connection</b></summary>

```bash
# Connect to MongoDB
mongosh ai-chatbot-support

# Check collections
show collections

# Should show:
# - users
# - faqs
# - conversations (empty initially)
# - messages (empty initially)
# - reports (empty initially)

# Check users count
db.users.countDocuments()
# Should return: 5

# Check FAQs count
db.faqs.countDocuments()
# Should return: 30+

# Exit
exit
```

</details>

<details open>
<summary><b>4️⃣ Test Login</b></summary>

1. Go to [http://localhost:3000](http://localhost:3000)
2. Use demo credentials:
   - **Email:** `customer1@example.com`
   - **Password:** `customer123`
3. Click "Sign In"

**Expected Result:**
- ✅ Redirects to `/customer` dashboard
- ✅ Shows conversation list sidebar
- ✅ Shows chat interface
- ✅ Can create new conversation

</details>

<details open>
<summary><b>5️⃣ Test AI Chat</b></summary>

1. Login as customer (see above)
2. Click "New Chat" button
3. Type a message: "How do I reset my password?"
4. Press Send

**Expected Result:**
- ✅ Your message appears on the right (blue)
- ✅ AI response appears on the left (white) within 3 seconds
- ✅ Response is relevant and helpful
- ✅ Typing indicator shows while AI is responding

</details>

---

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><b>❌ "Port 5000 already in use"</b></summary>

**Solution 1: Kill the process using port 5000**
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Solution 2: Change the port**
Edit `backend/.env`:
```env
PORT=5001  # Or any other available port
```

Don't forget to update frontend `.env` if you change the port!

</details>

<details>
<summary><b>❌ "Cannot connect to MongoDB"</b></summary>

**Check if MongoDB is running:**
```bash
# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod

# Try connecting manually
mongosh
```

**Start MongoDB if not running:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Check connection string in `.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/ai-chatbot-support
```

</details>

<details>
<summary><b>❌ "OpenAI API Error 401 Unauthorized"</b></summary>

**Causes:**
- Invalid API key
- Extra spaces in API key
- API key not set in `.env`

**Solution:**
1. Check `.env` file:
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```
2. Verify no spaces before/after the key
3. Restart backend server after changes
4. Test API key at [platform.openai.com/playground](https://platform.openai.com/playground)

</details>

<details>
<summary><b>❌ "npm install fails"</b></summary>

**Solution 1: Clear cache**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Solution 2: Use legacy peer deps**
```bash
npm install --legacy-peer-deps
```

**Solution 3: Update npm**
```bash
npm install -g npm@latest
```

</details>

<details>
<summary><b>❌ "Frontend shows blank page"</b></summary>

**Check browser console:**
- Press F12 or Cmd+Option+I
- Look for errors in Console tab

**Common fixes:**
```bash
# Clear frontend build
cd frontend
rm -rf node_modules build
npm install
npm start
```

**Check if backend is running:**
- Visit [http://localhost:5000/health](http://localhost:5000/health)

</details>

---

## 🎯 Next Steps

Once setup is complete:

1. **📚 Read the User Guide:** Learn how to use each feature
   - [USER_GUIDE.md](./USER_GUIDE.md)

2. **🏗️ Understand the Architecture:** See how it works
   - [ARCHITECTURE.md](./ARCHITECTURE.md)

3. **✨ Explore Features:** Discover all capabilities
   - [FEATURES.md](./FEATURES.md)

4. **🚀 Deploy to Production:** Make it live
   - See deployment section in [README.md](../README.md#-deployment-guide)

---

<div align="center">

### 🎉 Setup Complete!

Your AI Chatbot Support Portal is ready to use!

[![Start Using](https://img.shields.io/badge/→%20User%20Guide-Read%20Next-success?style=for-the-badge)](./USER_GUIDE.md)
[![Back to README](https://img.shields.io/badge/←%20Back%20to-README-blue?style=for-the-badge)](../README.md)

**Need Help?** Check the [Troubleshooting](#-troubleshooting) section above or [open an issue](https://github.com/jai-nayani/CC2/issues)

</div>
