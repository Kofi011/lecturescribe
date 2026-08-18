/**
 * DarkHeroCard.jsx — Dark rounded container matching SasuSync Image 1
 * Features:
 *   - Dark rounded card (rounded-[32px], bg-[#0c0c0c])
 *   - Bold white headline with italic serif accent word
 *   - Dual action pill buttons (white solid + dark outline)
 */

export default function DarkHeroCard({ onGetStarted, onSeeExample }) {
  return (
    <section className="px-6 py-12 md:py-16 max-w-6xl mx-auto">
      <div className="card-dark text-center">
        <div className="max-w-3xl mx-auto">
          {/* Headline matching SasuSync Image 1 */}
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

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={onGetStarted}
              className="btn-white px-8 py-3.5"
            >
              Upload a lecture
            </button>
            <button
              onClick={onSeeExample}
              className="btn-dark-outline px-8 py-3.5"
            >
              See an example
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
