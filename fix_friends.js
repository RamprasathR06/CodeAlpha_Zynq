const mongoose = require('mongoose');
const User = require('./models/User');

async function fixFriends() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/social_media_app');

        const ram = await User.findOne({ username: /Ram/i });
        const saritha = await User.findOne({ username: /Saritha/i });

        if (!ram || !saritha) {
            console.log(`Missing user. Ram: ${!!ram}, Saritha: ${!!saritha}`);
            process.exit(0);
        }

        console.log(`Ram ID: ${ram._id}`);
        console.log(`Saritha ID: ${saritha._id}`);

        // Ensure they are friends
        if (!ram.friends.includes(saritha._id)) {
            ram.friends.push(saritha._id);
            await ram.save();
            console.log('Added Saritha to Ram friends');
        } else {
            console.log('Saritha already in Ram friends');
        }

        if (!saritha.friends.includes(ram._id)) {
            saritha.friends.push(ram._id);
            await saritha.save();
            console.log('Added Ram to Saritha friends');
        } else {
            console.log('Ram already in Saritha friends');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixFriends();
