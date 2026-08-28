# TASKS.md — Team Lead / Infra-Data-QA

**Branch: `dev/lead`**

Push to `dev/lead` after each task. Open PR into `dev` at the end of each phase.

---

## Phase 0 — Repo & Team Setup

- [ ] Create GitHub repo, initialize with `.gitignore` (node_modules, .env, dist/build, __pycache__) → commit + push
- [ ] Create branch structure: `main` ← `dev` ← `dev/frontend`, `dev/backend`, `dev/ai-pipeline`, `dev/lead` → push all branches
- [ ] Add team documentation (`docs/TEAM.md`, `docs/team/` role folders) → commit + push
- [ ] Ensure `.env.example` is committed with all placeholder keys (coordinate with backend on required vars) → commit + push
- [ ] Verify all team members can clone, checkout their branch, and push → confirm with team

## Phase 1 — Local Development Environment

- [ ] Confirm frontend dev server runs locally (`npm run dev` or equivalent) → commit + push
- [ ] Confirm backend dev server runs locally (`npm run dev`) → commit + push
- [ ] Confirm Griot sidecar runs locally (`uvicorn main:app`) → commit + push
- [ ] Confirm frontend can reach backend API locally (CORS, proxy config) → commit + push
- [ ] Document local setup steps in root `README.md` (all three services) → commit + push

## Phase 2 — Documentation Maintenance

- [ ] Update root `docs/TASKS.md` with current team progress status → commit + push
- [ ] Update `docs/PROJECT.md` and `docs/REQUIREMENTS.md` if scope changes arise → commit + push
- [ ] Keep `docs/TEAM.md` current as roles and responsibilities evolve → commit + push

## Phase 3 — Integration Testing (after Phases complete across team)

- [ ] Test upload flow end-to-end: frontend upload → backend validation → AI pipeline transcription → notes → frontend results display → commit + push
- [ ] Test with MP3 file (clear English) → verify Whisper engine is used, all notes fields populated → commit + push
- [ ] Test with WAV file → verify format accepted and processed correctly → commit + push
- [ ] Test with M4A file → verify format accepted and processed correctly → commit + push
- [ ] Test with accented/multilingual audio → verify Griot Nano 1 routing triggers → commit + push
- [ ] Test invalid file type (e.g. .pdf) → verify client-side and server-side rejection with specific error → commit + push
- [ ] Test oversized file (>15 MB) → verify rejection with specific error → commit + push
- [ ] Test over-length audio (>10 min) → verify rejection with specific error → commit + push

## Phase 4 — Auth & Trial Integration Testing

- [ ] Test signup flow: frontend form → `POST /api/auth/signup` → cookie set → redirect to `/workspace` → commit + push
- [ ] Test login flow: frontend form → `POST /api/auth/login` → cookie set → redirect to `/workspace` → commit + push
- [ ] Test logout flow: click logout → `POST /api/auth/logout` → cookie cleared → redirect to landing → commit + push
- [ ] Test session persistence: refresh page on `/workspace` → `GET /api/auth/me` → user stays logged in → commit + push
- [ ] Test trial gating: 3 anonymous uploads succeed → 4th returns 403 `TRIAL_EXHAUSTED` → UI shows login CTA → commit + push
- [ ] Test authenticated upload: logged-in user uploads → no trial limit → lecture auto-saved to library → commit + push

## Phase 5 — Workspace & Tutor Integration Testing

- [ ] Test lecture library: workspace shows all past lectures from `GET /api/lectures` → commit + push
- [ ] Test lecture detail: click a past lecture → loads full transcript, notes, and tutor history → commit + push
- [ ] Test lecture deletion: delete a lecture → removed from library and database → commit + push
- [ ] Test AI Tutor: ask a question about the transcript → get grounded answer → conversation persists → commit + push
- [ ] Test tutor grounding: ask a question NOT in the transcript → tutor refuses gracefully → commit + push

## Phase 6 — Pre-Deployment Audit

- [ ] Mobile responsiveness audit: test all pages on phone, tablet, and desktop viewports → commit + push
- [ ] Security audit: verify no API keys in frontend code, all cookies are HTTP-only, rate limits trigger correctly → commit + push
- [ ] Error handling audit: test every error path (API down, invalid input, expired session, trial exhausted) → commit + push
- [ ] Export audit: test all export formats (copy, .txt, .md, .json, branded PDF) → commit + push

## Phase 7 — Deployment

- [ ] Merge `dev` into `main` (after all integration tests pass) → push `main`
- [ ] Deploy backend to Render/Railway: set production env vars (`GROQ_API_KEY`, `LLM_API_KEY`, `JWT_SECRET`, `SESSION_SECRET`, `DATABASE_URL`, `PORT`) → verify health check
- [ ] Run database migrations on production PostgreSQL → verify tables created
- [ ] Deploy frontend to Vercel: set `VITE_API_URL` to deployed backend URL → verify all pages load
- [ ] Deploy Griot sidecar (if hosted separately) → verify `/health` endpoint
- [ ] End-to-end test on live deployment: full upload → transcribe → notes → tutor → export flow → commit + push
- [ ] Update `README.md` with the live deployed URL → commit + push
