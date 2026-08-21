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

## Phase 7 — Testing & UI Refinements
- [x] Test with mp3, wav, and m4a files → commit + push
- [x] Test invalid/unsupported file type and length validation → commit + push
- [x] Test API failure and fallback behavior → commit + push
- [x] Add structured markdown renderer and academic tutor interface → commit + push

## Phase 8 — Navigation, Trial Mode, Authentication & Workspace
- [x] Task 8.1: Update documentation specifications (PROJECT.md, REQUIREMENTS.md, ARCHITECTURE.md, DESIGN.md, TASKS.md) → commit + push
- [x] Task 8.2: Backend database setup with PostgreSQL (users table migration & connection pool) → commit + push
- [x] Task 8.3: Backend authentication service (bcrypt password hashing, JWT/cookie auth, `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`) → commit + push
- [x] Task 8.4: Backend trial tracking & gating (signed session cookie `lecture_trial_session`, 3-upload limit for anonymous users, bypass for authenticated users) → commit + push
- [ ] Task 8.5: Frontend Menu dropdown navigation (HOME, TRY LECTURESCRIBE, LOGIN, ABOUT per DESIGN.md) → commit + push

- [ ] Task 8.6: Frontend static About page (`/about` with hero and 3-card how-it-works architecture) → commit + push
- [ ] Task 8.7: Frontend Auth page (`/login` with "Log in" and "Create account" toggle, form validation, and auth state) → commit + push
- [ ] Task 8.8: Frontend Trial mode & gating (`/trial` reusing upload flow with 3-trial limit enforcement and Login CTA) → commit + push
- [ ] Task 8.9: Frontend Protected Workspace (`/workspace` with full unlimited lecture pipeline and user logout) → commit + push
- [ ] Task 8.10: End-to-end testing of navigation, trial gating, and authentication flows → commit + push

## Phase 9 — Deployment
- [ ] Merge `dev` into `main` (deployment should run off `main`, not `dev`)
- [ ] Deploy backend (Render/Railway with managed PostgreSQL), set production env vars → commit + push
- [ ] Deploy frontend (Vercel), point to deployed backend URL → commit + push
- [ ] Test the live deployed link end-to-end → commit + push
- [ ] Update README.md with the live link → commit + push

---

## Notes for the agent
- Work through TASKS.md one task at a time, in order. Do not skip ahead.
- Never mark a task `[x]` until it has actually been run and tested, not just written.
- If a task breaks something already working, fix it before committing — don't push broken code.
- Every "commit + push" above means push to `dev`, unless the task explicitly says to merge/deploy from `main`.
