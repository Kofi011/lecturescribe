/**
 * TrialPage.jsx — Anonymous 3-Trial Upload Experience with Limit Enforcement
 */

import { useState, useEffect } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import UploadCard from '../components/UploadCard'
import AnimatedWaveform from '../components/AnimatedWaveform'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function TrialPage({
  onNavigate,
  onUpload,
  uploadError,
  currentUser,
  onLogout,
  onOpenInfo,
  onOpenSettings,
  onOpenWorkspaceModal,
}) {
  const [trialStatus, setTrialStatus] = useState({
    isAuthenticated: false,
    trialsUsed: 0,
    trialsRemaining: 3,
    maxTrials: 3,
    canUpload: true,
  })
  const [loadingStatus, setLoadingStatus] = useState(true)

  const fetchStatus = async () => {
    try {
      const endpoint = API_URL ? `${API_URL}/api/trial-status` : '/api/trial-status'
      const res = await fetch(endpoint, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setTrialStatus(data)
      }
    } catch (err) {
      console.warn('[trial] failed to fetch trial status:', err)
    } finally {
      setLoadingStatus(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [currentUser])

  // If user is already logged in, redirect them to the workspace
  if (currentUser) {
    return (
      <div className="min-h-screen relative flex flex-col bg-white selection:bg-black selection:text-white">
        <Nav
          currentPage="trial"
          onNavigate={onNavigate}
          currentUser={currentUser}
          onLogout={onLogout}
          onOpenSettings={onOpenSettings}
          onOpenWorkspaceModal={onOpenWorkspaceModal}
        />
        <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 text-center w-full">
          <div className="card-white w-full max-w-md p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] mx-auto shadow-sm animate-scale-up">
            <span className="pill-badge text-[10px] mb-3">MEMBER ACCESS</span>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">You are signed in</h2>
            <p className="text-xs sm:text-sm text-neutral-600 mb-6 leading-relaxed">
              Your account has unlimited lecture processing. Go directly to your private workspace.
            </p>
            <button
              onClick={() => onNavigate('workspace')}
              className="btn-primary w-full text-sm py-3 sm:py-3.5"
            >
              Open Workspace →
            </button>
          </div>
        </main>
        <Footer onOpenInfo={onOpenInfo} />
      </div>
    )
  }

  const isExhausted = !trialStatus.canUpload || trialStatus.trialsRemaining <= 0

  return (
    <div className="min-h-screen relative flex flex-col bg-white selection:bg-black selection:text-white overflow-x-hidden">
      <AnimatedWaveform />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
        <Nav
          currentPage="trial"
          onNavigate={onNavigate}
          currentUser={currentUser}
          onLogout={onLogout}
          onOpenSettings={onOpenSettings}
          onOpenWorkspaceModal={onOpenWorkspaceModal}
        />
      </header>

      <main className="flex-1 relative z-10 max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 md:py-16 space-y-8 sm:space-y-10 w-full">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="pill-badge text-[10px]">FREE TRIAL MODE</span>
            {!loadingStatus && (
              <span className="text-[10px] sm:text-[11px] font-bold px-3 py-1 bg-neutral-100 text-neutral-800 rounded-full border border-neutral-200">
                {isExhausted
                  ? '0 of 3 remaining'
                  : `${trialStatus.trialsRemaining} of ${trialStatus.maxTrials} free trials remaining`}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight leading-[1.1]">
            Try LectureScribe for{' '}
            <span className="font-serif italic font-normal text-[1.12em] tracking-tight inline-block pr-1">
              free.
            </span>
          </h1>
          <p className="text-neutral-600 text-xs sm:text-sm md:text-base max-w-xl mx-auto font-normal leading-relaxed">
            Upload up to 3 lecture recordings without an account. Get complete transcripts, structured notes, and full AI tutor access.
          </p>
        </div>

        {/* Upload Zone or Exhausted Card */}
        {isExhausted ? (
          <div className="card-white p-6 sm:p-12 text-center space-y-6 border-2 border-black animate-scale-up rounded-[24px] sm:rounded-[32px]">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-black flex items-center justify-center mx-auto text-xl">
              🎓
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-black">
                You've completed your 3 free trials!
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                We hope LectureScribe helped your study routine. Create a free account or sign in to continue with <strong>unlimited lecture uploads</strong>, permanent session history, and full AI tutor access.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('auth')}
                className="btn-primary w-full sm:w-auto text-sm px-8 py-3.5 sm:py-4 shadow-sm"
              >
                Create Account to Continue →
              </button>
              <button
                onClick={() => onNavigate('auth')}
                className="btn-secondary w-full sm:w-auto text-sm px-8 py-3.5 sm:py-4"
              >
                Log In
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <UploadCard onSubmit={onUpload} />
          </div>
        )}

        {/* 3 Step Process Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 sm:pt-4">
          <div className="p-4 border border-neutral-200/80 rounded-[18px] sm:rounded-[20px] bg-neutral-50/50 text-center">
            <div className="font-bold text-[10px] text-neutral-400 mb-1 tracking-wider">STEP 1</div>
            <div className="text-xs font-bold text-black">Upload Audio</div>
            <div className="text-[11px] text-neutral-500 mt-1">MP3, WAV, or M4A</div>
          </div>
          <div className="p-4 border border-neutral-200/80 rounded-[18px] sm:rounded-[20px] bg-neutral-50/50 text-center">
            <div className="font-bold text-[10px] text-neutral-400 mb-1 tracking-wider">STEP 2</div>
            <div className="text-xs font-bold text-black">Neural Acoustic Engine</div>
            <div className="text-[11px] text-neutral-500 mt-1">High-Fidelity Transcription</div>
          </div>
          <div className="p-4 border border-neutral-200/80 rounded-[18px] sm:rounded-[20px] bg-neutral-50/50 text-center">
            <div className="font-bold text-[10px] text-neutral-400 mb-1 tracking-wider">STEP 3</div>
            <div className="text-xs font-bold text-black">Instant Notes</div>
            <div className="text-[11px] text-neutral-500 mt-1">Export, Study &amp; Tutor Q&amp;A</div>
          </div>
        </div>
      </main>

      <Footer onOpenInfo={onOpenInfo} />
    </div>
  )
}
