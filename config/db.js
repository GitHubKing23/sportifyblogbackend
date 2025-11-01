const mongoose = require("mongoose");

const connectDB = async () => {
  // If ArangoDB is configured, skip Mongo connection to avoid accidental connections
  if (process.env.ARANGO_URL && process.env.ARANGO_DB) {
    console.log('ℹ️ ARANGO detected; skipping MongoDB connection (production uses ArangoDB)');
    return;
  }

  console.log("🔍 Connecting to MongoDB...");
  console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
  console.log("🔗 MONGO_URI:", process.env.MONGO_URI);

  if (!process.env.MONGO_URI) {
    const msg = "❌ MONGO_URI is not defined! Make sure .env or .env.production is loaded.";
    console.error(msg);
    // In non-test environments, fail loudly to surface misconfiguration
    if (process.env.NODE_ENV !== "test") {
      // Do not exit if Arango is configured (handled above); otherwise exit as before
      process.exit(1);
    }
    return; // Avoid crashing in tests, allow Jest to log failure.
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Prevent infinite hanging if MongoDB is unreachable
    });
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
