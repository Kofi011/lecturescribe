/**
 * NavigationModal.jsx — Interactive Application Navigation & Dashboard Drawer
 * Requirement 2: Every Clickable Element Must Produce a Relevant Result
 *
 * Views:
 *   - 'lectures': View and manage previously processed lectures
 *   - 'summaries': High-yield summary cards
 *   - 'topics': Key concept explorer across lectures
 *   - 'search': Global search across all lectures and transcripts
 *   - 'settings': Application preferences & export options
 */

import { useState, useMemo } from 'react'
import { getSavedLectures, deleteLecture, clearAllLectures } from '../utils/lectureStorage'

export default function NavigationModal({
  isOpen,
  onClose,
  onSelectLecture,
  initialView = 'lectures',
}) {
  const [activeTab, setActiveTab] = useState(initialView)
  const [lectures, setLectures] = useState(() => getSavedLectures())
  const [searchQuery, setSearchQuery] = useState('')
  const [exportPref, setExportPref] = useState('md')

  if (!isOpen) return null

  // Filter lectures based on global search query
  const filteredLectures = lectures.filter((l) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      l.title?.toLowerCase().includes(q) ||
      l.overview?.toLowerCase().includes(q) ||
      l.transcript?.toLowerCase().includes(q) ||
      l.key_concepts?.some((c) => c.concept.toLowerCase().includes(q))
    )
  })

  // Extract all topics/concepts across all lectures
  const allTopics = useMemo(() => {
    const list = []
    for (const lec of lectures) {
      if (Array.isArray(lec.key_concepts)) {
        for (const c of lec.key_concepts) {
          list.push({ ...c, lectureTitle: lec.title, lectureId: lec.id, lecture: lec })
        }
      }
    }
    return list
  }, [lectures])

  const handleDelete = (id, e) => {
    e.stopPropagation()
    if (confirm('Delete this lecture summary and transcript?')) {
      const updated = deleteLecture(id)
      setLectures(updated)
    }
  }

  const handleClearAll = () => {
    if (confirm('Clear all saved lectures? (Sample lecture will be restored)')) {
      const updated = clearAllLectures()
      setLectures(updated)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white border border-neutral-200 rounded-[28px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl italic font-normal text-black">
              LectureScribe Workspace
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-200/70 hover:bg-black hover:text-white text-black flex items-center justify-center transition-colors text-sm font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-8 pt-4 pb-2 border-b border-neutral-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'lectures',  label: `My Lectures (${lectures.length})` },
            { id: 'summaries', label: 'Summaries' },
            { id: 'topics',    label: `Concepts & Topics (${allTopics.length})` },
            { id: 'search',    label: 'Search Library' },
            { id: 'settings',  label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200/70',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

          {/* ─── TAB 1: MY LECTURES ────────────────────────────────────── */}
          {activeTab === 'lectures' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-black">Your Processed Lectures</h3>
                <span className="text-xs text-neutral-400 font-medium">Click any lecture to view full study notes</span>
              </div>

              {lectures.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-sm">
                  No lectures recorded yet. Upload a lecture audio to begin.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lectures.map((lec) => (
                    <div
                      key={lec.id}
                      onClick={() => {
                        onSelectLecture(lec)
                        onClose()
                      }}
                      className="group border border-neutral-200/90 rounded-[22px] p-5 hover:border-black hover:shadow-sm transition-all cursor-pointer bg-white flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
                            {lec.fileName || 'Audio Recording'}
                          </span>
                          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Ready
                          </span>
                        </div>
                        <h4 className="font-bold text-black text-base group-hover:underline underline-offset-2 mb-2 line-clamp-2">
                          {lec.title}
                        </h4>
                        <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed">
                          {lec.overview || lec.transcript?.slice(0, 140) + '…'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                        <span>{lec.key_concepts?.length || 4} Concepts</span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-black group-hover:translate-x-0.5 transition-transform">
                            Open Notes →
                          </span>
                          {lec.id !== 'sample_cs101_sorting' && (
                            <button
                              onClick={(e) => handleDelete(lec.id, e)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete lecture"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 2: SUMMARIES ──────────────────────────────────────── */}
          {activeTab === 'summaries' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-black">Executive Lecture Summaries</h3>
              <div className="space-y-4">
                {lectures.map((lec) => (
                  <div
                    key={lec.id}
                    className="border border-neutral-200/90 rounded-[22px] p-6 bg-neutral-50/50 hover:bg-white transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h4 className="font-bold text-black text-base md:text-lg">
                        {lec.title}
                      </h4>
                      <button
                        onClick={() => {
                          onSelectLecture(lec)
                          onClose()
                        }}
                        className="shrink-0 btn-primary text-xs px-4 py-2"
                      >
                        View Full Notes
                      </button>
                    </div>

                    <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                      {lec.overview}
                    </p>

                    {Array.isArray(lec.key_takeaways) && lec.key_takeaways.length > 0 && (
                      <div className="bg-white border border-neutral-200/80 rounded-[16px] p-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                          High-Yield Takeaways
                        </span>
                        <ul className="space-y-1.5 text-xs text-neutral-700">
                          {lec.key_takeaways.map((t, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-black font-bold">•</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 3: TOPICS & CONCEPTS EXPLORER ───────────────────────── */}
          {activeTab === 'topics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-black">Extracted Concept Knowledge Graph</h3>
                <span className="text-xs text-neutral-400">{allTopics.length} Core Concepts Indexed</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allTopics.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-neutral-200/90 rounded-[20px] p-5 bg-white hover:border-black transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 mb-1.5">
                        <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">Concept</span>
                        <span className="truncate max-w-[180px]">{item.lectureTitle}</span>
                      </div>
                      <h4 className="font-bold text-black text-base mb-2">
                        {item.concept}
                      </h4>
                      <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                        {item.explanation}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 text-right">
                      <button
                        onClick={() => {
                          onSelectLecture(item.lecture)
                          onClose()
                        }}
                        className="text-xs font-bold text-black hover:underline"
                      >
                        Explore in Lecture Notes →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 4: SEARCH LIBRARY ──────────────────────────────────── */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across lecture transcripts, topics, notes, concepts…"
                  className="w-full px-5 py-4 pl-12 border border-neutral-300 rounded-full text-sm focus:outline-none focus:border-black text-black placeholder:text-neutral-400 bg-white shadow-sm"
                  autoFocus
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-base">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-black"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  {filteredLectures.length} Result{filteredLectures.length === 1 ? '' : 's'} Found
                </span>

                {filteredLectures.map((lec) => (
                  <div
                    key={lec.id}
                    onClick={() => {
                      onSelectLecture(lec)
                      onClose()
                    }}
                    className="border border-neutral-200/90 rounded-[18px] p-4 hover:border-black cursor-pointer bg-white transition-all"
                  >
                    <h4 className="font-bold text-black text-sm mb-1">{lec.title}</h4>
                    <p className="text-xs text-neutral-500 line-clamp-2">{lec.overview || lec.transcript}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 5: SETTINGS ────────────────────────────────────────── */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-xl">
              <h3 className="text-lg font-bold text-black">Application Preferences</h3>

              <div className="border border-neutral-200 rounded-[20px] p-5 space-y-4 bg-neutral-50/50">
                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Default Export Format
                  </label>
                  <p className="text-xs text-neutral-500 mb-2">Choose default format when clicking Download Notes</p>
                  <div className="flex gap-2">
                    {['md', 'txt', 'json'].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setExportPref(fmt)}
                        className={[
                          'px-4 py-2 rounded-full text-xs font-bold uppercase transition-all',
                          exportPref === fmt
                            ? 'bg-black text-white'
                            : 'bg-white border border-neutral-300 text-neutral-600',
                        ].join(' ')}
                      >
                        .{fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <label className="text-xs font-bold text-black block mb-1">
                    Storage &amp; Data Privacy
                  </label>
                  <p className="text-xs text-neutral-500 mb-3">
                    LectureScribe retains session data locally on your device. Audio recordings are removed immediately upon processing.
                  </p>
                  <button
                    onClick={handleClearAll}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-colors"
                  >
                    Reset Library to Default
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
