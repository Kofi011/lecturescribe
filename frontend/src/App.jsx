/**
 * App.jsx — LectureScribe Root Application Controller
 * Routes:
 *   - 'landing'   — Public Landing Page (Hero, Features, Audio upload)
 *   - 'trial'     — Free Trial Mode (3 free uploads with live counter & gating)
 *   - 'auth'      — Authentication Page (Log in & Create Account toggle)
 *   - 'workspace' — Protected Student Workspace (Unlimited processing & library)
 *   - 'about'     — Static About & Mission Page
 *   - 'processing'— Staged processing animation & status
 *   - 'results'   — Complete study intelligence hub & AI tutor
 */

import './App.css'
import { useState, useEffect, useRef } from 'react'
import LandingPage from './pages/LandingPage'
import TrialPage from './pages/TrialPage'
import AuthPage from './pages/AuthPage'
import WorkspacePage from './pages/WorkspacePage'
import AboutPage from './pages/AboutPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ProcessingPage from './pages/ProcessingPage'
import ResultsPage from './pages/ResultsPage'
import NavigationModal from './components/NavigationModal'
import InfoModal from './components/InfoModal'
import UserSettingsModal from './components/UserSettingsModal'
import { saveLecture, deleteLecture, clearAllLectures, SAMPLE_LECTURE, getSavedLectures } from './utils/lectureStorage'
import { useInactivityLogout } from './utils/useInactivityLogout'
import { trackClientEvent } from './utils/analytics'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function App() {
  const getInitialPage = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase()
      if (path === '/admin') return 'admin'
      if (path === '/trial') return 'trial'
      if (path === '/login' || path === '/auth') return 'auth'
      if (path === '/about') return 'about'
      if (path === '/workspace') return 'workspace'
    }
    return 'landing'
  }

  const [page, setPage] = useState(getInitialPage)
  const [stage, setStage] = useState('uploaded')
  const [error, setError] = useState(null)
  const [currentLecture, setCurrentLecture] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [inactivityNotice, setInactivityNotice] = useState(null)

  // Modals
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false)
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState('lectures')
  const [infoModalType, setInfoModalType] = useState(null)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  const abortRef = useRef(null)

  // Sync browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setPage(getInitialPage())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // ─── Check Auth Session on Load ───────────────────────────────────────────
  useEffect(() => {
    async function checkAuth() {
      try {
        const endpoint = API_URL ? `${API_URL}/api/auth/me` : '/api/auth/me'
        const res = await fetch(endpoint, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data?.user) {
            setCurrentUser(data.user)
          }
        }
      } catch (err) {
        console.warn('[auth check]', err)
      }
    }
    checkAuth()
  }, [])

  // ─── Upload Handler ────────────────────────────────────────────────────────
  const handleUpload = async (file) => {
    setError(null)
    setCurrentLecture(null)
    setStage('uploaded')
    setPage('processing')

    // Staged progression animation
    await new Promise((r) => setTimeout(r, 1000))
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
        credentials: 'include',
        signal: controller.signal,
      })

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        data = await res.json()
      } else {
        const text = await res.text()
        data = { error: text || `Server error (${res.status})` }
      }

      if (!res.ok) {
        // If 3-trial limit reached, provide clear error message and link to auth
        if (res.status === 403 && data?.code === 'TRIAL_LIMIT_REACHED') {
          setError(
            'You have used all 3 free trial uploads. Please create a free account or log in to continue unlimited processing.'
          )
        } else {
          setError(data?.error || `Processing failed with status ${res.status}. Please try again.`)
        }
        setStage('transcribing')
        setPage('processing')
        return
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('[upload error]', err)
      setError(
        err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
          ? 'Connection to LectureScribe server failed. Please ensure the backend is running.'
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

    // Create object URL for audio playback
    let audioUrl = null
    try {
      audioUrl = URL.createObjectURL(file)
    } catch { }

    const completeLecture = {
      ...data,
      audioUrl,
    }

    // Persist to local client and cloud storage
    saveLecture(completeLecture, currentUser)
    setCurrentLecture(completeLecture)
    setPage('results')
  }

  // ─── Auth Handlers ────────────────────────────────────────────────────────
  const handleAuthSuccess = (user) => {
    setCurrentUser(user)
    setInactivityNotice(null)
    setPage('workspace')
  }

  const handleLogout = async (isAuto = false) => {
    try {
      const endpoint = API_URL ? `${API_URL}/api/auth/logout` : '/api/auth/logout'
      await fetch(endpoint, { method: 'POST', credentials: 'include' })
    } catch (err) {
      console.warn('[logout error]', err)
    }
    setCurrentUser(null)
    if (isAuto === true) {
      setInactivityNotice('You were automatically signed out due to 15 minutes of inactivity for your security.')
      setPage('auth')
    } else {
      setInactivityNotice(null)
      setPage('landing')
    }
  }

  // Automatic logout hook for inactive sessions (15 minutes default)
  useInactivityLogout(currentUser, handleLogout, 15)

  // ─── Navigation Handlers ──────────────────────────────────────────────────
  const handleNavigate = (targetPage) => {
    setError(null)
    setInactivityNotice(null)
    if (targetPage === 'workspace' && !currentUser) {
      setPage('auth')
      if (typeof window !== 'undefined') window.history.pushState(null, '', '/login')
      trackClientEvent('page_view_auth_redirect', '/login')
      return
    }
    setPage(targetPage)
    if (typeof window !== 'undefined') {
      const pathMap = {
        landing: '/',
        trial: '/trial',
        auth: '/login',
        workspace: '/workspace',
        about: '/about',
        admin: '/admin',
      }
      const targetPath = pathMap[targetPage] || '/'
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath)
      }
      trackClientEvent(`page_view_${targetPage}`, targetPath)
    }
  }

  // ─── Load Interactive Example ──────────────────────────────────────────────
  const handleSelectExample = () => {
    trackClientEvent('sample_lecture_loaded', '/results')
    saveLecture(SAMPLE_LECTURE)
    setCurrentLecture(SAMPLE_LECTURE)
    setPage('results')
  }

  const handleOpenWorkspaceModal = (tab = 'lectures') => {
    if (!currentUser) {
      setPage('auth')
      return
    }
    setWorkspaceInitialTab(tab)
    setWorkspaceModalOpen(true)
  }

  const handleSelectLectureFromModal = (lec) => {
    setCurrentLecture(lec)
    setWorkspaceModalOpen(false)
    setPage('results')
  }

  const handleDeleteLecture = (id) => {
    if (id === 'all') {
      clearAllLectures()
      setCurrentLecture(null)
      setPage('landing')
    } else {
      deleteLecture(id, currentUser)
      if (currentLecture?.id === id) {
        setCurrentLecture(null)
        setPage('landing')
      }
    }
  }

  const handleRetry = () => {
    abortRef.current?.abort()
    setError(null)
    setCurrentLecture(null)
    setPage(currentUser ? 'workspace' : 'landing')
  }

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* ─── 1. LANDING PAGE ────────────────────────────────────────────────── */}
      {page === 'landing' && (
        <LandingPage
          onUpload={handleUpload}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenInfo={(type) => setInfoModalType(type)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onSelectExample={handleSelectExample}
          onOpenWorkspaceModal={handleOpenWorkspaceModal}
        />
      )}

      {/* ─── 2. FREE TRIAL PAGE (3 UPLOADS) ─────────────────────────────────── */}
      {page === 'trial' && (
        <TrialPage
          onUpload={handleUpload}
          uploadError={error}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenInfo={(type) => setInfoModalType(type)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenWorkspaceModal={handleOpenWorkspaceModal}
        />
      )}

      {/* ─── 3. AUTH PAGE (LOGIN / SIGNUP) ──────────────────────────────────── */}
      {page === 'auth' && (
        <AuthPage
          onNavigate={handleNavigate}
          onAuthSuccess={handleAuthSuccess}
          onOpenInfo={(type) => setInfoModalType(type)}
          onOpenWorkspaceModal={handleOpenWorkspaceModal}
        />
      )}

      {/* ─── 4. PROTECTED STUDENT WORKSPACE ─────────────────────────────────── */}
      {page === 'workspace' && (
        <WorkspacePage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onUpload={handleUpload}
          uploadError={error}
          onSelectLecture={(lec) => {
            setCurrentLecture(lec)
            setPage('results')
          }}
          onLogout={handleLogout}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenInfo={(type) => setInfoModalType(type)}
          onOpenWorkspaceModal={handleOpenWorkspaceModal}
        />
      )}

      {/* ─── 5. STATIC ABOUT PAGE ───────────────────────────────────────────── */}
      {page === 'about' && (
        <AboutPage
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenInfo={(type) => setInfoModalType(type)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenWorkspaceModal={handleOpenWorkspaceModal}
        />
      )}

      {/* ─── 6. PROCESSING STATE ────────────────────────────────────────────── */}
      {page === 'processing' && (
        <ProcessingPage
          stage={error ? 'error' : stage}
          error={error}
          onRetry={handleRetry}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenWorkspaceModal={handleOpenWorkspaceModal}
        />
      )}

      {/* ─── 7. RESULTS VIEW ────────────────────────────────────────────────── */}
      {page === 'results' && currentLecture && (
        <ResultsPage
          lecture={currentLecture}
          onReset={handleRetry}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenWorkspaceModal={handleOpenWorkspaceModal}
          onOpenInfo={(type) => setInfoModalType(type)}
          onDeleteLecture={handleDeleteLecture}
          onUpdateLecture={(updated) => setCurrentLecture(updated)}
        />
      )}

      {/* ─── 8. ADMIN DASHBOARD ─────────────────────────────────────────────── */}
      {page === 'admin' && (
        <AdminDashboardPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenWorkspaceModal={handleOpenWorkspaceModal}
          onOpenInfo={(type) => setInfoModalType(type)}
        />
      )}

      {/* ─── WORKSPACE LIBRARY MODAL ────────────────────────────────────────── */}
      <NavigationModal
        isOpen={workspaceModalOpen}
        onClose={() => setWorkspaceModalOpen(false)}
        initialView={workspaceInitialTab}
        onSelectLecture={handleSelectLectureFromModal}
        onDeleteLecture={handleDeleteLecture}
      />

      {/* ─── USER SETTINGS MODAL ────────────────────────────────────────────── */}
      <UserSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        savedLecturesCount={getSavedLectures().length}
      />

      {/* ─── INFO MODAL ─────────────────────────────────────────────────────── */}
      <InfoModal
        type={infoModalType}
        isOpen={!!infoModalType}
        onClose={() => setInfoModalType(null)}
      />

      {/* ─── INACTIVITY AUTO-LOGOUT NOTIFICATION TOAST ───────────────────────── */}
      {inactivityNotice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-3.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-3 animate-fade-in border border-white/20">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span>
          <span>{inactivityNotice}</span>
          <button
            onClick={() => setInactivityNotice(null)}
            className="text-neutral-400 hover:text-white font-bold ml-2 cursor-pointer text-xs"
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
