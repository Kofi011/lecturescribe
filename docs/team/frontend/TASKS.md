# TASKS.md — Frontend / UI

**Branch: `dev/frontend`**

Push to `dev/frontend` after each task. Open PR into `dev` at the end of each phase.

---

## Phase 1 — Project Setup

- [ ] Initialize frontend (React + your CSS framework of choice, see DESIGN_BRIEF.md) → commit + push
- [ ] Set up base design system: color tokens, typography, button styles, spacing scale (document choices in a new `DESIGN.md` in this folder) → commit + push

## Phase 2 — Landing Page & Upload UI

- [ ] Build landing page hero section (headline, CTA buttons) → commit + push
- [ ] Build feature highlights section (e.g. 3-card grid) → commit + push
- [ ] Build mid-page CTA card linking to trial flow → commit + push
- [ ] Build contact/inquiry section → commit + push
- [ ] Build footer component → commit + push
- [ ] Build upload card component (file picker, drag-and-drop) → commit + push
- [ ] Add client-side file validation: accepted formats (MP3/WAV/M4A), file size (~15 MB), duration (~10 min) with specific error messages → commit + push

## Phase 3 — Processing Status UI

- [ ] Build staged processing indicator (Uploaded → Transcribing → Summarizing → Complete) inside a status card → commit + push
- [ ] Build error state UI for each failure type (validation, API timeout, server error) → commit + push
- [ ] Add loading states/spinners for all async actions → commit + push

## Phase 4 — Results View

- [ ] Build tab switcher component (Transcript tab / Notes tab) → commit + push
- [ ] Build Transcript tab: full transcript display with engine/language badge → commit + push
- [ ] Build Notes tab: structured Markdown renderer (headings, bullets, key concepts, terms, takeaways, revision questions) → commit + push
- [ ] Add Copy Notes button (copies formatted notes to clipboard with confirmation toast) → commit + push
- [ ] Add Download buttons: .txt, .md, .json exports → commit + push
- [ ] Build branded PDF export with LectureScribe Verified Stamp & Seal (client-side PDF generation) → commit + push

## Phase 5 — Audio Player

- [ ] Build minimalist audio player component (play/pause, scrubber, timestamp counter) → commit + push
- [ ] Add playback speed toggles (1x, 1.25x, 1.5x, 2x) → commit + push
- [ ] Integrate audio player into results view → commit + push

## Phase 6 — Navigation & Menu

- [ ] Build top nav bar: wordmark logo (left) + Menu pill button (right) → commit + push
- [ ] Build menu dropdown with items: HOME, TRY LECTURESCRIBE, LOGIN, ABOUT (exact order) → commit + push
- [ ] Add active route visual indicator → commit + push
- [ ] Build mobile navigation modal/drawer → commit + push
- [ ] Set up React Router: `/`, `/trial`, `/login`, `/workspace`, `/about` → commit + push

## Phase 7 — Static Pages

- [ ] Build About page: hero section, problem/solution narrative, 3-card architecture/philosophy grid → commit + push
- [ ] Confirm mobile responsiveness across all pages built so far → commit + push

## Phase 8 — Auth Page UI

- [ ] Build auth page (`/login`): centered card with pill toggle between "Log in" and "Create account" → commit + push
- [ ] Build form inputs (email, password) with validation feedback → commit + push
- [ ] Build submit button and clean error messaging container → commit + push
- [ ] Wire auth forms to backend endpoints: `POST /api/auth/signup`, `POST /api/auth/login` → commit + push
  - **Depends on backend**: Backend must have `/api/auth/signup` and `/api/auth/login` deployed and returning `{ user: { id, email } }` with auth cookie
- [ ] Implement auth state management: check `GET /api/auth/me` on app load, store user state, handle 401 → commit + push
  - **Depends on backend**: Backend must have `/api/auth/me` deployed
- [ ] Add logout flow: call `POST /api/auth/logout`, clear local state, redirect to landing → commit + push

## Phase 9 — Trial Mode UI

- [ ] Build trial page (`/trial`): reuse upload/processing/results components → commit + push
- [ ] Display remaining trial credits badge (e.g. "Free Trial • 3 of 3 remaining") by calling `GET /api/trial-status` → commit + push
  - **Depends on backend**: Backend must have `/api/trial-status` deployed
- [ ] Build trial exhaustion state: bordered card with "You've completed your 3 free trials" + "Create an Account to Continue" CTA button → commit + push
- [ ] Handle 403 `TRIAL_EXHAUSTED` response from `POST /api/upload` gracefully → commit + push

## Phase 10 — Protected Workspace UI

- [ ] Build workspace page (`/workspace`): route guard that redirects unauthenticated users to `/login` → commit + push
- [ ] Build workspace header: user email badge + "Log out" button → commit + push
- [ ] Build unlimited upload zone (same upload component, no trial limits) → commit + push
- [ ] Build past lecture library grid: display all lectures from `GET /api/lectures` with title, date, engine, language metadata → commit + push
  - **Depends on backend**: Backend must have `GET /api/lectures` deployed
- [ ] Build lecture detail view: click a past lecture → load full data from `GET /api/lectures/:id` → show transcript, notes, tutor history → commit + push
- [ ] Wire workspace upload to `POST /api/upload` (authenticated mode) → auto-save result → commit + push

## Phase 11 — AI Tutor UI

- [ ] Build tutor drawer/panel component: chat interface with message input, send button, conversation display → commit + push
- [ ] Wire tutor to `POST /api/chat`: send `{ message, transcript, history }`, display `{ reply }` → commit + push
  - **Depends on backend + AI pipeline**: Backend must have `/api/chat` deployed, AI pipeline must be returning grounded replies
- [ ] Integrate tutor into results view (accessible from both trial and workspace) → commit + push
- [ ] Wire tutor history persistence: call `POST /api/lectures/:id/tutor` to save conversations → commit + push
  - **Depends on backend**: Backend must have `/api/lectures/:id/tutor` deployed

## Phase 12 — Polish & Responsiveness

- [ ] Full mobile responsiveness audit across all pages and breakpoints → commit + push
- [ ] Verify accessible contrast and readable type at every size → commit + push
- [ ] Add micro-animations and transitions for a polished feel → commit + push
- [ ] Final design consistency pass: ensure all screens match your documented DESIGN.md → commit + push
