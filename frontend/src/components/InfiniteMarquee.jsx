/**
 * InfiniteMarquee.jsx — Generously spaced seamless marquee
 *
 * Requirements:
 *   1. Generous spacing between items
 *   2. The repeated sequence only becomes visible after the original instance
 *      has completely exited the viewport (using full-viewport trailing buffer)
 *   3. Smooth, steady, premium motion with ✦ separators
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

  // Two identical instances: Instance A followed by a full viewport trailing spacer,
  // then Instance B followed by a full viewport trailing spacer.
  const instances = [0, 1]

  return (
    <div
      className="w-full border-y border-neutral-200/80 bg-neutral-50/90 backdrop-blur-sm py-3 overflow-hidden select-none marquee-mask"
      aria-label="Features and format compatibility"
    >
      <div className="marquee-track flex items-center">
        {instances.map((instanceIndex) => (
          <div
            key={instanceIndex}
            className="flex items-center shrink-0 pr-[100vw]"
          >
            {marqueeItems.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center">
                <button
                  onClick={item.action}
                  className="px-6 md:px-12 py-1 text-xs md:text-sm font-semibold text-neutral-800 hover:text-black transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 group"
                >
                  <span className="group-hover:underline underline-offset-4 tracking-tight">
                    {item.label}
                  </span>
                </button>

                {/* Refined subtle symbol separator with generous spacing */}
                <span
                  className="text-xs text-neutral-400 px-4 md:px-8 select-none"
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
