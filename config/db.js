// MongoDB support has been removed from this codebase.
// This module remains as a noop for compatibility where other modules may call it.
// If you need to re-enable Mongo, restore the old implementation and add mongoose back to dependencies.

const connectDB = async () => {
  if (process.env.ARANGO_URL && process.env.ARANGO_DB) {
    console.log('ℹ️ ARANGO detected; MongoDB support disabled — skipping connect.');
    return;
  }

  if (process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI is set but MongoDB support has been removed from the application. Ignoring MONGO_URI.');
  } else {
    console.log('ℹ️ MongoDB support removed. No action taken.');
  }
  return;
};

module.exports = connectDB;
