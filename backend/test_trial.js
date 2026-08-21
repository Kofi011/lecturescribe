/**
 * test_trial.js — Automated test suite for 3-trial tracking & gating
 */

import { getTrialStatus, incrementTrial, MAX_FREE_TRIALS } from './src/services/trial.js'
import { generateToken } from './src/services/auth.js'

const BASE_URL = 'http://localhost:5000'

async function runTrialTests() {
  console.log('=== Starting Trial Service Unit & Integration Tests ===\n')

  // 1. Unit test: Fresh anonymous request
  console.log('1. Testing Fresh Anonymous Status...')
  const mockReqFresh = { cookies: {}, signedCookies: {} }
  const statusFresh = getTrialStatus(mockReqFresh)
  if (statusFresh.trialsUsed !== 0 || statusFresh.trialsRemaining !== 3 || !statusFresh.canUpload) {
    throw new Error(`Unit test failed on fresh trial status: ${JSON.stringify(statusFresh)}`)
  }
  console.log('✓ Fresh anonymous status has 3 remaining trials\n')

  // 2. Unit test: Authenticated user status bypass
  console.log('2. Testing Authenticated User Status...')
  const mockReqAuth = { user: { id: 'usr_1', email: 'user@test.com' } }
  const statusAuth = getTrialStatus(mockReqAuth)
  if (!statusAuth.isAuthenticated || !statusAuth.canUpload || statusAuth.trialsRemaining !== Infinity) {
    throw new Error(`Unit test failed on auth trial status: ${JSON.stringify(statusAuth)}`)
  }
  console.log('✓ Authenticated user has unlimited trials\n')

  // 3. Unit test: Cookie parsing with 3 used trials
  console.log('3. Testing Cookie Parsing for Exhausted Trials...')
  const mockReqExhausted = { signedCookies: { lecture_trial_session: { count: 3 } } }
  const statusExhausted = getTrialStatus(mockReqExhausted)
  if (statusExhausted.canUpload || statusExhausted.trialsRemaining !== 0) {
    throw new Error(`Unit test failed on exhausted trial status: ${JSON.stringify(statusExhausted)}`)
  }
  console.log('✓ Exhausted trial status correctly reports canUpload: false\n')

  // 4. Integration test: GET /api/trial-status endpoint
  console.log('4. Testing GET /api/trial-status endpoint...')
  const statusRes = await fetch(`${BASE_URL}/api/trial-status`)
  const statusData = await statusRes.json()

  if (!statusRes.ok || statusData.status !== 'ok' || typeof statusData.trialsRemaining !== 'number') {
    throw new Error(`GET /api/trial-status failed (${statusRes.status}): ${JSON.stringify(statusData)}`)
  }
  console.log('✓ Endpoint returned valid trial status payload:', statusData, '\n')

  // 5. Integration test: Authenticated trial status via Bearer Token
  console.log('5. Testing Authenticated GET /api/trial-status...')
  const testToken = generateToken({ id: 'usr_premium_1', email: 'premium@university.edu' })
  const authStatusRes = await fetch(`${BASE_URL}/api/trial-status`, {
    headers: { Authorization: `Bearer ${testToken}` },
  })
  const authStatusData = await authStatusRes.json()

  if (!authStatusRes.ok || !authStatusData.isAuthenticated) {
    throw new Error(`Authenticated status check failed: ${JSON.stringify(authStatusData)}`)
  }
  console.log('✓ Authenticated trial status returned unlimited access:', authStatusData, '\n')

  console.log('=== All Trial Service Tests Passed 100% ===')
}

runTrialTests().catch((err) => {
  console.error('✗ Trial Test Suite Error:', err.message)
  process.exit(1)
})
