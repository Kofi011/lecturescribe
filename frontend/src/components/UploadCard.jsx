/**
 * UploadCard.jsx — Audio file upload card styled with SasuSync visual language
 * Responsive for all mobile screen sizes down to 320px
 */

import { useState, useRef, useCallback } from 'react'

const ALLOWED_MIMES = new Set([
  'audio/mpeg', 'audio/wav', 'audio/x-wav',
  'audio/mp4', 'audio/x-m4a', 'audio/m4a',
])
const ALLOWED_EXTS     = new Set(['.mp3', '.wav', '.m4a'])
const MAX_SIZE_MB      = 15
const MAX_DURATION_MIN = 10

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

export default function UploadCard({ cardRef, onSubmit }) {
  const fileInputRef = useRef(null)
  const [file,       setFile]       = useState(null)
  const [error,      setError]      = useState(null)
  const [checking,   setChecking]   = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const validateFile = useCallback(async (candidate) => {
    setError(null)
    setFile(null)
    if (!candidate) return

    const ext = getExt(candidate.name)
    if (!ALLOWED_MIMES.has(candidate.type) && !ALLOWED_EXTS.has(ext)) {
      setError(
        `Unsupported format (${ext || candidate.type || 'unknown'}). ` +
        'Please upload an MP3, WAV, or M4A file.'
      )
      return
    }

    if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(
        `File is too large (${formatSize(candidate.size)}). ` +
        `Maximum is ${MAX_SIZE_MB} MB.`
      )
      return
    }

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
    onSubmit(file)
  }

  return (
    <div ref={cardRef} id="upload-section" className="w-full">
      {/* Upload Card */}
      <div className="bg-white border border-neutral-200/90 rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        {/* Drop area */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload audio file"
          onClick={() => !file && !checking && fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            'border-2 border-dashed rounded-[18px] sm:rounded-[22px] p-6 sm:p-10 md:p-12 text-center transition-all duration-200 select-none',
            isDragging
              ? 'border-black bg-neutral-50 scale-[1.01]'
              : file
              ? 'border-black bg-neutral-50/40 cursor-default'
              : 'border-neutral-200 hover:border-black hover:bg-neutral-50/50 cursor-pointer',
          ].join(' ')}
        >
          {/* Upload Icon */}
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 sm:mb-5 text-black shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          {checking ? (
            <p className="text-neutral-600 font-medium text-xs sm:text-sm">Analyzing audio duration…</p>
          ) : file ? (
            <div className="flex flex-col items-center">
              <span className="font-bold text-black text-sm sm:text-base md:text-lg break-all">{file.name}</span>
              <span className="text-neutral-500 text-[11px] sm:text-xs font-semibold mt-1 px-3 py-1 bg-neutral-100 rounded-full">
                {formatSize(file.size)}
              </span>
            </div>
          ) : (
            <>
              <p className="font-bold text-black text-sm sm:text-base md:text-lg mb-1 tracking-tight">
                Click to select audio or drag &amp; drop
              </p>
              <p className="text-neutral-400 text-[11px] sm:text-xs md:text-sm font-normal">
                MP3, WAV, or M4A · Max {MAX_DURATION_MIN} min · Max {MAX_SIZE_MB} MB
              </p>
            </>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/m4a"
          className="hidden"
          aria-hidden="true"
          onChange={handleChange}
        />

        {/* Error Message */}
        {error && (
          <div role="alert" className="mt-4 px-4 py-3 border border-red-500/20 bg-red-50/50 rounded-[16px] text-xs sm:text-sm text-red-900 flex items-start gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5 text-red-600">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 sm:mt-8 flex gap-3 flex-col sm:flex-row">
          <button
            id="upload-submit-btn"
            onClick={handleSubmit}
            disabled={!file || checking}
            className={[
              'btn-primary flex-1 py-3.5 sm:py-4 text-sm sm:text-base tracking-tight',
              (!file || checking) ? 'opacity-40 cursor-not-allowed hover:bg-black' : '',
            ].join(' ')}
          >
            Upload &amp; Transcribe
          </button>
          {(file || error) && !checking && (
            <button
              id="upload-clear-btn"
              onClick={handleClear}
              className="btn-secondary w-full sm:w-auto px-6 py-3.5 sm:py-4 text-sm sm:text-base"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
