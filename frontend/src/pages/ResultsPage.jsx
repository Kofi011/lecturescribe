/**
 * ResultsPage.jsx — Transcript & Notes view matching SasuSync visual language
 */

import { useState } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

function renderMarkdown(md) {
  if (!md) return null
  return md.split('\n').map((line, i) => {
    if (/^# (.+)/.test(line)) {
      return (
        <h1 key={i} className="text-2xl sm:text-3xl font-black text-black tracking-tight mt-8 mb-4 first:mt-0">
          {line.slice(2)}
        </h1>
      )
    }
    if (/^## (.+)/.test(line)) {
      return (
        <h2 key={i} className="text-lg sm:text-xl font-bold text-black tracking-tight mt-7 mb-3 first:mt-0 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
          {line.slice(3)}
        </h2>
      )
    }
    if (/^- (.+)/.test(line)) {
      return (
        <li key={i} className="ml-5 list-disc text-[15px] leading-relaxed text-neutral-700 mb-2 font-normal">
          {line.slice(2)}
        </li>
      )
    }
    if (line.trim() === '') return <div key={i} className="h-3" />
    return <p key={i} className="text-[15px] leading-relaxed text-neutral-700 mb-2 font-normal">{line}</p>
  })
}

export default function ResultsPage({ title, transcript, notes_markdown, onReset }) {
  const [activeTab, setActiveTab] = useState('notes')
  const [copyLabel, setCopyLabel] = useState('Copy notes')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notes_markdown)
      setCopyLabel('Copied to clipboard ✓')
      setTimeout(() => setCopyLabel('Copy notes'), 2500)
    } catch {
      setCopyLabel('Copy failed')
      setTimeout(() => setCopyLabel('Copy notes'), 2500)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([notes_markdown], { type: 'text/markdown' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100">
        <Nav />
      </header>

      <main className="flex-1 px-6 py-12 md:py-16 max-w-4xl mx-auto w-full">
        {/* Title */}
        <div className="mb-8">
          <span className="pill-badge mb-3">GENERATED SUMMARY</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight leading-tight mt-2">
            {title || 'Lecture Summary'}
          </h1>
        </div>

        {/* Tab Switcher Pills */}
        <div
          className="inline-flex gap-1.5 mb-6 bg-neutral-100 p-1.5 rounded-full border border-neutral-200/80"
          role="tablist"
          aria-label="View mode toggle"
        >
          {[
            { key: 'notes',      label: 'Structured Notes' },
            { key: 'transcript', label: 'Raw Transcript'   },
          ].map(({ key, label }) => (
            <button
              key={key}
              id={`tab-${key}`}
              role="tab"
              aria-selected={activeTab === key}
              aria-controls={`panel-${key}`}
              onClick={() => setActiveTab(key)}
              className={[
                'px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-150 cursor-pointer',
                activeTab === key
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-transparent text-neutral-500 hover:text-black',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Card Content */}
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="bg-white border border-neutral-200/90 rounded-[28px] p-8 md:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.03)] min-h-[300px]"
        >
          {activeTab === 'notes' ? (
            <ul className="list-none">
              {renderMarkdown(notes_markdown)}
            </ul>
          ) : (
            <div className="text-[15px] leading-relaxed text-neutral-700 whitespace-pre-wrap font-normal">
              {transcript}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {activeTab === 'notes' && (
          <div className="flex items-center gap-3.5 mt-8 flex-wrap">
            <button
              id="copy-notes-btn"
              onClick={handleCopy}
              className="btn-primary"
            >
              {copyLabel}
            </button>
            <button
              id="download-notes-btn"
              onClick={handleDownload}
              className="btn-secondary"
            >
              Download .md
            </button>
          </div>
        )}

        {/* Reset / Start Over link */}
        <div className="mt-12 pt-8 border-t border-neutral-100 flex items-center justify-between">
          <button
            id="start-over-btn"
            onClick={onReset}
            className="text-sm font-medium text-neutral-500 hover:text-black transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span>←</span> Upload another lecture
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
