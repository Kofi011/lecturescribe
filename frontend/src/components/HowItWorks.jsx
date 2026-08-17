/**
 * HowItWorks.jsx — dark alternating section explaining the 3-step flow
 * Per DESIGN.md: dark full-width section, 3-column card grid (stacks on mobile)
 * Mirrors "Transcribe / Summarize / Export" cards like reference site's feature row
 */

const steps = [
  {
    id: 'transcribe',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="16" cy="16" r="10" />
        <line x1="16" y1="10" x2="16" y2="16" />
        <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" />
        <path d="M10 26 Q16 28 22 26" strokeLinecap="round" />
      </svg>
    ),
    heading: 'Transcribe',
    body: 'Your lecture audio is transcribed word-for-word using Whisper AI — accurate even with accents and technical terms.',
  },
  {
    id: 'summarize',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="6" y="4" width="20" height="24" rx="3" />
        <line x1="10" y1="11" x2="22" y2="11" strokeLinecap="round" />
        <line x1="10" y1="16" x2="22" y2="16" strokeLinecap="round" />
        <line x1="10" y1="21" x2="17" y2="21" strokeLinecap="round" />
      </svg>
    ),
    heading: 'Summarize',
    body: 'Key concepts are distilled into headed sections, bullet points, and a concise Key Takeaways block you can actually study from.',
  },
  {
    id: 'export',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M10 20 L16 26 L22 20" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="26" x2="16" y2="10" strokeLinecap="round" />
        <path d="M8 6 h16 a2 2 0 0 1 2 2 v2 H6 V8 a2 2 0 0 1 2-2z" />
      </svg>
    ),
    heading: 'Export',
    body: 'Copy your notes to the clipboard or download them as a Markdown file. Ready for Notion, Obsidian, or any note app.',
  },
]

export default function HowItWorks({ sectionRef }) {
  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="bg-black text-white px-6 py-20 md:py-28"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section heading — bold sans */}
        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-center">
          Three things, done <em style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>properly.</em>
        </h2>
        <p className="text-gray-400 text-center mb-14 text-base md:text-lg max-w-lg mx-auto">
          No magic. Just good AI, good design, and a clean output you can use immediately.
        </p>

        {/* 3-column card grid — stacks to 1 column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className="border border-white/20 rounded-card p-8 flex flex-col gap-4"
            >
              <div className="text-white opacity-90">{step.icon}</div>
              <h3 className="text-xl font-bold">{step.heading}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
