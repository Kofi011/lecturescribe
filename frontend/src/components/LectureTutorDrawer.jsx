/**
 * LectureTutorDrawer.jsx — Interactive AI Tutor for asking questions about a specific lecture
 * Styled with exact font, spacing, and alignment matching LectureScribe Workspace.
 */

import { useState, useRef, useEffect } from 'react'
import MarkdownRenderer from './MarkdownRenderer'
import { saveTutorHistory } from '../utils/lectureStorage'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function LectureTutorDrawer({
  isOpen,
  onClose,
  lecture,
  currentUser,
  onUpdateLecture,
}) {
  const defaultGreeting = {
    role: 'assistant',
    content: `Hello! I've analyzed **${lecture?.title || 'this lecture'}**.\n\nWhat would you like to explore or clarify? You can ask me to explain a concept, quiz your understanding, break down terminology, or summarize any part of the transcript.`,
  }

  const [messages, setMessages] = useState([defaultGreeting])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  // Initialize from lecture's persisted tutor_history if present
  useEffect(() => {
    if (Array.isArray(lecture?.tutor_history) && lecture.tutor_history.length > 0) {
      setMessages(lecture.tutor_history)
    } else {
      setMessages([defaultGreeting])
    }
  }, [lecture?.id])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  if (!isOpen) return null

  const handleSend = async (customQuery) => {
    const query = customQuery || input
    if (!query || !query.trim() || loading) return

    const newMsg = { role: 'user', content: query.trim() }
    const updatedHistory = [...messages, newMsg]
    setMessages(updatedHistory)
    setInput('')
    setLoading(true)

    let finalHistory = updatedHistory
    try {
      const endpoint = API_URL ? `${API_URL}/api/chat` : '/api/chat'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: lecture?.transcript || lecture?.notes_markdown || '',
          question: query.trim(),
          history: updatedHistory,
        }),
      })

      if (!res.ok) {
        throw new Error('Server returned an error')
      }

      const data = await res.json()
      const assistantMsg = { role: 'assistant', content: data.answer || 'I could not generate an answer.' }
      finalHistory = [...updatedHistory, assistantMsg]
      setMessages(finalHistory)
    } catch {
      // Intelligent fallback using local extracted lecture knowledge if server offline
      const answer = generateLocalTutorReply(query.trim(), lecture)
      const assistantMsg = { role: 'assistant', content: answer }
      finalHistory = [...updatedHistory, assistantMsg]
      setMessages(finalHistory)
    } finally {
      setLoading(false)
      // Persist tutor history
      if (lecture?.id) {
        saveTutorHistory(lecture.id, finalHistory, currentUser)
        onUpdateLecture?.({ ...lecture, tutor_history: finalHistory })
      }
    }
  }

  const handleClearHistory = () => {
    const fresh = [defaultGreeting]
    setMessages(fresh)
    if (lecture?.id) {
      saveTutorHistory(lecture.id, fresh, currentUser)
      onUpdateLecture?.({ ...lecture, tutor_history: fresh })
    }
  }

  function generateLocalTutorReply(q, lec) {
    const low = q.toLowerCase()
    if (low.includes('concept') || low.includes('explain')) {
      const concepts = lec?.key_concepts?.map((c) => `- **${c.concept}**: ${c.explanation}`).join('\n') || ''
      return `### Key Concepts from this Lecture\n\n${concepts}`
    }
    if (low.includes('takeaway') || low.includes('summary') || low.includes('main')) {
      const takeaways = lec?.key_takeaways?.map((t) => `- ${t}`).join('\n') || lec?.overview
      return `### Key Takeaways\n\n${takeaways}`
    }
    if (low.includes('term') || low.includes('definition')) {
      const terms = lec?.important_terms?.map((t) => `- **${t.term}**: ${t.definition}`).join('\n') || ''
      return `### Important Terminology\n\n${terms}`
    }
    return `### Summary of "${lec?.title}"\n\n${lec?.overview}\n\n**Key Takeaway:** ${lec?.key_takeaways?.[0] || 'See full study notes in the Notes tab.'}`
  }

  const suggestedQuestions = [
    'What are the main takeaways?',
    'Explain the key concepts in simple terms',
    'What are the most important terms?',
  ]

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
        {/* Header matching Workspace style and font */}
        <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-3">
              <span className="font-serif text-2xl italic font-normal text-black">
                Academic Tutor
              </span>
              <span className="pill-badge text-[10px]">
                LIVE Q&amp;A
              </span>
            </div>
            {lecture?.title && (
              <p className="text-xs text-neutral-500 font-normal truncate max-w-xl">
                Focused on: {lecture.title}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 1 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-neutral-400 hover:text-red-600 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                title="Clear conversation history"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-neutral-200/70 hover:bg-black hover:text-white text-black flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Message Log with Structured Markdown Output */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-neutral-50/30">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {m.role === 'user' ? (
                <div className="max-w-[80%] rounded-[20px] rounded-br-sm px-5 py-3 bg-black text-white text-sm font-medium leading-relaxed shadow-sm">
                  {m.content}
                </div>
              ) : (
                <div className="max-w-[92%] rounded-[22px] rounded-bl-sm p-6 bg-white border border-neutral-200/90 text-neutral-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] leading-relaxed">
                  <MarkdownRenderer content={m.content} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-neutral-500 font-medium py-2 px-1">
              <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
              LectureScribe is reviewing the transcript & synthesizing answer…
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-8 py-3 bg-white border-t border-neutral-100 flex gap-2 overflow-x-auto no-scrollbar">
          {suggestedQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium px-4 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="p-6 sm:p-8 bg-white border-t border-neutral-100 flex gap-3 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this lecture (e.g. explain key concepts, compare terms)…"
            className="flex-1 px-5 py-3.5 border border-neutral-300 rounded-full text-sm focus:outline-none focus:border-black text-black placeholder:text-neutral-400 bg-neutral-50/50 focus:bg-white transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary px-7 py-3.5 text-sm disabled:opacity-40 disabled:hover:bg-black"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  )
}
