const connectDB = require('../config/db');

describe('connectDB Mongo noop', () => {
  let originalEnv;
  let logSpy;
  let warnSpy;

  beforeEach(() => {
    originalEnv = { ...process.env };
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    delete process.env.MONGO_URI;
    delete process.env.ARANGO_URL;
    delete process.env.ARANGO_DB;
  });

  afterEach(() => {
    process.env = originalEnv;
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('resolves quietly when Mongo variables are absent', async () => {
    await expect(connectDB()).resolves.toBeUndefined();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('MongoDB support removed'));
  });

  it('warns but does not throw when MONGO_URI is set', async () => {
    process.env.MONGO_URI = 'mongodb://does-not-matter';
    await expect(connectDB()).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('MONGO_URI is set'));
  });

  it('short-circuits when Arango env variables are provided', async () => {
    process.env.ARANGO_URL = 'http://arango:8529';
    process.env.ARANGO_DB = 'sportify';
    await expect(connectDB()).resolves.toBeUndefined();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ARANGO detected'));
  });
});
