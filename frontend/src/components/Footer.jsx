/**
 * Footer.jsx — Single-row minimal footer matching SasuSync Images 1 & 4
 */

export default function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-white px-6 py-8 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500 font-normal">
        {/* Left tagline */}
        <span>© {new Date().getFullYear()} LectureScribe by Kofi Labs. Built for students.</span>

        {/* Right flat link list */}
        <nav className="flex items-center gap-6 md:gap-8 flex-wrap justify-center">
          <a href="#how-it-works" className="hover:text-black transition-colors">How it works</a>
          <a href="#upload-section" className="hover:text-black transition-colors">Upload</a>
          <a href="#" className="hover:text-black transition-colors">Terms</a>
          <a href="#" className="hover:text-black transition-colors">Privacy</a>
          <a href="#" className="hover:text-black transition-colors">Acceptable use</a>
          <a href="#" className="hover:text-black transition-colors">Contact</a>
        </nav>
      </div>
    </footer>
  )
}
