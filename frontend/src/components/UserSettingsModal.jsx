/**
 * UserSettingsModal.jsx — Scholar Profile & Workspace Settings Modal
 * Strictly follows DESIGN.md (black-and-white minimalist aesthetic, high-contrast, rounded cards)
 */

import { useState } from 'react'

export default function UserSettingsModal({ isOpen, onClose, currentUser, onLogout, savedLecturesCount = 0 }) {
  const [activeTab, setActiveTab] = useState('account')
  const [preferences, setPreferences] = useState({
    autoSummarize: true,
    highFidelityASR: true,
    tutorTone: 'Academic & Socratic',
    exportFormat: 'PDF + Markdown',
  })
  const [savedFeedback, setSavedFeedback] = useState(false)

  if (!isOpen) return null

  const handleSave = () => {
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2000)
  }

  const username = currentUser?.email ? currentUser.email.split('@')[0] : 'Scholar'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white border border-neutral-200/90 rounded-[32px] w-full max-w-xl p-6 sm:p-8 shadow-2xl overflow-hidden relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-black tracking-tight">{username}</h3>
                <span className="pill-badge text-[9px] bg-neutral-100 text-neutral-800 border border-neutral-200">
                  SCHOLAR TIER
                </span>
              </div>
              <p className="text-xs text-neutral-500">{currentUser?.email || 'scholar@university.edu'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-sm font-bold text-black transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-5 pb-4 border-b border-neutral-100 text-xs font-bold">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === 'account' ? 'bg-black text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
            }`}
          >
            Account Details
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === 'preferences' ? 'bg-black text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
            }`}
          >
            Synthesis Preferences
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === 'data' ? 'bg-black text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
            }`}
          >
            Storage & Security
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-6 min-h-[220px]">
          {/* 1. Account Details */}
          {activeTab === 'account' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="p-4 bg-neutral-50 rounded-[20px] border border-neutral-200/80 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Email Address</span>
                  <span className="font-bold text-black text-xs">{currentUser?.email}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-neutral-200/60">
                  <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Access Level</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Unlimited Academic Workspace
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-neutral-200/60">
                  <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Saved Lectures</span>
                  <span className="font-bold text-black text-xs">{savedLecturesCount} Total Records</span>
                </div>
              </div>

              <div className="p-4 rounded-[20px] border border-neutral-200 text-neutral-600 text-xs leading-relaxed font-normal">
                Your account is currently active with full speech intelligence processing, unlimited lecture uploads, and persistent tutor histories.
              </div>
            </div>
          )}

          {/* 2. Synthesis Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 border border-neutral-200 rounded-[18px] hover:bg-neutral-50/50 cursor-pointer transition-colors">
                  <div>
                    <span className="font-bold text-black block">Adaptive Acoustic Pipeline</span>
                    <span className="text-[11px] text-neutral-500">Enhanced accent and classroom acoustic normalization</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.highFidelityASR}
                    onChange={(e) => setPreferences({ ...preferences, highFidelityASR: e.target.checked })}
                    className="w-4 h-4 accent-black rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 border border-neutral-200 rounded-[18px] hover:bg-neutral-50/50 cursor-pointer transition-colors">
                  <div>
                    <span className="font-bold text-black block">Automated High-Yield Extraction</span>
                    <span className="text-[11px] text-neutral-500">Auto-generate glossary definitions and revision quizzes</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.autoSummarize}
                    onChange={(e) => setPreferences({ ...preferences, autoSummarize: e.target.checked })}
                    className="w-4 h-4 accent-black rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-black uppercase tracking-wider text-[10px] block">
                  AI Study Tutor Persona
                </label>
                <select
                  value={preferences.tutorTone}
                  onChange={(e) => setPreferences({ ...preferences, tutorTone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-full text-xs font-semibold bg-neutral-50 focus:bg-white text-black outline-none cursor-pointer"
                >
                  <option value="Academic & Socratic">Academic &amp; Socratic (Deep concept exploration)</option>
                  <option value="Exam Focused">Exam Focused (High-yield key takeaway drills)</option>
                  <option value="Concise Summary">Concise Summary (Direct answers)</option>
                </select>
              </div>
            </div>
          )}

          {/* 3. Storage & Security */}
          {activeTab === 'data' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="p-4 bg-neutral-50 rounded-[20px] border border-neutral-200 space-y-2">
                <span className="font-bold text-black block">End-to-End Data Policy</span>
                <p className="text-neutral-600 text-xs font-normal leading-relaxed">
                  Audio recordings are analyzed in-memory and immediately destroyed after transcription. Notes and transcripts remain strictly private to your account.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 border border-neutral-200 rounded-[18px]">
                <div>
                  <span className="font-bold text-black block text-xs">Database Cloud Sync</span>
                  <span className="text-[11px] text-neutral-500">Synchronized across PostgreSQL &amp; local storage</span>
                </div>
                <span className="text-xs font-bold text-emerald-600">Active ✓</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <button
            onClick={() => {
              onClose()
              if (onLogout) onLogout()
            }}
            className="px-4 py-2 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
          >
            Log out of account
          </button>

          <div className="flex items-center gap-3">
            {savedFeedback && (
              <span className="text-xs font-bold text-emerald-600 animate-fade-in">
                Settings saved ✓
              </span>
            )}
            <button
              onClick={handleSave}
              className="btn-primary text-xs px-6 py-2.5"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
