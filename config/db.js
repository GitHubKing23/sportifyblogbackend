const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("🔍 Connecting to MongoDB...");
  console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
  console.log("🔗 MONGO_URI:", process.env.MONGO_URI);

  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not defined! Make sure .env or .env.test is loaded.");
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    return; // Avoid crashing in tests, allow Jest to log failure.
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
