const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/social_media_app')
    .then(async () => {
        console.log('Connected to DB');
        const users = await User.find({});
        console.log('--- USERS ---');
        users.forEach(u => console.log(`ID: ${u._id}, Username: ${u.username}`));
        console.log('--- END ---');
        mongoose.connection.close();
    })
    .catch(err => console.error(err));
