/**
 * UploadCard.jsx — bordered white card with audio file picker + client validation
 *
 * Client-side validation (before any network request):
 *   1. Format: MP3, WAV, M4A only (checked via MIME type + extension)
 *   2. Size:   ≤ 15 MB
 *   3. Duration: ≤ 10 minutes (via HTMLMediaElement metadata)
 *
 * On submit → calls onSubmit(file) — App.jsx handles the actual fetch.
 * This keeps the upload card pure UI/validation; no network calls here.
 */

import { useState, useRef, useCallback } from 'react'

// ─── Constants ───────────────────────────────────────────────────────────────
const ALLOWED_MIMES = new Set([
  'audio/mpeg', 'audio/wav', 'audio/x-wav',
  'audio/mp4', 'audio/x-m4a', 'audio/m4a',
])
const ALLOWED_EXTS    = new Set(['.mp3', '.wav', '.m4a'])
const MAX_SIZE_MB     = 15
const MAX_DURATION_MIN = 10

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio')
    audio.preload = 'metadata'
    const url = URL.createObjectURL(file)
    audio.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(audio.duration) }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read the audio file. It may be corrupted or unsupported.'))
    }
    audio.src = url
  })
}

function getExt(filename) {
  const i = filename.lastIndexOf('.')
  return i >= 0 ? filename.slice(i).toLowerCase() : ''
}

function formatSize(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function UploadCard({ cardRef, onSubmit }) {
  const fileInputRef = useRef(null)
  const [file,       setFile]       = useState(null)
  const [error,      setError]      = useState(null)
  const [checking,   setChecking]   = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // ── Validate candidate file ───────────────────────────────────────────────
  const validateFile = useCallback(async (candidate) => {
    setError(null)
    setFile(null)
    if (!candidate) return

    // 1. Format
    const ext  = getExt(candidate.name)
    if (!ALLOWED_MIMES.has(candidate.type) && !ALLOWED_EXTS.has(ext)) {
      setError(
        `Unsupported format (${ext || candidate.type || 'unknown'}). ` +
        'Please upload an MP3, WAV, or M4A file.'
      )
      return
    }

    // 2. Size
    if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(
        `File is too large (${formatSize(candidate.size)}). ` +
        `Maximum is ${MAX_SIZE_MB} MB.`
      )
      return
    }

    // 3. Duration (async)
    setChecking(true)
    try {
      const dur = await getAudioDuration(candidate)
      if (Number.isFinite(dur) && dur > MAX_DURATION_MIN * 60) {
        setError(
          `Lecture is too long (${(dur / 60).toFixed(1)} min). ` +
          `Maximum is ${MAX_DURATION_MIN} minutes.`
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

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleChange = (e) => {
    validateFile(e.target.files[0] ?? null)
    e.target.value = ''
  }

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    validateFile(e.dataTransfer.files[0] ?? null)
  }

  const handleClear = () => { setFile(null); setError(null) }

  const handleSubmit = () => {
    if (!file) return
    onSubmit(file)   // hand the validated File object up to App.jsx
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section ref={cardRef} id="upload-section" className="px-6 py-16 md:py-20 bg-white">
      <div className="max-w-2xl mx-auto">
        <p className="text-center text-[#6B7280] text-sm font-medium uppercase tracking-widest mb-8">
          Upload your lecture
        </p>

        <div className="card p-8 md:p-12">

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Click or drag an audio file here"
            onClick={() => !file && !checking && fileInputRef.current?.click()}
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
            {/* Upload icon */}
            <div className="flex justify-center mb-4">
              <svg
                width="40" height="40" viewBox="0 0 40 40"
                fill="none" stroke="black" strokeWidth="1.6"
                className={`transition-opacity ${file ? 'opacity-100' : 'opacity-40'}`}
                aria-hidden="true"
              >
                <path d="M20 8 v16 M13 15 l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="6" y="28" width="28" height="6" rx="3" />
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
                <p className="text-[#6B7280] text-sm">
                  MP3, WAV, or M4A · Max {MAX_DURATION_MIN} min · Max {MAX_SIZE_MB} MB
                </p>
              </>
            )}
          </div>

          {/* Hidden file input — accept mp3, wav, m4a */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/m4a"
            className="hidden"
            aria-hidden="true"
            onChange={handleChange}
          />

          {/* Error message */}
          {error && (
            <div role="alert" className="mt-4 px-4 py-3 border border-black rounded-card text-sm flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0 mt-0.5" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" />
                <line x1="8" y1="5" x2="8" y2="8.5" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.7" fill="currentColor" stroke="none" />
              </svg>
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex gap-3 flex-wrap">
            <button
              id="upload-submit-btn"
              onClick={handleSubmit}
              disabled={!file || checking}
              className={[
                'btn-primary flex-1 text-base py-4',
                (!file || checking) ? 'opacity-40 cursor-not-allowed' : '',
              ].join(' ')}
            >
              Upload &amp; Transcribe
            </button>
            {(file || error) && !checking && (
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
