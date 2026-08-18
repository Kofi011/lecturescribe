/**
 * InfiniteMarquee.jsx — Seamless infinite horizontal scrolling marquee
 * Positioned directly below the LectureScribe logo.
 *
 * Items:
 *   - Speech Intelligence
 *   - MP3 Audio
 *   - WAV Lossless
 *   - M4A Apple Audio
 *   - Structured Markdown
 *   - Concept Explorer
 *
 * Separator: Subtle ✦ symbol
 * Behavior: Mathematically seamless loop (0% to -50%), smooth reading speed, pauses on hover.
 */

export default function InfiniteMarquee({ onOpenInfo, onOpenMenu }) {
  const marqueeItems = [
    { label: 'Speech Intelligence',  action: () => onOpenInfo('format_intelligence') },
    { label: 'MP3 Audio',            action: () => onOpenInfo('format_mp3') },
    { label: 'WAV Lossless',         action: () => onOpenInfo('format_wav') },
    { label: 'M4A Apple Audio',      action: () => onOpenInfo('format_m4a') },
    { label: 'Structured Markdown',  action: () => onOpenInfo('format_markdown') },
    { label: 'Concept Explorer',     action: () => onOpenMenu('topics') },
  ]

  // We render 4 identical sets so the strip is wide enough for any viewport and translates seamlessly by 50%
  const repeatedSets = [0, 1, 2, 3]

  return (
    <div
      className="w-full border-y border-neutral-100 bg-neutral-50/80 backdrop-blur-sm py-2.5 overflow-hidden select-none marquee-mask"
      aria-label="Features and format compatibility"
    >
      <div className="marquee-track flex items-center">
        {repeatedSets.map((setIndex) => (
          <div key={setIndex} className="flex items-center shrink-0">
            {marqueeItems.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center">
                <button
                  onClick={item.action}
                  className="px-4 py-0.5 text-xs font-semibold text-neutral-700 hover:text-black transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 group"
                >
                  <span className="group-hover:underline underline-offset-4 tracking-tight">
                    {item.label}
                  </span>
                </button>

                {/* Subtle refined symbol separator */}
                <span
                  className="text-[10px] text-neutral-400/80 px-2 select-none"
                  aria-hidden="true"
                >
                  ✦
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
