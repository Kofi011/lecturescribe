/**
 * InfiniteMarquee.jsx — Contained centered marquee matching the SasuSync reference
 * Does not stretch edge-to-edge across viewport; bounded in a centered container with edge fades.
 */

export default function InfiniteMarquee({ onOpenInfo, onOpenMenu }) {
  const marqueeItems = [
    { label: 'Speech Intelligence',  action: () => onOpenInfo?.('format_intelligence') },
    { label: 'MP3 Audio',            action: () => onOpenInfo?.('format_mp3') },
    { label: 'WAV Lossless',         action: () => onOpenInfo?.('format_wav') },
    { label: 'M4A Apple Audio',      action: () => onOpenInfo?.('format_m4a') },
    { label: 'Structured Markdown',  action: () => onOpenInfo?.('format_markdown') },
    { label: 'Concept Explorer',     action: () => onOpenMenu?.('topics') },
  ]

  // Two identical adjacent sets of items for seamless continuous loop
  const sets = [0, 1]

  return (
    <div
      className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto overflow-hidden select-none py-1 marquee-contained-mask"
      aria-label="Features and format compatibility"
    >
      <div className="marquee-track flex items-center">
        {sets.map((setIdx) => (
          <div key={setIdx} className="flex items-center shrink-0">
            {marqueeItems.map((item, itemIdx) => (
              <div key={itemIdx} className="flex items-center">
                <button
                  onClick={item.action}
                  className="px-3.5 sm:px-5 py-1 text-xs sm:text-sm font-medium text-neutral-500 hover:text-black transition-colors whitespace-nowrap cursor-pointer group"
                >
                  <span className="group-hover:underline underline-offset-4 tracking-tight">
                    {item.label}
                  </span>
                </button>

                <span
                  className="text-[10px] text-neutral-300 px-2 sm:px-3 select-none"
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
