/**
 * routes/analytics.js — Admin Operational Analytics & Activity Stream Endpoints
 *
 * Design Principle:
 * The dashboard shows OPERATIONAL REALITY, never USER CONTENT or IDENTITY:
 * - Aggregate counts and live system status
 * - Anonymous event stream (event_name + route + created_at ONLY)
 * - anon_session_token, user_id, emails, transcripts, IP addresses, and metadata
 *   are STRUCTURALLY EXCLUDED from all responses.
 */

import express from 'express'
import { requireAdmin } from '../services/auth.js'
import { getLiveAnalyticsToday, getAnalyticsStream, logAnalyticsEvent } from '../db/index.js'

const router = express.Router()

// ─── GET /api/analytics/live ───────────────────────────────────────
// Returns today's live aggregate operational metrics (admin only)
router.get('/live', requireAdmin, async (_req, res) => {
  try {
    const liveMetrics = await getLiveAnalyticsToday()
    return res.json({
      status: 'ok',
      ...liveMetrics,
    })
  } catch (err) {
    console.error('[analytics live error]', err)
    return res.status(500).json({ error: 'Failed to retrieve live operational metrics.' })
  }
})

// ─── GET /api/analytics/stream ─────────────────────────────────────
// Returns the last ~50 events (event_name + route + created_at only) (admin only)
router.get('/stream', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10)
    const stream = await getAnalyticsStream(limit)

    // Structural safeguard: double-check that only anonymous stream fields are returned
    const sanitizedStream = stream.map((item) => ({
      event_name: item.event_name,
      route: item.route || '',
      created_at: item.created_at,
    }))

    return res.json({
      status: 'ok',
      count: sanitizedStream.length,
      events: sanitizedStream,
    })
  } catch (err) {
    console.error('[analytics stream error]', err)
    return res.status(500).json({ error: 'Failed to retrieve activity stream.' })
  }
})

// ─── POST /api/analytics/event ────────────────────────────────────
// Ingest client-side operational event (e.g. page navigation, sample demo)
router.post('/event', async (req, res) => {
  const { event_name, route } = req.body || {}
  if (!event_name || typeof event_name !== 'string') {
    return res.status(400).json({ error: 'event_name is required' })
  }

  // Filter allowed public event names to avoid arbitrary junk
  const cleanEvent = event_name.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50)
  const cleanRoute = (route || '').substring(0, 100)

  try {
    await logAnalyticsEvent({
      event_name: cleanEvent,
      route: cleanRoute,
      anon_session_token: req.cookies?.lecture_trial_session || null,
    })
    return res.json({ status: 'ok' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

export default router
