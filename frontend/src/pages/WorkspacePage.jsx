/**
 * WorkspacePage.jsx — Enhanced Scholar Hub & Academic Workspace
 * Designed per DESIGN.md (rich minimalist aesthetic, stat cards, studio launcher, recent lecture library)
 */

import { useState, useEffect } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import UploadCard from '../components/UploadCard'
import AnimatedWaveform from '../components/AnimatedWaveform'
import UserSettingsModal from '../components/UserSettingsModal'
import { getSavedLectures, syncServerLectures } from '../utils/lectureStorage'

export default function WorkspacePage({
  currentUser,
  onNavigate,
  onUpload,
  uploadError,
  onSelectLecture,
  onLogout,
  onOpenSettings,
  onOpenInfo,
  onOpenWorkspaceModal,
}) {
  const [savedLectures, setSavedLectures] = useState([])
  const [showUploadStudio, setShowUploadStudio] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

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
        <main className="flex-1 flex items-center justify-center px-4 py-8 sm:p-6 text-center">
          <div className="card-white w-full max-w-md p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] mx-auto shadow-sm">
            <span className="pill-badge text-[10px] mb-3">AUTHENTICATION REQUIRED</span>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Sign in to access Workspace</h2>
            <p className="text-xs sm:text-sm text-neutral-600 mb-6 leading-relaxed">
              The student workspace is protected. Please log in or create an account.
            </p>
            <button
              onClick={() => onNavigate('auth')}
              className="btn-primary w-full text-sm py-3 sm:py-3.5"
            >
              Sign In / Create Account →
            </button>
          </div>
        </main>
        <Footer onOpenInfo={onOpenInfo} />
      </div>
    )
  }

  const username = currentUser?.email ? currentUser.email.split('@')[0] : 'Scholar'
  const initial = username ? username.charAt(0).toUpperCase() : 'S'

  // Metric Computations
  const totalLectures = savedLectures?.length || 0
  const totalMinutes = savedLectures.reduce((acc, lec) => acc + (lec.durationSec ? Math.ceil(lec.durationSec / 60) : (lec.duration ? Math.ceil(lec.duration / 60) : 45)), 0)
  const totalStudyMinutes = totalMinutes
  const totalConcepts = savedLectures.reduce((acc, lec) => acc + (lec.keyConcepts?.length || lec.quiz?.length || 0) + (lec.importantTerms?.length || lec.glossary?.length || 0), 0)

  // Filter lectures based on search query
  const filteredLectures = (savedLectures || []).filter((lec) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      lec.title?.toLowerCase().includes(query) ||
      lec.overview?.toLowerCase().includes(query) ||
      lec.transcript?.toLowerCase().includes(query)
    )
  })

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
          onOpenSettings={onOpenSettings || (() => setIsSettingsOpen(true))}
          onOpenWorkspaceModal={onOpenWorkspaceModal}
        />
      </header>

      <main className="flex-1 relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-14 space-y-8 sm:space-y-10 w-full">
        {/* 1. Scholar Workspace Banner with User Profile Dropdown */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-5 sm:p-8 bg-neutral-50/80 border border-neutral-200/90 rounded-[24px] sm:rounded-[32px] shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="pill-badge text-[10px] bg-black text-white">SCHOLAR HUB</span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Speech Intelligence Active
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              Welcome back,{' '}
              <span className="font-serif italic font-normal text-[1.1em]">
                {username}
              </span>
            </h1>
            <p className="text-sm text-neutral-500 max-w-xl font-normal leading-relaxed">
              Your centralized academic synthesis hub. Review past lectures, explore core concepts, and consult your grounded AI tutor.
            </p>
          </div>

          {/* Profile & Settings Pill Menu */}
          <div className="relative self-end md:self-auto">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-3 px-4 py-2.5 bg-white border border-neutral-300 hover:border-black rounded-full transition-all shadow-sm cursor-pointer select-none"
              aria-label="User Profile Menu"
            >
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                {initial}
              </div>
              <div className="text-left hidden sm:block">
                <span className="font-bold text-xs text-black block leading-tight truncate max-w-[120px]">{username}</span>
                <span className="text-[10px] text-neutral-400 block font-normal">Account &amp; Settings</span>
              </div>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-neutral-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="2,4 6,8 10,4" />
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 bg-white border border-neutral-200 rounded-[24px] shadow-2xl p-2 z-50 animate-scale-up"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="px-4 py-3 border-b border-neutral-100 mb-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Signed in as</span>
                  <span className="font-bold text-xs text-black truncate block">{currentUser.email}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Unlimited Academic Tier
                  </span>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-100 hover:text-black rounded-full transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>⚙ Account Settings</span>
                    <span className="text-[10px] text-neutral-400">→</span>
                  </button>

                  <button
                    onClick={() => onOpenWorkspaceModal('lectures')}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-100 hover:text-black rounded-full transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>📚 Saved Library</span>
                    <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded-full font-bold">
                      {totalLectures}
                    </span>
                  </button>

                  <div className="pt-1 mt-1 border-t border-neutral-100">
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Academic Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-white p-5 border border-neutral-200/90 rounded-[24px]">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Synthesized</span>
            <div className="text-2xl font-black text-black tracking-tight">{totalLectures}</div>
            <span className="text-[11px] text-neutral-500 font-normal">Recorded lectures</span>
          </div>

          <div className="card-white p-5 border border-neutral-200/90 rounded-[24px]">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Study Volume</span>
            <div className="text-2xl font-black text-black tracking-tight">{totalMinutes}m</div>
            <span className="text-[11px] text-neutral-500 font-normal">Audio transcribed</span>
          </div>

          <div className="card-white p-5 border border-neutral-200/90 rounded-[24px]">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Key Concepts</span>
            <div className="text-2xl font-black text-black tracking-tight">{totalConcepts}</div>
            <span className="text-[11px] text-neutral-500 font-normal">Extracted terms</span>
          </div>

          <div className="card-white p-5 border border-neutral-200/90 rounded-[24px]">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Tutor Grounding</span>
            <div className="text-2xl font-black text-emerald-600 tracking-tight">100%</div>
            <span className="text-[11px] text-neutral-500 font-normal">Strict course material</span>
          </div>
        </div>

        {/* 3. Primary Action & Synthesis Launcher */}
        <div className="card-dark p-8 md:p-10 rounded-[32px] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <span className="pill-badge text-[10px] bg-white/10 text-neutral-300 border border-white/10">STUDIO SYNTHESIS</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Ready to transcribe a new{' '}
              <span className="font-serif italic font-normal text-[1.1em]">lecture?</span>
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-normal">
              Upload MP3, WAV, or M4A audio. Generate structured markdown notes, high-yield takeaways, and an interactive study tutor in seconds.
            </p>
          </div>

          <button
            id="workspace-launch-upload-btn"
            onClick={() => setShowUploadStudio(!showUploadStudio)}
            className="btn-white px-8 py-4 text-sm font-bold shrink-0 self-stretch md:self-auto shadow-lg"
          >
            {showUploadStudio ? 'Close Studio ✕' : '+ Transcribe New Audio'}
          </button>
        </div>

        {/* 4. Expandable Studio Upload Zone */}
        {showUploadStudio && (
          <div className="animate-fade-in border border-neutral-200 rounded-[32px] p-6 bg-neutral-50/50">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-sm font-bold text-black uppercase tracking-wider">Audio Upload Studio</h3>
              <button
                onClick={() => setShowUploadStudio(false)}
                className="text-xs text-neutral-500 hover:text-black font-semibold"
              >
                Dismiss ✕
              </button>
            </div>
            <UploadCard onSubmit={onUpload} />
          </div>
        )}

        {/* 5. Lecture Library & Past Syntheses */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-black tracking-tight">Your Lecture Library</h2>
              <p className="text-xs text-neutral-500">Search and access your study syntheses, stamped notes, and tutor histories.</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search lectures…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-neutral-300 rounded-full text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-black bg-white transition-colors"
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3.5 top-3 text-neutral-400"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {filteredLectures.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLectures.map((lec) => (
                <div
                  key={lec.id}
                  onClick={() => onSelectLecture(lec)}
                  className="card-white p-6 rounded-[28px] border border-neutral-200/90 hover:border-black transition-all group flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)] cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-semibold">
                      <span>{lec.date ? new Date(lec.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
                      <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-full font-bold">
                        {lec.durationSec ? `${Math.round(lec.durationSec / 60)} min` : 'Synthesized'}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-black group-hover:underline line-clamp-2 leading-snug">
                      {lec.title || 'Untitled Academic Lecture'}
                    </h3>

                    <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed font-normal">
                      {lec.overview || lec.structuredNotes?.[0]?.summary || lec.transcript?.slice(0, 120) || 'Full lecture synthesis…'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-900 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Open Study Notes <span>→</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {(lec.keyConcepts?.length || 0) + (lec.importantTerms?.length || 0)} concepts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-white p-12 text-center border border-dashed border-neutral-300 rounded-[32px] space-y-4">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center text-xl mx-auto">
                📚
              </div>
              <h3 className="text-lg font-bold text-black">No lectures found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                {searchQuery ? `No saved lectures matched "${searchQuery}".` : 'You haven’t synthesized any lecture recordings yet.'}
              </p>
              <button
                onClick={() => setShowUploadStudio(true)}
                className="btn-primary text-xs px-6 py-3"
              >
                + Transcribe First Lecture
              </button>
            </div>
          )}
        </div>
      </main>

      {/* User Settings Modal */}
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        onLogout={onLogout}
        savedLecturesCount={savedLectures.length}
      />

      <Footer onOpenInfo={onOpenInfo} />
    </div>
  )
}
