#!/usr/bin/env sh
PORT="${1:-8000}"

echo "Starting local HTTP server at http://localhost:${PORT}"
echo "Press Ctrl+C to stop."

if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "$PORT"
elif command -v npx >/dev/null 2>&1; then
  npx serve -l "$PORT" .
elif command -v python >/dev/null 2>&1; then
  python -m SimpleHTTPServer "$PORT"
else
  echo "Error: Neither python3 nor npx found to serve files over HTTP."
  exit 1
fi
