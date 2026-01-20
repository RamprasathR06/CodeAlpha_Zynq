const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    mediaUrl: { type: String }, // Cloudinary URL
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    image: { type: String }, // Legacy local path support
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
