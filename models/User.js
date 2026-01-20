const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, default: 'pending' } // pending, accepted, rejected
    }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
