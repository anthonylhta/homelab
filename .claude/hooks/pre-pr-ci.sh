#!/usr/bin/env bash
# PreToolUse(Bash): before any `gh pr create`, run the local quality gates.
# A red gate blocks the PR (exit 2) and feeds the failure back to Claude.
set -uo pipefail

cmd="$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input.command||"")}catch{console.log("")}})')"

case "$cmd" in
  *"gh pr create"*)
    echo "[pre-pr] Running 'npm run check' before opening a PR..." >&2
    log="$(mktemp)"
    if npm run check >"$log" 2>&1; then
      echo "[pre-pr] Gates green — allowing the PR." >&2
      rm -f "$log"
      exit 0
    fi
    echo "[pre-pr] Gates are RED — not opening a PR. Last 25 lines:" >&2
    tail -25 "$log" >&2
    rm -f "$log"
    exit 2
    ;;
  *)
    exit 0
    ;;
esac
