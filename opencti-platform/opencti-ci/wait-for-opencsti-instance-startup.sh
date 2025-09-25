#!/bin/bash
# Usage: ./wait-for-200.sh <URL> <TIMEOUT_SECONDS> <CHECK_INTERVAL_SECONDS>

URL="$1"
TIMEOUT="$2"
INTERVAL="$3"

if [ -z "$URL" ] || [ -z "$TIMEOUT" ] || [ -z "$INTERVAL" ]; then
  echo "Usage: $0 <URL> <TIMEOUT_SECONDS> <CHECK_INTERVAL_SECONDS>"
  exit 1
fi

START=$(date +%s)

while :; do
  ELAPSED=$(( $(date +%s) - START ))

  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "Timeout after ${TIMEOUT}s"
    exit 1
  fi

  CODE=$(wget --server-response -O /dev/null "$URL" 2>&1 \
    | awk '/^  HTTP/{print $2; exit}')

  echo "[$ELAPSED s] HTTP $CODE"

  if [ "$CODE" -eq 200 ] 2>/dev/null; then
    echo "Success after ${ELAPSED}s"
    exit 0
  fi

  sleep "$INTERVAL"
done
