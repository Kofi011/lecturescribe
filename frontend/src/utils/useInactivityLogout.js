/**
 * useInactivityLogout.js — Auto-logout hook for inactive student sessions
 * Listens for user interactions (mouse, keyboard, touch, scroll) and logs out after inactivity threshold.
 */

import { useEffect, useRef } from 'react'

const DEFAULT_TIMEOUT_MINUTES = 15

export function useInactivityLogout(currentUser, onLogout, timeoutMinutes = DEFAULT_TIMEOUT_MINUTES) {
  const timerRef = useRef(null)
  const lastActivityRef = useRef(Date.now())

  useEffect(() => {
    if (!currentUser) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    const timeoutMs = (timeoutMinutes || DEFAULT_TIMEOUT_MINUTES) * 60 * 1000

    const handleAutoLogout = () => {
      console.log(`[security] User inactive for ${timeoutMinutes} minutes. Logging out automatically.`)
      onLogout?.(true) // pass isAutoLogout flag
    }

    const resetTimer = () => {
      const now = Date.now()
      // Throttle resets to once every 2 seconds
      if (now - lastActivityRef.current < 2000) return
      lastActivityRef.current = now

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(handleAutoLogout, timeoutMs)
    }

    // Set initial timer
    timerRef.current = setTimeout(handleAutoLogout, timeoutMs)

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((evt) => window.removeEventListener(evt, resetTimer))
    }
  }, [currentUser, onLogout, timeoutMinutes])
}
