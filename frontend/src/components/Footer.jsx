/**
 * Footer.jsx — minimal single-row footer per DESIGN.md
 * Copyright + tagline left, flat link list right
 */
export default function Footer() {
  return (
    <footer className="border-t border-gray-100 px-6 py-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#6B7280]">
      <span>© {new Date().getFullYear()} LectureScribe — smarter notes, faster.</span>
      <nav className="flex gap-6" aria-label="Footer links">
        <a href="#how-it-works" className="hover:text-black transition-colors">How it works</a>
        <a href="#upload-section" className="hover:text-black transition-colors">Upload</a>
      </nav>
    </footer>
  )
}
