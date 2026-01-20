const mongoose = require('mongoose');
const User = require('./models/User');

async function checkIDs() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/social_media_app');
        const users = await User.find({});
        console.log('--- GRANULAR DB CHECK ---');
        users.forEach(u => {
            console.log(`Username: ${u.username}`);
            console.log(`  _id: ${u._id} (Type: ${typeof u._id})`);
            console.log(`  _id stringified: ${JSON.stringify(u._id)}`);
            console.log(`  Friends: ${JSON.stringify(u.friends)}`);
            console.log(`  Requests: ${JSON.stringify(u.friendRequests)}`);
            console.log('---');
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkIDs();
