#!/usr/bin/env bash
set -euo pipefail

# Simple ArangoDB backup script using arangodump.
# Expects ARANGO_URL, ARANGO_DB, ARANGO_USER, ARANGO_PASS to be set in environment.

: ${ARANGO_URL:?Need ARANGO_URL}
: ${ARANGO_DB:?Need ARANGO_DB}
: ${ARANGO_USER:?Need ARANGO_USER}
: ${ARANGO_PASS:?Need ARANGO_PASS}

TS=$(date +%Y%m%dT%H%M%S)
OUTDIR="backups/arangodump-${ARANGO_DB}-${TS}"
mkdir -p "$OUTDIR"

echo "Starting arangodump for database '$ARANGO_DB' to '$OUTDIR'"
arangodump --server.endpoint "$ARANGO_URL" --server.database "$ARANGO_DB" \
  --server.username "$ARANGO_USER" --server.password "$ARANGO_PASS" \
  --output-directory "$OUTDIR"

echo "Backup complete: $OUTDIR"
