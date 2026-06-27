---
description: Start a new <type>/<slug> branch off an up-to-date main
argument-hint: <type>/<slug>  (or just <slug>, defaults to feat/)
---

Start a fresh feature branch for: **$ARGUMENTS**

1. Check the working tree is clean. If it isn't, stop and tell me (don't stash silently).
2. `git switch main` then `git pull --ff-only`.
3. Decide the branch name from `$ARGUMENTS`:
   - If it already starts with `feat/`, `fix/`, `refactor/`, or `chore/`, use it verbatim.
   - Otherwise use `feat/$ARGUMENTS` (kebab-case the slug).
4. `git switch -c <branch>` and confirm the new branch name.

Never commit to `main`. Stop after the branch exists — don't start coding until I say what to build.
