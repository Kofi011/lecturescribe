/**
 * config.js — Global client configuration & API URL resolution
 */
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://lecturescribe-backend.onrender.com' : '')
