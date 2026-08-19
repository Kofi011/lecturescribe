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

import { useState, useMemo, useEffect } from 'react'
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

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialView)
      setLectures(getSavedLectures())
    }
  }, [isOpen, initialView])

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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
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
            className="w-9 h-9 rounded-full bg-neutral-200/70 hover:bg-black hover:text-white text-black flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
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
                'px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap cursor-pointer',
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200/70',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-8 max-h-[60vh]">
          {/* TAB 1: MY LECTURES */}
          {activeTab === 'lectures' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Saved Sessions ({lectures.length})
                </span>
                <span className="text-xs text-neutral-500">
                  Click any lecture to view full notes &amp; transcript
                </span>
              </div>

              {lectures.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-sm">
                  No lectures in your library yet. Upload an audio recording to get started!
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
                      className="group border border-neutral-200 hover:border-black rounded-[20px] p-5 cursor-pointer transition-all bg-white hover:shadow-md flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="pill-badge text-[10px]">
                            {lec.isSample ? 'PRELOADED EXAMPLE' : 'PROCESSED'}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {new Date(lec.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-black text-base group-hover:text-black mb-2 line-clamp-2">
                          {lec.title}
                        </h4>
                        <p className="text-xs text-neutral-500 line-clamp-3 mb-4 font-normal">
                          {lec.overview}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs">
                        <span className="text-neutral-400 font-medium">
                          {lec.key_concepts?.length || 0} concepts • {lec.revision_questions?.length || 0} questions
                        </span>
                        {!lec.isSample && (
                          <button
                            onClick={(e) => handleDelete(lec.id, e)}
                            className="text-red-400 hover:text-red-600 font-medium cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUMMARIES */}
          {activeTab === 'summaries' && (
            <div className="space-y-6">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Executive Summaries &amp; Takeaways
              </span>
              {lectures.map((lec) => (
                <div
                  key={lec.id}
                  className="bg-neutral-50 border border-neutral-200/80 rounded-[20px] p-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-black text-base">{lec.title}</h4>
                    <button
                      onClick={() => {
                        onSelectLecture(lec)
                        onClose()
                      }}
                      className="btn-secondary text-xs px-4 py-1.5 cursor-pointer"
                    >
                      Open Lecture →
                    </button>
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed font-normal">
                    {lec.overview}
                  </p>
                  {lec.key_takeaways?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-200/60">
                      <span className="text-xs font-bold text-neutral-500 block mb-1">
                        Key Takeaways:
                      </span>
                      <ul className="space-y-1">
                        {lec.key_takeaways.map((t, idx) => (
                          <li key={idx} className="text-xs text-neutral-600 flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CONCEPTS & TOPICS */}
          {activeTab === 'topics' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Concept Knowledge Index ({allTopics.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allTopics.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectLecture(item.lecture)
                      onClose()
                    }}
                    className="border border-neutral-200 hover:border-black rounded-[18px] p-4 bg-white cursor-pointer transition-all hover:shadow-sm"
                  >
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      From: {item.lectureTitle}
                    </span>
                    <h5 className="font-bold text-sm text-black mb-1">
                      {item.concept}
                    </h5>
                    <p className="text-xs text-neutral-600 line-clamp-2 font-normal">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SEARCH */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all transcripts, topics, notes, or concepts…"
                  className="w-full px-5 py-3.5 border border-neutral-300 rounded-full text-sm focus:outline-none focus:border-black text-black placeholder:text-neutral-400"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                {filteredLectures.length === 0 ? (
                  <div className="text-center py-10 text-neutral-400 text-sm">
                    No matching lecture results found for &ldquo;{searchQuery}&rdquo;.
                  </div>
                ) : (
                  filteredLectures.map((lec) => (
                    <div
                      key={lec.id}
                      onClick={() => {
                        onSelectLecture(lec)
                        onClose()
                      }}
                      className="border border-neutral-200 hover:border-black rounded-[18px] p-5 cursor-pointer bg-white transition-all flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-black text-sm mb-1">{lec.title}</h4>
                        <p className="text-xs text-neutral-500 line-clamp-1 font-normal">
                          {lec.overview}
                        </p>
                      </div>
                      <span className="text-xs text-neutral-400 font-semibold shrink-0 ml-4">
                        Open →
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h4 className="font-bold text-base text-black mb-1">Storage &amp; Data</h4>
                <p className="text-xs text-neutral-500 mb-4 font-normal">
                  Lecture transcripts and notes are stored securely in your browser&apos;s local storage.
                </p>
                <button
                  onClick={handleClearAll}
                  className="btn-secondary text-xs px-4 py-2 text-red-600 hover:text-red-800 cursor-pointer"
                >
                  Clear All Saved Lectures
                </button>
              </div>

              <div className="pt-6 border-t border-neutral-100">
                <h4 className="font-bold text-base text-black mb-1">Default Export Format</h4>
                <p className="text-xs text-neutral-500 mb-3 font-normal">
                  Choose your preferred default study format when downloading notes.
                </p>
                <div className="flex gap-2">
                  {['md', 'txt', 'json'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setExportPref(fmt)}
                      className={[
                        'px-4 py-2 text-xs font-bold rounded-full uppercase transition-all cursor-pointer',
                        exportPref === fmt
                          ? 'bg-black text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                      ].join(' ')}
                    >
                      .{fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between text-xs text-neutral-500">
          <span>LectureScribe Academic Intelligence</span>
          <button
            onClick={onClose}
            className="btn-primary text-xs px-5 py-2 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
