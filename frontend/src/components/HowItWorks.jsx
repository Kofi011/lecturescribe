/**
 * HowItWorks.jsx — "Three things, done properly." section
 * Requirement 2: Every card is interactive with a functional trigger
 * Requirement 3: Internal transcription tech is not exposed
 */

export default function HowItWorks({ sectionRef, onExploreFeature }) {
  const items = [
    {
      id: 'transcribe',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      heading: 'Speech Intelligence',
      body: 'Your lecture is transcribed word-for-word with high acoustic precision. Fast, accurate, and resilient against background classroom noise and accents.',
      actionLabel: 'Learn about speech engine →',
      actionKey: 'format_intelligence',
    },
    {
      id: 'summarize',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      heading: 'Structured Study Knowledge',
      body: 'Key concepts are distilled into headed sections, bulleted notes, key terminology definitions, and self-test revision questions ready for exam prep.',
      actionLabel: 'Preview concept schema →',
      actionKey: 'topics',
    },
    {
      id: 'export',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      heading: 'Instant Markdown Export',
      body: 'Copy notes directly to your clipboard or download formatted Markdown (.md) or Plain Text (.txt). Compatible with Notion, Obsidian, and Apple Notes.',
      actionLabel: 'Check export formats →',
      actionKey: 'format_markdown',
    },
  ]

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="px-6 py-20 md:py-28 bg-white border-t border-neutral-100"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-black tracking-tight mb-4 leading-tight">
            Three things, done{' '}
            <span className="font-serif italic font-normal text-[1.12em] tracking-tight">
              properly.
            </span>
          </h2>
          <p className="text-neutral-500 text-base md:text-lg max-w-xl mx-auto font-normal">
            One upload, one transcript, one structured study summary for every lecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-neutral-200/90 rounded-[28px] p-8 md:p-10 flex flex-col justify-between shadow-[0_2px_16px_rgba(0,0,0,0.02)] hover:border-black transition-all duration-200"
            >
              <div>
                <div className="text-black w-10 h-10 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-black tracking-tight mb-2">
                  {item.heading}
                </h3>
                <p className="text-neutral-500 text-sm md:text-[15px] leading-relaxed font-normal">
                  {item.body}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100">
                <button
                  onClick={() => onExploreFeature(item.actionKey)}
                  className="text-xs font-bold text-black hover:underline cursor-pointer flex items-center gap-1"
                >
                  {item.actionLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
