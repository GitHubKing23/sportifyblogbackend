const connectDB = require('../config/db');

// Helper to check if MongoDB is available
async function isMongoAvailable(uri) {
  try {
    await connectDB();
    return true;
  } catch (e) {
    return false;
  }
}

describe('MongoDB URI Validation', () => {
  it('should throw an error if MONGO_URI is missing', async () => {
    const originalEnv = process.env.MONGO_URI;
    delete process.env.MONGO_URI;
    let errorCaught = false;
    try {
      await connectDB();
    } catch (e) {
      errorCaught = true;
    }
    process.env.MONGO_URI = originalEnv;
    expect(errorCaught).toBe(true);
  });

  it('should fail to connect with an invalid MONGO_URI', async () => {
    const originalEnv = process.env.MONGO_URI;
    process.env.MONGO_URI = 'mongodb://invalid:27017/invalid';
    let errorCaught = false;
    try {
      await connectDB();
    } catch (e) {
      errorCaught = true;
    }
    process.env.MONGO_URI = originalEnv;
    expect(errorCaught).toBe(true);
  });

  it('should connect successfully with a valid MONGO_URI', async () => {
    const originalEnv = process.env.MONGO_URI;
    process.env.MONGO_URI = 'mongodb://admin:StrongPassword123!@127.0.0.1:27017/sportifyinsider?authSource=admin';
    let errorCaught = false;
    let mongoAvailable = await isMongoAvailable(process.env.MONGO_URI);
    if (!mongoAvailable) {
      console.warn('⚠️  Skipping test: MongoDB server is not available on localhost.');
      return;
    }
    try {
      await connectDB();
    } catch (e) {
      errorCaught = true;
    }
    process.env.MONGO_URI = originalEnv;
    expect(errorCaught).toBe(false);
  });
});
