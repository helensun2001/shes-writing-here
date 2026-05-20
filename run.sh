#!/usr/bin/env bash
# 启动本地 server，并打开浏览器
set -e
PORT=${PORT:-8000}
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# 跨平台 opener
opener=""
if command -v open >/dev/null 2>&1; then opener="open"
elif command -v xdg-open >/dev/null 2>&1; then opener="xdg-open"
elif command -v start >/dev/null 2>&1; then opener="start"
fi

echo "Serving $DIR at http://localhost:$PORT"
[ -n "$opener" ] && (sleep 0.8 && $opener "http://localhost:$PORT") &

python3 -m http.server "$PORT"
