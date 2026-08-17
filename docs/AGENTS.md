# AGENTS.md — Operating rules for the coding agent

You are developing **LectureScribe**. Follow these rules for every session.

## Source of truth
1. `PROJECT.md` — what we're building and why
2. `REQUIREMENTS.md` — what the system must do
3. `ARCHITECTURE.md` — how it must be built (stack, flow, endpoints)
4. `DESIGN.md` — visual style (colors, type, buttons, layout) for every UI screen
5. `TASKS.md` — the checklist to work through, in order

## Git workflow (required)
- Work one task at a time, in the order listed in `TASKS.md`.
- All development happens on a `dev` branch — never commit directly to `main`.
- The moment a task is complete AND tested, commit and push to `dev`:
  ```
  git add .
  git commit -m "type: short description"
  git push origin dev
  ```
- `main` is only updated by merging `dev` in — via a Pull Request (reviewed
  by you before merging) or a manual `git merge dev` once you're happy with
  a batch of tasks. The agent should not merge to `main` on its own unless
  you explicitly ask it to.
- Never batch multiple unrelated tasks into one commit.
- Never push code that hasn't been run/tested at least once.
- Use commit prefixes: `feat:` `fix:` `chore:` `docs:` `refactor:`.
- After pushing, mark the task `[x]` in `TASKS.md` and commit that update too
  (can be combined with the same commit if done together).

## Build rules
1. Do not implement features that aren't specified in `REQUIREMENTS.md` without asking first.
2. Never put API keys (Groq/LLM) in frontend code — backend/env vars only.
3. Keep the app mobile responsive at every step, not as a final pass.
3a. Follow `DESIGN.md` for every screen you build — black/white palette,
    pill buttons, bold headline + italic serif accent word, bordered
    white cards. Don't introduce new colors or styles not in that file.
4. Use plain, readable code — comments where logic isn't obvious.
5. Handle every API/upload error with a specific, user-facing message (see REQUIREMENTS.md).
6. Don't mark a task complete in TASKS.md until it has actually been tested.
7. Don't rewrite or refactor working code unless the task requires it.
8. Before a major architectural change (e.g. switching from sync to async
   processing, adding a database), explain the decision and reasoning first.
9. Build in the order given in TASKS.md — don't skip ahead to deployment
   or polish before the core upload → transcript → notes flow works.
10. Keep processing synchronous for the MVP (per ARCHITECTURE.md) unless
    told otherwise — don't build a job queue/polling system unprompted.

## When stuck or blocked
- If an API call fails repeatedly, report the exact error back rather than
  silently retrying or swapping providers.
- If a requirement is ambiguous, state the assumption you're making and proceed,
  rather than stalling.
