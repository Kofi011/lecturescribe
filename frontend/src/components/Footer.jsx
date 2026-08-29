/**
 * Footer.jsx — Minimal single-row footer with interactive policy & contact modals
 * Requirement 2: Every Clickable Element Must Produce a Relevant Result
 */

export default function Footer({ onOpenInfo }) {
  return (
    <footer className="border-t border-neutral-100 bg-white px-4 py-6 sm:px-6 sm:py-8 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-xs text-neutral-500 font-normal text-center md:text-left">
        {/* Left Tagline */}
        <span>© {new Date().getFullYear()} LectureScribe by Kofi Labs. Built for students.</span>

        {/* Right Interactive Links */}
        <nav className="flex items-center gap-3.5 sm:gap-6 md:gap-8 flex-wrap justify-center" aria-label="Footer Navigation">
          <button
            onClick={() => onOpenInfo('how_it_works')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            How it works
          </button>
          <button
            onClick={() => onOpenInfo('terms')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            Terms
          </button>
          <button
            onClick={() => onOpenInfo('privacy')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            Privacy
          </button>
          <button
            onClick={() => onOpenInfo('acceptable_use')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            Acceptable use
          </button>
          <button
            onClick={() => onOpenInfo('contact')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>
      </div>
    </footer>
  )
}
