# PROJECT.md — LectureScribe

## What this is
LectureScribe is an academic AI web platform that converts lecture audio
recordings into structured study notes, transcripts, key concept graphs,
and interactive revision material.

The platform provides:
1. **Public Landing Page**: Overview of features, interactive example notes, and brand introduction.
2. **Trial Mode ("Try LectureScribe")**: Allows prospective students to test the full upload → transcribe → notes pipeline up to **3 times** without creating an account.
3. **Account System & Authentication**: Secure sign up and login with email and hashed passwords.
4. **Protected Student Workspace**: Full-featured, unlimited lecture transcription and study notes hub for registered users.
5. **About Page**: Static brand and mission overview explaining why LectureScribe was built.

## Why it exists
Students record or receive lecture audio but rarely re-listen to it because
it takes too long. LectureScribe removes that friction: upload once, get a
usable summary in minutes.

## Target users
- University and college students with audio recordings (mp3/wav/m4a)
- Educators, teaching assistants, and researchers needing quick transcripts and structured outlines

## Core user stories
1. **Menu Navigation**: As a visitor, I want to open the Menu dropdown and easily navigate between HOME, TRY LECTURESCRIBE, LOGIN, and ABOUT.
2. **Trial Experience**: As a new student, I want to test the full transcription and notes flow for up to 3 trial recordings without signing up, so I can thoroughly evaluate the tool.
3. **Account Registration & Login**: As a student who has used my 3 free trials (or at any time), I want to create a secure account and log in, unlocking unlimited lecture uploads and accessing the private workspace.
4. **Transcription & Study Generation**: As a student, I want dual-engine speech recognition (Groq Whisper + Griot Nano 1 for accented/multilingual speech) that generates formatted summaries, key concepts, and revision questions.
5. **Study Export & Tutor Q&A**: As a student, I want to copy/download notes (.txt/.md/.json) and ask grounded questions to the AI Academic Tutor.

## Scope
- Navigation Menu: Pill dropdown with HOME, TRY LECTURESCRIBE, LOGIN, ABOUT
- Trial Flow: 3-use server-side signed session cookie gating; prompts login/signup after 3 attempts
- Auth System: Email + password signup/login, PostgreSQL users table, bcrypt hashing, JWT/session authentication
- Protected Workspace: Gated route for authenticated students with unlimited uploads and study tools
- About Page: Static overview detailing the problem, solution, and technology
- Dual Transcription: Groq Whisper + Griot Nano 1 sidecar routing
- Output Formats: Structured Markdown, Overview, Concepts, Terminology, Revision Q&A, Raw Transcript

## Out of scope (for future phases)
- Multi-file batch upload simultaneously
- Real-time streaming transcription of live microphone audio during a lecture
- Collaborative note sharing / team workspaces

## Expected workflow
1. **Trial**: Visit site → Click "Try LectureScribe" → Upload audio → Transcribe & summarize → View notes (tracks up to 3 free uploads).
2. **Registration**: After 3 trial uploads (or at user discretion) → Sign up / Log in → Redirect to Protected Workspace.
3. **Workspace**: Unlimited uploads → Transcribe (Whisper / Griot Nano 1) → Generate notes → Tutor Q&A → Export.

## Visual style
Inspired by sms.sasusync.com: black-and-white minimalist palette, bold headline with an italic serif accent word, pill buttons, bordered white cards, and alternating sections. Full spec in `DESIGN.md`.
