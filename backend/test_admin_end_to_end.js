/**
 * test_admin_end_to_end.js — Comprehensive End-to-End Validation Suite for Admin Dashboard
 *
 * Tests:
 * 1. Non-admin 403 rejection on all admin endpoints
 * 2. Privacy structural guarantee (no token, email, transcript, metadata, or per-visitor trail in network responses)
 * 3. Live metrics dynamic reactivity (numbers reflect real events and increment live)
 */

import express from 'express'
import cookieParser from 'cookie-parser'
import { generateToken, authenticateOptional } from './src/services/auth.js'
import { initDb, logAnalyticsEvent, isDbHealthy, getLiveAnalyticsToday, getAnalyticsStream } from './src/db/index.js'
import analyticsRouter from './src/routes/analytics.js'
import { checkGriotHealth } from './src/services/transcribe.js'

async function run() {
  console.log('====================================================')
  console.log('  LectureScribe Admin Dashboard End-to-End Test Suite')
  console.log('====================================================\n')

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
      message: 'LectureScribe backend running',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        db: dbHealthy ? 'healthy' : 'disconnected',
        griot_sidecar: griotStatus,
      },
    })
  })

  app.use('/api/analytics', analyticsRouter)

  const server = app.listen(0)
  const port = server.address().port
  const baseUrl = `http://localhost:${port}`

  try {
    const studentUser = { id: 'usr_student_99', email: 'student99@university.edu', role: 'user' }
    const adminUser = { id: 'usr_admin_01', email: 'admin01@lecturescribe.io', role: 'admin' }

    const studentToken = generateToken(studentUser)
    const adminToken = generateToken(adminUser)

    // ─────────────────────────────────────────────────────────────────────────
    // TEST PHASE 1: Access Control & 403 Forbidden Verification (Task 9)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('[TEST 1] Verifying 403 / 401 Access Control on Admin Endpoints...')

    // 1.1 Unauthenticated requests
    const resUnauthLive = await fetch(`${baseUrl}/api/analytics/live`)
    if (resUnauthLive.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated /api/analytics/live, got ${resUnauthLive.status}`)
    }

    const resUnauthStream = await fetch(`${baseUrl}/api/analytics/stream`)
    if (resUnauthStream.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated /api/analytics/stream, got ${resUnauthStream.status}`)
    }

    // 1.2 Non-admin (role = 'user') requests
    const resStudentLive = await fetch(`${baseUrl}/api/analytics/live`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    if (resStudentLive.status !== 403) {
      throw new Error(`Expected 403 for student /api/analytics/live, got ${resStudentLive.status}`)
    }
    const studentLiveBody = await resStudentLive.json()
    if (studentLiveBody.code !== 'FORBIDDEN_NOT_ADMIN') {
      throw new Error(`Expected FORBIDDEN_NOT_ADMIN code, got: ${JSON.stringify(studentLiveBody)}`)
    }

    const resStudentStream = await fetch(`${baseUrl}/api/analytics/stream`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    if (resStudentStream.status !== 403) {
      throw new Error(`Expected 403 for student /api/analytics/stream, got ${resStudentStream.status}`)
    }

    console.log('✓ PASS: All non-admin requests are strictly rejected with 401/403.\n')

    // ─────────────────────────────────────────────────────────────────────────
    // TEST PHASE 2: Privacy Guarantee & Zero-Identity Network Audit (Task 10)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('[TEST 2] Verifying Privacy Guarantees in Admin Network Responses...')

    // Seed events containing confidential and identifying data in backend
    await logAnalyticsEvent({
      event_name: 'upload_completed',
      route: '/api/upload',
      anon_session_token: 'SUPER_SECRET_SESSION_TOKEN_ABC123',
      metadata: {
        transcript: 'Prof. Alan Turing on Computational Machinery and Intelligence',
        student_email: 'private_student@university.edu',
        student_ip: '192.168.1.100',
        engine: 'groq-whisper',
      },
    })

    const resAdminStream = await fetch(`${baseUrl}/api/analytics/stream?limit=20`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    if (resAdminStream.status !== 200) {
      throw new Error(`Expected 200 for admin /api/analytics/stream, got ${resAdminStream.status}`)
    }

    const streamBody = await resAdminStream.json()
    const rawResponseText = JSON.stringify(streamBody)

    // Structural privacy inspection: check raw response text
    const forbiddenKeywords = [
      'SUPER_SECRET_SESSION_TOKEN',
      'Alan Turing',
      'Computational Machinery',
      'private_student@university.edu',
      '192.168.1.100',
      'anon_session_token',
      'metadata',
      '"transcript":',
      '"password":',
      '"user_id":',
    ]

    for (const keyword of forbiddenKeywords) {
      if (rawResponseText.includes(keyword)) {
        throw new Error(`CRITICAL PRIVACY VIOLATION: Keyword "${keyword}" found in admin stream network payload!`)
      }
    }

    // Verify object structure
    for (const item of streamBody.events) {
      const allowedKeys = ['event_name', 'route', 'created_at']
      const itemKeys = Object.keys(item)
      for (const key of itemKeys) {
        if (!allowedKeys.includes(key)) {
          throw new Error(`PRIVACY VIOLATION: Unexpected key "${key}" found in stream event item: ${JSON.stringify(item)}`)
        }
      }
    }

    console.log(`✓ PASS: Verified ${streamBody.events.length} stream events. Zero personal identities, tokens, or transcripts leaked.\n`)

    // ─────────────────────────────────────────────────────────────────────────
    // TEST PHASE 3: Real Numbers & Dynamic State Updates (Task 11)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('[TEST 3] Verifying Live Metrics Dynamic Reactivity...')

    // 3.1 Initial baseline
    const resInitial = await fetch(`${baseUrl}/api/analytics/live`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const metricsInitial = await resInitial.json()
    console.log('Initial metrics baseline:', {
      uploads: metricsInitial.uploadsToday,
      success: metricsInitial.successToday,
      griot: metricsInitial.engineSplit.griot,
    })

    // 3.2 Trigger real operational events
    console.log('Triggering new Griot transcription and upload completion...')
    await logAnalyticsEvent({
      event_name: 'upload_completed',
      route: '/api/upload',
      anon_session_token: 'token_xyz',
      metadata: { engine: 'griot-nano-1', is_trial: true },
    })
    await logAnalyticsEvent({
      event_name: 'transcription_griot',
      route: '/api/upload',
      metadata: { engine: 'griot-nano-1' },
    })
    await logAnalyticsEvent({
      event_name: 'user_signup',
      route: '/api/auth/signup',
    })

    // 3.3 Re-fetch live metrics
    const resUpdated = await fetch(`${baseUrl}/api/analytics/live`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const metricsUpdated = await resUpdated.json()
    console.log('Updated metrics received:', {
      uploads: metricsUpdated.uploadsToday,
      success: metricsUpdated.successToday,
      griot: metricsUpdated.engineSplit.griot,
      signups: metricsUpdated.signupsToday,
      trialUploads: metricsUpdated.trialUploadsToday,
    })

    if (metricsUpdated.uploadsToday !== metricsInitial.uploadsToday + 1) {
      throw new Error(`Uploads count did not increment. Expected ${metricsInitial.uploadsToday + 1}, got ${metricsUpdated.uploadsToday}`)
    }
    if (metricsUpdated.successToday !== metricsInitial.successToday + 1) {
      throw new Error(`Success count did not increment. Expected ${metricsInitial.successToday + 1}, got ${metricsUpdated.successToday}`)
    }
    if (metricsUpdated.engineSplit.griot <= metricsInitial.engineSplit.griot) {
      throw new Error(`Griot engine split count did not increment.`)
    }
    if (metricsUpdated.signupsToday <= metricsInitial.signupsToday) {
      throw new Error(`Signups count did not increment.`)
    }

    console.log('✓ PASS: Live metrics accurately updated in real time as events occurred.\n')

    console.log('====================================================')
    console.log('  ALL END-TO-END ACCEPTANCE TESTS PASSED (100% OK) ')
    console.log('====================================================')
  } finally {
    server.close()
  }
}

run().catch((err) => {
  console.error('End-to-End Test Suite Failed:', err)
  process.exit(1)
})
