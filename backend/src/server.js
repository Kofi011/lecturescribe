/**
 * server.js — LectureScribe Express server
 *
 * Endpoints:
 *   GET  /api/health  — liveness check
 *   POST /api/upload  — audio upload, validation, transcription (Phase 3+)
 *
 * API keys (Groq, LLM) are loaded from .env — never sent to the frontend.
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import uploadRouter from './routes/upload.js'

const app = express()
const PORT = process.env.PORT || 5000

// ─── CORS ─────────────────────────────────────────────────────────
const allowedOriginEnv = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no Origin header (curl, Postman, server-to-server)
    if (!origin) return callback(null, true)

    // Allow configured production/dev origin or any localhost / 127.0.0.1 in local development
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    if (origin === allowedOriginEnv || isLocalhost) {
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

// ─── Feature routes ───────────────────────────────────────────────
app.use('/api', uploadRouter)

// ─── Global error handler ─────────────────────────────────────────
// Returns JSON — never a raw stack trace to the client
app.use((err, _req, res, _next) => {
  console.error('[server error]', err)
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred.',
  })
})

// ─── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[lecturescribe] backend listening on http://localhost:${PORT}`)
  console.log(`[lecturescribe] GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'loaded ✓' : 'NOT SET — add to .env'}`)
})
