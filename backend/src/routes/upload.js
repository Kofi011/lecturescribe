/**
 * routes/upload.js — Upload, Analysis, and Interactive Lecture Q&A
 *
 * Endpoints:
 *   POST /api/upload — Process lecture audio -> structured knowledge
 *   POST /api/chat   — Interactive Q&A about a lecture transcript
 */

import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { parseBuffer } from 'music-metadata'
import { transcribeAudio } from '../services/transcribe.js'
import { generateNotes }   from '../services/generateNotes.js'
import { askAboutLecture } from '../services/askLecture.js'

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

// ─── POST /api/upload ─────────────────────────────────────────────
router.post('/upload', (req, res) => {
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
      // 1. Duration check
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

      // 2. Transcribe speech
      console.log(`[upload] processing speech: ${req.file.originalname}`)
      const transcript = await transcribeAudio(filePath, req.file.mimetype)

      // 3. Generate structured study intelligence
      console.log('[upload] analyzing concepts & synthesizing notes…')
      const result = await generateNotes(transcript)

      removeTempFile(filePath)
      console.log(`[upload] lecture ready — "${result.title}"`)

      return res.json({
        status: 'complete',
        id: `lec_${Date.now()}`,
        date: new Date().toISOString(),
        durationSec: durationSec ? Math.round(durationSec) : null,
        fileName: req.file.originalname,
        transcript,
        ...result,
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

export default router
