/**
 * test_admin_suite.js — Full integration test for Admin Dashboard backend endpoints
 */

import express from 'express'
import cookieParser from 'cookie-parser'
import { generateToken, authenticateOptional } from './src/services/auth.js'
import { initDb, logAnalyticsEvent, isDbHealthy } from './src/db/index.js'
import analyticsRouter from './src/routes/analytics.js'
import { checkGriotHealth } from './src/services/transcribe.js'

async function run() {
  console.log('--- Starting Admin Dashboard Backend Integration Suite ---')
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
    const regularToken = generateToken({ id: 'u_student_1', email: 'student@uni.edu', role: 'user' })
    const adminToken = generateToken({ id: 'u_admin_1', email: 'admin@lecturescribe.io', role: 'admin' })

    // Test 1: Health endpoint
    console.log('1. Testing GET /api/health...')
    const healthRes = await fetch(`${baseUrl}/api/health`)
    if (!healthRes.ok) throw new Error(`Health check failed: ${healthRes.status}`)
    const healthData = await healthRes.json()
    console.log('Health response:', healthData)
    if (healthData.services?.api !== 'healthy') throw new Error('API service status should be healthy')
    if (!healthData.timestamp) throw new Error('Health check missing timestamp')

    // Seed some live events
    await logAnalyticsEvent({
      event_name: 'upload_completed',
      route: '/api/upload',
      anon_session_token: 'secret_anon_token_123',
      metadata: { engine: 'groq-whisper', is_trial: true, sensitive_transcript: 'private lecture' },
    })
    await logAnalyticsEvent({
      event_name: 'user_login',
      route: '/api/auth/login',
      anon_session_token: 'secret_anon_token_456',
      metadata: { user_id: 'u_student_1' },
    })

    // Test 2: GET /api/analytics/live without auth -> 401
    console.log('2. Testing GET /api/analytics/live (Unauthenticated)...')
    const unauthLive = await fetch(`${baseUrl}/api/analytics/live`)
    if (unauthLive.status !== 401) throw new Error(`Expected 401, got ${unauthLive.status}`)

    // Test 3: GET /api/analytics/live with regular user -> 403
    console.log('3. Testing GET /api/analytics/live (Regular User)...')
    const userLive = await fetch(`${baseUrl}/api/analytics/live`, {
      headers: { Authorization: `Bearer ${regularToken}` },
    })
    if (userLive.status !== 403) throw new Error(`Expected 403, got ${userLive.status}`)

    // Test 4: GET /api/analytics/live with admin -> 200
    console.log('4. Testing GET /api/analytics/live (Admin)...')
    const adminLive = await fetch(`${baseUrl}/api/analytics/live`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    if (adminLive.status !== 200) throw new Error(`Expected 200, got ${adminLive.status}`)
    const liveData = await adminLive.json()
    console.log('Live metrics received:', liveData)
    if (typeof liveData.uploadsToday !== 'number') throw new Error('uploadsToday must be a number')
    if (typeof liveData.engineSplit?.whisper !== 'number') throw new Error('engineSplit.whisper must be a number')
    if (typeof liveData.engineSplit?.griot !== 'number') throw new Error('engineSplit.griot must be a number')

    // Test 5: GET /api/analytics/stream without auth -> 401
    console.log('5. Testing GET /api/analytics/stream (Unauthenticated)...')
    const unauthStream = await fetch(`${baseUrl}/api/analytics/stream`)
    if (unauthStream.status !== 401) throw new Error(`Expected 401, got ${unauthStream.status}`)

    // Test 6: GET /api/analytics/stream with regular user -> 403
    console.log('6. Testing GET /api/analytics/stream (Regular User)...')
    const userStream = await fetch(`${baseUrl}/api/analytics/stream`, {
      headers: { Authorization: `Bearer ${regularToken}` },
    })
    if (userStream.status !== 403) throw new Error(`Expected 403, got ${userStream.status}`)

    // Test 7: GET /api/analytics/stream with admin -> 200 and PRIVACY VALIDATION
    console.log('7. Testing GET /api/analytics/stream (Admin) & Privacy Guarantees...')
    const adminStream = await fetch(`${baseUrl}/api/analytics/stream?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    if (adminStream.status !== 200) throw new Error(`Expected 200, got ${adminStream.status}`)
    const streamData = await adminStream.json()
    console.log(`Stream received with ${streamData.events?.length} events:`, streamData.events)

    if (!Array.isArray(streamData.events)) throw new Error('events must be an array')
    if (streamData.events.length === 0) throw new Error('events array is unexpectedly empty')

    for (const ev of streamData.events) {
      // Must contain event_name, route, created_at
      if (!ev.event_name) throw new Error('Event missing event_name')
      if (ev.route === undefined) throw new Error('Event missing route')
      if (!ev.created_at) throw new Error('Event missing created_at')

      // MUST NOT contain any sensitive or identifying properties
      if ('anon_session_token' in ev) throw new Error('PRIVACY VIOLATION: anon_session_token in stream item')
      if ('metadata' in ev) throw new Error('PRIVACY VIOLATION: metadata in stream item')
      if ('user_id' in ev) throw new Error('PRIVACY VIOLATION: user_id in stream item')
      if ('email' in ev) throw new Error('PRIVACY VIOLATION: email in stream item')
      if ('id' in ev) throw new Error('PRIVACY VIOLATION: id in stream item')
      if ('transcript' in ev) throw new Error('PRIVACY VIOLATION: transcript in stream item')
    }

    console.log('✓ All Admin Dashboard Backend Integration Tests passed successfully!')
  } finally {
    server.close()
  }
}

run().catch((err) => {
  console.error('Test Suite Failed:', err)
  process.exit(1)
})
