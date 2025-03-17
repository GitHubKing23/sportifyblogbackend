const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

// ✅ Load environment variables correctly based on NODE_ENV
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development"
});

const app = express();

// ✅ Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

app.use(express.json());
app.use(morgan("dev"));

// ✅ Improved CORS Configuration with Debugging
const allowedOrigins = [
  "https://sportifyinsider.com",  // ✅ Frontend domain
  "https://api.sportifyinsider.com", // ✅ API subdomain
  "http://localhost:5173", // ✅ Local development
  "http://localhost:3001",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173"
];

app.use(cors({
  origin: (origin, callback) => {
    console.log("🌍 Incoming request from:", origin); // ✅ Debugging origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("❌ CORS Not Allowed"));
    }
  },
  credentials: true, 
  methods: "GET,POST,PUT,DELETE,OPTIONS",  // ✅ Allow necessary methods
  allowedHeaders: "Content-Type,Authorization",  // ✅ Allow required headers
}));

// ✅ Handle Preflight Requests Correctly
app.options("*", cors());

// ✅ Disable caching globally
app.use((req, res, next) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// ✅ Serve static files (e.g., uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API Routes
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/upload", require("./routes/uploadRoute"));

// ✅ Improved Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "✅ Backend is running",
    database: mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected ❌",
    timestamp: new Date().toISOString(),
  });
});

// ✅ 404 Handler
app.use((req, res) => res.status(404).json({ error: "Route Not Found" }));

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error(`❌ Global Error: ${err.message}`);
  res.status(500).json({ error: err.message });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;

