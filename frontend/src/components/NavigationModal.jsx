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
import { getSavedLectures, deleteLecture, clearAllLectures, SAMPLE_LECTURE } from '../utils/lectureStorage'

export default function NavigationModal({
  isOpen,
  onClose,
  onSelectLecture,
  onDeleteLecture,
  initialView = 'lectures',
}) {
  const [activeTab, setActiveTab] = useState(initialView)
  const [lectures, setLectures] = useState(() => getSavedLectures())
  const [searchQuery, setSearchQuery] = useState('')
  const [exportPref, setExportPref] = useState('md')
  const [topicFilter, setTopicFilter] = useState('all')

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialView || 'lectures')
      setLectures(getSavedLectures())
    }
  }, [isOpen, initialView])

  // Sync across tabs and modal actions
  useEffect(() => {
    const handleStorageUpdate = () => {
      setLectures(getSavedLectures())
    }
    window.addEventListener('lecturescribe_storage_update', handleStorageUpdate)
    return () => window.removeEventListener('lecturescribe_storage_update', handleStorageUpdate)
  }, [])

  // Extract all topics/concepts across all lectures
  const allTopics = useMemo(() => {
    const list = []
    const sourceLectures = lectures && lectures.length > 0 ? lectures : [SAMPLE_LECTURE]
    for (const lec of sourceLectures) {
      if (Array.isArray(lec.key_concepts)) {
        for (const c of lec.key_concepts) {
          list.push({
            concept: c.concept,
            explanation: c.explanation,
            lectureTitle: lec.title,
            lectureId: lec.id,
            lecture: lec,
          })
        }
      }
    }
    return list
  }, [lectures])

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

  const filteredTopics = allTopics.filter((t) => {
    if (topicFilter === 'all') return true
    return t.concept.toLowerCase().includes(topicFilter.toLowerCase())
  })

  const handleDelete = (id, e) => {
    e?.stopPropagation()
    const updated = deleteLecture(id)
    setLectures(updated)
    onDeleteLecture?.(id)
  }

  const handleClearAll = (e) => {
    e?.stopPropagation()
    const updated = clearAllLectures()
    setLectures(updated)
    onDeleteLecture?.('all')
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
            { id: 'topics',    label: `Concept Explorer (${allTopics.length})` },
            { id: 'summaries', label: 'Summaries' },
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
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Saved Sessions ({lectures.length})
                  </span>
                  {lectures.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <span className="text-xs text-neutral-500">
                  Click any lecture to view full notes &amp; transcript
                </span>
              </div>

              {lectures.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-sm space-y-2">
                  <p>No lectures in your library.</p>
                  <p className="text-xs text-neutral-400">Upload a new recording to begin.</p>
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
                            {lec.createdAt ? new Date(lec.createdAt).toLocaleDateString() : 'Ready'}
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
                        <button
                          onClick={(e) => handleDelete(lec.id, e)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors"
                          title="Delete this lecture"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONCEPT EXPLORER */}
          {activeTab === 'topics' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    Concept Knowledge Graph
                  </span>
                  <p className="text-xs text-neutral-500">
                    Extracted academic concepts from your lecture transcripts. Click any concept to open its full study notes.
                  </p>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {['all', 'Complexity', 'Sort', 'Stability'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setTopicFilter(tag === 'all' ? 'all' : tag)}
                      className={[
                        'text-xs px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer',
                        (tag === 'all' && topicFilter === 'all') || topicFilter === tag
                          ? 'bg-black text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                      ].join(' ')}
                    >
                      {tag === 'all' ? 'All Concepts' : tag}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTopics.length === 0 ? (
                <div className="text-center py-10 text-neutral-400 text-sm">
                  No concepts found. Upload a lecture to generate academic concepts.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTopics.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onSelectLecture(item.lecture)
                        onClose()
                      }}
                      className="border border-neutral-200 hover:border-black rounded-[22px] p-5 bg-white cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            From: {item.lectureTitle}
                          </span>
                          <span className="text-[10px] bg-neutral-100 group-hover:bg-black group-hover:text-white px-2 py-0.5 rounded-full font-bold transition-colors">
                            Open Study Note →
                          </span>
                        </div>
                        <h5 className="font-bold text-base text-black mb-2">
                          {item.concept}
                        </h5>
                        <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                          {item.explanation}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Interactive Syllabus Concept</span>
                        <span className="text-black font-semibold">View in Hub</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUMMARIES */}
          {activeTab === 'summaries' && (
            <div className="space-y-6">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Executive Summaries &amp; Takeaways
              </span>
              {lectures.length === 0 ? (
                <div className="text-center py-10 text-neutral-400 text-sm">
                  No lecture summaries available.
                </div>
              ) : (
                lectures.map((lec) => (
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
                ))
              )}
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
