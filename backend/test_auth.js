/**
 * test_auth.js — Automated test suite for authentication endpoints
 */

import { initDb } from './src/db/index.js'
import { hashPassword, comparePassword, generateToken, verifyToken } from './src/services/auth.js'

const BASE_URL = 'http://localhost:5000'

async function runAuthTests() {
  console.log('=== Starting Auth Service Unit & Integration Tests ===\n')

  // 1. Test Auth Service Unit Helpers
  console.log('1. Testing Password Hashing & Verification...')
  const rawPass = 'SecretPassword123!'
  const hashed = await hashPassword(rawPass)
  const isMatch = await comparePassword(rawPass, hashed)
  const isWrong = await comparePassword('WrongPassword', hashed)

  if (!isMatch || isWrong) {
    throw new Error('Unit test failed: Password hashing or comparison mismatch')
  }
  console.log('✓ Password hashing and verification passed\n')

  console.log('2. Testing JWT Generation & Verification...')
  const mockUser = { id: 'usr_test_123', email: 'student@university.edu' }
  const token = generateToken(mockUser)
  const decoded = verifyToken(token)

  if (!decoded || decoded.id !== mockUser.id || decoded.email !== mockUser.email) {
    throw new Error('Unit test failed: JWT encoding/decoding mismatch')
  }
  console.log('✓ JWT token generation and verification passed\n')

  // 2. Test HTTP API Endpoints
  const testEmail = `student_${Date.now()}@university.edu`
  const testPass = 'SecurePass456!'

  console.log(`3. Testing POST /api/auth/signup (${testEmail})...`)
  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPass }),
  })
  const signupData = await signupRes.json()

  if (!signupRes.ok || signupData.status !== 'ok' || signupData.user?.email !== testEmail) {
    throw new Error(`Signup failed (${signupRes.status}): ${JSON.stringify(signupData)}`)
  }
  console.log('✓ User signup succeeded:', signupData.user)

  // 4. Test Duplicate Email Prevention
  console.log('4. Testing Duplicate Email Prevention...')
  const dupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPass }),
  })
  if (dupRes.status !== 409) {
    throw new Error(`Expected status 409 for duplicate email, got ${dupRes.status}`)
  }
  console.log('✓ Duplicate email rejected with status 409\n')

  // 5. Test Invalid Login
  console.log('5. Testing Invalid Password Login...')
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'IncorrectPassword' }),
  })
  if (badLoginRes.status !== 401) {
    throw new Error(`Expected status 401 for incorrect password, got ${badLoginRes.status}`)
  }
  console.log('✓ Invalid login rejected with status 401\n')

  // 6. Test Valid Login
  console.log('6. Testing Valid Login...')
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPass }),
  })
  const loginData = await loginRes.json()

  if (!loginRes.ok || loginData.status !== 'ok' || !loginData.token) {
    throw new Error(`Login failed (${loginRes.status}): ${JSON.stringify(loginData)}`)
  }
  console.log('✓ Valid login succeeded, token received\n')

  // 7. Test Protected Route GET /api/auth/me
  console.log('7. Testing Protected GET /api/auth/me...')
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${loginData.token}` },
  })
  const meData = await meRes.json()

  if (!meRes.ok || meData.user?.email !== testEmail) {
    throw new Error(`GET /api/auth/me failed (${meRes.status}): ${JSON.stringify(meData)}`)
  }
  console.log('✓ Protected /api/auth/me returned user profile:', meData.user, '\n')

  // 8. Test Logout
  console.log('8. Testing POST /api/auth/logout...')
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST' })
  const logoutData = await logoutRes.json()

  if (!logoutRes.ok || logoutData.status !== 'ok') {
    throw new Error(`Logout failed (${logoutRes.status}): ${JSON.stringify(logoutData)}`)
  }
  console.log('✓ Logout endpoint succeeded\n')

  console.log('=== All 8 Authentication Tests Passed 100% ===')
}

runAuthTests().catch((err) => {
  console.error('✗ Auth Test Suite Error:', err.message)
  process.exit(1)
})
