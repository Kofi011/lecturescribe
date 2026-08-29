/**
 * server.js — LectureScribe Express server
 *
 * Endpoints:
 *   GET  /api/health      — liveness check
 *   POST /api/auth/*      — signup, login, logout, me
 *   POST /api/upload      — audio upload, validation, transcription
 *   GET/POST /api/lectures— lecture persistence and history
 *   POST /api/chat        — interactive Q&A tutor
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import uploadRouter from './routes/upload.js'
import authRouter from './routes/auth.js'
import lecturesRouter from './routes/lectures.js'
import analyticsRouter from './routes/analytics.js'
import { authenticateOptional } from './services/auth.js'
import { initDb, isDbHealthy } from './db/index.js'
import { checkGriotHealth, ensureGriotSidecarRunning } from './services/transcribe.js'

const app = express()
const PORT = process.env.PORT || 5000
const SESSION_SECRET = process.env.SESSION_SECRET || 'lecturescribe_session_secret_default_key'

// ─── Security Headers ─────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Allow client-side rendering & dev flexibility
  })
)

// ─── CORS ─────────────────────────────────────────────────────────
// Support credentials and origins for authenticated sessions and trial cookies
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(cookieParser(SESSION_SECRET))
app.use(authenticateOptional)

// ─── Rate Limiting Middlewares ────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 login/signup attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
})

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // max 30 audio uploads per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Upload rate limit reached. Please wait before processing more lectures.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
})

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // max 60 chat queries per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Academic Tutor query limit reached. Please pause for a moment.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
})

// ─── Health check ──────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  const dbHealthy = await isDbHealthy()
  const griotStatus = await checkGriotHealth()

  res.json({
    status: 'ok',
    message: 'LectureScribe backend running',
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      db: dbHealthy ? 'healthy' : 'disconnected',
      griot_sidecar: griotStatus,
    },
  })
})

// ─── Feature routes ───────────────────────────────────────────────
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/signup', authLimiter)
app.use('/api/auth', authRouter)

app.use('/api/upload', uploadLimiter)
app.use('/api/chat', chatLimiter)
app.use('/api', uploadRouter)

app.use('/api/lectures', lecturesRouter)
app.use('/api/analytics', analyticsRouter)

// ─── Global error handler ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[server error]', err)
  if (res.headersSent) return
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred.',
  })
})

// ─── Process Error Safeguards ─────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('[server unhandledRejection]', reason)
})
process.on('uncaughtException', (err) => {
  console.error('[server uncaughtException]', err)
})

// ─── Initialize Database & Start ──────────────────────────────────
await initDb()

// Auto-start Griot Nano 1 sidecar if local Python sidecar is detected
ensureGriotSidecarRunning()

const server = app.listen(PORT, () => {
  console.log(`[lecturescribe] backend listening on http://localhost:${PORT}`)
  console.log(`[lecturescribe] GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'loaded ✓' : 'NOT SET — add to .env'}`)
})

// 5 minutes timeout for long-running audio transcription & AI summarization
server.timeout = 300000
server.keepAliveTimeout = 65000
server.headersTimeout = 66000
