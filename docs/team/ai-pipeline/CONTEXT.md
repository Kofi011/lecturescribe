# CONTEXT.md — AI Pipeline

## What you're building

LectureScribe is an AI-powered academic web platform that converts lecture audio into structured study notes. Your job is the entire AI/ML pipeline: speech-to-text transcription (dual engine), intelligent routing, structured notes generation via LLM, and the grounded AI Academic Tutor.

## What you own

1. **Griot Nano 1 sidecar** (`griot_sidecar/`) — Python/FastAPI service running ConformerCTC for accented/multilingual speech
2. **Groq Whisper integration** — calling the Groq Whisper API (`whisper-large-v3-turbo`) with `verbose_json` response format
3. **Intelligent ASR routing logic** — deciding which engine handles a given audio file based on language + confidence signals
4. **Normalized transcription output** — both engines produce `{ transcript, language, engine }` regardless of source
5. **LLM notes generation** — prompt engineering and API calls (Groq Llama / Qwen) to produce structured study materials from a transcript
6. **AI Academic Tutor** — grounded Q&A service that answers student questions constrained to the lecture transcript

## Dual Transcription Engine — Full Design

### Engine 1: Groq Whisper API

- Model: `whisper-large-v3-turbo`
- Call via Groq SDK with `verbose_json` response format to get segment-level metadata
- Returns: transcript text, detected language, and per-segment metrics (`avg_logprob`, `no_speech_prob`)
- Use for: clear English lectures, high-confidence audio

### Engine 2: Griot Nano 1 Sidecar

- Model: `Qlerqly/griot-nano-1` (ConformerCTC architecture)
- Runs as a FastAPI container with two endpoints:
  - `POST /transcribe` — accepts audio file (multipart), returns transcript
  - `GET /health` — readiness check
- Use for: African-accented English, multilingual speech, code-switched audio
- Dependencies: `transformers`, `torch`, `torchaudio`, `soundfile`, `fastapi`, `uvicorn`

### Intelligent Router — Decision Flow

```
                   Audio file received from backend
                          │
                          ▼
               Extract ~20-30s initial sample
                          │
                          ▼
              Send sample to Groq Whisper API
              (verbose_json response format)
                          │
                          ▼
              ┌───────────────────────────┐
              │ Evaluate routing signals: │
              │ • detected language       │
              │ • avg_logprob threshold   │
              │ • no_speech_prob          │
              └─────────────┬─────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
    High-confidence English     Low confidence / Non-English
              │                           │
              ▼                           ▼
    Groq Whisper (full file)    Griot Nano 1 Sidecar
              │                           │
              └─────────────┬─────────────┘
                            ▼
              Normalized output:
              { transcript, language, engine }
```

**Routing criteria** (tune these thresholds during testing):
- If detected language = English AND `avg_logprob > threshold` → Whisper
- If detected language ≠ English OR confidence is low → Griot Nano 1
- If Griot Nano 1 sidecar is unavailable → fallback to Whisper with a warning

### Normalized Output Format

Both engines must produce the same shape for the backend to consume:

```json
{
  "transcript": "Full transcript text...",
  "language": "en",
  "engine": "whisper | griot-nano-1"
}
```

## Notes Generation Engine

Take a transcript and produce structured study materials using an LLM API (Groq Llama or Qwen).

### Prompt design requirements

Your prompt(s) must generate all of the following fields:

| Field | Type | Description |
|---|---|---|
| `title` | string | Suggested lecture title derived from content |
| `overview` | string | 2-3 sentence summary of the lecture |
| `study_notes` | array | `[{ heading: string, bullets: string[] }]` — organized section notes |
| `key_concepts` | array | `["Concept 1", "Concept 2", ...]` — core ideas |
| `main_arguments` | array | `["Argument 1", ...]` — main arguments or theses |
| `important_terms` | array | `[{ term: string, definition: string }]` — glossary |
| `key_takeaways` | array | `["Takeaway 1", ...]` — most important points |
| `revision_questions` | array | `[{ question: string, answer: string }]` — self-test questions |
| `notes_markdown` | string | Complete structured Markdown document with all of the above |

### Output format

Return valid JSON. The backend will parse it and forward to the frontend. If the LLM returns malformed JSON, handle the parse error and retry or return a structured error.

## AI Academic Tutor

### Purpose

Students ask questions about their lecture. The tutor answers using only the transcript as its knowledge base — no external knowledge, no hallucination.

### Interface

The backend calls your tutor service with:

```json
{
  "message": "What did the professor say about neural networks?",
  "transcript": "Full transcript text...",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

You return:

```json
{
  "reply": "Based on the lecture, the professor discussed..."
}
```

### Grounding rules

- The tutor must only answer from information in the transcript
- If the transcript doesn't cover the question, say so explicitly
- Include conversation history for multi-turn context
- Keep answers concise and academic in tone

## What the backend gives you

The backend person handles file upload, validation, and routing the audio to your services. You expose internal functions or endpoints they can call:

1. **Transcription function**: receives audio file path → returns `{ transcript, language, engine }`
2. **Notes function**: receives transcript string → returns full structured notes object (JSON)
3. **Chat function**: receives `{ message, transcript, history }` → returns `{ reply }`

Coordinate with the backend person on whether these are in-process function calls (if your code lives in the Node backend) or HTTP calls (if the Griot sidecar is separate).

## Environment variables you need

```
GROQ_API_KEY=your_key_here       # Groq Whisper + LLM API
LLM_API_KEY=your_key_here        # If using a separate LLM provider
HF_TOKEN=your_hf_token           # HuggingFace token for Griot Nano 1 model
GRIOT_SIDECAR_URL=http://localhost:8001  # Griot sidecar address
```

## Tech stack

- **Groq SDK** (`groq-sdk` npm package) — for Whisper API and LLM calls from Node.js
- **Python / FastAPI** — for the Griot Nano 1 sidecar
- **PyTorch + Transformers + torchaudio** — model runtime in the sidecar
- **Griot Nano 1 model**: `Qlerqly/griot-nano-1` from HuggingFace

## Audio constraints

- Formats: MP3, WAV, M4A (the backend validates this before handing to you)
- Max duration: ~10 minutes
- Max file size: ~15 MB
- Target processing time: full transcription + notes in under 2 minutes for a 10-minute file

## Error handling

- If Groq API fails: return specific error (`TRANSCRIPTION_FAILED`, `LLM_FAILED`) with the actual error message
- If Griot sidecar is unreachable: fall back to Whisper-only, include a warning in the response
- If LLM returns malformed JSON: retry once, then return a parse error
- Don't silently swallow errors — the backend needs to surface them to the user
