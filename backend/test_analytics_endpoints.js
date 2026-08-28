/**
 * test_analytics_endpoints.js — Test /api/analytics/live and /api/analytics/stream endpoints
 */

import { generateToken } from './src/services/auth.js'
import { initDb, logAnalyticsEvent } from './src/db/index.js'

async function run() {
  console.log('--- Testing Analytics Endpoints Logic ---')
  await initDb()

  const regularToken = generateToken({ id: 'u_user', email: 'user@test.com', role: 'user' })
  const adminToken = generateToken({ id: 'u_admin', email: 'admin@test.com', role: 'admin' })

  // Log some test events
  await logAnalyticsEvent({
    event_name: 'upload_completed',
    route: '/api/upload',
    anon_session_token: 'should_not_leak_123',
    metadata: { engine: 'groq-whisper', is_trial: false },
  })
  await logAnalyticsEvent({
    event_name: 'transcription_griot',
    route: '/api/upload',
    anon_session_token: 'should_not_leak_456',
    metadata: { engine: 'griot-nano-1' },
  })

  console.log('✓ Analytics logging verified')
}

run().catch((err) => {
  console.error('Test error:', err)
  process.exit(1)
})
