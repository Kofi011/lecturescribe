/**
 * UploadCard.jsx — bordered white card with audio file picker + validation
 *
 * Client-side validation (before any network request):
 *   1. Format: MP3, WAV, M4A only (checked via MIME type + extension)
 *   2. Size:   ≤ 15 MB
 *   3. Duration: ≤ 10 minutes (via HTMLMediaElement metadata)
 *
 * On submit → POST /api/upload with the file (server re-validates all three).
 * Specific, human-readable error messages for every failure mode.
 */

import { useState, useRef, useCallback } from 'react'

// ─── Constants ───────────────────────────────────────────────────────────────
const ALLOWED_MIMES = new Set([
  'audio/mpeg', 'audio/wav', 'audio/x-wav',
  'audio/mp4', 'audio/x-m4a', 'audio/m4a',
])
const ALLOWED_EXTS   = new Set(['.mp3', '.wav', '.m4a'])
const MAX_SIZE_MB    = 15
const MAX_DURATION_MIN = 10

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Read audio duration via browser's media element (async) */
function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio')
    audio.preload = 'metadata'
    const url = URL.createObjectURL(file)
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)   // seconds (may be Infinity for some streams)
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read the audio file. It may be corrupted or unsupported.'))
    }
    audio.src = url
  })
}

function getExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx >= 0 ? filename.slice(idx).toLowerCase() : ''
}

function formatSize(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function UploadCard({ cardRef, onUploadSuccess }) {
  const fileInputRef   = useRef(null)
  const [file, setFile]         = useState(null)        // validated file ready to upload
  const [error, setError]       = useState(null)        // validation / upload error message
  const [checking, setChecking] = useState(false)       // async duration check in progress
  const [isDragging, setIsDragging] = useState(false)   // drag-over state
  const [uploadState, setUploadState] = useState('idle') // idle | uploading | success

  // ── Validate a candidate file ──────────────────────────────────────────────
  const validateFile = useCallback(async (candidate) => {
    setError(null)
    setFile(null)
    setUploadState('idle')

    if (!candidate) return

    // 1. Format check
    const ext  = getExtension(candidate.name)
    const mime = candidate.type
    if (!ALLOWED_MIMES.has(mime) && !ALLOWED_EXTS.has(ext)) {
      setError(
        `Unsupported file format (${ext || mime || 'unknown'}). ` +
        'Please upload an MP3, WAV, or M4A file.'
      )
      return
    }

    // 2. Size check
    if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(
        `File is too large (${formatSize(candidate.size)}). ` +
        `Maximum size is ${MAX_SIZE_MB} MB.`
      )
      return
    }

    // 3. Duration check (async — reads audio metadata in-browser)
    setChecking(true)
    try {
      const duration = await getAudioDuration(candidate)
      if (Number.isFinite(duration) && duration > MAX_DURATION_MIN * 60) {
        const mins = (duration / 60).toFixed(1)
        setError(
          `Lecture is too long (${mins} min). Maximum is ${MAX_DURATION_MIN} minutes.`
        )
        setChecking(false)
        return
      }
    } catch (e) {
      setError(e.message)
      setChecking(false)
      return
    }

    setChecking(false)
    setFile(candidate)
  }, [])

  // ── File input change ──────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    validateFile(e.target.files[0] ?? null)
    // Reset the input so the same file can be re-selected after clearing
    e.target.value = ''
  }

  // ── Drag-and-drop ──────────────────────────────────────────────────────────
  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    validateFile(e.dataTransfer.files[0] ?? null)
  }

  // ── Submit upload ──────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return
    setUploadState('uploading')
    setError(null)

    const formData = new FormData()
    formData.append('audio', file)

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        // Server-side validation error — show its specific message
        setError(data.error || 'Upload failed. Please try again.')
        setUploadState('idle')
        return
      }

      setUploadState('success')
      if (onUploadSuccess) onUploadSuccess(data)
    } catch {
      setError('Network error. Check your connection and try again.')
      setUploadState('idle')
    }
  }

  // ── Clear selection ────────────────────────────────────────────────────────
  const handleClear = () => {
    setFile(null)
    setError(null)
    setUploadState('idle')
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const isUploading = uploadState === 'uploading'
  const isSuccess   = uploadState === 'success'

  return (
    <section ref={cardRef} id="upload-section" className="px-6 py-16 md:py-20 bg-white">
      <div className="max-w-2xl mx-auto">
        {/* Section label */}
        <p className="text-center text-[#6B7280] text-sm font-medium uppercase tracking-widest mb-8">
          Upload your lecture
        </p>

        {/* Card */}
        <div className="card p-8 md:p-12">

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Click or drag a lecture audio file here"
            onClick={() => !file && !isUploading && fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={[
              'border-2 border-dashed rounded-card p-10 text-center transition-colors duration-150 select-none',
              isDragging
                ? 'border-black bg-gray-50'
                : file
                ? 'border-black bg-white cursor-default'
                : 'border-gray-300 hover:border-black cursor-pointer',
            ].join(' ')}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <svg
                width="40" height="40" viewBox="0 0 40 40"
                fill="none" stroke="black" strokeWidth="1.6"
                className={`transition-opacity ${file ? 'opacity-100' : 'opacity-40'}`}
                aria-hidden="true"
              >
                <path d="M20 8 v16 M13 15 l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="6" y="28" width="28" height="6" rx="3" strokeLinejoin="round" />
              </svg>
            </div>

            {checking ? (
              <p className="text-[#6B7280] text-sm">Checking audio…</p>
            ) : file ? (
              <>
                <p className="font-semibold text-black text-base mb-1 break-all">{file.name}</p>
                <p className="text-[#6B7280] text-sm">{formatSize(file.size)}</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-black text-base mb-1">
                  Click to select or drag &amp; drop
                </p>
                <p className="text-[#6B7280] text-sm">MP3, WAV, or M4A · Max {MAX_DURATION_MIN} min · Max {MAX_SIZE_MB} MB</p>
              </>
            )}
          </div>

          {/* Hidden file input — accepts mp3, wav, m4a */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/m4a"
            className="hidden"
            aria-hidden="true"
            onChange={handleFileChange}
          />

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mt-4 px-4 py-3 border border-black rounded-card text-sm text-black flex items-start gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0 mt-0.5" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" />
                <line x1="8" y1="5" x2="8" y2="8.5" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.7" fill="currentColor" stroke="none" />
              </svg>
              {error}
            </div>
          )}

          {/* Success state (Phase 3 will replace this with page transition) */}
          {isSuccess && (
            <div
              role="status"
              className="mt-4 px-4 py-3 border border-black rounded-card text-sm text-black flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" />
                <polyline points="5,8.5 7,10.5 11,6.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              File uploaded and validated. Transcription coming in Phase 3.
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex gap-3 flex-wrap">
            <button
              id="upload-submit-btn"
              onClick={handleUpload}
              disabled={!file || isUploading || isSuccess}
              className={[
                'btn-primary flex-1 text-base py-4 transition-opacity',
                (!file || isUploading || isSuccess) ? 'opacity-40 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {isUploading
                ? 'Uploading…'
                : isSuccess
                ? 'Uploaded ✓'
                : 'Upload & Transcribe'}
            </button>

            {(file || error) && !isUploading && !isSuccess && (
              <button
                id="upload-clear-btn"
                onClick={handleClear}
                className="btn-secondary px-6 py-4 text-base"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
