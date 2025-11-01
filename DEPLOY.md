# Deployment checklist & instructions

This document describes the minimal steps to deploy the Sportify Blog Backend to a VPS using ArangoDB.

Prerequisites
- A VPS (Ubuntu 22.04+ recommended)
- Node.js (v18+), npm
- ArangoDB reachable from the VPS (recommended: run Arango on the same host or restrict access with firewall)
- Nginx for reverse proxy and TLS

Quick checklist (run before cutover)
- [ ] Ensure `.env.production` exists on server and contains secure values for ARANGO_* and JWT_SECRET.
- [ ] Ensure `pm2` is installed on server (or use systemd). Install globally: `npm i -g pm2`.
- [ ] Install project deps: `npm ci`.
- [ ] Run `npm run check-arango` to verify connectivity.
- [ ] Run `npm run bootstrap-arango` to ensure the `blogposts` collection and indexes exist.
<!-- Migration to Mongo removed: there is no automatic Mongo->Arango migration. If you need a one-time import, run a dedicated migration tool outside this deployment flow. -->
- [ ] Start with PM2: `npm run start:prod`.
- [ ] Configure Nginx as reverse proxy and enable TLS (Certbot recommended).
- [ ] Configure backups and monitoring.

Environment variables
Create `/var/www/sportifyblog/backend/.env.production` on the server (owner: deploy user) with at least:

ARANGO_URL=http://127.0.0.1:8529
ARANGO_DB=SportifyBlogs
ARANGO_COLLECTION=blogposts
ARANGO_USER=your_user
ARANGO_PASS=your_password
PORT=5001
JWT_SECRET=keep_this_safe
NODE_ENV=production

This project now uses ArangoDB. Ensure Arango environment variables (ARANGO_*) are set on the server. There is no MONGO_URI required.

PM2 vs systemd
- PM2: use `pm2.config.js` included. Start: `pm2 start pm2.config.js --env production`.
- Systemd: if you prefer systemd, create a unit file that runs `node /path/to/server.js` and manages restart on failure.

Reverse proxy (Nginx) example (simplified)

server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_pass http://127.0.0.1:5001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}

Use Certbot to obtain TLS certs and enable HTTPS.

Backups
- Example manual backup (requires `arangodump` on the server):

  export ARANGO_URL=http://127.0.0.1:8529
  export ARANGO_DB=SportifyBlogs
  export ARANGO_USER=root
  export ARANGO_PASS=secret
  ./scripts/backup-arango.sh

- Automate with a cron job or systemd timer; store dumps off-host (S3 or another backup server).

Migration decision (current)
- MongoDB support has been removed from this codebase. Any historical migration helpers have been disabled. If you need to import legacy Mongo data, prepare a one-time migration plan and run it manually from a secure environment.

Monitoring & logs
- Use PM2 logs or systemd/journald for logs. Configure log rotation and a centralized log system when possible (ELK, Grafana Loki, etc.).
- Health endpoint: `/api/health` provides DB status and timestamp.

Security notes
- Do NOT commit `.env.production` to the repo. Rotate any secrets that were previously committed.
- Restrict ArangoDB network access with firewall rules and bind Arango to localhost when appropriate.

Rollback
- If deploy fails, roll back to the previous PM2 release or restore from a backup using `arangorestore` and your previous deployment tag.
