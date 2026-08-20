/**
 * Nav.jsx — Clean Top Navigation bar (Logo + Menu button)
 */

export default function Nav({ onOpenMenu, onGoHome }) {
  return (
    <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-6 md:px-12 bg-white/95 backdrop-blur-sm relative z-50">
      {/* Wordmark Logo */}
      <button
        onClick={onGoHome}
        className="flex items-center gap-1 group select-none text-left cursor-pointer"
        title="Return to Home"
      >
        <span className="font-serif text-3xl md:text-4xl italic text-black font-normal tracking-tight">
          LectureScribe
        </span>
        <sup className="text-xs font-sans font-bold text-black -top-2">®</sup>
      </button>

      {/* Action Menu button */}
      <button
        onClick={() => onOpenMenu('lectures')}
        className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
        aria-label="Open Workspace Menu"
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
          aria-hidden="true"
        >
          <polyline points="2,8 6,4 10,8" />
        </svg>
      </button>
    </nav>
  )
}
