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
- [ ] Create GitHub repo (e.g. `lecturescribe`)
- [ ] `git init`, add `.gitignore` (node_modules, .env, dist/build folders)
- [ ] Create and switch to `dev` branch: `git checkout -b dev`
- [ ] Add this set of `.md` files to the repo root
- [ ] Initial commit: `docs: add project planning docs`
- [ ] Push `dev` to GitHub: `git push -u origin dev`
- [ ] (Optional) Push an empty/initial `main` too so both branches exist on GitHub

## Phase 1 — Project setup
- [ ] Initialize frontend (React + Tailwind) → commit + push
- [ ] Initialize backend (Node/Express) → commit + push
- [ ] Configure environment variables (`.env.example` with placeholder keys, real `.env` gitignored) → commit + push
- [ ] Confirm frontend and backend run locally together → commit + push
- [ ] Set up base theme in Tailwind config per `DESIGN.md` (black/white palette, pill button styles, font choices) → commit + push

## Phase 2 — Upload
- [ ] Build landing/upload page per `DESIGN.md` (hero headline with italic accent word, pill buttons, bordered upload card) → commit + push
- [ ] Build upload UI (file picker, mobile-friendly) → commit + push
- [ ] Accept mp3 → commit + push
- [ ] Accept wav → commit + push
- [ ] Accept m4a → commit + push
- [ ] Add 10-minute duration validation (client + server) → commit + push
- [ ] Add file-size validation with clear error message → commit + push

## Phase 3 — Transcription
- [ ] Integrate Groq Whisper API on backend → commit + push
- [ ] Implement transcription call + response handling → commit + push
- [ ] Handle transcription errors (timeout, API failure) with specific messages → commit + push
- [ ] Return transcript to frontend → commit + push

## Phase 4 — Notes generation
- [ ] Write and test the summarization prompt (headings + bullets + title) → commit + push
- [ ] Generate suggested title → commit + push
- [ ] Generate section headings → commit + push
- [ ] Generate bullet points per section → commit + push
- [ ] Generate "Key Takeaways" section → commit + push

## Phase 5 — Results view
- [ ] Build Transcript tab (pill-style tab switcher per `DESIGN.md`) → commit + push
- [ ] Build Notes tab (bordered card, bold headings + bullets) → commit + push
- [ ] Add Copy Notes button (solid pill) → commit + push
- [ ] Add Download Notes button (outline pill, .txt or .md) → commit + push

## Phase 6 — Processing status & error UI
- [ ] Build staged processing indicator inside a dark rounded hero card per `DESIGN.md` (Uploaded → Transcribing → Summarizing → Complete) → commit + push
- [ ] Build error state UI for each failure type → commit + push
- [ ] Confirm mobile responsiveness across all screens → commit + push
- [ ] Add loading states for all async actions → commit + push

## Phase 7 — Testing
- [ ] Test with mp3 file → commit (fix any bugs found) + push
- [ ] Test with wav file → commit + push
- [ ] Test with m4a file → commit + push
- [ ] Test invalid/unsupported file type → commit + push
- [ ] Test file over 10 minutes → commit + push
- [ ] Test API failure (simulate by breaking key temporarily) → commit + push
- [ ] Test on an actual mobile device or dev-tools mobile view → commit + push

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
