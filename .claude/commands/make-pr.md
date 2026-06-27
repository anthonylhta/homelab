---
description: Run full local CI, then open a PR (never merge)
---

Open a pull request for the current branch.

1. Confirm I am **not** on `main`. If I am, stop.
2. Run the full local CI and continue **only if everything is green**:
   - `npm run check` (type-check + lint + test)
   - `docker compose build`
3. Push the branch: `git push -u origin HEAD`.
4. Open the PR with `gh pr create`. Title and body rules:
   - First person, plain capitalized sentences; one logical change.
   - Say what changed and why. No process narration.
   - **No AI/Claude attribution** (no `Co-Authored-By`, no "Generated with…").
   - **Do not** reference `notes/` or ADR numbers (they're gitignored).
5. Stop at "PR open, CI green, ready for review." **Never merge** — I merge on GitHub myself.
