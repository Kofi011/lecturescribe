# REQUIREMENTS.md — LectureScribe

## Functional requirements
- User can upload an audio file in MP3, WAV, or M4A format
- Maximum lecture duration is ~10 minutes (reject longer files with a clear message)
- Maximum file size enforced (~15MB, matched to the 10-min cap)
- System validates file type and rejects unsupported formats with a clear message
- System shows live processing status through defined stages:
  - Uploaded → Transcribing → Summarizing → Complete (or Error)
- System transcribes the audio into text
- System generates structured notes from the transcript:
  - Suggested title
  - Section headings
  - Bullet points under each heading
  - A short "Key Takeaways" section
- User can view the raw transcript
- User can view the generated notes
- User can switch between transcript view and notes view (tabs/toggle)
- User can copy notes to clipboard
- User can download notes as a file (.txt or .md)
- System shows a specific, human-readable error message for each failure type:
  - Unsupported file format
  - File too long / too large
  - Transcription API failure or timeout
  - Note-generation API failure or timeout
  - Generic network/server error

## Non-functional requirements
- Mobile-responsive UI (usable on a phone screen, not just desktop)
- API keys (Whisper/LLM) must never be exposed in frontend code — backend only
- Reasonable end-to-end processing time for a 10-minute file (aim: well under 2 minutes)
- Clean, uncluttered, accessible interface (readable font sizes, enough contrast)
- App must be deployed to a public URL, not just runnable locally
- Errors must degrade gracefully — no blank screens or raw stack traces shown to the user

## Explicitly NOT required for MVP
- Authentication / user accounts
- Persistent database of past lectures (session-only storage is fine)
- Real-time word-by-word transcription display
- Multi-language support (English-only is acceptable)
