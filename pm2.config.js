/**
 * PM2 ecosystem file for production.
 * Usage: install pm2 on the server and run:
 *   pm2 start pm2.config.js --env production
 */
module.exports = {
  apps: [
    {
      name: 'sportifyblogbackend',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
        // ARANGO_URL, ARANGO_DB, ARANGO_USER, ARANGO_PASS should be set in the system environment
      }
    }
  ]
};
