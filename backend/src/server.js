/**
 * server.js — LectureScribe Express server (Phase 1 skeleton)
 *
 * Exposes:
 *   POST /api/upload  — audio upload + process (wired up in Phase 3)
 *   GET  /api/health  — sanity check endpoint
 *
 * API keys (Groq, LLM) are loaded from .env and never sent to the frontend.
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 5000

// ─── CORS ─────────────────────────────────────────────────────────
// Allow requests from the frontend dev server (and Vercel URL in prod)
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`))
    }
  },
}))

app.use(express.json())

// ─── Health check ──────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'LectureScribe backend running' })
})

// ─── Upload / process route (stub — wired up in Phase 3) ──────────
// Imported and mounted in later phases:
// import uploadRouter from './routes/upload.js'
// app.use('/api', uploadRouter)

// ─── Global error handler ─────────────────────────────────────────
// Returns JSON errors, never a raw stack trace to the client
app.use((err, _req, res, _next) => {
  console.error('[server error]', err)
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred.',
  })
})

// ─── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[lecturescribe] backend listening on http://localhost:${PORT}`)
  console.log(`[lecturescribe] GROQ_API_KEY loaded: ${process.env.GROQ_API_KEY ? 'yes' : 'NO — add to .env'}`)
})
