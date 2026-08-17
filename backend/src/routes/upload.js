/**
 * routes/upload.js — POST /api/upload
 *
 * Full synchronous processing pipeline (per ARCHITECTURE.md):
 *   1. Validate file (format, size via multer; duration via music-metadata)
 *   2. Transcribe audio → Groq Whisper  (Phase 3)
 *   3. Generate notes  → Groq LLM       (Phase 4)
 *   4. Return { status, title, transcript, notes_markdown } to frontend
 *
 * All errors return specific, human-readable JSON messages.
 * Temp files are deleted after processing (or on any error).
 */

import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { parseBuffer } from 'music-metadata'
import { transcribeAudio } from '../services/transcribe.js'
import { generateNotes }   from '../services/generateNotes.js'

const router = express.Router()

// ─── Constants ────────────────────────────────────────────────────
const ALLOWED_MIMES = [
  'audio/mpeg',       // mp3
  'audio/wav',        // wav
  'audio/x-wav',      // wav (alternate)
  'audio/mp4',        // m4a
  'audio/x-m4a',      // m4a (alternate)
  'audio/m4a',        // m4a (some browsers)
]
const ALLOWED_EXTS   = ['.mp3', '.wav', '.m4a']
const MAX_SIZE_MB    = 15
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const MAX_DURATION_SECONDS = 10 * 60   // 10 minutes

// ─── Multer setup ─────────────────────────────────────────────────
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
        `Unsupported file format "${ext || file.mimetype}". ` +
        'Please upload an MP3, WAV, or M4A file.'
      )
      err.code = 'UNSUPPORTED_FORMAT'
      cb(err)
    }
  },
})

// ─── Helper: safe temp-file cleanup ──────────────────────────────
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

    // ── Multer-level errors ─────────────────────────────────────
    if (multerErr) {
      if (multerErr.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: `File is too large. Maximum size is ${MAX_SIZE_MB} MB.`,
        })
      }
      if (multerErr.code === 'UNSUPPORTED_FORMAT') {
        return res.status(400).json({ error: multerErr.message })
      }
      return res.status(400).json({ error: multerErr.message || 'Upload failed.' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided.' })
    }

    const filePath = req.file.path

    try {
      // ── 1. Duration check ────────────────────────────────────
      const fileBuffer  = fs.readFileSync(filePath)
      const metadata    = await parseBuffer(fileBuffer, { mimeType: req.file.mimetype })
      const durationSec = metadata.format.duration

      if (durationSec && durationSec > MAX_DURATION_SECONDS) {
        removeTempFile(filePath)
        const mins = Math.round(durationSec / 60)
        return res.status(400).json({
          error: `Lecture is too long (${mins} min). Maximum is 10 minutes.`,
        })
      }

      // ── 2. Transcribe ────────────────────────────────────────
      console.log(`[upload] transcribing: ${req.file.originalname}`)
      const transcript = await transcribeAudio(filePath, req.file.mimetype)

      // ── 3. Generate notes ────────────────────────────────────
      console.log('[upload] generating notes…')
      const { title, notes_markdown } = await generateNotes(transcript)

      // ── 4. Clean up + respond ────────────────────────────────
      removeTempFile(filePath)
      console.log(`[upload] done — "${title}"`)

      return res.json({
        status:         'complete',
        title,
        transcript,
        notes_markdown,
      })

    } catch (err) {
      removeTempFile(filePath)
      console.error('[upload] error:', err.message)
      // Return the service's human-readable message directly
      return res.status(500).json({ error: err.message })
    }
  })
})

export default router
