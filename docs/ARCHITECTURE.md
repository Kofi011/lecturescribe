# ARCHITECTURE.md — LectureScribe

## Tech stack
| Layer                | Choice                          |
|-----------------------|----------------------------------|
| Frontend              | React + Tailwind CSS            |
| Backend                | Node.js + Express               |
| Primary Speech Engine  | Groq Whisper API (whisper-large-v3-turbo) |
| Specialized Speech Engine | Griot Nano 1 FastAPI Sidecar (Qlerqly/griot-nano-1) |
| Note generation        | LLM API (Groq Llama / Qwen)     |
| Storage                | Temporary server-side storage only (no DB required for MVP) |
| Deployment — frontend   | Vercel                          |
| Deployment — backend    | Render or Railway               |

## Dual Transcription Engine: Groq Whisper + Griot Nano 1
LectureScribe uses an intelligent dual-engine routing architecture:
1. **Groq Whisper API**: Fast, high-throughput cloud ASR for standard clear English lectures.
2. **Griot Nano 1 (`Qlerqly/griot-nano-1`)**: Local/Containerized Python FastAPI sidecar (`POST /transcribe`) specialized for African-accented English, diverse dialects, and multilingual speech.
3. **Language & Confidence Routing**: A ~20–30s initial audio sample is analyzed with `verbose_json`. If English with high confidence (favorable `avg_logprob` / `no_speech_prob`), Whisper transcribes the full file; otherwise, the audio is routed to the Griot Nano 1 sidecar.
4. **Normalized Output**: Both engines normalize results to `{ transcript, language, engine }` before forwarding to the study note generation service.

## System flow
```
Mobile/Web Frontend (upload mp3/wav/m4a)
        │
        ▼
Backend API (Node/Express)
        │
        ├─ 1. Validate file (type, size, duration)
        │
        ├─ 2. Language & Confidence Sample Check (~20-30s sample)
        │        ├─ English + High Confidence ──► Groq Whisper API
        │        └─ Multilingual / Accented / Low Conf ──► Griot Nano 1 Sidecar
        │
        ├─ 3. Send normalized transcript → LLM API
        │        └─ returns structured study knowledge { title, overview, concepts, notes, quiz }
        │
        ▼
Response to frontend: { status, title, transcript, notes_markdown, engine_used }
        │
        ▼
Results Page (Tabs: Overview & Concepts | Study Notes | Terms | Quiz | Transcript)
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
