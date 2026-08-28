/**
 * services/auth.js — Authentication utilities, password hashing, and JWT tokens
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'lecturescribe_jwt_secret_default_key_development'
const AUTH_COOKIE_NAME = 'lecture_auth_token'
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Hash a plain password with bcrypt.
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compare plain password against bcrypt hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a signed JWT for an authenticated user.
 * @param {Object} user
 * @param {string} user.id
 * @param {string} user.email
 * @param {string} [user.role='user']
 * @returns {string}
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

/**
 * Verify and decode a JWT token.
 * @param {string} token
 * @returns {Object|null}
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

/**
 * Set secure HTTP-only authentication cookie on response.
 * @param {import('express').Response} res
 * @param {string} token
 */
export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  })
}

/**
 * Clear authentication cookie on logout.
 * @param {import('express').Response} res
 */
export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}

/**
 * Express middleware to attach user to request if authenticated.
 */
export function authenticateOptional(req, _res, next) {
  const token =
    req.cookies?.[AUTH_COOKIE_NAME] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '')

  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      req.user = decoded
    }
  }

  next()
}

/**
 * Express middleware requiring general authentication.
 */
export function requireAuth(req, res, next) {
  const token =
    req.cookies?.[AUTH_COOKIE_NAME] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '')

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' })
  }

  req.user = decoded
  next()
}

/**
 * Express middleware requiring administrator role ('admin').
 * Rejects non-admin or unauthenticated requests with 401 or 403.
 */
export function requireAdmin(req, res, next) {
  const token =
    req.cookies?.[AUTH_COOKIE_NAME] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '')

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in as admin.' })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' })
  }

  req.user = decoded

  if (decoded.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: Administrator privileges required.',
      code: 'FORBIDDEN_NOT_ADMIN',
    })
  }

  next()
}

