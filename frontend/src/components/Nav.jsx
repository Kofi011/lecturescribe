/**
 * Nav.jsx — Top Navigation Bar with Menu & User Profile Pill Dropdown
 *
 * Menu Items:
 *   1. HOME — returns to the landing page
 *   2. TRY LECTURESCRIBE (if not signed in) / WORKSPACE (if signed in)
 *   3. ABOUT — goes to the static About page
 *   4. SAVED LIBRARY — goes to saved lectures (for signed-in users)
 *   5. SETTINGS — opens user settings modal
 *   6. LOG OUT — signs out of the account
 */

import { useState, useRef, useEffect } from 'react'

export default function Nav({
  currentPage = 'landing',
  onNavigate,
  currentUser = null,
  onLogout,
  onOpenSettings,
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

  const username = currentUser?.email ? currentUser.email.split('@')[0] : ''
  const initial = username ? username.charAt(0).toUpperCase() : 'S'

  return (
    <nav className="max-w-7xl mx-auto flex items-center justify-between gap-2 px-4 py-3.5 sm:px-6 sm:py-5 md:px-12 bg-white/95 backdrop-blur-sm relative z-50">
      {/* Brand Mark: Continuous Scribe Loop + Scaled Wordmark */}
      <button
        onClick={() => handleItemClick('landing')}
        className="flex items-center gap-1.5 sm:gap-2 group select-none text-left cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] origin-left shrink-0"
        title="Return to Home"
      >
        {/* Continuous Scribe Loop Icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 52 52"
          fill="none"
          className="text-black transition-transform duration-200 group-hover:scale-110 shrink-0 sm:w-[22px] sm:h-[22px]"
          aria-hidden="true"
        >
          <path
            d="M12 40 C6 30 6 18 16 12 C28 5 36 22 24 34 C16 42 22 50 34 46 C44 42 46 28 38 18"
            stroke="currentColor"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="40" r="3" fill="currentColor" />
          <circle cx="38" cy="18" r="2.5" fill="currentColor" />
        </svg>

        <span className="font-serif text-xl sm:text-2xl md:text-[28px] italic text-black font-normal tracking-tight transition-transform duration-200 group-hover:scale-105 origin-left inline-block">
          LectureScribe
        </span>
        <sup className="text-[9px] sm:text-[10px] font-sans font-bold text-black -top-1 sm:-top-1.5 transition-transform duration-200 group-hover:scale-105 origin-left">®</sup>
      </button>

      {/* Menu Pill & Profile Dropdown */}
      <div className="relative flex items-center gap-2 sm:gap-3 shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="btn-primary px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 select-none"
          aria-expanded={menuOpen}
          aria-label="Navigation Menu"
        >
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white text-black text-[9px] sm:text-[10px] font-bold flex items-center justify-center shrink-0">
                {initial}
              </span>
              <span className="max-w-[70px] sm:max-w-[100px] md:max-w-[120px] truncate text-xs sm:text-sm">{username}</span>
            </div>
          ) : (
            <span>Menu</span>
          )}
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 shrink-0 ${menuOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <polyline points="2,4 6,8 10,4" />
          </svg>
        </button>

        {/* Dropdown Menu per DESIGN.md */}
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-60 sm:w-64 max-w-[calc(100vw-24px)] bg-white border border-neutral-200/90 rounded-[24px] shadow-2xl p-2.5 z-50 animate-scale-up">
            {/* Header info if user logged in */}
            {currentUser && (
              <div className="px-4 py-3 mb-1.5 border-b border-neutral-100 text-xs">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                    {initial}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-black truncate block">{username}</span>
                    <span className="text-[10px] text-neutral-400 truncate block">{currentUser.email}</span>
                  </div>
                </div>
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

              {/* 2. TRY LECTURESCRIBE (Anonymous only) */}
              {!currentUser && (
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
              )}

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
                  <span>SCHOLAR WORKSPACE</span>
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

              {/* 5. ADMIN DASHBOARD (Only visible to admin role) */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => handleItemClick('admin')}
                  className={[
                    'w-full text-left px-4 py-2.5 text-xs font-bold rounded-full transition-all flex items-center justify-between cursor-pointer border border-neutral-900/10',
                    currentPage === 'admin'
                      ? 'bg-black text-white'
                      : 'text-black bg-neutral-100 hover:bg-neutral-200',
                  ].join(' ')}
                >
                  <span className="flex items-center gap-1.5">
                    <span>⚡ ADMIN CONSOLE</span>
                  </span>
                  <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded font-mono font-semibold">ADMIN</span>
                </button>
              )}

              {/* Quick Library access — only for signed-in users */}
              {currentUser && onOpenWorkspaceModal && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onOpenWorkspaceModal('lectures')
                  }}
                  className="w-full text-left px-4 py-2 text-[11px] font-semibold text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer pt-2 mt-1 border-t border-neutral-100 flex items-center justify-between"
                >
                  <span>Saved Library</span>
                  <span className="text-[10px] text-neutral-400">›</span>
                </button>
              )}

              {/* User Settings Option if authenticated */}
              {currentUser && onOpenSettings && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onOpenSettings()
                  }}
                  className="w-full text-left px-4 py-2 text-[11px] font-semibold text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>⚙ Account Settings</span>
                  <span className="text-[10px] text-neutral-400">›</span>
                </button>
              )}

              {/* Logout Option if authenticated */}
              {currentUser && onLogout && (
                <div className="pt-1 mt-1 border-t border-neutral-100">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      onLogout()
                    }}
                    className="w-full text-left px-4 py-2 text-[11px] font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
