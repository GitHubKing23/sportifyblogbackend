#!/usr/bin/env bash
# Refresh deploy helper
# Usage: run from project root on the VPS to pull latest code, reinstall deps and restart PM2

set -euo pipefail

APP_DIR="$HOME/sportifyblogbackend"
BRANCH="new-backend-code"
PM2_APP_NAME="blog-api"

echo "-> Refreshing deploy in $APP_DIR (branch: $BRANCH)"
cd "$APP_DIR"

echo "-> Fetching and resetting to origin/$BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "-> Removing node_modules and package-lock.json"
rm -rf node_modules
rm -f package-lock.json

echo "-> Installing clean dependencies (npm ci)"
npm ci

echo "-> Restarting pm2 process: $PM2_APP_NAME"
pm2 delete "$PM2_APP_NAME" || true
pm2 start pm2.config.js --env production

echo "-> Done. Showing last 120 lines of logs for $PM2_APP_NAME"
pm2 logs "$PM2_APP_NAME" --lines 120
