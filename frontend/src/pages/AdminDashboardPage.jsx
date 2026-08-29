/**
 * AdminDashboardPage.jsx — Operational Visibility & Analytics Dashboard for LectureScribe Admins
 *
 * Privacy Guarantee:
 * The dashboard shows OPERATIONAL REALITY, never USER CONTENT or IDENTITY:
 * - Aggregate counts and live system status
 * - Anonymous event stream (event_name + route + relative timestamp only)
 * - Excludes user identities, emails, accounts, lecture titles, transcripts, notes, and IP addresses.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function AdminDashboardPage({
  currentUser,
  onNavigate,
  onLogout,
  onOpenSettings,
  onOpenWorkspaceModal,
  onOpenInfo,
}) {
  const [healthData, setHealthData] = useState(null)
  const [liveMetrics, setLiveMetrics] = useState(null)
  const [streamEvents, setStreamEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const pollTimerRef = useRef(null)

  const isAdmin = currentUser?.role === 'admin'

  // ─── Fetch All Admin Dashboard Data ───────────────────────────────────────
  const fetchDashboardData = useCallback(async (showRefreshIndicator = false) => {
    if (!isAdmin) {
      setLoading(false)
      return
    }

    if (showRefreshIndicator) setIsRefreshing(true)

    try {
      const authHeader = {}
      const healthEndpoint = API_URL ? `${API_URL}/api/health` : '/api/health'
      const liveEndpoint = API_URL ? `${API_URL}/api/analytics/live` : '/api/analytics/live'
      const streamEndpoint = API_URL ? `${API_URL}/api/analytics/stream?limit=50` : '/api/analytics/stream?limit=50'

      const [healthRes, liveRes, streamRes] = await Promise.all([
        fetch(healthEndpoint, { credentials: 'include', headers: authHeader }),
        fetch(liveEndpoint, { credentials: 'include', headers: authHeader }),
        fetch(streamEndpoint, { credentials: 'include', headers: authHeader }),
      ])

      if (healthRes.ok) {
        const hData = await healthRes.json()
        setHealthData(hData)
      } else {
        setHealthData({ services: { api: 'degraded', db: 'unknown', griot_sidecar: 'unknown' } })
      }

      if (liveRes.ok) {
        const lData = await liveRes.json()
        setLiveMetrics(lData)
      } else if (liveRes.status === 403) {
        setError('Access forbidden: Administrator privileges required.')
      }

      if (streamRes.ok) {
        const sData = await streamRes.json()
        setStreamEvents(sData.events || [])
      }

      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error('[admin dashboard fetch error]', err)
      setError('Connection to LectureScribe server failed. Retrying in 10s…')
    } finally {
      setLoading(false)
      if (showRefreshIndicator) {
        setTimeout(() => setIsRefreshing(false), 400)
      }
    }
  }, [isAdmin])

  // ─── Auto-polling setup (every 10 seconds) ─────────────────────────────────
  useEffect(() => {
    if (!isAdmin) return

    fetchDashboardData(false)

    pollTimerRef.current = setInterval(() => {
      fetchDashboardData(false)
    }, 10000)

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [isAdmin, fetchDashboardData])

  // Helper for format relative time
  const formatTimeAgo = (isoString) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diffSec = Math.floor((now - date) / 1000)

      if (diffSec < 5) return 'just now'
      if (diffSec < 60) return `${diffSec}s ago`
      const diffMin = Math.floor(diffSec / 60)
      if (diffMin < 60) return `${diffMin}m ago`
      const diffHr = Math.floor(diffMin / 60)
      if (diffHr < 24) return `${diffHr}h ago`
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch {
      return isoString
    }
  }

  // ─── 403 ACCESS DENIED STATE FOR NON-ADMINS ───────────────────────────────
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col justify-between font-sans selection:bg-black selection:text-white">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm w-full border-b border-neutral-100">
          <Nav
            currentPage="admin"
            onNavigate={onNavigate}
            currentUser={currentUser}
            onLogout={onLogout}
            onOpenSettings={onOpenSettings}
            onOpenWorkspaceModal={onOpenWorkspaceModal}
          />
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
          <div className="border border-neutral-200 rounded-[28px] sm:rounded-[32px] p-6 sm:p-12 shadow-sm bg-neutral-50/50">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-5 sm:mb-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg sm:text-xl">
              🔒
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200 text-neutral-800 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-4">
              Restricted Route
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Administrator Access <span className="font-serif italic font-normal">Required</span>
            </h1>

            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 max-w-md mx-auto">
              The Admin Dashboard is strictly restricted to accounts with <code className="bg-neutral-200 px-1.5 py-0.5 rounded text-xs text-black font-semibold">role = &apos;admin&apos;</code>.
              Your account currently does not have administrator privileges.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
              {currentUser ? (
                <button
                  onClick={() => onNavigate('workspace')}
                  className="btn-primary w-full sm:w-auto px-6 py-3 text-xs uppercase tracking-wider font-bold cursor-pointer"
                >
                  Return to Workspace
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('auth')}
                  className="btn-primary w-full sm:w-auto px-6 py-3 text-xs uppercase tracking-wider font-bold cursor-pointer"
                >
                  Log in as Admin
                </button>
              )}
              <button
                onClick={() => onNavigate('landing')}
                className="btn-secondary w-full sm:w-auto px-6 py-3 text-xs uppercase tracking-wider font-bold cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        </main>

        <Footer onNavigate={onNavigate} onOpenInfo={onOpenInfo} />
      </div>
    )
  }

  // Calculate percentage success rate if uploads processed
  const totalUploads = liveMetrics?.uploadsToday || 0
  const successUploads = liveMetrics?.successToday || 0
  const successPercent = totalUploads > 0 ? Math.round((successUploads / totalUploads) * 100) : 100

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between font-sans selection:bg-black selection:text-white">
      {/* Clean Top Navigation Bar with identical full-width spacing as Landing */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm w-full border-b border-neutral-100">
        <Nav
          currentPage="admin"
          onNavigate={onNavigate}
          currentUser={currentUser}
          onLogout={onLogout}
          onOpenSettings={onOpenSettings}
          onOpenWorkspaceModal={onOpenWorkspaceModal}
        />
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-10 flex-1 w-full space-y-8">
        {/* ─── DASHBOARD TOP HEADER WITH ADMIN BADGE & PULSING LIVE INDICATOR ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="bg-black text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Admin Console
              </span>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-0.5 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                <span>Live Polling (10s)</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Operational <span className="font-serif italic font-normal">Reality</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl">
              Real-time operational health and aggregate metrics. Structurally isolated from individual student identities and lecture transcripts.
            </p>
          </div>

          {/* Refresh controls & Last checked */}
          <div className="flex items-center gap-3 shrink-0">
            {lastUpdated && (
              <span className="text-[11px] text-neutral-400 hidden md:inline-block">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              className="btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Poll latest data immediately"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`${isRefreshing ? 'animate-spin' : ''}`}
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{isRefreshing ? 'Refreshing…' : 'Refresh Now'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => fetchDashboardData(true)} className="underline cursor-pointer">Retry</button>
          </div>
        )}

        {/* ─── PANEL 1: SYSTEM HEALTH (POLLS GET /api/health) ────────────────── */}
        <section aria-labelledby="health-panel-title" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="health-panel-title" className="text-sm font-bold uppercase tracking-wider text-neutral-500">
              1. System Health & Services
            </h2>
            <span className="text-[11px] text-neutral-400">GET /api/health</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1.1 API Status */}
            <div className="border border-neutral-200 rounded-[24px] p-5 bg-white shadow-sm flex flex-col justify-between hover:border-neutral-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Node / Express API</span>
                <span className={`w-3 h-3 rounded-full ${healthData?.services?.api === 'healthy' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-red-500'}`}></span>
              </div>
              <div>
                <div className="text-lg font-extrabold text-black capitalize">
                  {healthData?.services?.api || (loading ? 'Checking…' : 'Offline')}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Core REST endpoints & auth pipeline
                </div>
              </div>
            </div>

            {/* 1.2 DB Status */}
            <div className="border border-neutral-200 rounded-[24px] p-5 bg-white shadow-sm flex flex-col justify-between hover:border-neutral-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Database Engine</span>
                <span className={`w-3 h-3 rounded-full ${healthData?.services?.db === 'healthy' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-red-500'}`}></span>
              </div>
              <div>
                <div className="text-lg font-extrabold text-black capitalize">
                  {healthData?.services?.db || (loading ? 'Checking…' : 'Disconnected')}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Users, lectures & analytics tables
                </div>
              </div>
            </div>

            {/* 1.3 Griot Nano 1 Sidecar */}
            <div className="border border-neutral-200 rounded-[24px] p-5 bg-white shadow-sm flex flex-col justify-between hover:border-neutral-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Griot Nano 1 Sidecar</span>
                <span
                  className={`w-3 h-3 rounded-full ${
                    healthData?.services?.griot_sidecar === 'healthy'
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                      : 'bg-amber-400 shadow-sm shadow-amber-400/50'
                  }`}
                ></span>
              </div>
              <div>
                <div className="text-lg font-extrabold text-black capitalize flex items-center gap-1.5">
                  <span>{healthData?.services?.griot_sidecar || (loading ? 'Checking…' : 'Offline')}</span>
                  {healthData?.services?.griot_sidecar !== 'healthy' && (
                    <span className="text-[10px] font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Whisper Fallback
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  African-accented ConformerCTC engine
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── PANEL 2: LIVE USAGE METRICS (POLLS GET /api/analytics/live) ──── */}
        <section aria-labelledby="metrics-panel-title" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="metrics-panel-title" className="text-sm font-bold uppercase tracking-wider text-neutral-500">
              2. Live Usage Today
            </h2>
            <span className="text-[11px] text-neutral-400">GET /api/analytics/live</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {/* 2.1 Uploads Processed Today */}
            <div className="border border-neutral-200 rounded-[24px] p-4 sm:p-5 bg-white shadow-sm hover:border-neutral-300 transition-colors">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                Uploads Processed
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-black">
                {liveMetrics ? liveMetrics.uploadsToday : (loading ? '—' : '0')}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Total audio jobs today
              </div>
            </div>

            {/* 2.2 Success vs Failure */}
            <div className="border border-neutral-200 rounded-[24px] p-4 sm:p-5 bg-white shadow-sm hover:border-neutral-300 transition-colors">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                Outcomes
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-black flex items-baseline gap-1.5">
                <span>{liveMetrics ? liveMetrics.successToday : '0'}</span>
                <span className="text-xs font-semibold text-neutral-400">
                  / {liveMetrics ? liveMetrics.failureToday : '0'} fail
                </span>
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                {successPercent}% success rate
              </div>
            </div>

            {/* 2.3 Speech Engine Split */}
            <div className="border border-neutral-200 rounded-[24px] p-4 sm:p-5 bg-white shadow-sm hover:border-neutral-300 transition-colors">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                Engine Split
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-black space-y-0.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-neutral-500 font-medium">Whisper:</span>
                  <span className="font-bold">{liveMetrics?.engineSplit?.whisper || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-neutral-500 font-medium">Griot:</span>
                  <span className="font-bold">{liveMetrics?.engineSplit?.griot || 0}</span>
                </div>
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Dual-engine distribution
              </div>
            </div>

            {/* 2.4 Signups + Logins */}
            <div className="border border-neutral-200 rounded-[24px] p-4 sm:p-5 bg-white shadow-sm hover:border-neutral-300 transition-colors">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                User Activity
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-black flex items-baseline gap-1.5">
                <span>{liveMetrics ? (liveMetrics.signupsToday + liveMetrics.loginsToday) : '0'}</span>
                <span className="text-xs font-medium text-neutral-400">events</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                {liveMetrics?.signupsToday || 0} signups • {liveMetrics?.loginsToday || 0} logins
              </div>
            </div>

            {/* 2.5 Trial Uploads Used */}
            <div className="sm:col-span-2 lg:col-span-1 border border-neutral-200 rounded-[24px] p-4 sm:p-5 bg-white shadow-sm hover:border-neutral-300 transition-colors">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                Trial Uploads
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-black">
                {liveMetrics ? liveMetrics.trialUploadsToday : (loading ? '—' : '0')}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Anonymous trial conversions
              </div>
            </div>
          </div>
        </section>

        {/* ─── PANEL 3: ANONYMOUS ACTIVITY STREAM (POLLS /api/analytics/stream) */}
        <section aria-labelledby="stream-panel-title" className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 id="stream-panel-title" className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                3. Anonymous Activity Stream
              </h2>
              <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-semibold">
                Last {streamEvents.length} events
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <span>🔒 Zero-Content & Zero-Identity Firehose</span>
            </div>
          </div>

          <div className="border border-neutral-200 rounded-[28px] bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[460px] sm:min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-12 px-4 sm:px-5 py-3 bg-neutral-50/80 border-b border-neutral-200/80 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <div className="col-span-5 sm:col-span-4">Event Type</div>
                  <div className="col-span-4 sm:col-span-5">Route Target</div>
                  <div className="col-span-3 text-right">Timestamp</div>
                </div>

                {/* Event List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-100 font-mono text-xs">
                  {streamEvents.length > 0 ? (
                    streamEvents.map((ev, index) => {
                      let badgeStyle = 'bg-neutral-100 text-neutral-800'
                      if (ev.event_name?.includes('signup')) badgeStyle = 'bg-emerald-100 text-emerald-800 font-semibold'
                      if (ev.event_name?.includes('login')) badgeStyle = 'bg-blue-100 text-blue-800'
                      if (ev.event_name?.includes('upload_completed')) badgeStyle = 'bg-black text-white font-semibold'
                      if (ev.event_name?.includes('upload_failed')) badgeStyle = 'bg-red-100 text-red-800 font-semibold'
                      if (ev.event_name?.includes('griot')) badgeStyle = 'bg-amber-100 text-amber-900'

                      return (
                        <div
                          key={`${ev.created_at}-${index}`}
                          className="grid grid-cols-12 px-4 sm:px-5 py-3 items-center hover:bg-neutral-50/60 transition-colors"
                        >
                          {/* Event Name */}
                          <div className="col-span-5 sm:col-span-4 flex items-center gap-2 truncate pr-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans tracking-wide truncate ${badgeStyle}`}>
                              {ev.event_name}
                            </span>
                          </div>

                          {/* Route */}
                          <div className="col-span-4 sm:col-span-5 text-neutral-600 truncate pr-2 font-mono text-[11px]">
                            {ev.route || '/'}
                          </div>

                          {/* Time */}
                          <div className="col-span-3 text-right text-neutral-400 font-sans text-[11px] truncate">
                            {formatTimeAgo(ev.created_at)}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="py-12 text-center text-neutral-400 text-xs font-sans">
                      {loading ? 'Connecting to activity stream…' : 'No recent operational events recorded today yet.'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stream Footer Notice */}
            <div className="px-4 sm:px-5 py-3 bg-neutral-50 border-t border-neutral-200/80 text-[11px] text-neutral-500 font-sans flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
              <span>Displaying raw anonymous stream — strictly excluded: anon tokens, IDs, emails, IP addresses & transcripts.</span>
              <span className="font-semibold text-black shrink-0">Privacy Verified ✓</span>
            </div>
          </div>
        </section>
      </main>

      <Footer onNavigate={onNavigate} onOpenInfo={onOpenInfo} />
    </div>
  )
}
