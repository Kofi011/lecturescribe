# Product Requirements Document (PRD)

## LectureScribe — AI-Powered Lecture-to-Notes Platform

| Field               | Detail                                                       |
|---------------------|--------------------------------------------------------------|
| **Document Version** | 1.0                                                         |
| **Status**           | Pre-Production (Development Complete, Deployment Pending)   |
| **Author**           | LectureScribe Product Team                                  |
| **Last Updated**     | August 24, 2026                                             |
| **Repository**       | [github.com/Kofi011/lecturescribe](https://github.com/Kofi011/lecturescribe) |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Vision & Objectives](#3-vision--objectives)
4. [Target Users & Personas](#4-target-users--personas)
5. [Market Context & Competitive Landscape](#5-market-context--competitive-landscape)
6. [Product Overview](#6-product-overview)
7. [User Stories & Journeys](#7-user-stories--journeys)
8. [Functional Requirements](#8-functional-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [System Architecture](#10-system-architecture)
11. [Data Model](#11-data-model)
12. [API Specification](#12-api-specification)
13. [UI/UX Design Specification](#13-uiux-design-specification)
14. [Security & Privacy](#14-security--privacy)
15. [Performance Requirements](#15-performance-requirements)
16. [Release Plan & Milestones](#16-release-plan--milestones)
17. [Success Metrics & KPIs](#17-success-metrics--kpis)
18. [Out of Scope & Future Roadmap](#18-out-of-scope--future-roadmap)
19. [Risks & Mitigations](#19-risks--mitigations)
20. [Appendices](#20-appendices)

---

## 1. Executive Summary

**LectureScribe** is an AI-powered academic web platform that transforms pre-recorded lecture audio into structured, exam-ready study materials. Students upload lecture recordings (MP3, WAV, M4A) and receive within minutes: a full transcript, organized section notes, key concept extractions, a terminology glossary, self-test revision questions, and access to an interactive AI Academic Tutor grounded in the lecture content.

The platform features a **dual speech recognition engine** — Groq Whisper for standard English and Griot Nano 1 for African-accented and multilingual speech — making it uniquely inclusive for global academic communities. A generous 3-trial freemium model removes the barrier to entry, while authenticated users unlock unlimited processing, persistent lecture libraries, and branded PDF exports.

LectureScribe is currently feature-complete in development and pending production deployment.

---

## 2. Problem Statement

### The Core Problem

University students routinely record lectures but rarely re-listen to them. A 60-minute recording takes 60 minutes to review — plus time to manually transcribe, organize, and synthesize. The result: **valuable lecture content goes unused**, and students rely on incomplete handwritten notes or expensive third-party services.

### Pain Points

| Pain Point | Impact |
|---|---|
| **Time cost of re-listening** | Students skip lecture review entirely, losing critical content |
| **Manual transcription** | Tedious, error-prone, and inaccessible for non-native speakers |
| **Unstructured raw audio** | No searchable text, no organized concepts, no study aids |
| **Accent & language barriers** | Existing transcription tools fail on accented or multilingual speech |
| **Fragmented study workflow** | Students juggle separate tools for transcription, note-taking, and Q&A |

### Opportunity

By collapsing the entire **record → transcribe → organize → study** pipeline into a single upload action, LectureScribe converts hours of manual effort into minutes of automated processing — and produces study materials superior to what most students create manually.

---

## 3. Vision & Objectives

### Product Vision

> *"Every student deserves an AI scribe — one that understands every accent, organizes every idea, and helps them study smarter."*

### Strategic Objectives

| # | Objective | Success Indicator |
|---|---|---|
| O1 | Remove friction from lecture review | Upload-to-notes completion in under 2 minutes |
| O2 | Serve linguistically diverse student bodies | Dual-engine routing successfully handles accented/multilingual audio |
| O3 | Drive organic adoption via the trial model | ≥ 30% trial-to-registration conversion rate |
| O4 | Deliver exam-ready study materials | Generated notes cover ≥ 90% of lecture topics with structured formatting |
| O5 | Establish trust through premium UX | Minimalist, high-contrast design rated ≥ 4.5/5 in user surveys |

---

## 4. Target Users & Personas

### Primary Persona: The Overwhelmed University Student

| Attribute | Detail |
|---|---|
| **Name** | Ama, 21 |
| **Role** | 3rd-year Computer Science student |
| **Context** | Records every lecture on her phone but rarely reviews them |
| **Goals** | Get structured notes quickly before exams; query specific topics from past lectures |
| **Frustrations** | Existing tools are expensive, inaccurate on her professor's accent, or require manual cleanup |
| **Behavior** | Will try a free tool first; converts to a registered user if the quality is good |

### Secondary Persona: The Multilingual Graduate Researcher

| Attribute | Detail |
|---|---|
| **Name** | Kofi, 26 |
| **Role** | MSc Biomedical Engineering student, bilingual (Twi/English) |
| **Context** | Attends lectures given in accented English with code-switching; needs precise transcripts for thesis references |
| **Goals** | Accurate transcription regardless of accent; exportable notes for citation |
| **Frustrations** | Whisper-only tools garble non-standard English; manual correction takes hours |

### Tertiary Persona: The Educator / Teaching Assistant

| Attribute | Detail |
|---|---|
| **Name** | Dr. Mensah, 45 |
| **Role** | University lecturer |
| **Context** | Records office hours and review sessions; wants to share structured notes with students |
| **Goals** | Quick turnaround on organized summaries; professional-looking PDF exports |
| **Frustrations** | No time to manually write post-lecture summaries |

---

## 5. Market Context & Competitive Landscape

### Market Overview

The AI note-taking and transcription market is projected to exceed $5B by 2028, driven by remote/hybrid learning adoption and AI model improvements. Key segments include meeting transcription (Otter.ai, Fireflies), lecture capture (Notability, AudioPen), and study aids (Notion AI, Quizlet).

### Competitive Positioning

| Feature | LectureScribe | Otter.ai | AudioPen | Notion AI |
|---|:---:|:---:|:---:|:---:|
| Lecture-specific structured notes | ✅ | ❌ | Partial | ❌ |
| Accented/multilingual speech engine | ✅ (Griot Nano 1) | ❌ | ❌ | ❌ |
| Free trial without signup | ✅ (3 lectures) | ❌ | ❌ | ❌ |
| AI Academic Tutor (grounded Q&A) | ✅ | ❌ | ❌ | Partial |
| Branded PDF export with seal | ✅ | ❌ | ❌ | ❌ |
| Revision questions generation | ✅ | ❌ | ❌ | ❌ |
| Key concept & terminology extraction | ✅ | ❌ | ❌ | ❌ |

### Differentiators

1. **Dual ASR Engine** — Only platform with intelligent routing between standard and accented speech models
2. **Academic-First Output** — Notes structured for study (concepts, terms, Q&A), not generic summaries
3. **Zero-Friction Trial** — Full product experience before any signup commitment
4. **Grounded AI Tutor** — Q&A constrained to actual lecture content, preventing hallucination

---

## 6. Product Overview

### Platform Structure

```
┌─────────────────────────────────────────────────────┐
│                   LectureScribe                      │
├──────────────┬──────────────┬──────────────┬────────┤
│  Landing     │  Trial Mode  │  Auth        │  About │
│  Page (/)    │  (/trial)    │  (/login)    │ (/about)│
├──────────────┴──────────────┴──────────────┴────────┤
│              Protected Workspace (/workspace)        │
│  ┌──────────┬───────────┬───────────┬──────────┐    │
│  │ Unlimited│ Lecture   │ AI Tutor  │ Export   │    │
│  │ Uploads  │ Library   │ (Q&A)    │ (PDF/MD) │    │
│  └──────────┴───────────┴───────────┴──────────┘    │
└─────────────────────────────────────────────────────┘
```

### Core Capabilities

| Capability | Description |
|---|---|
| **Audio Upload & Validation** | Accept MP3/WAV/M4A up to ~15 MB and ~10 minutes with client + server validation |
| **Dual-Engine Transcription** | Groq Whisper for standard English; Griot Nano 1 (ConformerCTC) for accented/multilingual |
| **Intelligent Routing** | Automated language detection and confidence scoring on initial audio sample |
| **Structured Notes Generation** | LLM-powered extraction of title, overview, sections, key concepts, terms, takeaways, and revision Q&A |
| **AI Academic Tutor** | Grounded Q&A chatbot constrained to lecture transcript content |
| **Multi-Format Export** | Branded PDF with verified stamp & seal, JSON, Markdown, and plain text |
| **Trial Gating** | 3 free uploads via server-side signed cookie; prompts registration after exhaustion |
| **User Authentication** | Email/password with bcrypt hashing, JWT sessions, and HTTP-only cookies |
| **Lecture Persistence** | Full CRUD storage of lectures, notes, and tutor conversations in PostgreSQL |
| **Audio Playback** | Synchronized player with speed controls (1x, 1.25x, 1.5x, 2x) and scrubber |

---

## 7. User Stories & Journeys

### Epic 1: Discovery & Trial

| ID | User Story | Acceptance Criteria | Priority |
|---|---|---|---|
| US-1.1 | As a visitor, I want to understand what LectureScribe does from the landing page so I can decide whether to try it | Landing page displays hero headline, feature cards, and example notes | P0 |
| US-1.2 | As a visitor, I want to navigate between pages via a clean menu dropdown | Menu pill opens dropdown with HOME, TRY LECTURESCRIBE, LOGIN, ABOUT in exact order | P0 |
| US-1.3 | As a new student, I want to test the full pipeline without signing up | Trial page processes up to 3 uploads with remaining credits display | P0 |
| US-1.4 | As a trial user who has exhausted 3 free uploads, I want a clear prompt to create an account | UI displays trial exhaustion message with prominent login/signup CTA | P0 |

### Epic 2: Authentication & Account Management

| ID | User Story | Acceptance Criteria | Priority |
|---|---|---|---|
| US-2.1 | As a student, I want to create an account with my email and password | Signup creates user in PostgreSQL, sets auth cookie, redirects to workspace | P0 |
| US-2.2 | As a returning student, I want to log in and access my workspace | Login verifies credentials, sets auth cookie, redirects to workspace | P0 |
| US-2.3 | As a logged-in student, I want to log out securely | Logout clears auth cookie and redirects to landing page | P0 |

### Epic 3: Lecture Processing

| ID | User Story | Acceptance Criteria | Priority |
|---|---|---|---|
| US-3.1 | As a student, I want to upload audio and receive a transcript | Upload → validation → transcription completes with engine identification | P0 |
| US-3.2 | As a student with accented/multilingual lectures, I want accurate transcription | Griot Nano 1 engine is routed for low-confidence English or non-English audio | P0 |
| US-3.3 | As a student, I want structured notes with headings, concepts, and terms | Notes generation produces title, overview, sections, key concepts, terminology, takeaways | P0 |
| US-3.4 | As a student, I want self-test revision questions generated from my lecture | Revision Q&A section is populated from lecture content | P1 |
| US-3.5 | As a student, I want real-time processing status feedback | Staged indicator shows Uploaded → Transcribing → Summarizing → Complete | P0 |

### Epic 4: Study & Export

| ID | User Story | Acceptance Criteria | Priority |
|---|---|---|---|
| US-4.1 | As a student, I want to ask questions about my lecture to the AI Tutor | Tutor responds with grounded answers from transcript; conversation persists | P0 |
| US-4.2 | As a student, I want to copy my notes to clipboard | Copy button copies formatted notes to clipboard with confirmation | P0 |
| US-4.3 | As a student, I want to download my notes in multiple formats | Export options: branded PDF, JSON, Markdown, plain text | P0 |
| US-4.4 | As a student, I want to play back my lecture audio with speed controls | Audio player with 1x/1.25x/1.5x/2x speed and scrubber | P1 |

### Epic 5: Workspace & Persistence

| ID | User Story | Acceptance Criteria | Priority |
|---|---|---|---|
| US-5.1 | As an authenticated student, I want unlimited lecture uploads | Workspace bypasses trial limits; processes without restriction | P0 |
| US-5.2 | As a student, I want to access my past lectures in a library | Workspace displays all previous lectures in a grid with metadata | P0 |
| US-5.3 | As a student, I want to revisit full notes and tutor history for past lectures | Selecting a past lecture loads transcript, notes, and tutor conversation | P0 |

### User Journey Map

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ DISCOVER │───▶│ TRY (x3) │───▶│ REGISTER │───▶│ WORKSPACE│───▶│ EXPORT & │
│ Landing  │    │ Trial    │    │ Auth     │    │ Unlimited│    │ STUDY    │
│ Page     │    │ Mode     │    │ Page     │    │ Pipeline │    │ PDF/Tutor│
└─────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                                              │
     │         ┌──────────┐                         │
     └────────▶│  ABOUT   │◀────────────────────────┘
               │  Page    │
               └──────────┘
```

---

## 8. Functional Requirements

### FR-1: Navigation & Menu System

| ID | Requirement | Priority |
|---|---|---|
| FR-1.1 | Top navigation bar with wordmark logo (left) and "Menu" pill button (right) | P0 |
| FR-1.2 | Menu dropdown contains exactly: HOME, TRY LECTURESCRIBE, LOGIN, ABOUT (in order) | P0 |
| FR-1.3 | Active route is visually indicated in navigation | P0 |
| FR-1.4 | Navigation is responsive across mobile, tablet, and desktop | P0 |

### FR-2: Trial Flow

| ID | Requirement | Priority |
|---|---|---|
| FR-2.1 | Anonymous users execute the full upload → transcribe → notes pipeline up to 3 times | P0 |
| FR-2.2 | Trial limit enforced server-side via signed HTTP-only session cookie (`lecture_trial_session`) | P0 |
| FR-2.3 | UI displays remaining trial credits (e.g., "Trial 1 of 3", "2 free trials remaining") | P0 |
| FR-2.4 | 4th upload attempt rejected with `TRIAL_LIMIT_REACHED` error and login CTA | P0 |
| FR-2.5 | Trial flow reuses existing upload, processing, and results UI components | P1 |

### FR-3: Authentication & User Accounts

| ID | Requirement | Priority |
|---|---|---|
| FR-3.1 | Unified auth page with toggle between "Create account" and "Log in" modes | P0 |
| FR-3.2 | Signup: email + password → creates user in PostgreSQL → sets auth cookie → redirects to workspace | P0 |
| FR-3.3 | Login: email + password → verifies bcrypt hash → sets auth cookie → redirects to workspace | P0 |
| FR-3.4 | Logout: clears auth cookie → returns success response | P0 |
| FR-3.5 | Session validation: `/api/auth/me` returns user info or 401 | P0 |
| FR-3.6 | Passwords hashed with bcrypt (cost factor ≥ 10) before storage | P0 |

### FR-4: Protected Workspace & Persistence

| ID | Requirement | Priority |
|---|---|---|
| FR-4.1 | Authenticated users redirected to `/workspace` with full unlimited processing | P0 |
| FR-4.2 | All lectures, transcripts, notes, and tutor conversations persisted in PostgreSQL | P0 |
| FR-4.3 | Past lecture library displayed in a grid with metadata (title, date, engine, language) | P0 |
| FR-4.4 | User profile status and logout button in workspace header | P0 |
| FR-4.5 | Full CRUD operations on lecture records (create, read, update, delete) | P0 |

### FR-5: Speech Transcription (Dual Engine)

| ID | Requirement | Priority |
|---|---|---|
| FR-5.1 | Accept MP3, WAV, and M4A audio files up to ~15 MB and ~10 minutes | P0 |
| FR-5.2 | Groq Whisper API (`whisper-large-v3-turbo`) for standard English transcription | P0 |
| FR-5.3 | Griot Nano 1 FastAPI sidecar (`Qlerqly/griot-nano-1`) for accented/multilingual speech | P0 |
| FR-5.4 | Intelligent routing: evaluate initial ~20-30s sample for language and confidence metrics (`avg_logprob`, `no_speech_prob`) | P0 |
| FR-5.5 | Normalized output: both engines produce `{ transcript, language, engine }` | P0 |
| FR-5.6 | Display `engine_used` and detected language in UI results | P1 |

### FR-6: Notes Generation Engine

| ID | Requirement | Priority |
|---|---|---|
| FR-6.1 | Generate suggested lecture title from transcript content | P0 |
| FR-6.2 | Generate overview/summary paragraph | P0 |
| FR-6.3 | Generate structured section headings with bullet points | P0 |
| FR-6.4 | Extract key concepts as a structured list | P0 |
| FR-6.5 | Extract important terminology with definitions (glossary) | P0 |
| FR-6.6 | Generate key takeaways section | P0 |
| FR-6.7 | Generate self-test revision questions | P1 |
| FR-6.8 | Produce complete structured Markdown notes document | P0 |

### FR-7: AI Academic Tutor

| ID | Requirement | Priority |
|---|---|---|
| FR-7.1 | Interactive Q&A interface grounded in lecture transcript | P0 |
| FR-7.2 | Conversation history persisted per lecture in PostgreSQL | P0 |
| FR-7.3 | Tutor responses constrained to lecture content (anti-hallucination) | P0 |
| FR-7.4 | Rate-limited to prevent abuse | P1 |

### FR-8: Export & Output

| ID | Requirement | Priority |
|---|---|---|
| FR-8.1 | Copy notes to clipboard with confirmation feedback | P0 |
| FR-8.2 | Download as plain text (.txt) | P0 |
| FR-8.3 | Download as Markdown (.md) | P0 |
| FR-8.4 | Download as complete JSON (.json) with all structured fields | P1 |
| FR-8.5 | Download as branded PDF with LectureScribe Verified Stamp & Seal | P0 |

### FR-9: Audio Playback

| ID | Requirement | Priority |
|---|---|---|
| FR-9.1 | Minimalist audio player with play/pause, scrubber, and timestamp | P1 |
| FR-9.2 | Playback speed toggles: 1x, 1.25x, 1.5x, 2x | P1 |
| FR-9.3 | Black-and-white design consistent with platform aesthetic | P1 |

### FR-10: Static Pages

| ID | Requirement | Priority |
|---|---|---|
| FR-10.1 | Landing page with hero section, feature highlights, example notes, and CTA | P0 |
| FR-10.2 | About page with mission statement, problem/solution narrative, and 3-card architecture grid | P0 |
| FR-10.3 | Mid-page dark CTA card on landing: "Try LectureScribe free" linking to trial flow | P0 |
| FR-10.4 | Contact section with form fields for inquiries | P2 |

---

## 9. Non-Functional Requirements

### NFR-1: Security

| ID | Requirement | Priority |
|---|---|---|
| NFR-1.1 | Passwords hashed with bcrypt (rounds ≥ 10); never stored in plain text | P0 |
| NFR-1.2 | API keys (Groq, HuggingFace, JWT_SECRET, SESSION_SECRET) stored in backend `.env` only | P0 |
| NFR-1.3 | Auth cookies: `httpOnly: true`, `sameSite: 'lax'`, `secure: true` in production | P0 |
| NFR-1.4 | Security headers via `helmet` middleware | P0 |
| NFR-1.5 | API rate limiting via `express-rate-limit` on auth, upload, and chat routes | P0 |
| NFR-1.6 | Server-side validation of file type, duration, size, and authentication tokens | P0 |
| NFR-1.7 | `.env` files gitignored; `.env.example` committed as template | P0 |

### NFR-2: Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-2.1 | End-to-end processing time (upload → notes) for 10-minute file | < 2 minutes |
| NFR-2.2 | Page initial load time | < 3 seconds |
| NFR-2.3 | Audio file upload (15 MB) | < 10 seconds on broadband |

### NFR-3: Reliability

| ID | Requirement | Priority |
|---|---|---|
| NFR-3.1 | Specific, human-readable error messages for all failure types | P0 |
| NFR-3.2 | Graceful degradation if Griot Nano 1 sidecar is unavailable (fallback to Whisper) | P1 |
| NFR-3.3 | File cleanup after processing to prevent disk accumulation | P1 |

### NFR-4: Responsiveness

| ID | Requirement | Priority |
|---|---|---|
| NFR-4.1 | Full mobile responsiveness across all pages (phones, tablets, desktops) | P0 |
| NFR-4.2 | Touch-friendly interactions on mobile devices | P0 |
| NFR-4.3 | Consistent visual design at all breakpoints per DESIGN.md | P0 |

### NFR-5: Accessibility

| ID | Requirement | Priority |
|---|---|---|
| NFR-5.1 | Semantic HTML structure with proper heading hierarchy | P1 |
| NFR-5.2 | Sufficient color contrast (black-on-white palette inherently meets WCAG AA) | P1 |
| NFR-5.3 | Keyboard navigable UI elements | P2 |

---

## 10. System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                                                              │
│    React + Tailwind CSS SPA (Vercel)                        │
│    ┌─────────┬──────────┬──────┬───────┬──────────────┐     │
│    │ Landing │ Trial    │ Auth │ About │ Workspace    │     │
│    │ Page    │ Page     │ Page │ Page  │ (Protected)  │     │
│    └─────────┴──────────┴──────┴───────┴──────────────┘     │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTPS / REST API
┌────────────────────────▼─────────────────────────────────────┐
│                       SERVER LAYER                           │
│                                                              │
│    Node.js + Express (Render/Railway)                        │
│    ┌──────────┬───────────┬──────────┬───────────────┐      │
│    │ Auth     │ Upload    │ Lectures │ Chat          │      │
│    │ Routes   │ Routes    │ CRUD     │ (Tutor)       │      │
│    └──────────┴─────┬─────┴──────────┴───────────────┘      │
│                     │                                        │
│    ┌────────────────▼────────────────────────────────┐      │
│    │         INTELLIGENT ASR ROUTER                  │      │
│    │                                                  │      │
│    │   Evaluates ~20-30s sample for language +        │      │
│    │   confidence (avg_logprob, no_speech_prob)       │      │
│    │                                                  │      │
│    │   ┌─────────────┐    ┌────────────────────┐     │      │
│    │   │ Groq Whisper │    │ Griot Nano 1       │     │      │
│    │   │ (Cloud API)  │    │ (FastAPI Sidecar)  │     │      │
│    │   │ Standard EN  │    │ Accented/Multi-    │     │      │
│    │   │              │    │ lingual Speech     │     │      │
│    │   └──────────────┘    └────────────────────┘     │      │
│    └─────────────────────────────────────────────────┘      │
│                     │                                        │
│    ┌────────────────▼────────────────────────────────┐      │
│    │            LLM NOTE GENERATION                  │      │
│    │         (Groq Llama / Qwen API)                 │      │
│    └─────────────────────────────────────────────────┘      │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                       DATA LAYER                             │
│                                                              │
│    PostgreSQL (Managed — Render/Railway)                     │
│    ┌──────────────┬──────────────────────────────────┐      │
│    │ users        │ lectures                          │      │
│    │ ─ id (UUID)  │ ─ id (UUID)                      │      │
│    │ ─ email      │ ─ user_id (FK → users)           │      │
│    │ ─ password   │ ─ title, overview, transcript     │      │
│    │   _hash      │ ─ key_concepts (JSONB)           │      │
│    │ ─ timestamps │ ─ revision_questions (JSONB)     │      │
│    │              │ ─ tutor_history (JSONB)           │      │
│    │              │ ─ engine_used, language           │      │
│    └──────────────┴──────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React + Tailwind CSS | Component-based SPA with utility-first styling for rapid iteration |
| **Backend** | Node.js + Express | Non-blocking I/O ideal for audio upload/streaming; rich middleware ecosystem |
| **Database** | PostgreSQL | JSONB support for flexible schema (concepts, terms, tutor history); relational integrity for user-lecture associations |
| **Auth** | bcrypt + JWT + HTTP-only cookies | Industry-standard password hashing with secure, stateless session management |
| **Primary ASR** | Groq Whisper API (`whisper-large-v3-turbo`) | High-throughput cloud ASR with verbose metadata for routing decisions |
| **Specialized ASR** | Griot Nano 1 (FastAPI sidecar, `Qlerqly/griot-nano-1`) | ConformerCTC model optimized for African-accented and multilingual speech |
| **Note Generation** | Groq Llama / Qwen LLM API | Fast inference for structured Markdown note production |
| **Security** | `helmet` + `express-rate-limit` | Security headers and abuse prevention |
| **File Handling** | `multer` + `music-metadata` | Robust multipart upload and audio metadata extraction |
| **Frontend Deploy** | Vercel | Zero-config React deployment with global CDN |
| **Backend Deploy** | Render / Railway | Managed Node.js hosting with PostgreSQL add-on |

### Dual Transcription Engine — Routing Logic

```
                   Audio Upload Received
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
              │ • avg_logprob             │
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
                            │
                            ▼
              LLM Note Generation Pipeline
```

---

## 11. Data Model

### Entity-Relationship Diagram

```
┌──────────────────┐         ┌──────────────────────────────┐
│     users         │         │          lectures             │
├──────────────────┤         ├──────────────────────────────┤
│ id (UUID) PK     │◄────┐   │ id (UUID) PK                │
│ email (VARCHAR)  │     └───│ user_id (UUID) FK            │
│ password_hash    │         │ title (VARCHAR)              │
│ created_at       │         │ overview (TEXT)              │
│ updated_at       │         │ duration_sec (INT)           │
│                  │         │ engine_used (VARCHAR)        │
│                  │         │ language (VARCHAR)           │
│                  │         │ file_name (VARCHAR)          │
│                  │         │ transcript (TEXT)            │
│                  │         │ key_concepts (JSONB)         │
│                  │         │ main_arguments (JSONB)       │
│                  │         │ important_terms (JSONB)      │
│                  │         │ study_notes (JSONB)          │
│                  │         │ key_takeaways (JSONB)        │
│                  │         │ revision_questions (JSONB)   │
│                  │         │ notes_markdown (TEXT)        │
│                  │         │ tutor_history (JSONB)        │
│                  │         │ created_at (TIMESTAMPTZ)     │
│                  │         │ updated_at (TIMESTAMPTZ)     │
└──────────────────┘         └──────────────────────────────┘
```

### Database Indexes

| Index | Table | Column(s) | Purpose |
|---|---|---|---|
| `idx_users_email` | users | email | Fast email lookups during login |
| `idx_lectures_user_id` | lectures | user_id | Fast retrieval of user's lecture library |
| `idx_lectures_created_at` | lectures | created_at DESC | Chronological ordering for recent lectures |

### JSONB Field Schemas

**key_concepts**: `[ "Concept 1", "Concept 2", ... ]`

**important_terms**: `[ { "term": "...", "definition": "..." }, ... ]`

**revision_questions**: `[ { "question": "...", "answer": "..." }, ... ]`

**tutor_history**: `[ { "role": "user|assistant", "content": "..." }, ... ]`

---

## 12. API Specification

### Authentication Endpoints

| Method | Endpoint | Request Body | Response | Auth Required | Rate Limited |
|---|---|---|---|---|---|
| POST | `/api/auth/signup` | `{ email, password }` | `{ user: { id, email } }` + Set auth cookie | ❌ | ✅ |
| POST | `/api/auth/login` | `{ email, password }` | `{ user: { id, email } }` + Set auth cookie | ❌ | ✅ |
| POST | `/api/auth/logout` | — | `{ message: 'Logged out' }` + Clear cookie | ❌ | ❌ |
| GET | `/api/auth/me` | — | `{ user: { id, email } }` or 401 | ✅ | ❌ |

### Lecture Processing Endpoints

| Method | Endpoint | Description | Auth Required | Rate Limited |
|---|---|---|---|---|
| POST | `/api/upload` | Upload audio file for transcription + notes | ❌ (trial) / ✅ (workspace) | ✅ |
| GET | `/api/trial-status` | Check remaining trial credits | ❌ | ❌ |

**Upload behavior by auth state:**
- **Authenticated**: Processes lecture → auto-saves to database → returns results
- **Unauthenticated**: Checks trial cookie → if `trials_used < 3`, processes and increments → if `trials_used >= 3`, returns 403 `TRIAL_EXHAUSTED`

### Lecture CRUD Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/lectures` | List all lectures for authenticated user | ✅ |
| GET | `/api/lectures/:id` | Get single lecture with full data | ✅ |
| POST | `/api/lectures` | Create/import lecture record | ✅ |
| PUT | `/api/lectures/:id` | Update lecture title or notes | ✅ |
| DELETE | `/api/lectures/:id` | Delete lecture record | ✅ |
| POST | `/api/lectures/:id/tutor` | Append to tutor conversation history | ✅ |

### AI Tutor Endpoint

| Method | Endpoint | Request Body | Response | Auth Required | Rate Limited |
|---|---|---|---|---|---|
| POST | `/api/chat` | `{ message, transcript, history }` | `{ reply }` | ❌ | ✅ |

### Trial Session Cookie Specification

| Attribute | Value |
|---|---|
| Name | `lecture_trial_session` |
| Type | Signed HTTP-only cookie |
| Contents | `{ trials_used: 0..3 }` |
| HttpOnly | `true` |
| SameSite | `lax` |
| Secure | `true` (production) |

### Authentication Flow

```
              User Request (Upload Audio)
                        │
                        ▼
           Is user logged in (JWT Cookie)?
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
         YES (Auth)            NO (Trial)
             │                     │
             │          Check signed trial cookie:
             │          trials_used count (0..3)
             │                     │
             │           ┌─────────┴─────────┐
             │           ▼                   ▼
             │     trials_used ≥ 3     trials_used < 3
             │           │                   │
             │     Reject with 403           │
             │     "TRIAL_EXHAUSTED"         │
             │     (Show Login CTA)          │
             │                               │
             └──────────┬────────────────────┘
                        │
                        ▼
               Process Lecture Audio
           (Validate → Transcribe → Notes)
                        │
                        ▼
           Increment signed trial cookie
              (trials_used = count + 1)
```

---

## 13. UI/UX Design Specification

### Design Philosophy

> Minimal. High-contrast. Confident. Premium simplicity, not "startup gradient."

Inspired by [sms.sasusync.com](https://sms.sasusync.com/) — borrowing the visual language, not the content.

### Design System

#### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#000000` | Text, buttons, dark hero backgrounds |
| `--color-surface` | `#FFFFFF` | Backgrounds, button text on dark |
| `--color-muted` | `~#6B7280` | Secondary text, captions, subtext |
| — | Grayscale only | No accent colors, no blue links |

#### Typography

| Element | Style |
|---|---|
| **Logo/Wordmark** | Italic serif (e.g., *LectureScribe*) |
| **Headlines** | Large, bold, sans-serif (Inter/Helvetica, 700-800 weight) |
| **Emphasis word** | Italic serif within headline (e.g., "Turn your lecture into *notes*.") |
| **Body/Subtext** | Regular weight, gray, smaller size, centered under headlines |

#### Buttons

| Type | Style |
|---|---|
| **Primary** | Solid black, fully rounded (pill), white bold text |
| **Secondary** | White/transparent, thin black outline, black text, pill shape |
| **Nav "Menu"** | Black pill, white text, chevron icon, top-right corner |

### Page Specifications

#### Landing Page (`/`)
- Light background with subtle flowing spline waveform animations
- Centered marquee above main headline
- Hero: "Turn your lecture into *notes*."
- CTA buttons: "Upload a lecture" (solid) + "See an example" (outline with badge)
- 3-column feature card grid ("Three things, done properly.")
- Dark mid-page CTA card (`bg-[#0c0c0c]`, rounded `32px`): "Try LectureScribe free" with single solid pill CTA
- Contact section: White bordered card with form

#### Trial Page (`/trial`)
- Reuses core upload → status → results UI
- Badge showing remaining credits (e.g., "Free Trial • 3 of 3 remaining")
- Exhaustion state: bordered card with "You've completed your 3 free trials" + "Create an Account to Continue" CTA

#### Auth Page (`/login`)
- Centered auth card on clean white background
- Pill toggle between "Log in" and "Create account"
- Rounded pill outline form inputs (email, password)
- Primary pill submit button
- Clean error messaging container

#### About Page (`/about`)
- Hero: "Smarter lecture notes, built for *students*."
- Problem & Solution narrative
- 3-card architecture grid (Speech Intelligence, Semantic Synthesis, Grounded Tutor)
- Footer with navigation links

#### Protected Workspace (`/workspace`)
- User email badge + "Log out" button in header
- Unlimited upload zone
- Past lecture session grid/library
- Full study toolkit (notes, tutor, export)

### Component Inventory

| Component | File | Purpose |
|---|---|---|
| `Nav` | `Nav.jsx` | Top navigation bar with menu dropdown |
| `NavigationModal` | `NavigationModal.jsx` | Full-screen mobile navigation |
| `HeroSection` | `HeroSection.jsx` | Landing page hero with headline + CTA |
| `AnimatedWaveform` | `AnimatedWaveform.jsx` | Spline waveform animation |
| `InfiniteMarquee` | `InfiniteMarquee.jsx` | Scrolling marquee banner |
| `HowItWorks` | `HowItWorks.jsx` | 3-card feature grid |
| `DarkHeroCard` | `DarkHeroCard.jsx` | Mid-page dark CTA card |
| `ContactSection` | `ContactSection.jsx` | Contact form |
| `UploadCard` | `UploadCard.jsx` | File upload interface |
| `AudioPlayer` | `AudioPlayer.jsx` | Audio playback with speed controls |
| `MarkdownRenderer` | `MarkdownRenderer.jsx` | Structured notes display |
| `LectureTutorDrawer` | `LectureTutorDrawer.jsx` | AI Tutor chat interface |
| `InfoModal` | `InfoModal.jsx` | Information dialog |
| `UserSettingsModal` | `UserSettingsModal.jsx` | User preferences |
| `Footer` | `Footer.jsx` | Page footer |

---

## 14. Security & Privacy

### Authentication Security

| Control | Implementation |
|---|---|
| Password Storage | bcrypt with cost factor ≥ 10 |
| Session Management | JWT tokens in HTTP-only, SameSite, Secure cookies |
| Secret Management | `JWT_SECRET` and `SESSION_SECRET` in backend `.env` only |
| API Key Protection | Groq, HuggingFace keys strictly backend-only; never exposed to frontend |

### Application Security

| Control | Implementation |
|---|---|
| Security Headers | `helmet` middleware (CSP, HSTS, X-Content-Type-Options, etc.) |
| Rate Limiting | `express-rate-limit` on `/api/auth/*`, `/api/upload`, `/api/chat` |
| Input Validation | Server-side validation of file type, size, duration, and auth tokens |
| CORS | Configured to allow only the deployed frontend origin |
| Trial Integrity | Server-side signed cookies prevent client-side bypass |

### Data Privacy

| Consideration | Approach |
|---|---|
| Audio Files | Processed and cleaned up; not permanently stored on server |
| User Data | Email and hashed password only; minimal PII collection |
| Lecture Content | Stored in PostgreSQL; accessible only by the authenticated owner |
| Third-Party APIs | Audio sent to Groq/HuggingFace for processing; subject to their privacy policies |

---

## 15. Performance Requirements

| Metric | Target | Measurement |
|---|---|---|
| Upload-to-notes latency (10-min file) | < 2 minutes | End-to-end timer from upload start to notes display |
| Page load time (cold) | < 3 seconds | Lighthouse First Contentful Paint |
| Audio upload time (15 MB, broadband) | < 10 seconds | Network transfer time |
| Whisper API transcription (10-min) | < 60 seconds | API response time |
| LLM note generation | < 30 seconds | API response time |
| Database query (lecture list) | < 200 ms | PostgreSQL query execution |
| Concurrent users (MVP) | ~50 simultaneous | Server capacity under standard Render/Railway tier |

---

## 16. Release Plan & Milestones

### Phase Summary

| Phase | Name | Status | Key Deliverables |
|---|---|---|---|
| **Phase 0** | Repo Setup | ✅ Complete | GitHub repo, branch strategy, docs |
| **Phase 1** | Project Setup | ✅ Complete | Frontend + backend scaffolding, Tailwind theme |
| **Phase 2** | Upload | ✅ Complete | File upload with validation (MP3/WAV/M4A) |
| **Phase 3** | Transcription | ✅ Complete | Dual-engine ASR (Whisper + Griot Nano 1) |
| **Phase 4** | Notes Generation | ✅ Complete | LLM-powered structured notes |
| **Phase 5** | Results View | ✅ Complete | Transcript/notes tabs, copy, download |
| **Phase 6** | Processing Status | ✅ Complete | Staged indicator, error UI, mobile responsive |
| **Phase 7** | Testing & Refinements | ✅ Complete | Format testing, Markdown renderer, tutor |
| **Phase 8** | Nav, Trial, Auth, Workspace | ✅ Complete | Menu system, 3-trial gating, auth, PostgreSQL persistence |
| **Phase 8.5** | Persistence, Security, Audio, PDF | ✅ Complete | Lectures CRUD, helmet/rate-limit, audio player, branded PDF |
| **Phase 9** | Deployment | 🔲 Pending | Production deploy (Vercel + Render/Railway) |

### Phase 9 — Deployment Checklist

- [ ] Merge `dev` into `main`
- [ ] Deploy backend to Render/Railway with managed PostgreSQL; configure production env vars
- [ ] Deploy frontend to Vercel; configure backend URL
- [ ] End-to-end testing on live deployment
- [ ] Update README.md with live URL

### Future Phases (Post-Launch)

| Phase | Name | Scope |
|---|---|---|
| Phase 10 | Analytics & Monitoring | Usage analytics, error tracking, performance monitoring |
| Phase 11 | Advanced Features | Batch upload, live streaming, collaborative workspaces |
| Phase 12 | Monetization | Subscription tiers, institutional licensing |

---

## 17. Success Metrics & KPIs

### Product Metrics

| KPI | Target | Measurement |
|---|---|---|
| Trial-to-Registration Conversion | ≥ 30% | (Signups after trial) / (Users who completed ≥ 1 trial) |
| Upload Success Rate | ≥ 95% | (Successful processings) / (Total uploads attempted) |
| Processing Completion Rate | ≥ 98% | (Notes generated) / (Transcriptions completed) |
| Tutor Engagement Rate | ≥ 40% | (Lectures with ≥ 1 tutor question) / (Total lectures) |
| Return Usage (30-day) | ≥ 60% | (Users with ≥ 2 sessions in 30 days) / (Total registered users) |

### Quality Metrics

| KPI | Target | Measurement |
|---|---|---|
| Transcription Accuracy (standard EN) | ≥ 92% WER | Word Error Rate on test corpus |
| Transcription Accuracy (accented EN) | ≥ 85% WER | Word Error Rate on accented test corpus |
| Notes Topic Coverage | ≥ 90% | Manual evaluation: key topics captured vs. lecture content |
| User Satisfaction Score | ≥ 4.5 / 5 | Post-session micro-survey |

### Technical Metrics

| KPI | Target | Measurement |
|---|---|---|
| Uptime | ≥ 99.5% | Server monitoring |
| P95 Processing Latency | < 120 seconds | Server-side timing |
| Error Rate | < 2% | (5xx responses) / (Total requests) |
| Page Load (LCP) | < 2.5 seconds | Lighthouse / Core Web Vitals |

---

## 18. Out of Scope & Future Roadmap

### Explicitly Out of Scope (v1.0)

| Feature | Rationale |
|---|---|
| Multi-file batch upload | Adds complexity to processing queue; single-file covers core use case |
| Real-time streaming transcription | Requires WebSocket infrastructure and live audio capture; significant architecture change |
| Collaborative note sharing / team workspaces | Social features are a distinct product surface; post-v1 |
| OAuth / social login (Google, GitHub) | Email/password sufficient for MVP; OAuth adds dependency |
| Mobile native app | Web-responsive SPA covers mobile use case for v1 |
| Payment processing / subscriptions | Freemium model is sufficient for initial traction |
| Admin dashboard | Not needed until user scale requires operational tooling |

### Future Roadmap

```
v1.0 (Current)          v1.5                    v2.0
─────────────────       ─────────────────       ─────────────────
✅ Core Pipeline        OAuth / Social Login    Live Streaming
✅ Dual ASR Engine      Batch Upload            Collaborative Spaces
✅ Trial + Auth         Usage Analytics         Subscription Tiers
✅ Workspace + CRUD     Mobile PWA              Institutional Licensing
✅ Branded PDF Export   Flashcard Generation    LMS Integrations
🔲 Production Deploy   Email Notifications     Offline Mode / PWA
```

---

## 19. Risks & Mitigations

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Groq API rate limits or downtime | Medium | High | Implement exponential backoff; monitor API status; evaluate fallback providers |
| R2 | Griot Nano 1 sidecar unavailable | Medium | Medium | Graceful fallback to Whisper-only; display engine warning to user |
| R3 | Poor transcription quality on heavily accented audio | Medium | High | Continuous evaluation of Griot Nano 1 accuracy; user feedback loop for model improvements |
| R4 | Trial abuse via cookie clearing | Low | Low | Server-side signed cookies resist basic bypass; consider IP-based fingerprinting for v2 |
| R5 | LLM hallucination in notes or tutor | Medium | Medium | Grounding prompts constrain output to transcript content; user can verify against raw transcript |
| R6 | Database scaling under high concurrent users | Low | Medium | PostgreSQL indexing strategy in place; horizontal scaling available via managed providers |
| R7 | Audio file size exceeding limits | Low | Low | Client + server validation at ~15 MB / ~10 min; clear error messages for rejection |
| R8 | Security vulnerabilities in auth flow | Low | Critical | bcrypt + JWT + HTTP-only cookies; helmet headers; rate limiting; regular security review |

---

## 20. Appendices

### Appendix A: Griot Nano 1 Sidecar Specification

| Attribute | Detail |
|---|---|
| **Model** | `Qlerqly/griot-nano-1` (ConformerCTC architecture) |
| **Framework** | Python / FastAPI |
| **Endpoints** | `POST /transcribe` (audio file → transcript), `GET /health` (readiness check) |
| **Specialty** | African-accented English, multilingual speech |
| **Dependencies** | `transformers`, `torch`, `torchaudio`, `soundfile`, `fastapi`, `uvicorn` |
| **Deployment** | Sidecar container alongside main backend |

### Appendix B: Environment Variables

| Variable | Service | Purpose |
|---|---|---|
| `GROQ_API_KEY` | Backend | Groq Whisper & LLM API authentication |
| `LLM_API_KEY` | Backend | Note generation LLM authentication |
| `JWT_SECRET` | Backend | JWT token signing |
| `SESSION_SECRET` | Backend | Cookie signing |
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `HF_TOKEN` | Griot Sidecar | HuggingFace model access |
| `PORT` | Backend | Server port (default: 5000) |

### Appendix C: File Structure

```
lecturescribe/
├── .git/
├── .gitignore
├── docs/
│   ├── AGENTS.md             # Agent operating rules
│   ├── ARCHITECTURE.md       # System architecture
│   ├── DESIGN.md             # Visual style guide
│   ├── PRD.md                # This document
│   ├── PROJECT.md            # Project overview
│   ├── README.md             # Quick-start guide
│   ├── REQUIREMENTS.md       # Functional/non-functional requirements
│   └── TASKS.md              # Development checklist
├── branding/
│   ├── concept[1-9]_*.svg    # Logo concepts
│   └── index.html            # Brand preview
├── frontend/
│   └── src/
│       ├── App.jsx           # Root component + routing
│       ├── main.jsx          # React entry point
│       ├── index.css         # Global styles
│       ├── components/       # Reusable UI components (15 files)
│       ├── pages/            # Route-level pages (7 files)
│       └── utils/            # Utility functions (PDF export, etc.)
├── backend/
│   ├── src/
│   │   ├── server.js         # Express server entry point
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic (transcription, notes, auth)
│   │   └── db/               # Database connection and queries
│   ├── package.json          # Node dependencies
│   └── .env.example          # Environment variable template
└── griot_sidecar/
    ├── main.py               # FastAPI sidecar server
    ├── requirements.txt      # Python dependencies
    └── test_sidecar.py       # Sidecar test suite
```

### Appendix D: Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | August 24, 2026 | LectureScribe Product Team | Initial PRD — synthesized from PROJECT.md, REQUIREMENTS.md, ARCHITECTURE.md, DESIGN.md, and TASKS.md |

---

*This document is the single source of truth for LectureScribe's product requirements. All implementation decisions should reference this PRD. For visual specifications, see [DESIGN.md](file:///c:/Users/USER/Desktop/LectureScribe/docs/DESIGN.md). For architecture details, see [ARCHITECTURE.md](file:///c:/Users/USER/Desktop/LectureScribe/docs/ARCHITECTURE.md).*
