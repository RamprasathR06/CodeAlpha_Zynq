# 🚀 Quick Start Guide for Zynq

## After Cloning from GitHub

### 1. Install Dependencies
```bash
npm install
```

This will install all required packages:
- Express.js
- MongoDB/Mongoose
- Cloudinary
- Multer
- And more...

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```dotenv
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dnpvypn98
CLOUDINARY_API_KEY=193229757342251
CLOUDINARY_API_SECRET=Et5VhmvwxVqpgrCU3YzhEF039A4

# Server Port
PORT=3002

# MongoDB Connection
MONGODB_URI=mongodb://127.0.0.1:27017/social_media_app

# For MongoDB Atlas (optional)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social_media_app?retryWrites=true&w=majority
```

⚠️ **IMPORTANT:** The `.env` file is in `.gitignore` for security. You must create it locally after cloning.

### 3. Ensure MongoDB is Running

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
- Use connection string in `.env`

### 4. Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### 5. Access the Application
```
http://localhost:3002
```

---

## 📁 Project Structure

```
Zynq/
├── server.js              # Express server & API
├── models/                # MongoDB schemas
├── public/                # Frontend assets
│   ├── index.html
│   ├── js/main.js
│   └── css/style.css
├── .env                   # Environment variables (create this)
├── .gitignore
├── package.json
└── README.md             # Full documentation
```

---

## 🆘 Troubleshooting

### "Cannot find module" Error
```bash
npm install
```

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB with `mongod`

### Cloudinary Upload Issues
- Verify `.env` has correct credentials
- Check Cloudinary dashboard for API keys
- Ensure file size < 100MB

### Port Already in Use
Change `PORT` in `.env` to a different port (e.g., 3003)

---

## 📝 Important Notes

1. **`.env` file is NOT in Git** - Create it locally after cloning
2. **Credentials are sensitive** - Never commit `.env` to version control
3. **MongoDB must be running** - Local or Atlas connection required
4. **Cloudinary account needed** - Sign up at https://cloudinary.com
5. **Node.js 18+** - Ensure compatible version

---

## 🎯 Next Steps

1. Read [README.md](README.md) for complete documentation
2. Check API endpoints in README.md
3. Review database schemas in `models/` folder
4. Start creating and sharing posts!

---

## 📚 Learn More

- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Mongoose Docs](https://mongoosejs.com)

---

**Happy coding! 🎉**
