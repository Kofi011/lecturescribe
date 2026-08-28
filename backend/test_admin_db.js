/**
 * test_admin_db.js — Test DB schema role column, setUserRole, analytics logging, and stream privacy
 */

import { initDb, createUser, findUserByEmail, setUserRole, logAnalyticsEvent, getLiveAnalyticsToday, getAnalyticsStream } from './src/db/index.js'

async function run() {
  console.log('--- Testing DB Role & Analytics ---')
  await initDb()

  const testEmail = `admin_test_${Date.now()}@lecturescribe.local`
  const user = await createUser({
    email: testEmail,
    password_hash: 'hashed_password_dummy',
  })
  console.log('Created user with default role:', user.role)
  if (user.role !== 'user') throw new Error('Default role should be user')

  const promoted = await setUserRole(testEmail, 'admin')
  console.log('Promoted user role:', promoted?.role)
  if (promoted?.role !== 'admin') throw new Error('Role update failed')

  const fetched = await findUserByEmail(testEmail)
  if (fetched?.role !== 'admin') throw new Error('Fetched user role is not admin')

  // Log some test analytics events
  await logAnalyticsEvent({
    event_name: 'user_signup',
    route: '/api/auth/signup',
    anon_session_token: 'secret_token_123',
    metadata: { sensitive: 'should_never_leak' },
  })

  await logAnalyticsEvent({
    event_name: 'upload_completed',
    route: '/api/upload',
    anon_session_token: 'secret_token_456',
    metadata: { engine: 'groq-whisper', is_trial: true },
  })

  const live = await getLiveAnalyticsToday()
  console.log('Live Analytics Today:', live)
  if (live.uploadsToday < 1) throw new Error('Uploads today should be >= 1')
  if (live.signupsToday < 1) throw new Error('Signups today should be >= 1')

  const stream = await getAnalyticsStream(5)
  console.log('Analytics Stream (last 5):', stream)
  if (!stream.length) throw new Error('Stream should have items')

  // CRITICAL PRIVACY CHECK
  for (const item of stream) {
    if (item.anon_session_token !== undefined) throw new Error('PRIVACY VIOLATION: anon_session_token present in stream item')
    if (item.metadata !== undefined) throw new Error('PRIVACY VIOLATION: metadata present in stream item')
    if (item.email !== undefined) throw new Error('PRIVACY VIOLATION: email present in stream item')
    if (item.id !== undefined) throw new Error('PRIVACY VIOLATION: id present in stream item')
    if (!item.event_name || !item.created_at) throw new Error('Stream item missing required fields')
  }

  console.log('✓ All DB role and privacy stream tests passed successfully!')
}

run().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
