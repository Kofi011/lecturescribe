/**
 * routes/upload.js — Upload, Analysis, Trial Gating, and Interactive Lecture Q&A
 *
 * Endpoints:
 *   GET  /api/trial-status — Returns trial credits or authenticated status
 *   POST /api/upload       — Process lecture audio (with 3-trial limit enforcement)
 *   POST /api/chat         — Interactive Q&A about a lecture transcript
 */

import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { parseBuffer } from 'music-metadata'
import { transcribeAudio } from '../services/transcribe.js'
import { generateNotes }   from '../services/generateNotes.js'
import { askAboutLecture } from '../services/askLecture.js'
import { getTrialStatus, incrementTrial, enforceTrialLimit } from '../services/trial.js'
import { createLecture } from '../db/index.js'

const router = express.Router()

const ALLOWED_MIMES = [
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
]
const ALLOWED_EXTS   = ['.mp3', '.wav', '.m4a']
const MAX_SIZE_MB    = 15
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const MAX_DURATION_SECONDS = 10 * 60   // 10 minutes

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, unique + path.extname(file.originalname).toLowerCase())
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase()
    const mimeOk = ALLOWED_MIMES.includes(file.mimetype)
    const extOk  = ALLOWED_EXTS.includes(ext)
    if (mimeOk || extOk) {
      cb(null, true)
    } else {
      const err = new Error(
        `Unsupported audio format "${ext || file.mimetype}". ` +
        'Please upload an MP3, WAV, or M4A lecture file.'
      )
      err.code = 'UNSUPPORTED_FORMAT'
      cb(err)
    }
  },
})

function removeTempFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch (e) {
    console.warn('[upload] failed to remove temp file:', e.message)
  }
}

// ─── GET /api/trial-status ─────────────────────────────────────────
router.get('/trial-status', (req, res) => {
  const status = getTrialStatus(req)
  return res.json({
    status: 'ok',
    ...status,
  })
})

// ─── POST /api/upload ─────────────────────────────────────────────
router.post('/upload', (req, res) => {
  // 1. Enforce trial limit before processing file upload
  const trialStatus = getTrialStatus(req)
  if (!trialStatus.canUpload) {
    return res.status(403).json({
      error: 'You have completed your 3 free trial uploads. Please log in or create an account to continue unlimited processing.',
      code: 'TRIAL_LIMIT_REACHED',
      trialsUsed: trialStatus.trialsUsed,
      trialsRemaining: 0,
      maxTrials: trialStatus.maxTrials,
    })
  }

  upload.single('audio')(req, res, async (multerErr) => {
    if (multerErr) {
      if (multerErr.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: `Audio file is too large. Maximum supported size is ${MAX_SIZE_MB} MB.`,
        })
      }
      if (multerErr.code === 'UNSUPPORTED_FORMAT') {
        return res.status(400).json({ error: multerErr.message })
      }
      return res.status(400).json({ error: multerErr.message || 'Upload failed.' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file was attached.' })
    }

    const filePath = req.file.path

    try {
      // 2. Duration check
      const fileBuffer  = fs.readFileSync(filePath)
      const metadata    = await parseBuffer(fileBuffer, { mimeType: req.file.mimetype })
      const durationSec = metadata.format.duration

      if (durationSec && durationSec > MAX_DURATION_SECONDS) {
        removeTempFile(filePath)
        const mins = Math.round(durationSec / 60)
        return res.status(400).json({
          error: `Lecture audio is too long (${mins} min). Maximum duration is 10 minutes.`,
        })
      }

      // 3. Transcribe speech with dual-engine intelligence
      console.log(`[upload] processing speech: ${req.file.originalname}`)
      const { transcript, language, engine } = await transcribeAudio(filePath, req.file.mimetype)

      // 4. Generate structured study intelligence
      console.log(`[upload] analyzing concepts & synthesizing notes (engine: ${engine}, lang: ${language})…`)
      const result = await generateNotes(transcript)

      removeTempFile(filePath)

      // 5. Update trial count for unauthenticated users
      const trialResult = incrementTrial(req, res)
      console.log(`[upload] lecture ready — "${result.title}" (transcribed by ${engine}) [trials remaining: ${trialResult.trialsRemaining}]`)

      const lecturePayload = {
        id: `lec_${Date.now()}`,
        date: new Date().toISOString(),
        durationSec: durationSec ? Math.round(durationSec) : null,
        fileName: req.file.originalname,
        engine_used: engine,
        language,
        transcript,
        user_id: req.user?.id || null,
        ...result,
      }

      // Auto-save to database if user is authenticated
      if (req.user?.id) {
        try {
          const savedDbRecord = await createLecture(lecturePayload)
          if (savedDbRecord?.id) {
            lecturePayload.id = savedDbRecord.id
          }
        } catch (dbErr) {
          console.warn('[upload] failed to auto-save to db:', dbErr.message)
        }
      }

      return res.json({
        status: 'complete',
        ...lecturePayload,
        trial: {
          isAuthenticated: !!req.user,
          trialsUsed: trialResult.trialsUsed,
          trialsRemaining: trialResult.trialsRemaining,
          maxTrials: 3,
        },
      })

    } catch (err) {
      removeTempFile(filePath)
      console.error('[upload] error:', err.message)
      return res.status(500).json({ error: err.message })
    }
  })
})

// ─── POST /api/chat — Ask About This Lecture ──────────────────────
router.post('/chat', async (req, res) => {
  const { transcript, question, history } = req.body

  if (!transcript) {
    return res.status(400).json({ error: 'Lecture transcript is required for context.' })
  }
  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Question cannot be empty.' })
  }

  try {
    const answer = await askAboutLecture(transcript, question.trim(), history || [])
    return res.json({ answer })
  } catch (err) {
    console.error('[chat] error:', err.message)
    return res.status(500).json({ error: err.message || 'Failed to answer question.' })
  }
})

// ─── POST /api/contact — User / Institutional Inquiries ───────────
router.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body || {}

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' })
  }

  console.log(`[contact inquiry] from "${name}" <${email}> [${subject || 'General'}]: ${message.substring(0, 80)}...`)
  return res.json({
    status: 'received',
    message: 'Thank you for reaching out to LectureScribe. We have received your message.',
  })
})

export default router
