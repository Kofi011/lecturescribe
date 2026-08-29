/**
 * analytics.js — Client-Side Operational Event Tracker (Privacy-Preserving)
 * Sends anonymous operational telemetry to the backend admin stream.
 */

const API_URL = import.meta.env.VITE_API_URL || ''

export function trackClientEvent(eventName, route = '') {
  if (!eventName || typeof window === 'undefined') return

  try {
    const endpoint = API_URL ? `${API_URL}/api/analytics/event` : '/api/analytics/event'
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        event_name: eventName,
        route: route || window.location.pathname,
      }),
    }).catch(() => {
      // Non-blocking telemetry
    })
  } catch {
    // Non-blocking
  }
}
