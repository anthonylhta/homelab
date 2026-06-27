#!/usr/bin/env bash
# PostToolUse(Edit|Write|MultiEdit): format the file Claude just touched with
# Prettier. Best-effort and silent — never blocks the edit.
set -uo pipefail

read_field() {
  node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input.file_path||"")}catch{console.log("")}})'
}

file="$(read_field)"
if [ -n "$file" ] && [ -f "$file" ]; then
  npx --no-install prettier --write --ignore-unknown "$file" >/dev/null 2>&1 || true
fi
exit 0
