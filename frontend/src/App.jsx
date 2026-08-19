/**
 * App.jsx — LectureScribe Root Application Controller
 * Requirement 1: Animated flowing visual waveform motion
 * Requirement 2: Every clickable element produces a relevant result
 * Requirement 3: Internal transcription technology is not exposed
 */

import './App.css'
import { useState, useEffect, useRef } from 'react'
import LandingPage    from './pages/LandingPage'
import ProcessingPage from './pages/ProcessingPage'
import ResultsPage    from './pages/ResultsPage'
import NavigationModal from './components/NavigationModal'
import InfoModal       from './components/InfoModal'
import { saveLecture, deleteLecture, SAMPLE_LECTURE } from './utils/lectureStorage'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function App() {
  const [page,           setPage]           = useState('landing')
  const [stage,          setStage]          = useState('uploaded')
  const [error,          setError]          = useState(null)
  const [currentLecture, setCurrentLecture] = useState(null)

  // Interactive Modals
  const [menuOpen,        setMenuOpen]        = useState(false)
  const [menuInitialTab,  setMenuInitialTab]  = useState('lectures')
  const [infoModalType,   setInfoModalType]   = useState(null)

  const abortRef = useRef(null)

  // ─── Upload Handler ────────────────────────────────────────────────────────
  const handleUpload = async (file) => {
    setError(null)
    setCurrentLecture(null)
    setStage('uploaded')
    setPage('processing')

    // Visual progression state
    await new Promise((r) => setTimeout(r, 1200))
    setStage('transcribing')

    const formData = new FormData()
    formData.append('audio', file)

    const controller = new AbortController()
    abortRef.current = controller

    let data
    try {
      const endpoint = API_URL ? `${API_URL}/api/upload` : '/api/upload'
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      // Parse JSON response or fallback to text error
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        data = await res.json()
      } else {
        const text = await res.text()
        data = { error: text || `Server error (${res.status})` }
      }

      if (!res.ok) {
        setError(data?.error || `Processing failed with status ${res.status}. Please try again.`)
        setStage('transcribing')
        setPage('processing')
        return
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('[upload error]', err)
      setError(
        err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
          ? 'Connection to LectureScribe server failed. Please ensure the backend is running and try again.'
          : `Upload error: ${err.message}`
      )
      setStage('transcribing')
      setPage('processing')
      return
    }

    // Advance stages smoothly
    setStage('summarizing')
    await new Promise((r) => setTimeout(r, 900))
    setStage('complete')
    await new Promise((r) => setTimeout(r, 600))
    await new Promise((r) => setTimeout(r, 600))

    // Persist to local client storage
    saveLecture(data)
    setCurrentLecture(data)
    setPage('results')
  }

  // ─── Load Interactive Example ──────────────────────────────────────────────
  const handleSelectExample = () => {
    saveLecture(SAMPLE_LECTURE)
    setCurrentLecture(SAMPLE_LECTURE)
    setPage('results')
  }

  // ─── Navigation / Menu triggers ────────────────────────────────────────────
  const handleOpenMenu = (tab = 'lectures') => {
    setMenuInitialTab(tab)
    setMenuOpen(true)
  }

  const handleSelectLectureFromMenu = (lec) => {
    setCurrentLecture(lec)
    setMenuOpen(false)
    setPage('results')
  }

  const handleDeleteLecture = (id) => {
    deleteLecture(id)
    if (currentLecture?.id === id) {
      setCurrentLecture(null)
      setPage('landing')
    }
  }

  const handleRetry = () => {
    abortRef.current?.abort()
    setPage('landing')
    setStage('uploaded')
    setError(null)
    setCurrentLecture(null)
  }

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* ─── PAGES ──────────────────────────────────────────────────────────── */}
      {page === 'landing' && (
        <LandingPage
          onUpload={handleUpload}
          onOpenMenu={handleOpenMenu}
          onOpenInfo={(type) => setInfoModalType(type)}
          onSelectExample={handleSelectExample}
        />
      )}

      {page === 'processing' && (
        <ProcessingPage
          stage={error ? 'error' : stage}
          error={error}
          onRetry={handleRetry}
          onOpenMenu={handleOpenMenu}
          onOpenInfo={(type) => setInfoModalType(type)}
        />
      )}

      {page === 'results' && currentLecture && (
        <ResultsPage
          lecture={currentLecture}
          onReset={handleRetry}
          onOpenMenu={handleOpenMenu}
          onOpenInfo={(type) => setInfoModalType(type)}
          onDeleteLecture={handleDeleteLecture}
        />
      )}

      {/* ─── INTERACTIVE WORKSPACE MENU MODAL (Requirement 2) ────────────────── */}
      <NavigationModal
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        initialView={menuInitialTab}
        onSelectLecture={handleSelectLectureFromMenu}
      />

      {/* ─── INTERACTIVE POLICY & FORMAT INFO MODAL (Requirement 2) ─────────── */}
      <InfoModal
        type={infoModalType}
        isOpen={!!infoModalType}
        onClose={() => setInfoModalType(null)}
      />
    </div>
  )
}
