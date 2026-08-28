# TASKS.md — AI Pipeline

**Branch: `dev/ai-pipeline`**

Push to `dev/ai-pipeline` after each task. Open PR into `dev` at the end of each phase.

---

## Phase 1 — Griot Nano 1 Sidecar Setup

- [ ] Set up Python/FastAPI project in `griot_sidecar/` with `requirements.txt` → commit + push
- [ ] Implement `GET /health` endpoint (readiness check) → commit + push
- [ ] Load `Qlerqly/griot-nano-1` model (ConformerCTC) using `transformers` + `torch` → commit + push
- [ ] Implement `POST /transcribe` endpoint: accept audio file (multipart), preprocess with `torchaudio`/`soundfile`, run inference, return `{ transcript, language, engine: "griot-nano-1" }` → commit + push
- [ ] Test sidecar locally with MP3, WAV, and M4A files → commit + push
- [ ] Handle errors: unsupported format, model loading failure, inference timeout → commit + push

## Phase 2 — Groq Whisper Integration

- [ ] Set up Groq SDK in the Node.js backend (`groq-sdk` package) → commit + push
- [ ] Implement Whisper transcription function: send audio to Groq Whisper API (`whisper-large-v3-turbo`) with `verbose_json` response format → commit + push
- [ ] Parse `verbose_json` response: extract full transcript text, detected language, and per-segment metrics (`avg_logprob`, `no_speech_prob`) → commit + push
- [ ] Return normalized output: `{ transcript, language: "en", engine: "whisper" }` → commit + push
- [ ] Handle Groq API errors: rate limits, timeouts, invalid audio — return specific error codes (`TRANSCRIPTION_FAILED`) with the actual error message → commit + push

## Phase 3 — Intelligent ASR Routing

- [ ] Implement sample extraction: extract ~20-30 second initial audio sample for language detection → commit + push
- [ ] Implement routing logic: send sample to Whisper, evaluate `detected_language`, `avg_logprob`, and `no_speech_prob` against thresholds → commit + push
- [ ] Route decision: high-confidence English → Whisper (full file); low confidence or non-English → Griot Nano 1 sidecar → commit + push
- [ ] Implement fallback: if Griot sidecar `GET /health` fails or `/transcribe` times out, fall back to Whisper with a warning flag in the response → commit + push
- [ ] Normalize both engine outputs to `{ transcript, language, engine }` before returning to the backend → commit + push
- [ ] Test routing with: clear English audio, accented English audio, non-English audio, and degraded/noisy audio → commit + push

## Phase 4 — Notes Generation (LLM)

- [ ] Design the summarization prompt: instruct the LLM to produce all required fields (title, overview, study_notes, key_concepts, main_arguments, important_terms, key_takeaways, revision_questions, notes_markdown) as valid JSON → commit + push
- [ ] Implement LLM API call: send transcript + prompt to Groq Llama or Qwen, parse the JSON response → commit + push
- [ ] Handle malformed JSON from LLM: detect parse errors, retry once with a stricter prompt, return structured error if retry fails → commit + push
- [ ] Validate output: check all required fields are present, apply defaults for missing optional fields → commit + push
- [ ] Test with transcripts of varying length (1 min, 5 min, 10 min) and topic diversity → commit + push

### Notes output schema (what you must return)

```json
{
  "title": "string",
  "overview": "string",
  "study_notes": [{ "heading": "string", "bullets": ["string"] }],
  "key_concepts": ["string"],
  "main_arguments": ["string"],
  "important_terms": [{ "term": "string", "definition": "string" }],
  "key_takeaways": ["string"],
  "revision_questions": [{ "question": "string", "answer": "string" }],
  "notes_markdown": "string"
}
```

## Phase 5 — AI Academic Tutor

- [ ] Design the tutor system prompt: instruct the LLM to answer only from the provided transcript, refuse questions not covered, maintain academic tone → commit + push
- [ ] Implement tutor function: receive `{ message, transcript, history }`, construct prompt with transcript as context + conversation history, call LLM, return `{ reply }` → commit + push
- [ ] Test grounding: ask questions covered by the transcript (should answer) and questions NOT covered (should refuse gracefully) → commit + push
- [ ] Test multi-turn conversation: verify history is used for contextual follow-ups → commit + push

## Phase 6 — Integration & End-to-End Testing

- [ ] Expose clean function interfaces for the backend to call: `transcribe(filePath)`, `generateNotes(transcript)`, `chat({ message, transcript, history })` → commit + push
  - **Coordinate with backend**: agree on function signatures or HTTP endpoints
- [ ] Test full pipeline locally: audio file → routing → transcription → notes → tutor Q&A → verify all output fields → commit + push
- [ ] Test with edge cases: very short audio (<1 min), maximum length (~10 min), silence/noise, multiple languages → commit + push
- [ ] Document any tunable parameters (routing thresholds, prompt templates) in a comment block or config file → commit + push
