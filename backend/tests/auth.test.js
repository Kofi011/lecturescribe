/**
 * tests/auth.test.js — Unit and integration tests for auth service & routes
 */

import { hashPassword, comparePassword, generateToken, verifyToken } from '../src/services/auth.js'

export async function runAuthTests() {
  console.log('[TEST] Auth Service: Password Hashing & JWT Validation...')

  // 1. Password Hashing
  const rawPass = 'SecretPassword123!'
  const hashed = await hashPassword(rawPass)
  const isMatch = await comparePassword(rawPass, hashed)
  const isWrong = await comparePassword('WrongPassword', hashed)

  if (!isMatch || isWrong) {
    throw new Error('Auth test failed: Password hashing or comparison mismatch')
  }

  // 2. JWT Generation & Verification
  const mockUser = { id: 'usr_test_123', email: 'student@university.edu', role: 'user' }
  const token = generateToken(mockUser)
  const decoded = verifyToken(token)

  if (!decoded || decoded.id !== mockUser.id || decoded.email !== mockUser.email) {
    throw new Error('Auth test failed: JWT encoding/decoding mismatch')
  }

  // 3. Admin Token Verification
  const adminUser = { id: 'admin_123', email: 'admin@edu.tech', role: 'admin' }
  const adminToken = generateToken(adminUser)
  const adminDecoded = verifyToken(adminToken)
  if (adminDecoded?.role !== 'admin') {
    throw new Error('Auth test failed: Admin role mismatch')
  }

  console.log('✓ Auth Service tests passed successfully.')
}
