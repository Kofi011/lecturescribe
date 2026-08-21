/**
 * ResultsPage.jsx — Comprehensive Academic Study Hub for Processed Lectures
 * Requirement 2: Every Clickable Element Must Produce a Relevant Result
 * Requirement 3: Internal transcription technology is not exposed
 */

import { useState } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import LectureTutorDrawer from '../components/LectureTutorDrawer'

export default function ResultsPage({
  lecture,
  onReset,
  onOpenMenu,
  onOpenInfo,
  onDeleteLecture,
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [copyLabel, setCopyLabel] = useState('Copy Notes')
  const [isTutorOpen, setIsTutorOpen] = useState(false)
  const [revealedAnswers, setRevealedAnswers] = useState({})
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false)

  const title              = lecture?.title || 'Lecture Summary'
  const overview           = lecture?.overview || ''
  const key_concepts       = lecture?.key_concepts || []
  const main_arguments     = lecture?.main_arguments || []
  const important_terms    = lecture?.important_terms || []
  const study_notes        = lecture?.study_notes || []
  const key_takeaways      = lecture?.key_takeaways || []
  const revision_questions = lecture?.revision_questions || []
  const transcript         = lecture?.transcript || ''
  const notes_markdown     = lecture?.notes_markdown || ''

  // ─── Actions ─────────────────────────────────────────────────────────────

  const handleCopy = async (textToCopy = notes_markdown) => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopyLabel('Copied ✓')
      setTimeout(() => setCopyLabel('Copy Notes'), 2500)
    } catch {
      setCopyLabel('Copy failed')
      setTimeout(() => setCopyLabel('Copy Notes'), 2500)
    }
  }

  const handleDownload = (format = 'md') => {
    let content = notes_markdown
    let mime = 'text/markdown'
    let ext = 'md'

    if (format === 'txt') {
      content = `${title}\n\nOVERVIEW:\n${overview}\n\nTRANSCRIPT:\n${transcript}`
      mime = 'text/plain'
      ext = 'txt'
    } else if (format === 'json') {
      content = JSON.stringify(lecture, null, 2)
      mime = 'application/json'
      ext = 'json'
    }

    const blob = new Blob([content], { type: mime })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    const safeName = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    a.href = url
    a.download = `${safeName}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    setExportDropdownOpen(false)
  }

  const toggleAnswer = (idx) => {
    setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  const handleDelete = () => {
    if (onDeleteLecture && lecture?.id) {
      onDeleteLecture(lecture.id)
    }
    onReset?.()
  }


  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-black selection:text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100">
        <Nav onOpenMenu={onOpenMenu} onOpenInfo={onOpenInfo} onGoHome={onReset} />
      </header>

      <main className="flex-1 px-6 py-10 md:py-16 max-w-5xl mx-auto w-full">

        {/* Top Header Card */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="pill-badge">LECTURE READY</span>
              {lecture?.durationSec && (
                <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                  {Math.round(lecture.durationSec / 60)} min audio
                </span>
              )}
              {lecture?.fileName && (
                <span className="text-xs font-normal text-neutral-400">
                  {lecture.fileName}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight leading-tight">
              {title}
            </h1>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsTutorOpen(true)}
              className="btn-primary flex items-center gap-2"
              title="Ask questions about this lecture"
            >
              <span>💬</span>
              <span>Ask About This Lecture</span>
            </button>

            <button
              onClick={() => setShowSummaryModal(true)}
              className="btn-secondary"
            >
              Quick Summary
            </button>
          </div>
        </div>

        {/* Interactive Tab Switcher */}
        <div
          className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2"
          role="tablist"
        >
          {[
            { id: 'overview',   label: 'Overview & Concepts', count: key_concepts.length },
            { id: 'notes',      label: 'Study Notes', count: study_notes.length },
            { id: 'terms',      label: 'Important Terms', count: important_terms.length },
            { id: 'quiz',       label: 'Revision Questions', count: revision_questions.length },
            { id: 'transcript', label: 'Raw Transcript' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all whitespace-nowrap cursor-pointer flex items-center gap-2',
                activeTab === tab.id
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200/70',
              ].join(' ')}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={[
                    'text-[10px] px-1.5 py-0.2 rounded-full',
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700',
                  ].join(' ')}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── TAB 1: OVERVIEW & KEY CONCEPTS ────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Overview Card */}
            <div className="bg-white border border-neutral-200/90 rounded-[28px] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                Lecture Overview
              </span>
              <p className="text-base sm:text-lg text-neutral-800 leading-relaxed font-normal">
                {overview || 'No overview available.'}
              </p>
            </div>

            {/* Key Concepts Grid */}
            {key_concepts.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                  <span>💡</span> Key Concepts Explained
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {key_concepts.map((c, i) => (
                    <div
                      key={i}
                      className="border border-neutral-200/90 rounded-[22px] p-6 bg-neutral-50/50 hover:bg-white hover:border-black transition-all"
                    >
                      <h4 className="font-bold text-black text-base mb-2">
                        {c.concept}
                      </h4>
                      <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                        {c.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Arguments */}
            {main_arguments.length > 0 && (
              <div className="bg-white border border-neutral-200/90 rounded-[28px] p-8 md:p-10 shadow-sm">
                <h3 className="text-lg font-bold text-black mb-4">
                  Main Arguments &amp; Core Ideas
                </h3>
                <ul className="space-y-3">
                  {main_arguments.map((arg, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-neutral-700 font-normal">
                      <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0"></span>
                      <span>{arg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: STUDY NOTES ────────────────────────────────────────── */}
        {activeTab === 'notes' && (
          <div className="space-y-6 animate-fade-in">
            {study_notes.length > 0 ? (
              study_notes.map((sec, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-neutral-200/90 rounded-[28px] p-8 shadow-sm"
                >
                  <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-black"></span>
                    {sec.heading}
                  </h3>
                  <ul className="space-y-2.5 pl-4">
                    {sec.points?.map((pt, pIdx) => (
                      <li key={pIdx} className="list-disc text-neutral-700 text-sm sm:text-[15px] leading-relaxed font-normal">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="bg-white border border-neutral-200 rounded-[28px] p-8 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
                {notes_markdown}
              </div>
            )}

            {/* High-Yield Key Takeaways Card */}
            {key_takeaways.length > 0 && (
              <div className="card-dark rounded-[28px] p-8 md:p-10">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                  High-Yield Takeaways
                </span>
                <ul className="space-y-3">
                  {key_takeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-neutral-200 font-normal">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: IMPORTANT TERMS ────────────────────────────────────── */}
        {activeTab === 'terms' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xl font-bold text-black mb-4">
              Glossary &amp; Essential Terminology
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {important_terms.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-neutral-200/90 rounded-[22px] p-6 shadow-sm hover:border-black transition-all"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Term #{idx + 1}
                  </span>
                  <h4 className="text-lg font-bold text-black mb-2">
                    {item.term}
                  </h4>
                  <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 4: REVISION QUESTIONS ─────────────────────────────────── */}
        {activeTab === 'quiz' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">Self-Test Revision Questions</h3>
              <span className="text-xs text-neutral-500 font-medium">Click any question to reveal or hide the answer</span>
            </div>

            <div className="space-y-4">
              {revision_questions.map((q, idx) => {
                const isRevealed = !!revealedAnswers[idx]
                return (
                  <div
                    key={idx}
                    className="border border-neutral-200/90 rounded-[22px] p-6 bg-white shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                          Question {idx + 1}
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-black">
                          {q.question}
                        </h4>
                      </div>
                      <button
                        onClick={() => toggleAnswer(idx)}
                        className="shrink-0 btn-secondary text-xs px-4 py-2"
                      >
                        {isRevealed ? 'Hide Answer' : 'Reveal Answer'}
                      </button>
                    </div>

                    {isRevealed && (
                      <div className="mt-4 pt-4 border-t border-neutral-100 bg-neutral-50 rounded-[16px] p-4 text-sm text-neutral-800 font-normal leading-relaxed animate-fade-in">
                        <span className="font-bold text-black block mb-1">Correct Explanation:</span>
                        {q.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── TAB 5: RAW TRANSCRIPT ─────────────────────────────────────── */}
        {activeTab === 'transcript' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-black">Verbatim Speech Transcript</h3>
                {lecture?.engine_used && (
                  <p className="text-xs text-neutral-500 font-medium mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Engine: {lecture.engine_used === 'griot-nano-1' ? 'Griot Nano 1 (African Accents & Dialects)' : 'Groq Whisper'}</span>
                    {lecture?.language ? <span>• Language: {lecture.language.toUpperCase()}</span> : ''}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleCopy(transcript)}
                className="btn-secondary text-xs px-4 py-2 self-start sm:self-auto"
              >
                Copy Transcript
              </button>
            </div>

            <div className="bg-white border border-neutral-200/90 rounded-[28px] p-8 md:p-10 shadow-sm text-sm sm:text-base leading-relaxed text-neutral-700 whitespace-pre-wrap font-normal">
              {transcript || 'No transcript text available.'}
            </div>
          </div>
        )}


        {/* Bottom Actions Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              id="copy-notes-btn"
              onClick={() => handleCopy()}
              className="btn-primary"
            >
              {copyLabel}
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                id="download-notes-btn"
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="btn-secondary flex items-center gap-2"
              >
                <span>Download / Export</span>
                <span className="text-xs">▼</span>
              </button>

              {exportDropdownOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-48 bg-white border border-neutral-200 rounded-[20px] shadow-xl p-2 z-50 animate-scale-up">
                  <button
                    onClick={() => handleDownload('md')}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors"
                  >
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => handleDownload('txt')}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors"
                  >
                    Plain Text (.txt)
                  </button>
                  <button
                    onClick={() => handleDownload('json')}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors"
                  >
                    Complete JSON (.json)
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsTutorOpen(true)}
              className="btn-secondary"
            >
              Ask Tutor
            </button>
          </div>

          {/* Right Navigation & Delete Actions */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              id="start-over-btn"
              onClick={onReset}
              className="text-neutral-500 hover:text-black transition-colors"
            >
              ← Upload another lecture
            </button>

            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              Delete Lecture
            </button>
          </div>
        </div>
      </main>

      {/* Interactive AI Lecture Tutor Drawer */}
      <LectureTutorDrawer
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        lecture={lecture}
      />

      {/* Quick Summary Modal */}
      {showSummaryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          onClick={() => setShowSummaryModal(false)}
        >
          <div
            className="bg-white border border-neutral-200 rounded-[28px] w-full max-w-xl p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="pill-badge mb-2">EXECUTIVE SUMMARY</span>
            <h3 className="text-2xl font-black text-black tracking-tight mb-4 mt-2">
              {title}
            </h3>

            <p className="text-sm text-neutral-700 leading-relaxed mb-6 font-normal">
              {overview}
            </p>

            {key_takeaways.length > 0 && (
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-[18px] p-5 mb-6">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                  High-Yield Points
                </span>
                <ul className="space-y-2 text-xs text-neutral-800 font-normal">
                  {key_takeaways.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-black font-bold">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSummaryModal(false)
                  handleCopy(overview + '\n\n' + key_takeaways.join('\n'))
                }}
                className="btn-secondary text-xs px-5 py-2.5"
              >
                Copy Summary
              </button>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="btn-primary text-xs px-5 py-2.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer onOpenInfo={onOpenInfo} />
    </div>
  )
}
