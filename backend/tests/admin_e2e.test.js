/**
 * tests/admin_e2e.test.js — End-to-End Acceptance Tests for Admin Dashboard & Privacy
 */

import express from 'express'
import cookieParser from 'cookie-parser'
import { generateToken, authenticateOptional } from '../src/services/auth.js'
import { initDb, isDbHealthy, getLiveAnalyticsToday, getAnalyticsStream } from '../src/db/index.js'
import analyticsRouter from '../src/routes/analytics.js'
import { checkGriotHealth } from '../src/services/transcribe.js'

export async function runAdminE2ETests() {
  console.log('[TEST] Admin Dashboard E2E: Access Control, Privacy & Dynamic Telemetry...')

  await initDb()

  const app = express()
  app.use(express.json())
  app.use(cookieParser('test_secret'))
  app.use(authenticateOptional)

  app.get('/api/health', async (_req, res) => {
    const dbHealthy = await isDbHealthy()
    const griotStatus = await checkGriotHealth()
    res.json({
      status: 'ok',
      services: {
        api: 'healthy',
        db: dbHealthy ? 'healthy' : 'degraded',
        griot_sidecar: griotStatus,
      },
    })
  })

  app.use('/api/analytics', analyticsRouter)

  const server = app.listen(0)
  const port = server.address().port
  const baseUrl = `http://localhost:${port}`

  try {
    const adminToken = generateToken({ id: 'admin_test', email: 'admin@edu.tech', role: 'admin' })
    const userToken = generateToken({ id: 'user_test', email: 'student@edu.tech', role: 'user' })

    // Test 1: 403 Forbidden for Non-Admin
    const unauthRes = await fetch(`${baseUrl}/api/analytics/live`)
    if (unauthRes.status !== 401 && unauthRes.status !== 403) {
      throw new Error(`Expected 401/403 for unauthenticated analytics access, got ${unauthRes.status}`)
    }

    const userRes = await fetch(`${baseUrl}/api/analytics/live`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })
    if (userRes.status !== 403) {
      throw new Error(`Expected 403 for student accessing admin live analytics, got ${userRes.status}`)
    }

    // Test 2: Admin Access & Privacy Guarantee
    const adminRes = await fetch(`${baseUrl}/api/analytics/stream?limit=20`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    if (!adminRes.ok) {
      throw new Error(`Admin failed to fetch analytics stream: ${adminRes.status}`)
    }

    const streamData = await adminRes.json()
    const events = streamData.events || []

    const FORBIDDEN_FIELDS = ['anon_session_token', 'transcript', 'notes_markdown', 'email', 'name', 'ip']
    for (const evt of events) {
      for (const field of FORBIDDEN_FIELDS) {
        if (evt[field] !== undefined) {
          throw new Error(`Privacy violation: forbidden field "${field}" leaked in admin stream`)
        }
      }
    }

    console.log('✓ Admin Dashboard E2E tests passed successfully.')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}
