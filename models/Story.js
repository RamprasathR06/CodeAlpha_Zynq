const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    image: { type: String }, // Legacy local path
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24h
});

module.exports = mongoose.model('Story', storySchema);
