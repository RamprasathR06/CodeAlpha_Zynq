const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');
const Post = require('./models/Post');
const Story = require('./models/Story');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Verify uploads directory
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('[Cloudinary] Config loaded:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'MISSING',
  api_key_present: !!process.env.CLOUDINARY_API_KEY,
  api_secret_present: !!process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    try {
      const isVideo = file.mimetype.startsWith('video');
      console.log(`[Cloudinary] Processing ${isVideo ? 'video' : 'image'}: ${file.originalname}`);
      return {
        folder: 'zynq_media',
        resource_type: isVideo ? 'video' : 'image',
        allowed_formats: isVideo ? ['mp4', 'mov', 'avi', 'webm'] : ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        chunk_size: isVideo ? 6000000 : undefined, // 6MB chunks for videos
        timeout: 120000 // 2 minute timeout
      };
    } catch (error) {
      console.error('[Cloudinary] Error in params:', error);
      throw error;
    }
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

const app = express();
app.use(express.json()); // Enable JSON body parsing
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3002;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/social_media_app')
  .then(() => console.log('Connected to MongoDB Successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, age } = req.body;
    // Simple validation check
    if (!username || !email || !password || !age) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const newUser = new User({ username, email, password, age });
    await newUser.save();
    res.status(201).json({ success: true, message: 'Registration successful' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || user.password !== password) { // Plain text comparison for now
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, message: 'Login successful', user: { _id: user._id, username: user.username } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Post Routes
app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const { userId, content } = req.body;
    console.log(`POST /api/posts: userId="${userId}", content="${content}"`);

    if (!userId || userId === 'null' || userId === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid User ID' });
    }

    let mediaUrl = null;
    let mediaType = 'image';
    if (req.file) {
      console.log('File detected:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        path: req.file.path // This should be the Cloudinary URL
      });
      mediaUrl = req.file.path;
      mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
      console.log(`✅ Upload successful! ${mediaType} URL: ${mediaUrl}`);
    } else {
      console.log('No file received in request');
    }

    // Verify User
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User ID ${userId} not found in DB`);
      return res.status(404).json({ success: false, message: 'User not found in database' });
    }

    const newPost = new Post({ user: userId, content, mediaUrl, mediaType });
    await newPost.save();

    // Populate user details for immediate display
    await newPost.populate('user', 'username');

    res.json({ success: true, post: newPost });
  } catch (err) {
    console.error('Create Post Error - Full details:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message, stack: err.stack });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check ownership
    if (post.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this post' });
    }

    // Delete associated media from Cloudinary
    if (post.mediaUrl) {
      const publicId = post.mediaUrl.split('/').pop().split('.')[0];
      const folder = 'zynq_media/';
      // Assuming public ID includes folder if configured that way, or just use the ID
      // Cloudinary usually returns the full URL. Extracting ID can be tricky if folders are used.
      // But since we use folder: 'zynq_media', the public ID in Cloudinary is zynq_media/filename

      const fullPublicId = `zynq_media/${publicId}`;
      await cloudinary.uploader.destroy(fullPublicId, { resource_type: post.mediaType });
    }

    // Delete related notifications
    await Notification.deleteMany({ post: post._id });

    // Remove from savedPosts for all users
    await User.updateMany(
      { savedPosts: post._id },
      { $pull: { savedPosts: post._id } }
    );

    // Finally delete the post
    await Post.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete Post Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username')
      .populate('comments.user', 'username')
      .sort({ createdAt: -1 }); // Newest first
    res.json({ success: true, posts });
  } catch (err) {
    console.error('Fetch Posts Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Like/Unlike Post
app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const likeIndex = post.likes.indexOf(userId);
    let isLiked = false;
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1); // Unlike
    } else {
      post.likes.push(userId); // Like
      isLiked = true;
      // Create notification for owner (if not the same person)
      if (post.user.toString() !== userId.toString()) {
        await Notification.create({
          to: post.user,
          from: userId,
          type: 'like',
          post: post._id
        });
      }
    }
    await post.save();
    res.json({ success: true, likesCount: post.likes.length, isLiked });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Comment on Post
app.post('/api/posts/:id/comment', async (req, res) => {
  try {
    const { userId, text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();

    // Create notification for owner
    if (post.user.toString() !== userId.toString()) {
      await Notification.create({
        to: post.user,
        from: userId,
        type: 'comment',
        post: post._id
      });
    }

    // Repopulate to return with user info
    const updatedPost = await Post.findById(post._id).populate('comments.user', 'username');
    res.json({ success: true, comments: updatedPost.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Share/Repost Post (Toggle)
app.post('/api/posts/:id/share', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const shareIndex = post.shares.findIndex(id => id.toString() === userId.toString());
    let isShared = false;

    if (shareIndex > -1) {
      // Already shared, so remove it (un-repost)
      post.shares.splice(shareIndex, 1);
      isShared = false;
    } else {
      // Not shared, so add it (repost)
      post.shares.push(userId);
      isShared = true;

      // Create notification for owner
      if (post.user.toString() !== userId.toString()) {
        await Notification.create({
          to: post.user,
          from: userId,
          type: 'repost',
          post: post._id
        });
      }
    }

    await post.save();
    res.json({ success: true, sharesCount: post.shares.length, isShared });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Increment Post Views (Unique)
app.post('/api/posts/:id/view', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Only add if userId provided and not already in viewedBy
    if (userId && !post.viewedBy.includes(userId)) {
      post.viewedBy.push(userId);
      await post.save();
    }

    res.json({ success: true, views: post.viewedBy.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save/Unsave Post
app.post('/api/posts/:id/save', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const saveIndex = user.savedPosts.indexOf(req.params.id);
    let isSaved = false;
    if (saveIndex > -1) {
      user.savedPosts.splice(saveIndex, 1);
      isSaved = false;
    } else {
      user.savedPosts.push(req.params.id);
      isSaved = true;
    }
    await user.save();
    res.json({ success: true, isSaved });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Saved Posts
app.get('/api/users/:userId/saved', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate({
      path: 'savedPosts',
      populate: { path: 'user', select: 'username' }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, savedPosts: user.savedPosts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get User Activity
app.get('/api/users/:userId/activity', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find posts user has liked
    const likedPosts = await Post.find({ likes: userId }).populate('user', 'username').sort({ createdAt: -1 });

    // Find posts user has commented on (using $elemMatch for deeper array check if needed, but simple is fine here)
    const commentedPosts = await Post.find({ 'comments.user': userId }).populate('user', 'username').sort({ createdAt: -1 });

    // Find posts user has viewed
    const viewedPosts = await Post.find({ viewedBy: userId }).populate('user', 'username').sort({ createdAt: -1 });

    res.json({
      success: true,
      liked: likedPosts,
      commented: commentedPosts,
      viewed: viewedPosts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- Story Routes ---

// Create Story
app.post('/api/stories', upload.single('image'), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Image is required' });

    const newStory = new Story({
      user: userId,
      mediaUrl: req.file.path,
      mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image'
    });
    await newStory.save();
    res.status(201).json({ success: true, story: newStory });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Stories (Own + Friends)
app.get('/api/stories', async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const userIds = [userId, ...user.friends];
    const stories = await Story.find({ user: { $in: userIds } })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, stories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- Friend System Routes ---

// Search Users
app.get('/api/users/search', async (req, res) => {
  try {
    const { query, userId } = req.query;
    if (!query) return res.json({ success: true, users: [] });

    console.log(`Search request: query="${query}", userId="${userId}"`);

    let searchCriteria = {
      username: { $regex: query, $options: 'i' }
    };

    if (userId && userId !== 'null' && userId !== 'undefined') {
      try {
        // Validate if userId is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(userId)) {
          searchCriteria._id = { $ne: userId };
        } else {
          console.warn('Invalid userId format for search exclusion:', userId);
        }
      } catch (e) {
        console.error('Error constructing search criteria:', e);
      }
    }

    console.log('Search Criteria:', searchCriteria);
    const users = await User.find(searchCriteria).select('username _id friends');
    console.log(`Found ${users.length} users`);
    res.json({ success: true, users });
  } catch (err) {
    console.error('Search Users Error Details:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// Get User Profile
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Get simple stats
    const postsCount = await Post.countDocuments({ user: user._id });

    res.json({ success: true, user: { ...user.toObject(), postsCount } });
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send Friend Request
app.post('/api/friends/request', async (req, res) => {
  try {
    const { fromId, toId } = req.body;

    const targetUser = await User.findById(toId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if already friends or requested
    if (targetUser.friends.some(fId => fId.toString() === fromId.toString())) {
      return res.status(400).json({ success: false, message: 'Already friends' });
    }
    const existingRequest = targetUser.friendRequests.find(r => r.from.toString() === fromId.toString());
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Request already sent' });
    }

    targetUser.friendRequests.push({ from: fromId });
    await targetUser.save();

    res.json({ success: true, message: 'Friend request sent' });
  } catch (err) {
    console.error('Friend Request Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Notifications (Combined Friend Requests + Interactions)
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'UserId required' });

    // 1. Get friend requests from User model
    const user = await User.findById(userId).populate('friendRequests.from', 'username');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 2. Get interaction notifications from Notification model
    const notifications = await Notification.find({ to: userId })
      .populate('from', 'username')
      .populate('post', 'content')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests: user.friendRequests,
      alerts: notifications
    });
  } catch (err) {
    console.error('Fetch Notifications Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Accept Friend Request
app.post('/api/friends/accept', async (req, res) => {
  try {
    const { userId, requestId, fromId } = req.body;
    const user = await User.findById(userId);
    const sender = await User.findById(fromId);

    if (!user || !sender) return res.status(404).json({ success: false, message: 'User not found' });

    // Add to friends lists
    user.friends.push(fromId);
    sender.friends.push(userId);

    // Remove request
    user.friendRequests = user.friendRequests.filter(r => r._id.toString() !== requestId);

    await user.save();
    await sender.save();

    res.json({ success: true, message: 'Friend request accepted' });
  } catch (err) {
    console.error('Accept Request Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get User's Friends
app.get('/api/users/:userId/friends', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('friends', 'username');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, friends: user.friends });
  } catch (err) {
    console.error('Get Friends Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- Chat Routes ---

// Get Messages between two users
app.get('/api/messages/:userId/:otherUserId', async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
      .sort({ createdAt: 1 }) // Oldest first
      .populate('replyTo');

    res.json({ success: true, messages });
  } catch (err) {
    console.error('Get Messages Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send Message
app.post('/api/messages', upload.single('image'), async (req, res) => {
  try {
    const { sender, receiver, content, replyTo } = req.body;
    let mediaUrl = null;
    let mediaType = 'image';
    if (req.file) {
      mediaUrl = req.file.path;
      mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    const newMessage = new Message({
      sender,
      receiver,
      content,
      mediaUrl,
      mediaType,
      replyTo: replyTo || null
    });

    await newMessage.save();
    await newMessage.populate('replyTo');

    res.json({ success: true, message: newMessage });
  } catch (err) {
    console.error('Send Message Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
