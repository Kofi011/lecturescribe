/**
 * HeroSection.jsx — Focused hero section with contained marquee above headline
 */

import InfiniteMarquee from './InfiniteMarquee'

export default function HeroSection({
  onUploadClick,
  onExampleClick,
  onOpenInfo,
  onOpenMenu,
}) {
  return (
    <section className="relative text-center px-4 sm:px-6 pt-6 pb-16 md:pt-10 md:pb-24">
      {/* Central Contained Marquee directly above the main headline */}
      <div className="mb-6 md:mb-10 relative z-20">
        <InfiniteMarquee
          onOpenInfo={onOpenInfo}
          onOpenMenu={onOpenMenu}
        />
      </div>

      {/* Central Content Area */}
      <div className="relative max-w-3xl mx-auto z-10 px-4 sm:px-6">
        {/* Main Headline — Proportioned elegantly matching reference */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-black tracking-[-0.03em] leading-[1.12] sm:leading-[1.08] mb-4 sm:mb-5">
          Turn your lectures <br className="hidden sm:inline" />
          into <span className="font-serif italic font-normal text-[1.05em] tracking-tight inline-block pr-0.5">notes.</span>
        </h1>

        {/* Subtext */}
        <p className="text-neutral-500 text-sm sm:text-base md:text-[17px] font-normal mb-8 sm:mb-10 max-w-lg mx-auto leading-relaxed">
          Upload any lecture recording and get a full transcript, structured study
          notes, key concepts, and revision questions in seconds.
        </p>

        {/* Call to action buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            id="hero-upload-btn"
            onClick={onUploadClick}
            className="btn-primary text-base px-8 py-4 shadow-md"
          >
            Upload a lecture
          </button>

          <button
            id="hero-example-btn"
            onClick={onExampleClick}
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-neutral-100/90 hover:bg-neutral-200/80 text-black text-sm font-semibold rounded-full border border-neutral-200/80 transition-all select-none cursor-pointer shadow-sm"
          >
            <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs">
              &lt;/&gt;
            </span>
            <div className="text-left flex flex-col">
              <span className="font-bold text-xs text-neutral-900 leading-tight">See an example</span>
              <span className="text-[11px] text-neutral-500 font-normal flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> CS 101 Lecture Notes
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>
  )
}
