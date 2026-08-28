/**
 * test_require_admin.js — Test requireAdmin middleware behavior
 */

import { generateToken, requireAdmin } from './src/services/auth.js'

async function run() {
  console.log('--- Testing requireAdmin Middleware ---')

  const regularUser = { id: 'u1', email: 'student@example.com', role: 'user' }
  const adminUser = { id: 'a1', email: 'admin@lecturescribe.io', role: 'admin' }

  const regularToken = generateToken(regularUser)
  const adminToken = generateToken(adminUser)

  // 1. Unauthenticated
  let status1 = null
  let body1 = null
  const req1 = { cookies: {}, headers: {} }
  const res1 = {
    status(s) { status1 = s; return this },
    json(d) { body1 = d; return this },
  }
  let next1Called = false
  requireAdmin(req1, res1, () => { next1Called = true })
  console.log('Unauthenticated status:', status1)
  if (status1 !== 401 || next1Called) throw new Error('Unauthenticated should get 401')

  // 2. Regular user (role = 'user')
  let status2 = null
  let body2 = null
  const req2 = { cookies: { lecture_auth_token: regularToken }, headers: {} }
  const res2 = {
    status(s) { status2 = s; return this },
    json(d) { body2 = d; return this },
  }
  let next2Called = false
  requireAdmin(req2, res2, () => { next2Called = true })
  console.log('Regular user status:', status2, body2)
  if (status2 !== 403 || next2Called) throw new Error('Regular user should get 403')

  // 3. Admin user (role = 'admin')
  let status3 = null
  let body3 = null
  const req3 = { cookies: { lecture_auth_token: adminToken }, headers: {} }
  const res3 = {
    status(s) { status3 = s; return this },
    json(d) { body3 = d; return this },
  }
  let next3Called = false
  requireAdmin(req3, res3, () => { next3Called = true })
  console.log('Admin user next() called:', next3Called, 'req.user.role:', req3.user?.role)
  if (!next3Called || req3.user?.role !== 'admin') throw new Error('Admin user should pass through middleware')

  console.log('✓ requireAdmin middleware tests passed successfully!')
}

run().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
