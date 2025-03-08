// backend/server.js (updated CORS section)
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize express app
const app = express();

// ✅ Log environment and MongoDB URI
console.log(`🛠️ Starting server.js - NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🔗 Loaded MONGO_URI: ${process.env.MONGO_URI}`);

// ✅ Ensure uploads directories exist
const baseUploadDir = path.join(__dirname, "uploads");
const blogUploadDir = path.join(baseUploadDir, "blogs");
const videoUploadDir = path.join(baseUploadDir, "videos");

[baseUploadDir, blogUploadDir, videoUploadDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📂 Created upload directory: ${dir}`);
    }
});

// ✅ Connect to MongoDB
connectDB()
    .then(() => {
        console.log("✅ MongoDB Connected");
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err.message);
        if (process.env.NODE_ENV !== "test") {
            process.exit(1);
        }
    });

// ✅ Middleware
app.use(express.json());
app.use(morgan("dev"));

// ✅ Enhanced CORS handling for development and production
const allowedOrigins = [
    "http://localhost:5173",  // Vite frontend (development)
    "http://localhost:3000",  // Optional, if you have another frontend
    process.env.FRONTEND_URL  // Production frontend URL (e.g., "https://sports-gateway.com")
].filter(Boolean); // Remove undefined/null values

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Explicitly allow methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Explicitly allow headers
}));

// ✅ Static file serving for uploads (serves `/uploads` folder)
app.use("/uploads", express.static(baseUploadDir));

// ✅ Debug Logger - Logs incoming requests
app.use((req, res, next) => {
    console.log(`🔎 Incoming request: ${req.method} ${req.originalUrl}`);
    next();
});

// ✅ Health Check Endpoint
app.get("/api/health", (req, res) => res.json({ status: "Backend running!" }));

// ✅ Import and Attach Routes
const fetchBlogRoute = require("./routes/fetchBlogRoute");
const fetchBlogsByCategoryRoute = require("./routes/fetchBlogsByCategoryRoute");
const createBlogRoute = require("./routes/createBlogRoute");
const updateBlogRoute = require("./routes/updateBlogRoute");
const deleteBlogRoute = require("./routes/deleteBlogRoute");
const featureBlogRoute = require("./routes/featureBlogRoute");
const uploadRoute = require("./routes/uploadRoute");

app.use("/api/blogs", fetchBlogRoute);
app.use("/api/blogs", fetchBlogsByCategoryRoute);
app.use("/api/blogs", createBlogRoute);
app.use("/api/blogs", updateBlogRoute);
app.use("/api/blogs", deleteBlogRoute);
app.use("/api/blogs", featureBlogRoute);
app.use("/api/upload", uploadRoute);

// ✅ Global 404 Handler
app.use((req, res) => {
    console.error(`❌ Route Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: "Route Not Found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error(`❌ Global Error Handler: ${err.message}`);
    res.status(500).json({ error: err.message || "Internal Server Error" });
});

// ✅ Start Server (Only if Not in Test Mode)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// ✅ Export for Testing
module.exports = app;