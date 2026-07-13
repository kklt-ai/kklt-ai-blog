#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-4000}"
SITE_PATH="/kklt-ai-blog/"

if [ -x "/opt/homebrew/opt/ruby@3.3/bin/ruby" ]; then
  export PATH="/opt/homebrew/opt/ruby@3.3/bin:/opt/homebrew/lib/ruby/gems/3.3.0/bin:$PATH"
fi

if ! command -v ruby >/dev/null 2>&1; then
  echo "Ruby is not installed. Please install Ruby 3.3 or newer first." >&2
  exit 1
fi

if ! ruby -e 'exit Gem::Version.new(RUBY_VERSION) >= Gem::Version.new("3.0.0") ? 0 : 1'; then
  echo "Ruby 3.0 or newer is required. Current Ruby is: $(ruby -v)" >&2
  echo "On this machine, install Homebrew Ruby 3.3 with: brew install ruby@3.3" >&2
  exit 1
fi

if ! command -v bundle >/dev/null 2>&1; then
  echo "Bundler is not installed. Install it with: gem install bundler" >&2
  exit 1
fi

if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port ${PORT} is already in use. Stop that process or start with another port:" >&2
  echo "  PORT=4001 ./start.sh" >&2
  lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >&2
  exit 1
fi

echo "Ruby: $(ruby -v)"
echo "Bundler: $(bundle -v)"

if ! bundle check >/dev/null 2>&1; then
  echo "Installing missing gems..."
  bundle install
fi

echo "Starting Jekyll at http://${HOST}:${PORT}${SITE_PATH}"
echo "The remote theme step can take 1-3 minutes. Wait for: Server running..."
bundle exec jekyll serve --livereload --host "$HOST" --port "$PORT" "$@"
