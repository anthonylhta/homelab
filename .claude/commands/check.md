---
description: Type-check, lint, and test in parallel
---

Run the project's quality gates and give me a concise pass/fail summary.

Run these three concurrently (in one message, separate shells), then collect the results:

- `npm run typecheck`
- `npm run lint`
- `npm test`

For each, report ✅/❌ and, on failure, the relevant error lines. Do not attempt fixes unless I ask.
