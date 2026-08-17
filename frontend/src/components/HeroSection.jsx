/**
 * HeroSection.jsx — landing page hero
 * Design: centered headline with italic serif accent on "notes",
 *         subtext in gray, two pill buttons (solid + outline)
 * Per DESIGN.md: "Turn your lecture into notes."
 */
export default function HeroSection({ onUploadClick, onExampleClick }) {
  return (
    <section className="relative text-center px-6 py-24 md:py-36 overflow-hidden">

      {/* Decorative faint wavy lines in margins (per DESIGN.md — low opacity) */}
      <svg
        className="absolute left-0 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none select-none"
        width="160" height="400" viewBox="0 0 160 400"
        fill="none" aria-hidden="true"
      >
        {[0, 40, 80, 120, 160, 200, 240, 280, 320, 360].map((y, i) => (
          <path
            key={i}
            d={`M0,${y} C40,${y - 20} 120,${y + 20} 160,${y}`}
            stroke="black" strokeWidth="1.5"
          />
        ))}
      </svg>
      <svg
        className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none select-none"
        width="160" height="400" viewBox="0 0 160 400"
        fill="none" aria-hidden="true"
      >
        {[0, 40, 80, 120, 160, 200, 240, 280, 320, 360].map((y, i) => (
          <path
            key={i}
            d={`M0,${y} C40,${y - 20} 120,${y + 20} 160,${y}`}
            stroke="black" strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* Headline — bold sans + italic serif accent word */}
      <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 max-w-3xl mx-auto">
        Turn your lecture into{' '}
        <em className="not-italic font-black" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          notes.
        </em>
      </h1>

      {/* Subtext */}
      <p className="text-[#6B7280] text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed">
        Upload a lecture recording and get a full transcript plus structured
        study notes — in minutes.
      </p>

      {/* CTA buttons */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <button
          id="hero-upload-btn"
          onClick={onUploadClick}
          className="btn-primary text-base px-8 py-4"
        >
          Upload a lecture
        </button>
        <button
          id="hero-example-btn"
          onClick={onExampleClick}
          className="btn-secondary text-base px-8 py-4"
        >
          See an example
        </button>
      </div>
    </section>
  )
}
