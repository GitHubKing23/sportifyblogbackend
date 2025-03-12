const mongoose = require("mongoose");
const dotenv = require("dotenv");

// ✅ Determine environment and load the correct .env file
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: envFile });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing. Check your .env or .env.test.");
    process.exit(1);
}

console.log(`🔗 Attempting to connect to MongoDB at ${MONGO_URI} (ENV: ${process.env.NODE_ENV || "development"})`);

// ✅ Function to check MongoDB connection
async function checkDBConnection() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("✅ Successfully connected to MongoDB!");
        
        // ✅ Close connection after success
        await mongoose.connection.close();
        console.log("✅ MongoDB connection closed.");
        process.exit(0);
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);

        // ✅ Ensure connection is closed on failure
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }

        process.exit(1);
    }
}

// ✅ Execute connection test
checkDBConnection();
