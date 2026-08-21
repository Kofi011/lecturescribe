/**
 * Nav.jsx — Top Navigation Bar with Menu Pill Dropdown
 *
 * Menu Items (in exact order per requirements):
 *   1. HOME — returns to the landing page
 *   2. TRY LECTURESCRIBE — goes to the 3-trial upload page
 *   3. LOGIN / WORKSPACE — goes to the auth page or workspace
 *   4. ABOUT — goes to the static About page
 */

import { useState, useRef, useEffect } from 'react'

export default function Nav({
  currentPage = 'landing',
  onNavigate,
  currentUser = null,
  onLogout,
  onOpenWorkspaceModal,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const handleItemClick = (page) => {
    setMenuOpen(false)
    if (onNavigate) onNavigate(page)
  }

  return (
    <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-6 md:px-12 bg-white/95 backdrop-blur-sm relative z-50">
      {/* Wordmark Logo */}
      <button
        onClick={() => handleItemClick('landing')}
        className="flex items-center gap-1 group select-none text-left cursor-pointer"
        title="Return to Home"
      >
        <span className="font-serif text-3xl md:text-4xl italic text-black font-normal tracking-tight">
          LectureScribe
        </span>
        <sup className="text-xs font-sans font-bold text-black -top-2">®</sup>
      </button>

      {/* Menu Pill & Dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 select-none"
          aria-expanded={menuOpen}
          aria-label="Navigation Menu"
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
            className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <polyline points="2,4 6,8 10,4" />
          </svg>
        </button>

        {/* Dropdown Menu per DESIGN.md */}
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2.5 w-60 bg-white border border-neutral-200/90 rounded-[24px] shadow-2xl p-2.5 z-50 animate-scale-up">
            {/* Header info if user logged in */}
            {currentUser && (
              <div className="px-4 py-2 mb-1.5 border-b border-neutral-100 text-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Signed in as</span>
                <span className="font-bold text-black truncate block">{currentUser.email}</span>
              </div>
            )}

            <div className="space-y-1">
              {/* 1. HOME */}
              <button
                onClick={() => handleItemClick('landing')}
                className={[
                  'w-full text-left px-4 py-2.5 text-xs font-bold rounded-full transition-all flex items-center justify-between cursor-pointer',
                  currentPage === 'landing'
                    ? 'bg-black text-white'
                    : 'text-neutral-800 hover:bg-neutral-100 hover:text-black',
                ].join(' ')}
              >
                <span>HOME</span>
                {currentPage === 'landing' && <span className="text-[10px]">●</span>}
              </button>

              {/* 2. TRY LECTURESCRIBE */}
              <button
                onClick={() => handleItemClick('trial')}
                className={[
                  'w-full text-left px-4 py-2.5 text-xs font-bold rounded-full transition-all flex items-center justify-between cursor-pointer',
                  currentPage === 'trial'
                    ? 'bg-black text-white'
                    : 'text-neutral-800 hover:bg-neutral-100 hover:text-black',
                ].join(' ')}
              >
                <span>TRY LECTURESCRIBE</span>
                <span className="text-[10px] bg-neutral-200/70 text-neutral-800 px-2 py-0.5 rounded-full font-semibold">3 Free</span>
              </button>

              {/* 3. LOGIN / WORKSPACE */}
              {currentUser ? (
                <button
                  onClick={() => handleItemClick('workspace')}
                  className={[
                    'w-full text-left px-4 py-2.5 text-xs font-bold rounded-full transition-all flex items-center justify-between cursor-pointer',
                    currentPage === 'workspace'
                      ? 'bg-black text-white'
                      : 'text-neutral-800 hover:bg-neutral-100 hover:text-black',
                  ].join(' ')}
                >
                  <span>WORKSPACE</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </button>
              ) : (
                <button
                  onClick={() => handleItemClick('auth')}
                  className={[
                    'w-full text-left px-4 py-2.5 text-xs font-bold rounded-full transition-all flex items-center justify-between cursor-pointer',
                    currentPage === 'auth'
                      ? 'bg-black text-white'
                      : 'text-neutral-800 hover:bg-neutral-100 hover:text-black',
                  ].join(' ')}
                >
                  <span>LOGIN</span>
                  <span className="text-neutral-400 text-[10px]">→</span>
                </button>
              )}

              {/* 4. ABOUT */}
              <button
                onClick={() => handleItemClick('about')}
                className={[
                  'w-full text-left px-4 py-2.5 text-xs font-bold rounded-full transition-all flex items-center justify-between cursor-pointer',
                  currentPage === 'about'
                    ? 'bg-black text-white'
                    : 'text-neutral-800 hover:bg-neutral-100 hover:text-black',
                ].join(' ')}
              >
                <span>ABOUT</span>
              </button>

              {/* Optional Quick Library access */}
              {onOpenWorkspaceModal && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onOpenWorkspaceModal('lectures')
                  }}
                  className="w-full text-left px-4 py-2 text-[11px] font-semibold text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer pt-2 mt-1 border-t border-neutral-100"
                >
                  Saved Library ({'>'})
                </button>
              )}

              {/* Logout Option if authenticated */}
              {currentUser && onLogout && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onLogout()
                  }}
                  className="w-full text-left px-4 py-2 text-[11px] font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                >
                  Log out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
