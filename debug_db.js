const mongoose = require('mongoose');
const User = require('./models/User');

async function debugDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/social_media_app');
        console.log('--- DATABASE STATUS ---');
        const users = await User.find({});
        console.log(`Total Users: ${users.length}`);
        for (const u of users) {
            console.log(`\nUser: ${u.username}`);
            console.log(`  _id: ${u._id}`);
            console.log(`  Friends: [${u.friends.join(', ')}]`);
            console.log(`  Requests: [${u.friendRequests.map(r => r.from).join(', ')}]`);
        }
        console.log('\n------------------------');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugDB();
