# LectureScribe

Upload a pre-recorded lecture (mp3/wav/m4a, ~10 min max) and get back a
transcript plus short, structured notes — headings, bullets, a suggested
title, and key takeaways. Copy or download the notes when you're done.

## Features
- Audio upload with format/duration/size validation
- Live processing status (Uploaded → Transcribing → Summarizing → Complete)
- Transcript view + structured Notes view (tabs)
- Copy-to-clipboard and download for notes
- Clear, specific error messages on failure
- Mobile-responsive, deployed to a public link

## Tech stack
- Frontend: React + Tailwind CSS (deployed on Vercel)
- Backend: Node.js + Express (deployed on Render/Railway)
- Speech-to-text: Groq Whisper API
- Note generation: LLM API

See `ARCHITECTURE.md` for the full system flow.

## Getting started (local dev)

### Backend
```
cd backend
npm install
cp .env.example .env   # fill in your API keys
npm run dev
```

### Frontend
```
cd frontend
npm install
npm run dev
```

## Environment variables (backend `.env`)
```
GROQ_API_KEY=your_key_here
LLM_API_KEY=your_key_here
PORT=5000
```
Never commit `.env` — it's gitignored. Use `.env.example` as the template.

## Project docs
- `PROJECT.md` — what this project is and its user stories
- `REQUIREMENTS.md` — functional/non-functional requirements
- `ARCHITECTURE.md` — tech stack, system flow, API design
- `DESIGN.md` — visual style guide (inspired by sms.sasusync.com)
- `AGENTS.md` — operating rules for the coding agent
- `TASKS.md` — development checklist (with git workflow)

## Live link
_Add the deployed URL here once Phase 8 is complete._

## Deployment
Frontend on Vercel, backend on Render/Railway. See `ARCHITECTURE.md` for
deployment notes and `TASKS.md` Phase 8 for the deployment checklist.
