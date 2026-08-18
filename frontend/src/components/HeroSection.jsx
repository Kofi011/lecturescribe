/**
 * HeroSection.jsx — Hero section matching SasuSync visual rhythm (Image 4)
 * Features:
 *   - High-contrast bold sans headline with elegant italic serif accent word
 *   - Faint curved decorative wireframe lines on side margins
 *   - High-contrast pill buttons (Solid black + Dual badge pill)
 */

export default function HeroSection({ onUploadClick, onExampleClick }) {
  return (
    <section className="relative text-center px-6 pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
      {/* Decorative subtle curved wireframe lines in left margin (matching SasuSync Image 4) */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 w-[280px] h-[550px] opacity-[0.07] pointer-events-none select-none">
        <svg viewBox="0 0 280 550" fill="none" className="w-full h-full">
          {[20, 50, 80, 110, 140, 170, 200, 230, 260].map((x, i) => (
            <path
              key={i}
              d={`M${x},0 C${x + 80},180 ${x - 60},360 ${x + 20},550`}
              stroke="black"
              strokeWidth="1.2"
            />
          ))}
        </svg>
      </div>

      {/* Decorative subtle curved wireframe lines in right margin */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[280px] h-[550px] opacity-[0.07] pointer-events-none select-none">
        <svg viewBox="0 0 280 550" fill="none" className="w-full h-full">
          {[20, 50, 80, 110, 140, 170, 200, 230, 260].map((x, i) => (
            <path
              key={i}
              d={`M${280 - x},0 C${280 - x - 80},180 ${280 - x + 60},360 ${280 - x - 20},550`}
              stroke="black"
              strokeWidth="1.2"
            />
          ))}
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto z-10">
        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-black tracking-tight leading-[1.04] mb-8">
          Turn your lecture into{' '}
          <span className="font-serif italic font-normal text-[1.12em] tracking-tight inline-block pr-1">
            notes.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-neutral-500 text-lg md:text-xl font-normal mb-12 max-w-2xl mx-auto leading-relaxed">
          Upload any lecture recording and get a full word-for-word transcript
          plus structured study notes in seconds.
        </p>

        {/* Call to action buttons matching SasuSync dual pill layout */}
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
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-neutral-100/80 hover:bg-neutral-100 text-black text-sm font-semibold rounded-full border border-neutral-200/80 transition-all select-none cursor-pointer"
          >
            <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs">
              &lt;/&gt;
            </span>
            <div className="text-left flex flex-col">
              <span className="font-bold text-xs text-neutral-900 leading-tight">See an example</span>
              <span className="text-[11px] text-neutral-500 font-normal flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Instant preview
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>
  )
}
