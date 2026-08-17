/**
 * routes/upload.js — POST /api/upload
 *
 * Handles audio file upload with full server-side validation:
 *   1. File format (mp3 / wav / m4a only)
 *   2. File size (≤ 15 MB)
 *   3. Audio duration (≤ 10 minutes)
 *
 * Actual transcription + note generation wired up in Phase 3+.
 */

import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { parseBuffer } from 'music-metadata'

const router = express.Router()

// ─── Constants ────────────────────────────────────────────────────
const ALLOWED_MIMES = [
  'audio/mpeg',       // mp3
  'audio/wav',        // wav
  'audio/x-wav',      // wav (alternate MIME)
  'audio/mp4',        // m4a
  'audio/x-m4a',      // m4a (alternate MIME)
  'audio/m4a',        // m4a (some browsers)
]
const ALLOWED_EXTS  = ['.mp3', '.wav', '.m4a']
const MAX_SIZE_MB   = 15
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const MAX_DURATION_SECONDS = 10 * 60   // 10 minutes

// ─── Multer setup ─────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    // Unique filename — avoids collisions and path-traversal issues
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, unique + path.extname(file.originalname).toLowerCase())
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const mimeOk = ALLOWED_MIMES.includes(file.mimetype)
    const extOk  = ALLOWED_EXTS.includes(ext)

    if (mimeOk || extOk) {
      cb(null, true)
    } else {
      // This error is caught in the route wrapper below
      const err = new Error(
        `Unsupported file format "${ext || file.mimetype}". Please upload an MP3, WAV, or M4A file.`
      )
      err.code = 'UNSUPPORTED_FORMAT'
      cb(err)
    }
  },
})

// ─── Helper: cleanup temp file safely ─────────────────────────────
function removeTempFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch (e) {
    console.warn('[upload] failed to remove temp file:', e.message)
  }
}

// ─── POST /api/upload ──────────────────────────────────────────────
router.post('/upload', (req, res) => {
  // Wrap multer in a callback so we can catch its errors as JSON
  upload.single('audio')(req, res, async (multerErr) => {
    // ── Multer-level errors (wrong type / too large) ──────────────
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

    // ── No file attached ─────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided.' })
    }

    const filePath = req.file.path

    try {
      // ── Duration check via music-metadata ────────────────────────
      const fileBuffer = fs.readFileSync(filePath)
      const metadata   = await parseBuffer(fileBuffer, { mimeType: req.file.mimetype })
      const durationSec = metadata.format.duration   // may be undefined for some formats

      if (durationSec && durationSec > MAX_DURATION_SECONDS) {
        removeTempFile(filePath)
        const mins = Math.round(durationSec / 60)
        return res.status(400).json({
          error: `Lecture is too long (${mins} min). Maximum is 10 minutes.`,
        })
      }

      // ── Validation passed ─────────────────────────────────────────
      // Phase 3 will replace this stub with Whisper + LLM calls.
      // Keep the file alive for Phase 3; for now clean up immediately.
      removeTempFile(filePath)

      return res.json({
        status: 'validated',
        message: 'File validated. Transcription will be wired up in Phase 3.',
        originalName: req.file.originalname,
        sizeMB: (req.file.size / 1024 / 1024).toFixed(2),
        durationSec: durationSec ? Math.round(durationSec) : null,
      })
    } catch (err) {
      removeTempFile(filePath)
      console.error('[upload] processing error:', err)
      return res.status(500).json({
        error: 'A server error occurred while processing your file. Please try again.',
      })
    }
  })
})

export default router
