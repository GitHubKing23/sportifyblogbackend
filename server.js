const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
// Load environment early so modules that read process.env (like config/db) see the vars
dotenv.config({ path: require('path').resolve(__dirname, '.env.production') });
const connectDB = require("./config/db");
const morgan = require("morgan");
const path = require("path");

// dotenv already loaded above to ensure DB config modules see environment variables

const app = express();

// Database connection: prefer ArangoDB if configured, otherwise fall back to MongoDB
if (process.env.ARANGO_URL && process.env.ARANGO_DB) {
  // Initialize ArangoDB connection (config/arango.js handles auth/database selection)
  try {
    const arango = require('./config/arango');
    console.log(`🔗 Using ArangoDB at ${process.env.ARANGO_URL}, DB: ${process.env.ARANGO_DB}`);
    // Run bootstrap to ensure collection and indexes exist (non-blocking startup)
    const { bootstrap } = require('./scripts/bootstrap-arango');
    bootstrap({ migrate: false }).then(result => {
      console.log('✅ Arango bootstrap result:', result);
    }).catch(err => {
      console.warn('⚠️ Arango bootstrap failed:', err.message || err);
    });
  } catch (err) {
    console.error('❌ Failed to initialize ArangoDB:', err.message || err);
    process.exit(1);
  }
} else {
  // ✅ Connect to MongoDB if Arango not configured
  connectDB()
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => {
      console.error("❌ MongoDB Connection Failed:", err.message);
      process.exit(1);
    });
}

app.use(express.json());
app.use(morgan("dev"));

// ✅ Improved CORS Configuration with Debugging
const allowedOrigins = [
  "https://sportifyinsider.com",       // ✅ Frontend domain
  "https://cms.sportifyinsider.com",   // ✅ CMS dashboard
  "https://api.sportifyinsider.com",   // ✅ API subdomain
  "http://localhost:5173",             // ✅ Local dev
  "http://localhost:3001",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173"
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
app.get("/api/health", async (req, res) => {
  try {
    let dbStatus = 'Unknown';
    if (process.env.ARANGO_URL && process.env.ARANGO_DB) {
      const arango = require('./config/arango');
      try {
        const ver = await arango.version();
        dbStatus = `ArangoDB ${ver.version} Connected ✅`;
      } catch (e) {
        dbStatus = `ArangoDB Disconnected ❌`;
      }
    } else {
      // MongoDB support has been removed — report that no DB is configured.
      dbStatus = process.env.MONGO_URI ? "MongoDB configured but disabled in this build" : "No database configured";
    }

    res.status(200).json({
      status: "✅ Backend is running",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ status: 'Error', error: err.message });
  }
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
