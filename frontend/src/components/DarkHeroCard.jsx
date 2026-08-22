/**
 * DarkHeroCard.jsx — Mid-page dark hero CTA container per DESIGN.md
 * Features:
 *   - Dark rounded card (rounded-[32px], bg-[#0c0c0c])
 *   - Bold white headline with italic serif accent word
 *   - Single solid pill button ("Try LectureScribe free")
 *   - Supporting subtext underneath ("No sign-up needed for your first lecture")
 */

export default function DarkHeroCard({ onGetStarted }) {
  return (
    <section className="px-6 py-12 md:py-16 max-w-6xl mx-auto">
      <div className="card-dark text-center">
        <div className="max-w-3xl mx-auto">
          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08] mb-6">
            Studying with an{' '}
            <span className="font-serif italic font-normal text-[1.12em] tracking-tight">
              AI scribe?
            </span>
          </h2>

          {/* Subtext */}
          <p className="text-neutral-400 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed font-normal">
            Upload your audio and get back an accurate transcript, headed topics,
            and high-yield takeaways you can study right away.
          </p>

          {/* Single CTA Button with Supporting Line */}
          <div className="flex flex-col items-center justify-center gap-3">
            <button
              id="dark-hero-try-free-btn"
              onClick={onGetStarted}
              className="btn-white px-9 py-4 text-base font-semibold shadow-md"
            >
              Try LectureScribe free
            </button>
            <span className="text-xs text-neutral-400 font-normal">
              No sign-up needed for your first lecture
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
