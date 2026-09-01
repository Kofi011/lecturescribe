/**
 * tests/db.test.js — Database layer persistence tests (Postgres & Local JSON fallback)
 */

import { initDb, findUserByEmail, isDbHealthy, logAnalyticsEvent, getLiveAnalyticsToday } from '../src/db/index.js'

export async function runDbTests() {
  console.log('[TEST] Database Layer: Connection, Seeding & Storage...')

  await initDb()

  const healthy = await isDbHealthy()
  if (!healthy) {
    throw new Error('Database health check failed')
  }

  // Verify Default Admin Seed
  const admin = await findUserByEmail('admin@edu.tech')
  if (!admin || admin.role !== 'admin') {
    throw new Error('Default admin account (admin@edu.tech) was not seeded properly')
  }

  // Verify Analytics Logging
  await logAnalyticsEvent({
    event_name: 'test_db_event',
    route: '/test',
  })

  const live = await getLiveAnalyticsToday()
  if (typeof live !== 'object') {
    throw new Error('Failed to retrieve live analytics summary')
  }

  console.log('✓ Database Layer tests passed successfully.')
}
