/**
 * test_db.js — Verify database initialization and user repository operations
 */

import { initDb, createUser, findUserByEmail, findUserById } from './src/db/index.js'
import bcrypt from 'bcryptjs'

async function runTest() {
  console.log('--- Testing Database Initialization ---')
  await initDb()

  const testEmail = `test_${Date.now()}@example.com`
  const passwordHash = await bcrypt.hash('TestPassword123!', 10)

  console.log(`Creating test user: ${testEmail}`)
  const created = await createUser({ email: testEmail, password_hash: passwordHash })
  console.log('Created user:', created)

  if (!created?.id || created.email !== testEmail) {
    throw new Error('User creation failed or returned invalid data')
  }

  console.log(`Querying user by email: ${testEmail}`)
  const foundByEmail = await findUserByEmail(testEmail)
  console.log('Found by email:', foundByEmail ? { id: foundByEmail.id, email: foundByEmail.email } : null)

  if (!foundByEmail || foundByEmail.id !== created.id) {
    throw new Error('Find by email failed')
  }

  console.log(`Querying user by ID: ${created.id}`)
  const foundById = await findUserById(created.id)
  console.log('Found by ID:', foundById)

  if (!foundById || foundById.email !== testEmail) {
    throw new Error('Find by ID failed')
  }

  console.log('✓ All database operations passed successfully!')
}

runTest().catch((err) => {
  console.error('✗ DB Test failed:', err)
  process.exit(1)
})
