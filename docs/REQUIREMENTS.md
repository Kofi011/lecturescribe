# REQUIREMENTS.md — LectureScribe

## Functional requirements

### 1. Navigation & Menu
- The top navigation bar features a "Menu" pill button that opens a clean dropdown with four items in exact order:
  1. **HOME** — Navigates to the landing page
  2. **TRY LECTURESCRIBE** — Navigates to the trial page
  3. **LOGIN** — Navigates to the authentication page
  4. **ABOUT** — Navigates to the static about page
- Active route/page is visually indicated and navigation works smoothly across mobile and desktop.

### 2. Trial Flow ("Try LectureScribe")
- Anonymous (unauthenticated) users can execute the full upload → transcribe → note generation pipeline up to **3 times**.
- Server enforces the 3-trial limit using a signed HTTP-only session cookie (`lecture_trial_session`), preventing bypass via page refreshes or local storage clearing.
- The UI displays remaining trial credits (e.g. "Trial 1 of 3", "2 free trials remaining").
- When an anonymous user attempts a 4th upload after consuming all 3 free trials, the backend rejects the request with a structured error (`TRIAL_LIMIT_REACHED`), and the frontend displays a clear message encouraging them to create an account with a prominent CTA button to **LOGIN / SIGN UP**.
- Reuses the existing upload, staged processing, and results UI without duplicating code.

### 3. Static About Page
- Presents LectureScribe's mission, background, and technology architecture.
- Includes a clean hero section and a 3-card "How It Works" feature breakdown matching `DESIGN.md`.

### 4. Authentication & User Accounts
- Unified authentication page supporting two modes via toggle/tabs:
  - **Create account** (Sign up with email and password)
  - **Log in** (Sign in with email and password)
- Backend stores user credentials in a PostgreSQL `users` table.
- Passwords must be hashed using bcrypt (cost factor >= 10) before storage.
- Issues secure JWT/session token upon successful authentication.
- Provides `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, and `/api/auth/me` endpoints.

### 5. Protected Student Workspace
- Authenticated users are automatically redirected to the protected Workspace (`/workspace`).
- Workspace provides full, unlimited lecture processing (bypasses trial limits).
- Includes user profile status and logout button in the header.

### 6. Speech Transcription & Notes Engine
- Supports MP3, WAV, and M4A audio files up to ~15MB and ~10 minutes.
- Dual speech recognition routing: Groq Whisper API for clear English and Griot Nano 1 sidecar for African-accented English and multilingual speech.
- Generates structured Markdown notes, key concepts, terminology glossary, and self-test revision questions.
- Includes interactive AI Academic Tutor for grounded transcript Q&A.

## Non-functional requirements
- **Security & Privacy**:
  - Passwords and session secrets must never be exposed to the frontend or committed to git.
  - Authentication tokens and trial cookies must be HTTP-only, secure in production, and use SameSite protection.
  - Server-side validation of file type, duration, and authentication tokens.
- **Design & Responsiveness**:
  - Strictly follows `DESIGN.md`: black-and-white palette, pill buttons, bold display type with italic serif accent word, bordered cards.
  - Mobile responsive across all pages (phones, tablets, desktops).
- **Performance & Error Handling**:
  - Specific, human-readable error messages for validation, trial exhaustion, and API timeouts.
  - End-to-end processing under 2 minutes for 10-minute files.

## Explicitly NOT required
- Multi-file batch upload simultaneously
- Live streaming microphone transcription
- Real-time collaborative note editing
