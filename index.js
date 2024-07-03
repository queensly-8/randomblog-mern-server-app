const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User.js");
const Blog = require("./models/Blog.js");

//Routes
const userRoutes = require("./routers/user.js");
const blogRoutes = require("./routers/blog.js");

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: [
        "http://localhost:3000",
        "https://randomblog-mern-client-app.vercel.app",
        "https://randomblog-mern-client-app-git-main-des-projects-c11f252c.vercel.app",
        "https://randomblog-mern-client-p3wxnpoay-des-projects-c11f252c.vercel.app"
    ],
    credentials: true, // Allow cookies and authorization headers
};

app.use(cors(corsOptions));

// Routes
app.use("/users", userRoutes);
app.use("/blog", blogRoutes);

mongoose.connect(process.env.MONGODB_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).catch(error => console.error('MongoDB connection error:', error));

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`API is now online at http://localhost:${PORT}`);
});

// Error handling for CORS issues
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        // Handle CORS unauthorized errors
        res.status(401).json({ error: 'Unauthorized request' });
    } else {
        next();
    }
});

module.exports = { app, mongoose };
