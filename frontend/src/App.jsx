/**
 * App.jsx — root component with page state machine
 *
 * Pages:
 *   landing    → LandingPage  (upload form)
 *   processing → ProcessingPage (status stages during API call)
 *   results    → ResultsPage  (transcript + notes tabs)
 *
 * Upload flow:
 *   1. User submits file from LandingPage
 *   2. App switches to ProcessingPage (stage: 'uploaded')
 *   3. POST /api/upload is called — backend runs synchronously:
 *        validates → transcribes (Whisper) → generates notes (LLM)
 *   4. While waiting, stages advance on a timer to give live feedback
 *   5. On success → ResultsPage with title + transcript + notes
 *   6. On error   → ProcessingPage error state with specific message + retry
 */

import './App.css'
import { useState, useEffect, useRef } from 'react'
import LandingPage    from './pages/LandingPage'
import ProcessingPage from './pages/ProcessingPage'
import ResultsPage    from './pages/ResultsPage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Stage progression timing (ms) — just for UX; actual progress is backend-driven
const STAGE_DELAYS = {
  uploaded:     0,
  transcribing: 1500,
  summarizing:  null,   // advanced when API call returns
}

export default function App() {
  const [page,    setPage]    = useState('landing')
  const [stage,   setStage]   = useState('uploaded')
  const [error,   setError]   = useState(null)
  const [result,  setResult]  = useState(null)

  // Ref to abort any in-flight fetch on unmount
  const abortRef = useRef(null)

  // ── Upload handler — called from LandingPage → UploadCard ────────────────
  const handleUpload = async (file) => {
    // Reset state
    setError(null)
    setResult(null)
    setStage('uploaded')
    setPage('processing')

    // Small delay so 'uploaded' stage is visible before advancing
    await new Promise((r) => setTimeout(r, STAGE_DELAYS.transcribing))
    setStage('transcribing')

    // Build form data
    const formData = new FormData()
    formData.append('audio', file)

    // Set up abort controller for cleanup
    const controller = new AbortController()
    abortRef.current = controller

    let data
    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      data = await res.json()

      if (!res.ok) {
        // Server returned a specific error — show it
        setError(data.error || 'An error occurred. Please try again.')
        setStage('transcribing')  // mark the failing stage
        setPage('processing')
        // Small delay so user sees the error state before it stabilises
        return
      }
    } catch (err) {
      if (err.name === 'AbortError') return   // component unmounted
      setError('Network error — check your connection and try again.')
      setStage('transcribing')
      setPage('processing')
      return
    }

    // Success — advance stage to summarizing then complete
    setStage('summarizing')
    await new Promise((r) => setTimeout(r, 800))
    setStage('complete')
    await new Promise((r) => setTimeout(r, 600))

    // Store result and switch to results page
    setResult(data)
    setPage('results')
  }

  // ── Retry — go back to landing, clear state ──────────────────────────────
  const handleRetry = () => {
    abortRef.current?.abort()
    setPage('landing')
    setStage('uploaded')
    setError(null)
    setResult(null)
  }

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────
  if (page === 'landing') {
    return <LandingPage onUpload={handleUpload} />
  }

  if (page === 'processing') {
    return (
      <ProcessingPage
        stage={error ? 'error' : stage}
        error={error}
        onRetry={handleRetry}
      />
    )
  }

  if (page === 'results' && result) {
    return (
      <ResultsPage
        title={result.title}
        transcript={result.transcript}
        notes_markdown={result.notes_markdown}
        onReset={handleRetry}
      />
    )
  }

  return null
}
