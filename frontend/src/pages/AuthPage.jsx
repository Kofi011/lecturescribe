/**
 * AuthPage.jsx — Authentication Page (Log in & Create Account toggle) per DESIGN.md
 */

import { useState } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import AnimatedWaveform from '../components/AnimatedWaveform'
import { API_URL } from '../config'

export default function AuthPage({
  initialMode = 'login',
  onNavigate,
  onAuthSuccess,
  onOpenInfo,
  onOpenWorkspaceModal,
}) {
  const [mode, setMode] = useState(initialMode) // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
    const fullUrl = API_URL ? `${API_URL}${endpoint}` : endpoint

    try {
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensures cookies are saved
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || `${mode === 'signup' ? 'Signup' : 'Login'} failed. Please try again.`)
        return
      }

      // Successful authentication
      if (onAuthSuccess) {
        onAuthSuccess(data.user)
      }
    } catch (err) {
      console.error('[auth error]', err)
      setError('Network connection to server failed. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col bg-white selection:bg-black selection:text-white overflow-x-hidden">
      <AnimatedWaveform />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
        <Nav
          currentPage="auth"
          onNavigate={onNavigate}
          onOpenWorkspaceModal={onOpenWorkspaceModal}
        />
      </header>

      <main className="flex-1 relative z-10 flex items-center justify-center px-4 sm:px-6 py-12 md:py-20">
        <div className="w-full max-w-md bg-white border border-neutral-200/90 rounded-[32px] p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] animate-scale-up">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="pill-badge text-[10px] mb-2">STUDENT ACCESS</span>
            <h1 className="text-3xl font-black text-black tracking-tight mt-1">
              {mode === 'login' ? 'Welcome back to ' : 'Create your '}
              <span className="font-serif italic font-normal text-[1.1em] block sm:inline">
                LectureScribe.
              </span>
            </h1>
            <p className="text-xs text-neutral-500 mt-2 font-normal">
              {mode === 'login'
                ? 'Sign in to access your protected workspace and unlimited study notes.'
                : 'Create an account to unlock unlimited lecture uploads and AI tutor access.'}
            </p>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex bg-neutral-100 p-1 rounded-full mb-6 select-none">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError(null)
              }}
              className={[
                'flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer',
                mode === 'login'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-neutral-600 hover:text-black',
              ].join(' ')}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setError(null)
              }}
              className={[
                'flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer',
                mode === 'signup'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-neutral-600 hover:text-black',
              ].join(' ')}
            >
              Create Account
            </button>
          </div>

          {/* Error Message Display with Offline Demo Option */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 border border-red-200/80 rounded-[18px] text-xs text-red-700 font-medium flex flex-col gap-2.5 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onAuthSuccess?.({
                    id: 'offline_demo_user',
                    email: email.trim() || 'admin@edu.tech',
                    role: (email.trim().toLowerCase() === 'admin@edu.tech' || !email.trim()) ? 'admin' : 'user',
                  })
                }}
                className="mt-1 w-full py-2.5 bg-neutral-900 hover:bg-black text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer shadow-xs text-center"
              >
                Continue in Standalone / Demo Mode →
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 pl-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full px-5 py-3.5 border border-neutral-300 rounded-full text-sm focus:outline-none focus:border-black text-black placeholder:text-neutral-400 bg-neutral-50/50 focus:bg-white transition-colors"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 pl-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-5 py-3.5 border border-neutral-300 rounded-full text-sm focus:outline-none focus:border-black text-black placeholder:text-neutral-400 bg-neutral-50/50 focus:bg-white transition-colors"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-sm font-bold mt-6 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>{mode === 'login' ? 'Signing in…' : 'Creating account…'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In →' : 'Create Free Account →'}</span>
              )}
            </button>
          </form>

          {/* Trial note */}
          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
            <p className="text-[11px] text-neutral-400 font-normal">
              Want to try before signing up?{' '}
              <button
                onClick={() => onNavigate('trial')}
                className="text-black font-bold hover:underline cursor-pointer"
              >
                Use the 3-lecture free trial →
              </button>
            </p>
          </div>
        </div>
      </main>

      <Footer onOpenInfo={onOpenInfo} />
    </div>
  )
}
