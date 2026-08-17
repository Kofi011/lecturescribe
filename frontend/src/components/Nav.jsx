/**
 * Nav.jsx — top navigation bar
 * Design: wordmark (italic serif) left, "Menu" pill button right
 * Per DESIGN.md: no inline nav links, single Menu button top-right
 */
export default function Nav() {
  return (
    <nav className="flex items-center justify-between px-6 py-5 md:px-12">
      {/* Wordmark — italic serif per DESIGN.md */}
      <span className="wordmark text-2xl select-none">LectureScribe</span>

      {/* Menu pill button */}
      <button
        className="btn-primary text-sm px-5 py-2 flex items-center gap-2"
        aria-label="Open menu"
      >
        Menu
        <svg
          width="12" height="12" viewBox="0 0 12 12"
          fill="none" stroke="currentColor" strokeWidth="2"
          aria-hidden="true"
        >
          <polyline points="2,4 6,8 10,4" />
        </svg>
      </button>
    </nav>
  )
}
