# Zynq - Social Media Application

A modern, full-stack social media platform built with **Node.js**, **Express**, **MongoDB**, and vanilla **JavaScript**. Zynq features real-time interactions, media sharing via Cloudinary, and an elegant dark-themed UI with purple accents.

![Zynq Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node.js](https://img.shields.io/badge/node.js-18%2B-green)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-success)
![Status](https://img.shields.io/badge/status-Active-brightgreen)

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Architecture](#database-architecture)
- [Cloudinary Integration](#cloudinary-integration)
- [API Endpoints](#api-endpoints)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [UI/UX Features](#uiux-features)
- [Recent Improvements](#recent-improvements)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

**Zynq** is a feature-rich social media platform that enables users to:
- Create and manage posts with media content
- Engage through likes, comments, and shares
- Build friend networks and send direct messages
- Share stories that auto-expire after 24 hours
- Receive real-time notifications
- Save favorite posts
- Experience intelligent media autoplay while scrolling

The application prioritizes **user experience** with a beautiful dark theme, smooth animations, and responsive design optimized for desktop and mobile devices.

---

## ✨ Features

### Core Social Features
- **User Authentication**: Register and login with secure password handling
- **Post Creation**: Share text content with optional image/video media
- **Interactions**: Like, comment, share, and save posts
- **User Profiles**: View user information, follower counts, and post galleries
- **Friend System**: Send/accept friend requests and manage connections
- **Direct Messaging**: Private text and media messaging between friends
- **Stories**: Temporary 24-hour media sharing with auto-deletion
- **Notifications**: Real-time alerts for likes, comments, shares, and friend requests

### Media Features
- **Image & Video Support**: Upload up to 100MB per file
- **Cloudinary Integration**: Cloud-based storage with automatic optimization
- **Intelligent Autoplay**: Videos auto-play when visible during scroll, pause when off-screen
- **Multiple Formats**: JPG, PNG, GIF, WebP (images) | MP4, MOV, AVI, WebM (videos)

### UI/UX Features
- **Dark Theme**: Eye-friendly interface with #0f172a background
- **Glassmorphism Design**: Modern frosted glass effect on cards
- **Smooth Animations**: Transitions and hover effects throughout
- **Responsive Layout**: 3-column grid (sidebar | feed | sidebar)
- **Compact Post Grid**: Uniform 160px square cards for profile galleries
- **Professional Header**: Search box, notifications, user menu
- **Right Sidebar**: Trending topics and friend suggestions

---

## 🛠️ Tech Stack

### Backend
- **Node.js** (18+) - JavaScript runtime
- **Express.js** (4.18.2) - Web framework
- **MongoDB** (8.0) - NoSQL database
- **Mongoose** (8.0.0) - ODM for MongoDB
- **Cloudinary** (1.41.3) - Image/video cloud storage
- **Multer** (2.0.2) - File upload middleware
- **Multer-Storage-Cloudinary** (4.0.0) - Cloudinary storage integration

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling (1745+ lines)
- **Vanilla JavaScript** (1465+ lines) - No framework dependencies
- **Intersection Observer API** - Smart media autoplay
- **Fetch API** - Asynchronous HTTP requests

### Development Tools
- **Nodemon** (3.0.0) - Auto-restart on file changes
- **dotenv** (17.2.3) - Environment variable management

---

## 📁 Project Structure

```
Zynq/
├── server.js                    # Express server & API routes (637 lines)
├── package.json                 # Dependencies & scripts
├── .env                         # Environment variables (Cloudinary, MongoDB, PORT)
├── models/                      # MongoDB Schemas
│   ├── User.js                  # User model with authentication & relationships
│   ├── Post.js                  # Post model with media & interactions
│   ├── Message.js               # Direct messaging model
│   ├── Story.js                 # 24-hour auto-expiring stories
│   └── Notification.js          # Notification system
├── public/                      # Frontend assets
│   ├── index.html               # Single-page app (475 lines)
│   ├── js/
│   │   └── main.js              # All frontend logic (1465+ lines)
│   │       ├── Auth system
│   │       ├── Post rendering & autoplay
│   │       ├── User interactions
│   │       ├── Messaging system
│   │       ├── Notification handling
│   │       └── Profile management
│   ├── css/
│   │   └── style.css            # Complete styling (1745 lines)
│   │       ├── Dark theme (#0f172a)
│   │       ├── Purple accent (#a855f7)
│   │       ├── Glassmorphism effects
│   │       ├── Responsive grid layouts
│   │       └── Smooth transitions
│   └── assets/
│       └── uploads/             # Local upload fallback
├── debug_db.js                  # Database debugging utility
├── debug_users.js               # User data debugging
├── fix_friends.js               # Data migration utility
├── id_check.js                  # ID validation utility
├── verify_auth.js               # Authentication verification
└── temp_users.json              # Temporary user data

```

---

## 🗄️ Database Architecture

### MongoDB Connection
```javascript
mongodb://127.0.0.1:27017/social_media_app
```

### Data Models

#### **1. User Schema**
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (plain text - consider hashing in production),
  age: Number (required),
  friends: [ObjectId] - Array of friend user IDs,
  friendRequests: [{
    from: ObjectId,
    status: String ('pending', 'accepted', 'rejected')
  }],
  savedPosts: [ObjectId] - Array of saved post IDs,
  createdAt: Date
}
```

**Key Features:**
- Friend relationship management
- Friend request system with status tracking
- Saved posts collection
- Timestamps for account creation

---

#### **2. Post Schema**
```javascript
{
  user: ObjectId (ref: 'User', required) - Post creator,
  content: String - Post text content,
  mediaUrl: String - Cloudinary URL,
  mediaType: String ('image' | 'video'),
  image: String - Legacy local path,
  likes: [ObjectId] - User IDs who liked,
  comments: [{
    user: ObjectId (ref: 'User'),
    text: String,
    createdAt: Date
  }],
  shares: [ObjectId] - User IDs who reposted,
  viewedBy: [ObjectId] - User IDs who viewed,
  createdAt: Date
}
```

**Key Features:**
- Media support (images & videos)
- Like/unlike functionality
- Nested comments system
- View count tracking
- Repost/share tracking

---

#### **3. Message Schema**
```javascript
{
  sender: ObjectId (ref: 'User', required),
  receiver: ObjectId (ref: 'User', required),
  content: String - Message text,
  mediaUrl: String - Cloudinary URL for images/videos,
  mediaType: String ('image' | 'video'),
  replyTo: ObjectId (ref: 'Message') - Thread reply,
  createdAt: Date
}
```

**Key Features:**
- Direct messaging between users
- Media sharing in messages
- Message threading/replies
- Chronological ordering

---

#### **4. Story Schema**
```javascript
{
  user: ObjectId (ref: 'User', required) - Story creator,
  mediaUrl: String - Cloudinary URL,
  mediaType: String ('image' | 'video'),
  image: String - Legacy local path,
  viewers: [ObjectId] - User IDs who viewed,
  createdAt: Date (expires: 86400) - Auto-deletes after 24 hours
}
```

**Key Features:**
- Temporary media with TTL (time-to-live)
- Automatic deletion after 24 hours
- Viewer tracking
- Expiring document with MongoDB TTL index

---

#### **5. Notification Schema**
```javascript
{
  to: ObjectId (ref: 'User', required) - Recipient,
  from: ObjectId (ref: 'User', required) - Sender,
  type: String - 'like' | 'comment' | 'repost' | 'friend_request',
  post: ObjectId (ref: 'Post') - Related post,
  read: Boolean (default: false),
  createdAt: Date
}
```

**Key Features:**
- Multiple notification types
- Read/unread status
- Post-related notifications
- Activity tracking

---

## ☁️ Cloudinary Integration

### Configuration
```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

### Storage Setup
**Multer-Storage-Cloudinary** automatically handles:
- File upload to Cloudinary cloud
- Folder organization: `zynq_media/`
- Resource type detection (image vs video)
- Chunk-based upload for large files (6MB chunks for videos)

### Upload Configuration
```javascript
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'zynq_media',
    resource_type: isVideo ? 'video' : 'image',
    allowed_formats: isVideo 
      ? ['mp4', 'mov', 'avi', 'webm'] 
      : ['jpg', 'png', 'jpeg', 'gif', 'webp'],
    chunk_size: isVideo ? 6000000 : undefined, // 6MB chunks
    timeout: 120000 // 2 minutes
  })
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});
```

### File Formats Supported
**Images:**
- JPG, JPEG
- PNG
- GIF
- WebP

**Videos:**
- MP4 (most common)
- MOV (Apple)
- AVI (legacy)
- WebM (web-optimized)

### Media Storage Locations
1. **Posts**: `https://res.cloudinary.com/{cloud_name}/image/upload/zynq_media/{filename}`
2. **Stories**: Same folder, auto-deleted after 24h
3. **Messages**: Same CDN endpoint
4. **User Avatars**: Can store as base64 or Cloudinary (currently using initials)

### Benefits
✅ **Unlimited Bandwidth** - No storage limits  
✅ **Automatic Optimization** - Images/videos optimized on-the-fly  
✅ **Global CDN** - Fast delivery worldwide  
✅ **Version Control** - Track media versions  
✅ **Security** - Private URLs with signed tokens  
✅ **Advanced Transformations** - Resize, crop, compress  

---

## 🔌 API Endpoints

### Authentication
```
POST /api/register
  Body: { username, email, password, age }
  Response: { success, message }

POST /api/login
  Body: { username, password }
  Response: { success, message, user: { _id, username } }
```

### Posts
```
GET /api/posts
  Response: { success, posts: [...] }

POST /api/posts
  Body: { userId, content, image (file) }
  File: Uploaded to Cloudinary
  Response: { success, post }

DELETE /api/posts/:id
  Body: { userId }
  Response: { success, message }

POST /api/posts/:id/like
  Body: { userId }
  Response: { success, message }

POST /api/posts/:id/comment
  Body: { userId, text }
  Response: { success, comment }

POST /api/posts/:id/share
  Body: { userId }
  Response: { success, message }

GET /api/posts/:id/views
  Response: { success, count }
```

### Users
```
GET /api/users/:id
  Response: { success, user }

GET /api/users
  Response: { success, users: [...] }

POST /api/users/friends/request
  Body: { fromId, toId }
  Response: { success, message }

GET /api/users/:id/friends
  Response: { success, friends: [...] }
```

### Messages
```
GET /api/messages/:userId
  Response: { success, messages: [...] }

POST /api/messages
  Body: { sender, receiver, content, image (file) }
  Response: { success, message }
```

### Stories
```
GET /api/stories
  Response: { success, stories: [...] }

POST /api/stories
  Body: { userId, image (file) }
  Response: { success, story }

DELETE /api/stories/:id
  Response: { success, message }
```

### Notifications
```
GET /api/notifications?userId=:id
  Response: { success, notifications: [...] }

POST /api/notifications/:id/read
  Response: { success, message }
```

---

## 💻 Installation & Setup

### Prerequisites
- **Node.js** 18.x or higher
- **MongoDB** (local or Atlas connection)
- **Cloudinary** account (free tier available)
- **npm** or **yarn**

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd Zynq
```

### Step 2: Install Dependencies
```bash
npm install
```

Installed packages:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `cloudinary` - Cloud storage SDK
- `multer` - File upload
- `multer-storage-cloudinary` - Cloudinary storage driver
- `dotenv` - Environment variables
- `nodemon` - Dev dependency for auto-reload

### Step 3: MongoDB Setup

**Option A: Local MongoDB**
```bash
# Ensure MongoDB is running
mongod
```

**Option B: MongoDB Atlas**
```bash
# Create cluster at https://www.mongodb.com/cloud/atlas
# Get connection string from cluster settings
```

### Step 4: Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### Step 5: Environment Configuration
See [Environment Variables](#environment-variables) section below

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```dotenv
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=3002

# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/social_media_app

# Optional: MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social_media_app?retryWrites=true&w=majority
```

### Getting Credentials

**Cloudinary:**
1. Visit [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy Cloud Name, API Key, API Secret
3. Paste into `.env`

**MongoDB Local:**
```bash
# Default local connection string
mongodb://127.0.0.1:27017/social_media_app
```

**MongoDB Atlas:**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster (M0 free tier available)
3. Click "Connect" → "Connect your application"
4. Copy connection string and replace `<password>` and `<username>`

---

## 🚀 Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

Uses **nodemon** to automatically restart server on file changes.

### Production Mode
```bash
npm start
```

Runs `node server.js` directly.

### Default Access
```
http://localhost:3002
```

The application serves static files from `public/` directory and uses index.html as the SPA entry point.

### Initial Data
```bash
# Optional: Run seed scripts to populate test data
node debug_users.js
node debug_db.js
```

---

## 🎨 UI/UX Features

### Design System

**Color Palette:**
- Primary Background: `#0f172a` (Deep Blue)
- Secondary Background: `#1e293b` (Slate)
- Accent Color: `#a855f7` (Purple)
- Text Primary: `#f1f5f9` (Off White)
- Text Secondary: `#94a3b8` (Slate Gray)

**Typography:**
- Font Stack: System fonts (sans-serif)
- Headings: 1.5rem - 2rem
- Body: 0.95rem - 1rem
- Code: Monospace

### Layout Architecture

**3-Column Grid:**
```
┌─────────────────────────────────────────┐
│            Header (Search, Notifications)│
├────────────┬──────────────┬─────────────┤
│  Sidebar   │     Feed     │   Sidebar   │
│  (280px)   │    (1fr)     │   (320px)   │
│            │              │             │
│ Navigation │   Posts      │ Trending    │
│ Profile    │   Stories    │ Friends     │
│            │   Messages   │             │
└────────────┴──────────────┴─────────────┘
```

### Component Features

**Post Cards:**
- Full-width in feed (1.5rem padding)
- Compact grid in profiles (160px squares)
- Image/video media support
- Action buttons (like, comment, share, save)
- User avatar with color-coded initials
- Timestamp display
- View counter

**Post Grid (Profile):**
- Uniform 160px × 160px squares
- Aspect ratio 1:1 (square images)
- Object-fit cover (no distortion)
- Scale effect on hover (1.02×)
- Purple glow shadow
- Smooth transitions

**Interactive Elements:**
- Hover state animations
- Smooth scrolling
- Glass morphism backgrounds
- Backdrop blur effects
- Subtle shadows

### Recent UI Improvements (Latest Build)

**Compact Post Grid:**
- Reduced from 200px to 160px grid cards
- Improved uniform sizing across all posts
- Better visual hierarchy

**Intelligent Autoplay:**
- Videos auto-play when scrolled into view
- Pause and reset when scrolled away
- Threshold: 50% visibility
- Muted by default (required for autoplay)
- Smooth playback with `playsinline`

**Responsive Design:**
- Mobile-first approach
- Tablet optimization
- Desktop multi-column layout
- Flexible grid gaps and padding
- Touch-friendly button sizes

---

## 📈 Recent Improvements

### Version 1.0.0 - Current

#### UI Enhancements
✅ Compact uniform post grid cards (160px)  
✅ Post grid consistent sizing across feed and profiles  
✅ Improved hover animations with purple glow effects  
✅ Reduced spacing and padding for modern look  

#### Media & Performance
✅ Intelligent video autoplay on scroll  
✅ Video pause when scrolled out of view  
✅ Reset video playback position on pause  
✅ Muted video by default for autoplay compatibility  
✅ Mobile-optimized with `playsinline`  

#### Technical
✅ Intersection Observer API for viewport detection  
✅ Cloudinary integration for scalable media storage  
✅ MongoDB TTL indexes for auto-expiring stories  
✅ Real-time notifications system  
✅ Friend request management  

#### Frontend Architecture
✅ Single-file JavaScript (1465+ lines)  
✅ No framework dependencies  
✅ Vanilla CSS (1745 lines)  
✅ Semantic HTML5  
✅ Fetch API for all HTTP requests  

---

## 🐛 Troubleshooting

### Server Won't Start

**Issue:** "Cannot find module" errors
```bash
# Solution: Reinstall dependencies
npm install
```

**Issue:** Port 3002 already in use
```bash
# Change PORT in .env or kill process
# Linux/Mac: lsof -ti:3002 | xargs kill -9
# Windows: netstat -ano | findstr :3002
```

**Issue:** MongoDB connection error
```
Error: "connect ECONNREFUSED 127.0.0.1:27017"
```
**Solutions:**
- Ensure MongoDB is running: `mongod`
- Check MongoDB URI in `.env`
- Verify MongoDB installation

### Cloudinary Upload Issues

**Issue:** "Invalid API credentials"
```javascript
// In server.js logs, check:
console.log('[Cloudinary] Config loaded:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key_present: !!process.env.CLOUDINARY_API_KEY,
  api_secret_present: !!process.env.CLOUDINARY_API_SECRET
});
```

**Solution:**
- Verify `.env` file credentials
- Check Cloudinary dashboard for correct values
- Ensure `.env` is in root directory

**Issue:** "File too large"
```
Error: Entity too large (> 100MB)
```

**Solution:**
- Check file size limit in `server.js` (currently 100MB)
- Compress video before upload
- Use Cloudinary's compression options

### Login/Auth Issues

**Issue:** "Invalid credentials" message
- Verify username/password are correct
- Check MongoDB has users: `db.users.find()`
- Run `npm run dev` to restart server

**Issue:** Session persists after logout
```javascript
// Clear localStorage manually
localStorage.clear();
location.reload();
```

### Media Not Displaying

**Issue:** Images/videos show broken links
1. Check Cloudinary URL format
2. Verify `mediaUrl` field in database
3. Check browser Network tab for failed requests
4. Verify Cloudinary credentials are correct

**Issue:** Autoplay not working
- Check if videos have `muted` attribute
- Verify `playsinline` attribute
- Check browser autoplay policies
- Try a different video format (MP4 recommended)

### Performance Issues

**Issue:** Slow post loading
```javascript
// Check database indexes
db.posts.createIndex({ user: 1 })
db.posts.createIndex({ createdAt: -1 })
```

**Issue:** Large memory usage
- Close browser dev tools
- Clear browser cache
- Restart Node.js server
- Check for memory leaks in console

---

## 🔮 Future Enhancements

### Planned Features

**Authentication & Security**
- [ ] JWT-based authentication
- [ ] Password hashing (bcrypt)
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] OAuth social login (Google, GitHub, Facebook)

**Social Features**
- [ ] User blocks/reports
- [ ] Post collections/playlists
- [ ] Advanced search with filters
- [ ] Trending hashtags
- [ ] User mentions (@username)
- [ ] Post scheduling
- [ ] Collaborative posts

**Messaging**
- [ ] Group conversations
- [ ] Message encryption
- [ ] Voice/video call integration
- [ ] Message reactions
- [ ] Typing indicators

**Performance**
- [ ] Image lazy loading
- [ ] Pagination for feeds
- [ ] Infinite scroll implementation
- [ ] IndexedDB caching
- [ ] Service workers for offline support

**Backend**
- [ ] GraphQL API
- [ ] WebSocket for real-time updates
- [ ] Rate limiting
- [ ] Request validation middleware
- [ ] Error handling middleware
- [ ] Logging system

**Testing**
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Cypress)
- [ ] Load testing (Artillery)

**DevOps**
- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Deployment to AWS/Heroku
- [ ] Environment-based configs
- [ ] Automated backups

---

## 📄 File Descriptions

| File | Purpose | Lines |
|------|---------|-------|
| `server.js` | Express server, routes, Cloudinary config | 637 |
| `public/js/main.js` | Frontend logic, DOM manipulation, API calls | 1465+ |
| `public/css/style.css` | Complete application styling | 1745 |
| `public/index.html` | Single-page app markup | 475 |
| `models/User.js` | User schema, auth, relationships | - |
| `models/Post.js` | Post schema, media, interactions | - |
| `models/Message.js` | Message schema, direct messaging | - |
| `models/Story.js` | Story schema, auto-expiring content | - |
| `models/Notification.js` | Notification schema, alerts | - |
| `.env` | Environment variables | - |
| `package.json` | Dependencies, scripts | - |

---

## 📞 Support

For issues, questions, or suggestions:

1. **Check Troubleshooting** section above
2. **Review Server Logs** for error messages
3. **Check Browser Console** for frontend errors
4. **Verify Environment Variables** are set correctly
5. **Restart MongoDB and Node.js** server

---

## 🎉 Happy Coding!

Start building your social network with Zynq!

```bash
npm install && npm start
```

Visit: http://localhost:3002

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**Status:** Active Development
