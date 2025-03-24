const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

console.log("🧪 DEBUG: Jest Test Setup Started");

// ✅ Load Test Environment Variables
const envPath = path.resolve(__dirname, "../.env.test"); // Ensure correct path
dotenv.config({ path: envPath });

console.log(`🔗 Connecting to test database: ${process.env.MONGO_URI}`);

// ✅ Connect to MongoDB (for testing)
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log("✅ Connected to test database.");
});

// ✅ Clear test database before each test
beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

// ✅ Close MongoDB Connection & Stop Server After Tests
afterAll(async () => {
    console.log("🛑 Closing test database connection...");
    await mongoose.connection.close();
    console.log("✅ Database connection closed.");
});

// ✅ Set Jest timeout for slow MongoDB operations
jest.setTimeout(20000);

console.log("✅ DEBUG: jest.setup.js complete. Ready to run tests.");
