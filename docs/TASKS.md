# TASKS.md — LectureScribe Development Checklist

**Branching: all work happens on `dev`. `main` only gets updated when you
merge `dev` in yourself (or approve a PR) — the agent should not push to
`main` directly.**

**Rule for every task below: as soon as a task is done and tested, commit
and push it to `dev` before moving to the next one.**

```
git checkout dev          # make sure you're on dev, not main
git add .
git commit -m "type: short description of what was done"
git push origin dev
```
Use commit prefixes: `feat:`, `fix:`, `chore:`, `docs:` — keeps history readable.

When you're happy with a batch of tasks (e.g. end of a Phase), merge to `main`:
```
git checkout main
git merge dev
git push origin main
```

---

## Phase 0 — Repo setup
- [x] Create GitHub repo (`lecturescribe` — https://github.com/Kofi011/lecturescribe)
- [x] `git init`, add `.gitignore` (node_modules, .env, dist/build folders)
- [x] Create and switch to `dev` branch: `git checkout -b dev`
- [x] Add this set of `.md` files to the repo root
- [x] Initial commit: `docs: add project planning docs`
- [x] Push `dev` to GitHub: `git push -u origin dev`
- [x] Push `master` so both branches exist on GitHub

## Phase 1 — Project setup
- [x] Initialize frontend (React + Tailwind) → commit + push
- [x] Initialize backend (Node/Express) → commit + push
- [x] Configure environment variables (`.env.example` with placeholder keys, real `.env` gitignored) → commit + push
- [x] Confirm frontend and backend run locally together → commit + push
- [x] Set up base theme in Tailwind config per `DESIGN.md` (black/white palette, pill button styles, font choices) → commit + push

## Phase 2 — Upload
- [x] Build landing/upload page per `DESIGN.md` (hero headline with italic accent word, pill buttons, bordered upload card) → commit + push
- [x] Build upload UI (file picker, mobile-friendly) → commit + push
- [x] Accept mp3 → commit + push
- [x] Accept wav → commit + push
- [x] Accept m4a → commit + push
- [x] Add 10-minute duration validation (client + server) → commit + push
- [x] Add file-size validation with clear error message → commit + push

## Phase 3 — Transcription (Dual Engine: Groq Whisper + Griot Nano 1)
- [x] Build Python/FastAPI Griot Nano 1 sidecar service (`POST /transcribe`, `GET /health`) → commit + push
- [x] Integrate Groq Whisper API on Node backend with `verbose_json` metadata → commit + push
- [x] Implement language-detection & confidence routing logic (English vs dialectal/multilingual) → commit + push
- [x] Normalize dual-engine output to `{ transcript, language, engine }` → commit + push
- [x] Handle connection & speech errors with user-facing actionable messages → commit + push
- [x] Return `engine_used` and language in API response and display in UI → commit + push


## Phase 4 — Notes generation
- [x] Write and test the summarization prompt (headings + bullets + title) → commit + push
- [x] Generate suggested title → commit + push
- [x] Generate section headings → commit + push
- [x] Generate bullet points per section → commit + push
- [x] Generate "Key Takeaways" section → commit + push

## Phase 5 — Results view
- [x] Build Transcript tab (pill-style tab switcher per `DESIGN.md`) → commit + push
- [x] Build Notes tab (bordered card, bold headings + bullets) → commit + push
- [x] Add Copy Notes button (solid pill) → commit + push
- [x] Add Download Notes button (outline pill, .txt or .md) → commit + push

## Phase 6 — Processing status & error UI
- [x] Build staged processing indicator inside a dark rounded hero card per `DESIGN.md` (Uploaded → Transcribing → Summarizing → Complete) → commit + push
- [x] Build error state UI for each failure type → commit + push
- [x] Confirm mobile responsiveness across all screens → commit + push
- [x] Add loading states for all async actions → commit + push

## Phase 7 — Testing
- [x] Test with mp3 file → commit (fix any bugs found) + push
- [x] Test with wav file → commit + push
- [x] Test with m4a file → commit + push
- [x] Test invalid/unsupported file type → commit + push
- [x] Test file over 10 minutes → commit + push
- [x] Test API failure (simulate by breaking key temporarily) → commit + push
- [x] Test on an actual mobile device or dev-tools mobile view → commit + push

## Phase 8 — Deployment
- [ ] Merge `dev` into `main` (deployment should run off `main`, not `dev`)
- [ ] Deploy backend (Render/Railway), set production env vars → commit + push
- [ ] Deploy frontend (Vercel), point to deployed backend URL → commit + push
- [ ] Test the live deployed link end-to-end → commit + push
- [ ] Update README.md with the live link → commit + push

---

## Notes for the agent
- Don't jump ahead to Phase 3+ before Phase 1–2 are working and pushed.
- Never mark a task `[x]` until it has actually been run and tested, not just written.
- If a task breaks something already working, fix it before committing — don't push broken code.
- Every "commit + push" above means push to `dev`, unless the task explicitly says to merge/deploy from `main`.
