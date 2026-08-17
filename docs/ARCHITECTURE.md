# ARCHITECTURE.md — LectureScribe

## Tech stack
| Layer                | Choice                          |
|-----------------------|----------------------------------|
| Frontend              | React + Tailwind CSS            |
| Backend                | Node.js + Express               |
| Speech-to-text         | Groq Whisper API (whisper-large-v3-turbo) |
| Note generation        | LLM API (Claude or GPT)         |
| Storage                | Temporary server-side storage only (no DB required for MVP) |
| Deployment — frontend   | Vercel                          |
| Deployment — backend    | Render or Railway               |

Note: a database (PostgreSQL) is optional and NOT required for the MVP —
add it later only if you need to persist past lectures.

## Visual design
Frontend styling follows `DESIGN.md` (inspired by sms.sasusync.com's
layout/tone): black-and-white palette, bold sans headline + one italic
serif accent word, pill buttons, minimal top nav with a single "Menu"
button, alternating light/dark sections, bordered white cards for the
upload widget and notes/transcript views. Read `DESIGN.md` before building
any UI component.

## System flow
```
Mobile/Web Frontend (upload mp3/wav/m4a)
        │
        ▼
Backend API (Node/Express)
        │
        ├─ 1. Validate file (type, size, duration)
        │
        ├─ 2. Send audio → Groq Whisper API
        │        └─ returns transcript
        │
        ├─ 3. Send transcript → LLM API
        │        └─ returns { title, notes_markdown }
        │
        ▼
Response to frontend: { status, title, transcript, notes_markdown }
        │
        ▼
Results Page (tabs: Transcript | Notes) + Copy/Download buttons
```

## Processing status states
Shown to the user during processing (satisfies the "live processing status" story):
```
✓ Audio uploaded
✓ Validating file
● Transcribing lecture...
○ Generating notes
○ Complete
```
On failure, replace the current stage with an ✗ and a specific error message.

## API endpoints (suggested)
- `POST /api/upload` — accepts audio file, runs validation, kicks off processing
- `GET /api/status/:jobId` — returns current stage (for polling) OR
  process synchronously and skip polling for MVP simplicity (see note below)
- `GET /api/result/:jobId` — returns `{ title, transcript, notes_markdown }`

### Simplification for the 10-minute demo cap
Because files are capped at ~10 minutes, you can process **synchronously**:
the frontend uploads, shows a spinner/staged progress bar, and waits for one
response containing everything. This avoids building a job queue/polling
system. Only build async polling if processing time becomes a real problem.

## Security rules
- API keys (Groq, LLM) live only in backend environment variables
- Never send API keys to the frontend, never commit them to git
- Use `.env` locally and platform secrets (Vercel/Render env vars) in production
- Validate file type/size server-side, not just client-side (client checks are for UX only)

## Data handling
- Uploaded audio files are temporary — delete after processing completes
- No user data persisted beyond the current session for MVP

## Screen-by-screen (per DESIGN.md)
```
Landing / Upload page (light bg)
  Nav: "LectureScribe" wordmark (italic serif) | "Menu" pill, top-right
  Headline: "Turn your lecture into *notes*."   ← italic serif on "notes"
  Subtext: one line on what it does
  Buttons: [ Upload a lecture ] (solid black)  [ See an example ] (outline)
  Upload widget: bordered white card below hero

Processing page (dark rounded hero card)
  Headline (white): "Processing your lecture."
  Status list inside the card:
    ✓ Audio uploaded
    ✓ Validating file
    ● Transcribing...
    ○ Generating notes
    ○ Complete

Results page (light bg)
  Tabs (pill style): [ Transcript ]  [ Notes ]
  Content: bordered white card, bold headings + bullets
  Buttons below card: [ Copy notes ] (solid)  [ Download ] (outline)
```
