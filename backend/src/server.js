/**
 * server.js — LectureScribe Express server
 *
 * Endpoints:
 *   GET  /api/health      — liveness check
 *   POST /api/auth/*      — signup, login, logout, me
 *   POST /api/upload      — audio upload, validation, transcription
 *   POST /api/chat        — interactive Q&A tutor
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import uploadRouter from './routes/upload.js'
import authRouter from './routes/auth.js'
import { authenticateOptional } from './services/auth.js'
import { initDb } from './db/index.js'

const app = express()
const PORT = process.env.PORT || 5000
const SESSION_SECRET = process.env.SESSION_SECRET || 'lecturescribe_session_secret_default_key'

// ─── CORS ─────────────────────────────────────────────────────────
// Support credentials and origins for authenticated sessions and trial cookies
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
}))

app.use(express.json())
app.use(cookieParser(SESSION_SECRET))
app.use(authenticateOptional)

// ─── Health check ──────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'LectureScribe backend running' })
})

// ─── Feature routes ───────────────────────────────────────────────
app.use('/api/auth', authRouter)
app.use('/api', uploadRouter)

// ─── Global error handler ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[server error]', err)
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred.',
  })
})

// ─── Initialize Database & Start ──────────────────────────────────
await initDb()

app.listen(PORT, () => {
  console.log(`[lecturescribe] backend listening on http://localhost:${PORT}`)
  console.log(`[lecturescribe] GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'loaded ✓' : 'NOT SET — add to .env'}`)
})
