/**
 * routes/auth.js — Authentication endpoints (Signup, Login, Logout, Current User)
 */

import express from 'express'
import { findUserByEmail, findUserById, createUser, logAnalyticsEvent } from '../db/index.js'
import {
  hashPassword,
  comparePassword,
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
} from '../services/auth.js'

const router = express.Router()

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── POST /api/auth/signup ─────────────────────────────────────────
router.post('/signup', async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' })
  }

  try {
    const existing = await findUserByEmail(email)
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' })
    }

    const password_hash = await hashPassword(password)
    const user = await createUser({ email, password_hash, role: 'user' })

    // Log analytics event
    await logAnalyticsEvent({
      event_name: 'user_signup',
      route: '/api/auth/signup',
      anon_session_token: req.cookies?.lecture_trial_session || null,
    })

    const token = generateToken(user)
    setAuthCookie(res, token)

    return res.status(201).json({
      status: 'ok',
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        created_at: user.created_at,
      },
      token,
    })
  } catch (err) {
    console.error('[auth signup error]', err)
    return res.status(500).json({ error: 'Failed to create account. Please try again.' })
  }
})

// ─── POST /api/auth/login ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' })
  }

  try {
    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const isMatch = await comparePassword(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    // Log analytics event
    await logAnalyticsEvent({
      event_name: 'user_login',
      route: '/api/auth/login',
      anon_session_token: req.cookies?.lecture_trial_session || null,
    })

    const token = generateToken(user)
    setAuthCookie(res, token)

    return res.json({
      status: 'ok',
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        created_at: user.created_at,
      },
      token,
    })
  } catch (err) {
    console.error('[auth login error]', err)
    return res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

// ─── POST /api/auth/logout ─────────────────────────────────────────
router.post('/logout', (_req, res) => {
  clearAuthCookie(res)
  return res.json({ status: 'ok', message: 'Logged out successfully' })
})

// ─── GET /api/auth/me ──────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await findUserById(req.user.id)
    if (!user) {
      clearAuthCookie(res)
      return res.status(401).json({ error: 'User account not found.' })
    }

    return res.json({
      status: 'ok',
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        created_at: user.created_at,
      },
    })
  } catch (err) {
    console.error('[auth me error]', err)
    return res.status(500).json({ error: 'Failed to retrieve user profile.' })
  }
})

export default router
