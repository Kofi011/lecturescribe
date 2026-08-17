/**
 * ResultsPage.jsx — shows transcript and notes in pill-tab switcher
 *
 * Per DESIGN.md:
 *   Light background, tab pills (Transcript / Notes) styled like Menu pill
 *   Content in a bordered white card — bold headings, bullets
 *   Buttons below card: solid Copy, outline Download
 *
 * Props:
 *   title:          string
 *   transcript:     string
 *   notes_markdown: string (Markdown with ## headings and - bullets)
 *   onReset:        () => void  — start over
 */

import { useState } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

// ─── Simple Markdown renderer ─────────────────────────────────────────────────
// Renders ## headings and - bullets from the LLM output.
// Not a full MD parser — just enough for our known output structure.
function renderMarkdown(md) {
  if (!md) return null
  return md.split('\n').map((line, i) => {
    if (/^# (.+)/.test(line)) {
      return <h1 key={i} className="text-2xl font-black mt-6 mb-3 first:mt-0">{line.slice(2)}</h1>
    }
    if (/^## (.+)/.test(line)) {
      return <h2 key={i} className="text-lg font-bold mt-6 mb-2 first:mt-0">{line.slice(3)}</h2>
    }
    if (/^- (.+)/.test(line)) {
      return (
        <li key={i} className="ml-5 list-disc text-[15px] leading-relaxed text-gray-800 mb-1">
          {line.slice(2)}
        </li>
      )
    }
    if (line.trim() === '') return <div key={i} className="h-2" />
    return <p key={i} className="text-[15px] leading-relaxed text-gray-800 mb-1">{line}</p>
  })
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ResultsPage({ title, transcript, notes_markdown, onReset }) {
  const [activeTab, setActiveTab] = useState('notes')
  const [copyLabel, setCopyLabel] = useState('Copy notes')

  // ── Copy to clipboard ──────────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notes_markdown)
      setCopyLabel('Copied ✓')
      setTimeout(() => setCopyLabel('Copy notes'), 2500)
    } catch {
      setCopyLabel('Copy failed')
      setTimeout(() => setCopyLabel('Copy notes'), 2500)
    }
  }

  // ── Download as .md ────────────────────────────────────────────────────────
  const handleDownload = () => {
    const blob = new Blob([notes_markdown], { type: 'text/markdown' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    // Sanitise the title to make a safe filename
    const safeName = (title || 'lecture-notes')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    a.href     = url
    a.download = `${safeName}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <Nav />
      </header>

      <main className="flex-1 px-6 py-12 md:py-16 max-w-3xl mx-auto w-full">

        {/* Lecture title */}
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-8 leading-tight">
          {title || 'Your lecture notes'}
        </h1>

        {/* Tab switcher — pill style per DESIGN.md */}
        <div
          className="inline-flex gap-2 mb-6 bg-gray-100 p-1 rounded-pill"
          role="tablist"
          aria-label="View toggle"
        >
          {[
            { key: 'notes',      label: 'Notes'      },
            { key: 'transcript', label: 'Transcript'  },
          ].map(({ key, label }) => (
            <button
              key={key}
              id={`tab-${key}`}
              role="tab"
              aria-selected={activeTab === key}
              aria-controls={`panel-${key}`}
              onClick={() => setActiveTab(key)}
              className={[
                'px-5 py-2 text-sm font-semibold rounded-pill transition-colors duration-150',
                activeTab === key
                  ? 'bg-black text-white'
                  : 'bg-transparent text-gray-500 hover:text-black',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content card */}
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="card min-h-64"
        >
          {activeTab === 'notes' ? (
            <ul className="list-none">
              {renderMarkdown(notes_markdown)}
            </ul>
          ) : (
            <p className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap">
              {transcript}
            </p>
          )}
        </div>

        {/* Action buttons — only shown on Notes tab */}
        {activeTab === 'notes' && (
          <div className="flex gap-3 mt-6 flex-wrap">
            <button
              id="copy-notes-btn"
              onClick={handleCopy}
              className="btn-primary px-8 py-3 text-sm"
            >
              {copyLabel}
            </button>
            <button
              id="download-notes-btn"
              onClick={handleDownload}
              className="btn-secondary px-8 py-3 text-sm"
            >
              Download .md
            </button>
          </div>
        )}

        {/* Start over */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <button
            id="start-over-btn"
            onClick={onReset}
            className="text-sm text-[#6B7280] hover:text-black transition-colors underline underline-offset-2"
          >
            ← Upload another lecture
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
