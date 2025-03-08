const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('🧪 DEBUG: Starting jest.setup.js');

// ✅ Resolve the absolute path to `.env.test`
const envPath = path.resolve(__dirname, '.env.test');
console.log('🧪 DEBUG: Checking for .env.test at:', envPath);

// ✅ Check if the file exists before trying to load it
if (fs.existsSync(envPath)) {
    console.log('✅ DEBUG: .env.test file found.');

    // ✅ Load .env.test
    const dotenvResult = dotenv.config({ path: envPath });

    // ✅ Log dotenv parsing result for debugging
    if (dotenvResult.error) {
        console.error('❌ DEBUG: Failed to load .env.test:', dotenvResult.error);
    } else {
        console.log('✅ DEBUG: .env.test loaded successfully.');
        console.log('📝 DEBUG: Parsed .env.test:', dotenvResult.parsed);
    }
} else {
    console.error('❌ DEBUG: .env.test file not found at:', envPath);
}

// ✅ Ensure NODE_ENV is explicitly set for Jest
process.env.NODE_ENV = 'test';
console.log('🌍 DEBUG: NODE_ENV set to:', process.env.NODE_ENV);

// ✅ Check if MONGO_URI is present after loading
if (!process.env.MONGO_URI) {
    console.error('❌ DEBUG: MONGO_URI is missing after loading .env.test!');
} else {
    console.log('✅ DEBUG: MONGO_URI found:', process.env.MONGO_URI);
}

// ✅ Set Jest timeout to 15 seconds to handle slow MongoDB operations
jest.setTimeout(15000);

// 🚀 Log confirmation that Jest setup is complete
console.log('✅ DEBUG: jest.setup.js complete. Ready to run tests.');

// 🛡️ Optional: Log process.env only if necessary (remove in production)
if (process.env.DEBUG_ENV === 'true') {
    console.log('🗂️ DEBUG: Full process.env dump (sensitive data warning - check before sharing):', process.env);
}
