# TASKS.md — Backend / API

**Branch: `dev/backend`**

Push to `dev/backend` after each task. Open PR into `dev` at the end of each phase.

---

## Phase 1 — Project Setup

- [ ] Initialize backend (Node.js + Express, ES modules) → commit + push
- [ ] Configure environment variables: create `.env.example` with all placeholder keys, add `.env` to `.gitignore` → commit + push
- [ ] Set up basic Express server with health check endpoint (`GET /api/health`) → commit + push
- [ ] Install and configure core middleware: `cors`, `cookie-parser`, `dotenv` → commit + push

## Phase 2 — File Upload & Validation

- [ ] Configure `multer` for multipart file upload (`POST /api/upload`) with temp storage in `backend/uploads/` → commit + push
- [ ] Add server-side file type validation: accept only MP3, WAV, M4A (check MIME type + extension) → commit + push
- [ ] Add server-side file size validation: reject files > ~15 MB with specific error message → commit + push
- [ ] Add server-side duration validation: use `music-metadata` to check audio duration, reject > ~10 min → commit + push
- [ ] Add temp file cleanup after processing completes or fails → commit + push
- [ ] Return specific, structured error responses for each validation failure type → commit + push

## Phase 3 — Database Setup

- [ ] Set up PostgreSQL connection pool using `pg` (support `DATABASE_URL` from env) → commit + push
- [ ] Create `users` table migration: `id` (UUID PK), `email` (UNIQUE), `password_hash`, `created_at`, `updated_at` + email index → commit + push
- [ ] Create `lectures` table migration: all fields per schema in CONTEXT.md (JSONB columns for concepts, terms, questions, tutor history) + indexes on `user_id` and `created_at` → commit + push
- [ ] Add local SQLite or JSON-file fallback for development without PostgreSQL (optional) → commit + push
- [ ] Test database connection and table creation → commit + push

## Phase 4 — Authentication Service

- [ ] Install `bcryptjs` and `jsonwebtoken` → commit + push
- [ ] Build `POST /api/auth/signup`: validate email + password, hash password (bcrypt, rounds ≥ 10), insert into `users` table, set JWT auth cookie, return `{ user: { id, email } }` → commit + push
- [ ] Build `POST /api/auth/login`: validate email + password, verify bcrypt hash, set JWT auth cookie, return `{ user: { id, email } }` → commit + push
- [ ] Build `POST /api/auth/logout`: clear auth cookie, return `{ message: 'Logged out' }` → commit + push
- [ ] Build `GET /api/auth/me`: read JWT from cookie, verify, return `{ user: { id, email } }` or 401 → commit + push
- [ ] Build auth middleware function: verifies JWT cookie, attaches `req.user`, returns 401 if invalid → commit + push
- [ ] Configure cookie settings: `httpOnly: true`, `sameSite: 'lax'`, `secure: true` in production → commit + push
- [ ] Add rate limiting on `/api/auth/signup` and `/api/auth/login` → commit + push

## Phase 5 — Trial Gating

- [ ] Implement signed trial session cookie (`lecture_trial_session`): stores `{ trials_used: 0..3 }` → commit + push
- [ ] Build trial check middleware: reads cookie, increments count on successful processing, rejects at ≥ 3 with `{ error: 'TRIAL_EXHAUSTED' }` (403) → commit + push
- [ ] Build `GET /api/trial-status`: returns `{ trialsRemaining, trialsUsed, maxTrials: 3, isAuthenticated }` → commit + push
- [ ] Update `POST /api/upload` to branch on auth state: authenticated → bypass trial, process + auto-save; unauthenticated → check trial cookie → commit + push
- [ ] Test trial flow: 3 uploads succeed, 4th is rejected with 403 → commit + push

## Phase 6 — Lectures CRUD

- [ ] Build `POST /api/lectures`: save lecture record to database (all fields from CONTEXT.md schema) → commit + push
- [ ] Build `GET /api/lectures`: list all lectures for `req.user.id`, ordered by `created_at DESC` → commit + push
- [ ] Build `GET /api/lectures/:id`: return single lecture with full data, verify ownership (`user_id = req.user.id`) → commit + push
- [ ] Build `PUT /api/lectures/:id`: update title, notes, or other editable fields, verify ownership → commit + push
- [ ] Build `DELETE /api/lectures/:id`: delete lecture record, verify ownership → commit + push
- [ ] Build `POST /api/lectures/:id/tutor`: append to `tutor_history` JSONB array, verify ownership → commit + push
- [ ] All lecture endpoints require auth middleware → commit + push

## Phase 7 — AI Pipeline Integration

- [ ] Wire `POST /api/upload` to call the AI pipeline's transcription service: pass audio file path → receive `{ transcript, language, engine }` → commit + push
  - **Depends on AI pipeline**: Transcription service must be callable (function or HTTP endpoint)
- [ ] Wire `POST /api/upload` to call the AI pipeline's notes service: pass transcript → receive full structured notes object → commit + push
  - **Depends on AI pipeline**: Notes service must be callable
- [ ] Build `POST /api/chat`: receive `{ message, transcript, history }` from frontend, forward to AI pipeline's tutor service, return `{ reply }` → commit + push
  - **Depends on AI pipeline**: Tutor service must be callable
- [ ] Add rate limiting on `/api/upload` and `/api/chat` → commit + push
- [ ] On authenticated upload: auto-save the full result (transcript + notes) to the `lectures` table → commit + push

## Phase 8 — Security Hardening

- [ ] Install and configure `helmet` middleware (security headers: CSP, HSTS, X-Content-Type-Options, etc.) → commit + push
- [ ] Configure CORS to allow only the deployed frontend origin (configurable via env var) → commit + push
- [ ] Audit all endpoints: verify auth middleware is applied where required, validate all inputs → commit + push
- [ ] Verify `.env` is gitignored and no secrets are committed → commit + push
- [ ] Test all rate limits: verify they trigger correctly under load → commit + push
