# CONTEXT.md — Team Lead / Infra-Data-QA

## What you're responsible for

LectureScribe is an AI-powered academic web platform that converts lecture audio into structured study notes. As lead, you own: repo infrastructure, CI/CD, deployment, end-to-end testing, documentation, PR reviews, and the final merge to `main`.

## Your responsibilities

### 1. Repository & Branch Management
- Maintain the branch structure: `main` ← `dev` ← `dev/{frontend,backend,ai-pipeline,lead}`
- You are the only one who merges `dev` into `main`
- Review and merge all team PRs from `dev/{role}` into `dev`
- Keep root `docs/TASKS.md` in sync with progress across all team folders

### 2. Deployment & Infrastructure
- Deploy backend to Render or Railway with managed PostgreSQL
- Deploy frontend to Vercel, pointed to the backend URL
- Configure production environment variables on both platforms
- Own the `.env.example` template and production env var documentation

### 3. End-to-End Testing & QA
- Test the full pipeline: upload → transcribe → notes → export
- Test with MP3, WAV, and M4A files of varying quality
- Test trial gating: 3 uploads → exhaustion → login CTA
- Test auth flow: signup → login → workspace → logout
- Test error cases: invalid files, API failures, expired sessions
- Verify mobile responsiveness across devices

### 4. Documentation & Coordination
- Maintain `docs/TEAM.md`, root `docs/TASKS.md`, and project-wide docs
- Break ties on scope decisions and cross-role conflicts
- Ensure handoff points between roles are clearly defined
- Update `README.md` with deployment URLs once live

## Platform overview

| Route | Page | Owner |
|---|---|---|
| `/` | Landing Page | Frontend |
| `/trial` | Trial Page (3 free uploads) | Frontend (UI) + Backend (gating) + AI Pipeline (processing) |
| `/login` | Auth Page | Frontend (UI) + Backend (auth service) |
| `/workspace` | Protected Workspace | Frontend (UI) + Backend (CRUD) + AI Pipeline (processing) |
| `/about` | About Page | Frontend |

## Tech stack overview

| Layer | Technology | Owner |
|---|---|---|
| Frontend | React + CSS (frontend's choice) | Frontend |
| Backend | Node.js + Express | Backend |
| Database | PostgreSQL | Backend |
| Auth | bcrypt + JWT + HTTP-only cookies | Backend |
| Primary ASR | Groq Whisper API | AI Pipeline |
| Specialized ASR | Griot Nano 1 (FastAPI sidecar) | AI Pipeline |
| Note Generation | Groq Llama / Qwen LLM | AI Pipeline |
| Frontend Deploy | Vercel | Lead |
| Backend Deploy | Render / Railway | Lead |

## Deployment checklist

1. Merge `dev` into `main` (after all phases pass E2E testing)
2. Deploy backend to Render/Railway:
   - Set production env vars: `GROQ_API_KEY`, `LLM_API_KEY`, `JWT_SECRET`, `SESSION_SECRET`, `DATABASE_URL`, `PORT`
   - Run database migrations
   - Verify `/api/auth/me` returns 401 (no cookie) and Griot health check passes
3. Deploy frontend to Vercel:
   - Set `VITE_API_URL` (or equivalent) to the deployed backend URL
   - Verify all pages load and routing works
4. End-to-end test on the live deployment
5. Update `README.md` with the live URL

## Cross-role integration points to monitor

| Integration | Frontend needs | Backend provides | AI Pipeline provides |
|---|---|---|---|
| Upload flow | POST `/api/upload` response shape | Endpoint + validation | Transcription + notes result |
| Auth flow | Cookie-based session state | Auth endpoints + JWT | — |
| Trial gating | `GET /api/trial-status` + 403 handling | Trial cookie + gating logic | — |
| Tutor chat | POST `/api/chat` response | Endpoint + rate limiting | Grounded Q&A response |
| Lecture library | GET `/api/lectures` list | CRUD endpoints | — |

When reviewing PRs, check that both sides of each integration point match (request/response shapes, error codes, auth requirements).
