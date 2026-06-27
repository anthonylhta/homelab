#!/usr/bin/env bash
# PostToolUse(Bash): after a `git commit`, nudge a notes/ decision entry.
# Non-blocking — surfaces a reminder as extra context for Claude.
set -uo pipefail

cmd="$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input.command||"")}catch{console.log("")}})')"

case "$cmd" in
  *"git commit"*)
    cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"Reminder: capture the rationale for this change in notes/ (gitignored) — what changed and why. Do not reference notes/ in commits or PR bodies."}}
JSON
    ;;
  *) : ;;
esac
exit 0
