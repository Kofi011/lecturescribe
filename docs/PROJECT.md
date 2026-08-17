# PROJECT.md — LectureScribe

## What this is
LectureScribe is a web service that takes a pre-recorded lecture audio file
and turns it into short, structured study notes. The user uploads audio,
watches it get processed, and ends up with a transcript + a clean set of
headed/bulleted notes they can copy or download.

## Why it exists
Students record or receive lecture audio but rarely re-listen to it because
it takes too long. LectureScribe removes that friction: upload once, get a
usable summary in minutes.

## Target users
- University students who have lecture recordings (mp3/wav/m4a)
- Demo/grading context: single-user, no login required for MVP

## Core user stories
1. As a student, I want to upload a pre-recorded lecture audio file
   (mp3/wav/m4a, capped at ~10 min for demo) and see live processing status,
   so I know it's working.
2. As a student, I want the audio transcribed and then condensed into
   structured, headed/bulleted notes with a suggested title — with both
   transcript and notes viewable — so I get a short, usable summary instead
   of a wall of text.
3. As a student, I want to copy/download my notes, get clear error messages
   on failure, and use it on a deployed mobile-friendly link, so the tool is
   reliable and portable.

## Scope for the demo (MVP)
- Single file upload, max ~10 minutes / ~15MB
- Formats: mp3, wav, m4a only
- Processing stages shown to the user (upload → transcribe → summarize → done)
- No live word-by-word transcription — status stages only
- No accounts/login — session-based, nothing persisted long-term
- Deployed, mobile-friendly link

## Out of scope (for now)
- Multi-file batch upload
- User accounts / history of past lectures
- Real-time streaming transcription of live audio
- Editing notes after generation

## Expected workflow
Upload audio → validate → transcribe (Whisper) → summarize into notes (LLM)
→ show transcript + notes → copy/download.

## Visual style
The frontend takes visual inspiration (layout and tone, not content) from
sms.sasusync.com: black-and-white, bold headline with one italic serif
accent word, pill-shaped buttons, minimal "Menu" nav, alternating
light/dark sections, bordered white cards. Full spec in `DESIGN.md`.
