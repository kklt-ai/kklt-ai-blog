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

if ! command -v bundle >/dev/null 2>&1; then
  echo "Bundler is not installed. Install it with: gem install bundler" >&2
  exit 1
fi

echo "Ruby: $(ruby -v)"
echo "Bundler: $(bundle -v)"

if ! bundle check >/dev/null 2>&1; then
  echo "Installing missing gems..."
  bundle install
fi

echo "Starting Jekyll at http://${HOST}:${PORT}${SITE_PATH}"
bundle exec jekyll serve --livereload --host "$HOST" --port "$PORT" "$@"
