/**
 * Nav.jsx — Top Navigation bar matching SasuSync visual language
 * Features:
 *   - Wordmark logo: "LectureScribe®" in Instrument Serif italic
 *   - Solid black "Menu" pill button with chevron
 *   - Optional sub-nav ticker bar with format support tags
 */

export default function Nav() {
  return (
    <div className="w-full">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-6 md:px-12">
        {/* Wordmark logo with registered trademark symbol matching SasuSync */}
        <a href="/" className="flex items-center gap-1 group select-none">
          <span className="font-serif text-3xl md:text-4xl italic text-black font-normal tracking-tight">
            LectureScribe
          </span>
          <sup className="text-xs font-sans font-bold text-black -top-2">®</sup>
        </a>

        {/* Menu pill button */}
        <button
          className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
          aria-label="Open menu"
        >
          <span>Menu</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 group-hover:-translate-y-0.5"
            aria-hidden="true"
          >
            <polyline points="2,8 6,4 10,8" />
          </svg>
        </button>
      </nav>

      {/* Ticker bar below nav matching SasuSync network category ticker */}
      <div className="border-y border-neutral-100 bg-neutral-50/70 py-2.5 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-neutral-500 font-medium">
          <div className="shrink-0 font-semibold text-black flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Supported Audio
          </div>
          <div className="flex items-center gap-6 md:gap-10 overflow-x-auto no-scrollbar whitespace-nowrap pl-6">
            <span className="text-neutral-800 font-semibold">MP3 Audio</span>
            <span>WAV Lossless</span>
            <span className="text-neutral-800 font-semibold">M4A Apple Audio</span>
            <span>Whisper Turbo AI</span>
            <span className="text-neutral-800 font-semibold">Structured Markdown</span>
          </div>
        </div>
      </div>
    </div>
  )
}
