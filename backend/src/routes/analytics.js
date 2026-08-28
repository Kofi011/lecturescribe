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
import { getLiveAnalyticsToday, getAnalyticsStream } from '../db/index.js'

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

export default router
