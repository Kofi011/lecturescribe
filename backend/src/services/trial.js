/**
 * services/trial.js — Anonymous user 3-trial tracking & signed session cookie gating
 */

export const TRIAL_COOKIE_NAME = 'lecture_trial_session'
export const MAX_FREE_TRIALS = 3
const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

/**
 * Extract current trial usage status from request.
 * @param {import('express').Request} req
 * @returns {{ isAuthenticated: boolean, trialsUsed: number, trialsRemaining: number, maxTrials: number, canUpload: boolean }}
 */
export function getTrialStatus(req) {
  // Authenticated users have unlimited access
  if (req.user) {
    return {
      isAuthenticated: true,
      trialsUsed: 0,
      trialsRemaining: Infinity,
      maxTrials: MAX_FREE_TRIALS,
      canUpload: true,
    }
  }

  // Check signed cookie first, fallback to standard cookie if not signed
  const cookieVal = req.signedCookies?.[TRIAL_COOKIE_NAME] || req.cookies?.[TRIAL_COOKIE_NAME]
  let trialsUsed = 0

  if (cookieVal) {
    if (typeof cookieVal === 'object' && typeof cookieVal.count === 'number') {
      trialsUsed = cookieVal.count
    } else if (typeof cookieVal === 'string') {
      try {
        const parsed = JSON.parse(cookieVal)
        if (typeof parsed.count === 'number') trialsUsed = parsed.count
      } catch {
        const num = parseInt(cookieVal, 10)
        if (!isNaN(num)) trialsUsed = num
      }
    }
  }

  const trialsRemaining = Math.max(0, MAX_FREE_TRIALS - trialsUsed)
  const canUpload = trialsUsed < MAX_FREE_TRIALS

  return {
    isAuthenticated: false,
    trialsUsed,
    trialsRemaining,
    maxTrials: MAX_FREE_TRIALS,
    canUpload,
  }
}

/**
 * Increment trial count and set signed HTTP-only cookie on response.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {{ trialsUsed: number, trialsRemaining: number }}
 */
export function incrementTrial(req, res) {
  if (req.user) {
    return { trialsUsed: 0, trialsRemaining: Infinity }
  }

  const status = getTrialStatus(req)
  const newCount = status.trialsUsed + 1
  const payload = {
    count: newCount,
    updatedAt: new Date().toISOString(),
  }

  res.cookie(TRIAL_COOKIE_NAME, payload, {
    signed: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  })

  return {
    trialsUsed: newCount,
    trialsRemaining: Math.max(0, MAX_FREE_TRIALS - newCount),
  }
}

/**
 * Express middleware to enforce the 3-trial limit on upload endpoints.
 */
export function enforceTrialLimit(req, res, next) {
  const status = getTrialStatus(req)

  if (!status.canUpload) {
    return res.status(403).json({
      error: 'You have completed your 3 free trial uploads. Please log in or create an account to continue unlimited processing.',
      code: 'TRIAL_LIMIT_REACHED',
      trialsUsed: status.trialsUsed,
      trialsRemaining: 0,
      maxTrials: MAX_FREE_TRIALS,
    })
  }

  req.trialStatus = status
  next()
}
