const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'comment', 'repost', 'friend_request'], required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
