# ARCHITECTURE.md — LectureScribe

## Tech stack
| Layer                     | Choice                                                    |
|---------------------------|-----------------------------------------------------------|
| Frontend                  | React + Tailwind CSS                                      |
| Backend                   | Node.js + Express                                         |
| Database                  | PostgreSQL (Users table & authentication records)         |
| Authentication            | bcrypt password hashing + JWT / HTTP-only signed cookies  |
| Primary Speech Engine     | Groq Whisper API (`whisper-large-v3-turbo`)               |
| Specialized Speech Engine | Griot Nano 1 FastAPI Sidecar (`Qlerqly/griot-nano-1`)      |
| Note generation           | LLM API (Groq Llama / Qwen)                               |
| Deployment — frontend     | Vercel                                                    |
| Deployment — backend      | Render or Railway (with managed PostgreSQL)               |

## Dual Transcription Engine: Groq Whisper + Griot Nano 1
1. **Groq Whisper API**: Fast, high-throughput cloud ASR for standard English lectures.
2. **Griot Nano 1 Sidecar**: FastAPI container running ConformerCTC model optimized for African-accented speech and multilingual audio.
3. **Intelligent Router**: Initial ~20-30s audio sample evaluated for language and confidence metrics (`avg_logprob`, `no_speech_prob`). Dispatches to Whisper for confident English or Griot Nano 1 for accented/multilingual speech.
4. **Normalized Output**: Both engines produce `{ transcript, language, engine }` before forwarding to note generation.

## Database Schema (PostgreSQL)
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  overview TEXT,
  duration_sec INTEGER,
  engine_used VARCHAR(50),
  language VARCHAR(50),
  file_name VARCHAR(255),
  transcript TEXT,
  key_concepts JSONB DEFAULT '[]',
  main_arguments JSONB DEFAULT '[]',
  important_terms JSONB DEFAULT '[]',
  study_notes JSONB DEFAULT '[]',
  key_takeaways JSONB DEFAULT '[]',
  revision_questions JSONB DEFAULT '[]',
  notes_markdown TEXT,
  tutor_history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lectures_user_id ON lectures(user_id);
CREATE INDEX IF NOT EXISTS idx_lectures_created_at ON lectures(created_at DESC);
```

## Authentication & 3-Attempt Trial Gating Flow
```
                     User Request (Upload Audio)
                                │
                                ▼
                   Is user logged in (JWT Cookie)?
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
             YES (Auth)                    NO (Trial)
                 │                             │
                 │                 Check signed trial cookie:
                 │                 trials_used count (0..3)
                 │                             │
                 │                   ┌─────────┴─────────┐
                 │                   ▼                   ▼
                 │             trials_used >= 3      trials_used < 3
                 │                   │                   │
                 │           Reject with 403             │
                 │           "TRIAL_EXHAUSTED"           │
                 │           (Show Login CTA)            │
                 │                                       │
                 └──────────────┬────────────────────────┘
                                │
                                ▼
                       Process Lecture Audio
                   (Validate → Transcribe → Notes)
                                │
                                ▼
                   Increment signed trial cookie
                      (trials_used = count + 1)
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/signup` — `{ email, password }` → Creates user in PostgreSQL, sets auth cookie, returns `{ user: { id, email } }` (rate limited)
- `POST /api/auth/login` — `{ email, password }` → Verifies bcrypt hash, sets auth cookie, returns `{ user: { id, email } }` (rate limited)
- `POST /api/auth/logout` — Clears auth cookie, returns `{ message: 'Logged out' }`
- `GET /api/auth/me` — Reads auth cookie, returns `{ user: { id, email } }` or 401

### Lecture Processing & Persistence Endpoints
- `POST /api/upload` — Accepts audio file (rate limited).
  - If authenticated: processes lecture and auto-saves to database.
  - If unauthenticated: verifies trial session cookie. If `trials_used < 3`, processes and increments trial cookie count. If `trials_used >= 3`, returns 403 `TRIAL_EXHAUSTED`.
- `GET /api/trial-status` — Returns `{ trialsRemaining: number, trialsUsed: number, maxTrials: 3, isAuthenticated: boolean }`
- `GET /api/lectures` — Returns list of all persisted lectures for authenticated student.
- `GET /api/lectures/:id` — Returns single lecture with transcript, study notes, and tutor history.
- `POST /api/lectures` — Saves or imports lecture record.
- `PUT /api/lectures/:id` — Updates lecture title or notes.
- `DELETE /api/lectures/:id` — Deletes lecture record.
- `POST /api/lectures/:id/tutor` — Appends/updates persisted AI Academic Tutor chat history.
- `POST /api/chat` — Grounded academic tutor Q&A endpoint (rate limited).

## Frontend Page Routes & Structure
```
/           ── Landing Page (Hero, Feature Highlights, Example Notes, Menu Nav)
/trial      ── Try LectureScribe (3-trial upload flow with remaining counter)
/login      ── Auth Page (Create Account & Log in toggle)
/workspace  ── Protected Student Workspace (Full unlimited uploads & study hub)
/about      ── About Page (Static problem statement, mission & 3-card architecture)
```

## Security Rules
- Passwords must be hashed using bcrypt (rounds >= 10).
- JWT secret (`JWT_SECRET`) and cookie signing secret (`SESSION_SECRET`) stored in backend `.env` only.
- Authentication cookies set with `httpOnly: true`, `sameSite: 'lax'`, and `secure: true` in production.
- API keys (Groq, HuggingFace) remain strictly backend-only.
