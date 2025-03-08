const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables (including MONGO_URI from .env.test if running tests)
dotenv.config({ path: '.env.test' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing. Check your .env.test or environment variables.');
    process.exit(1);
}

console.log(`🔗 Attempting to connect to MongoDB at ${MONGO_URI}`);

async function checkDBConnection() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('✅ Successfully connected to MongoDB!');
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

checkDBConnection();
