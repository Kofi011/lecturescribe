/**
 * WorkspacePage.jsx — Protected Student Workspace for Authenticated Users
 */

import { useState, useEffect } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import UploadCard from '../components/UploadCard'
import AnimatedWaveform from '../components/AnimatedWaveform'
import { getSavedLectures, syncServerLectures } from '../utils/lectureStorage'

export default function WorkspacePage({
  currentUser,
  onNavigate,
  onUpload,
  uploadError,
  onSelectLecture,
  onLogout,
  onOpenInfo,
  onOpenWorkspaceModal,
}) {
  const [savedLectures, setSavedLectures] = useState([])

  useEffect(() => {
    setSavedLectures(getSavedLectures())
    if (currentUser) {
      syncServerLectures().then((res) => {
        if (Array.isArray(res)) setSavedLectures(res)
      })
    }
    const handleStorageUpdate = () => {
      setSavedLectures(getSavedLectures())
    }
    window.addEventListener('lecturescribe_storage_update', handleStorageUpdate)
    return () => window.removeEventListener('lecturescribe_storage_update', handleStorageUpdate)
  }, [currentUser])

  // Guard: if not authenticated, prompt login
  if (!currentUser) {
    return (
      <div className="min-h-screen relative flex flex-col bg-white selection:bg-black selection:text-white">
        <Nav currentPage="workspace" onNavigate={onNavigate} onOpenWorkspaceModal={onOpenWorkspaceModal} />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="card-white max-w-md p-8">
            <span className="pill-badge text-[10px] mb-3">AUTHENTICATION REQUIRED</span>
            <h2 className="text-2xl font-bold mb-2">Sign in to access Workspace</h2>
            <p className="text-sm text-neutral-600 mb-6">
              The student workspace is protected. Please log in or create an account.
            </p>
            <button
              onClick={() => onNavigate('auth')}
              className="btn-primary w-full text-sm py-3.5"
            >
              Sign In / Create Account →
            </button>
          </div>
        </main>
        <Footer onOpenInfo={onOpenInfo} />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex flex-col bg-white selection:bg-black selection:text-white overflow-x-hidden">
      <AnimatedWaveform />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
        <Nav
          currentPage="workspace"
          onNavigate={onNavigate}
          currentUser={currentUser}
          onLogout={onLogout}
          onOpenWorkspaceModal={onOpenWorkspaceModal}
        />
      </header>

      <main className="flex-1 relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-12 w-full">
        {/* Workspace Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-neutral-50 border border-neutral-200/90 rounded-[28px]">
          <div>
            <div className="flex items-center gap-2">
              <span className="pill-badge text-[10px] bg-black text-white">STUDENT WORKSPACE</span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Unlimited Processing
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight mt-2">
              Welcome back,{' '}
              <span className="font-serif italic font-normal text-[1.05em]">
                {currentUser.email.split('@')[0]}
              </span>
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Account: <strong className="text-black">{currentUser.email}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => onOpenWorkspaceModal('lectures')}
              className="btn-secondary flex-1 sm:flex-none text-xs px-5 py-2.5 flex items-center justify-center gap-2"
            >
              <span>Library</span>
              <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded-full font-bold">
                {savedLectures.length}
              </span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2.5 text-xs font-bold text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-full transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-black">Upload New Lecture</h2>
              <p className="text-xs text-neutral-500">Transcribe and synthesize your lecture audio recording.</p>
            </div>
          </div>
          <UploadCard onSubmit={onUpload} />
        </div>

        {/* Recent Lectures Section */}
        {savedLectures.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-black">Recent Lectures</h2>
              <button
                onClick={() => onOpenWorkspaceModal('lectures')}
                className="text-xs font-bold text-neutral-600 hover:text-black hover:underline cursor-pointer"
              >
                View all ({savedLectures.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {savedLectures.slice(0, 6).map((lec) => (
                <div
                  key={lec.id}
                  onClick={() => onSelectLecture(lec)}
                  className="card-white p-5 cursor-pointer hover:border-black transition-all group"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2">
                    <span>{lec.date ? new Date(lec.date).toLocaleDateString() : 'Recent'}</span>
                    <span className="font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-full text-[10px]">
                      {lec.engine_used || 'groq-whisper'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-black group-hover:underline line-clamp-2 mb-2">
                    {lec.title || 'Untitled Lecture'}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2">
                    {lec.structuredNotes?.[0]?.summary || lec.transcript?.slice(0, 100) || 'Lecture notes…'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer onOpenInfo={onOpenInfo} />
    </div>
  )
}
