// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

// ✅ Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.production') });

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

// ✅ Improved CORS Configuration
const allowedOrigins = [
  "https://sportifyinsider.com", "https://api.sportifyinsider.com", 
  "http://localhost:5173", "http://localhost:3001", "http://localhost:3000"
];
app.use(cors({
  origin: (origin, callback) => {
    console.log("🌍 Incoming request from:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("❌ CORS Not Allowed"));
    }
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
}));

// ✅ Handle Preflight Requests
app.options("*", cors());

// ✅ Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API Routes
app.use("/api/blogs", (req, res, next) => {
  console.log("🔍 Request received at /api/blogs");
  next();
}, require("./routes/blogRoutes")); // Debugging request reaching here

app.use("/api/upload", require("./routes/uploadRoute"));

// ✅ Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "✅ Backend is running",
    database: mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected ❌",
    timestamp: new Date().toISOString(),
  });
});

// ✅ 404 Handler for Undefined Routes
app.use((req, res) => res.status(404).json({ error: "Route Not Found" }));

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error(`❌ Global Error: ${err.message}`);
  res.status(500).json({ error: err.message });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
