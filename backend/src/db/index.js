/**
 * db/index.js — Database connection pool, users & lectures repositories (PostgreSQL with local fallback)
 */

import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const { Pool } = pg

let pool = null
let usePostgres = false
const localDataDir = path.resolve('data')
const localUsersFile = path.join(localDataDir, 'users.json')
const localLecturesFile = path.join(localDataDir, 'lectures.json')

function getLocalUsers() {
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true })
    }
    if (!fs.existsSync(localUsersFile)) {
      fs.writeFileSync(localUsersFile, JSON.stringify([]), 'utf-8')
      return []
    }
    const raw = fs.readFileSync(localUsersFile, 'utf-8')
    return JSON.parse(raw || '[]')
  } catch (err) {
    console.warn('[db] local users read error:', err.message)
    return []
  }
}

function saveLocalUsers(users) {
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true })
    }
    fs.writeFileSync(localUsersFile, JSON.stringify(users, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[db] local users write error:', err.message)
  }
}

function getLocalLectures() {
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true })
    }
    if (!fs.existsSync(localLecturesFile)) {
      fs.writeFileSync(localLecturesFile, JSON.stringify([]), 'utf-8')
      return []
    }
    const raw = fs.readFileSync(localLecturesFile, 'utf-8')
    return JSON.parse(raw || '[]')
  } catch (err) {
    console.warn('[db] local lectures read error:', err.message)
    return []
  }
}

function saveLocalLectures(lectures) {
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true })
    }
    fs.writeFileSync(localLecturesFile, JSON.stringify(lectures, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[db] local lectures write error:', err.message)
  }
}

const localEventsFile = path.join(localDataDir, 'analytics_events.json')

function getLocalEvents() {
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true })
    }
    if (!fs.existsSync(localEventsFile)) {
      fs.writeFileSync(localEventsFile, JSON.stringify([]), 'utf-8')
      return []
    }
    const raw = fs.readFileSync(localEventsFile, 'utf-8')
    return JSON.parse(raw || '[]')
  } catch (err) {
    console.warn('[db] local events read error:', err.message)
    return []
  }
}

function saveLocalEvents(events) {
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true })
    }
    fs.writeFileSync(localEventsFile, JSON.stringify(events, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[db] local events write error:', err.message)
  }
}

/**
 * Initialize database schema and verify connection.
 */
export async function initDb() {
  const dbUrl = process.env.DATABASE_URL

  if (dbUrl) {
    try {
      pool = new Pool({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      })

      // Test connection
      const client = await pool.connect()
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

          -- Migration for existing databases
          ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

          CREATE TABLE IF NOT EXISTS lectures (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(500) NOT NULL,
            overview TEXT,
            duration_sec INTEGER,
            engine_used VARCHAR(50),
            language VARCHAR(50),
            file_name VARCHAR(255),
            transcript TEXT,
            key_concepts JSONB DEFAULT '[]',
            main_arguments JSONB DEFAULT '[]',
            important_terms JSONB DEFAULT '[]',
            study_notes JSONB DEFAULT '[]',
            key_takeaways JSONB DEFAULT '[]',
            revision_questions JSONB DEFAULT '[]',
            notes_markdown TEXT,
            tutor_history JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_lectures_user_id ON lectures(user_id);
          CREATE INDEX IF NOT EXISTS idx_lectures_created_at ON lectures(created_at DESC);

          CREATE TABLE IF NOT EXISTS analytics_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_name VARCHAR(100) NOT NULL,
            route VARCHAR(255),
            anon_session_token VARCHAR(255),
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
        `)
        usePostgres = true
        console.log('[db] Connected to PostgreSQL & verified users, lectures, and analytics_events tables ✓')
      } finally {
        client.release()
      }
      return
    } catch (err) {
      console.warn('[db] PostgreSQL connection failed (' + err.message + '). Falling back to persistent local storage for dev.')
      usePostgres = false
    }
  } else {
    console.log('[db] DATABASE_URL not set. Operating in local persistent mode (data/users.json, data/lectures.json, data/analytics_events.json).')
    usePostgres = false
  }

  // Ensure local directories and files exist
  getLocalUsers()
  getLocalLectures()
  getLocalEvents()
}

/**
 * Check if the database connection is currently healthy.
 * @returns {Promise<boolean>}
 */
export async function isDbHealthy() {
  if (usePostgres && pool) {
    try {
      const res = await pool.query('SELECT 1 as healthy')
      return res.rows[0]?.healthy === 1
    } catch {
      return false
    }
  }
  return true
}

/**
 * Look up a user by email address.
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export async function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase().trim()

  if (usePostgres && pool) {
    const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [normalizedEmail])
    const row = res.rows[0]
    if (!row) return null
    return {
      ...row,
      role: row.role || 'user',
    }
  }

  const users = getLocalUsers()
  const found = users.find((u) => u.email.toLowerCase() === normalizedEmail)
  if (!found) return null
  return {
    ...found,
    role: found.role || 'user',
  }
}

/**
 * Look up a user by ID.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function findUserById(id) {
  if (usePostgres && pool) {
    const res = await pool.query('SELECT id, email, role, created_at FROM users WHERE id = $1 LIMIT 1', [id])
    const row = res.rows[0]
    if (!row) return null
    return {
      id: row.id,
      email: row.email,
      role: row.role || 'user',
      created_at: row.created_at,
    }
  }

  const users = getLocalUsers()
  const user = users.find((u) => u.id === id)
  if (!user) return null
  return { id: user.id, email: user.email, role: user.role || 'user', created_at: user.created_at }
}

/**
 * Create a new user in the database.
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.password_hash
 * @param {string} [data.role='user']
 * @returns {Promise<Object>}
 */
export async function createUser({ email, password_hash, role = 'user' }) {
  const normalizedEmail = email.toLowerCase().trim()

  if (usePostgres && pool) {
    const res = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
      [normalizedEmail, password_hash, role]
    )
    return res.rows[0]
  }

  const users = getLocalUsers()
  const newUser = {
    id: randomUUID(),
    email: normalizedEmail,
    password_hash,
    role: role || 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  users.push(newUser)
  saveLocalUsers(users)

  return { id: newUser.id, email: newUser.email, role: newUser.role, created_at: newUser.created_at }
}

/**
 * Manually set or update a user's role (e.g. promote to 'admin').
 * @param {string} emailOrId
 * @param {string} [role='admin']
 * @returns {Promise<Object|null>}
 */
export async function setUserRole(emailOrId, role = 'admin') {
  const normalized = emailOrId.toLowerCase().trim()

  if (usePostgres && pool) {
    const res = await pool.query(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE LOWER(email) = $2 OR id::text = $2
       RETURNING id, email, role, updated_at`,
      [role, normalized]
    )
    return res.rows[0] || null
  }

  const users = getLocalUsers()
  const user = users.find((u) => u.email.toLowerCase() === normalized || u.id === emailOrId)
  if (!user) return null

  user.role = role
  user.updated_at = new Date().toISOString()
  saveLocalUsers(users)

  return { id: user.id, email: user.email, role: user.role, updated_at: user.updated_at }
}

// ─────────────────────────────────────────────────────────────────────────────
// LECTURES REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all lectures for a specific user.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getLecturesByUserId(userId) {
  if (!userId) return []

  if (usePostgres && pool) {
    const res = await pool.query(
      'SELECT * FROM lectures WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    return res.rows.map(mapLectureRow)
  }

  const all = getLocalLectures()
  return all
    .filter((l) => l.user_id === userId)
    .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
}

/**
 * Get a single lecture by ID.
 * @param {string} id
 * @param {string} [userId] - Optional user verification
 * @returns {Promise<Object|null>}
 */
export async function getLectureById(id, userId = null) {
  if (!id) return null

  if (usePostgres && pool) {
    const query = userId
      ? 'SELECT * FROM lectures WHERE id = $1 AND user_id = $2 LIMIT 1'
      : 'SELECT * FROM lectures WHERE id = $1 LIMIT 1'
    const params = userId ? [id, userId] : [id]
    const res = await pool.query(query, params)
    return res.rows[0] ? mapLectureRow(res.rows[0]) : null
  }

  const all = getLocalLectures()
  const found = all.find((l) => l.id === id && (!userId || l.user_id === userId))
  return found || null
}

/**
 * Create/Save a lecture in the database.
 * @param {Object} lecture
 * @returns {Promise<Object>}
 */
export async function createLecture(lecture) {
  const newId = lecture.id || randomUUID()
  const now = new Date().toISOString()

  if (usePostgres && pool) {
    const res = await pool.query(
      `INSERT INTO lectures (
        id, user_id, title, overview, duration_sec, engine_used, language, file_name,
        transcript, key_concepts, main_arguments, important_terms, study_notes,
        key_takeaways, revision_questions, notes_markdown, tutor_history, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19
      ) RETURNING *`,
      [
        newId,
        lecture.user_id || null,
        lecture.title || 'Lecture Summary',
        lecture.overview || '',
        lecture.duration_sec || lecture.durationSec || 0,
        lecture.engine_used || 'groq-whisper',
        lecture.language || 'en',
        lecture.file_name || lecture.fileName || '',
        lecture.transcript || '',
        JSON.stringify(lecture.key_concepts || []),
        JSON.stringify(lecture.main_arguments || []),
        JSON.stringify(lecture.important_terms || []),
        JSON.stringify(lecture.study_notes || []),
        JSON.stringify(lecture.key_takeaways || []),
        JSON.stringify(lecture.revision_questions || []),
        lecture.notes_markdown || '',
        JSON.stringify(lecture.tutor_history || []),
        now,
        now,
      ]
    )
    return mapLectureRow(res.rows[0])
  }

  const all = getLocalLectures()
  const record = {
    ...lecture,
    id: newId,
    durationSec: lecture.duration_sec || lecture.durationSec || 0,
    fileName: lecture.file_name || lecture.fileName || '',
    tutor_history: lecture.tutor_history || [],
    created_at: now,
    updated_at: now,
    date: now,
  }

  // Remove existing with same id if any
  const filtered = all.filter((l) => l.id !== newId)
  filtered.unshift(record)
  saveLocalLectures(filtered)
  return record
}

/**
 * Update an existing lecture (e.g. title, tutor_history, notes).
 * @param {string} id
 * @param {string} userId
 * @param {Object} updates
 * @returns {Promise<Object|null>}
 */
export async function updateLecture(id, userId, updates) {
  const now = new Date().toISOString()

  if (usePostgres && pool) {
    const current = await getLectureById(id, userId)
    if (!current) return null

    const tutorHist = updates.tutor_history ? JSON.stringify(updates.tutor_history) : JSON.stringify(current.tutor_history || [])
    const title = updates.title || current.title

    const res = await pool.query(
      `UPDATE lectures SET
        title = $1,
        tutor_history = $2,
        updated_at = $3
      WHERE id = $4 AND user_id = $5
      RETURNING *`,
      [title, tutorHist, now, id, userId]
    )
    return res.rows[0] ? mapLectureRow(res.rows[0]) : null
  }

  const all = getLocalLectures()
  const idx = all.findIndex((l) => l.id === id && (!userId || l.user_id === userId))
  if (idx === -1) return null

  all[idx] = {
    ...all[idx],
    ...updates,
    updated_at: now,
  }
  saveLocalLectures(all)
  return all[idx]
}

/**
 * Delete a lecture.
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function deleteLecture(id, userId) {
  if (usePostgres && pool) {
    const res = await pool.query(
      'DELETE FROM lectures WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    )
    return (res.rowCount || 0) > 0
  }

  const all = getLocalLectures()
  const initialLength = all.length
  const filtered = all.filter((l) => !(l.id === id && (!userId || l.user_id === userId)))
  if (filtered.length !== initialLength) {
    saveLocalLectures(filtered)
    return true
  }
  return false
}

function mapLectureRow(row) {
  if (!row) return null
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    overview: row.overview,
    durationSec: row.duration_sec,
    duration_sec: row.duration_sec,
    engine_used: row.engine_used,
    language: row.language,
    fileName: row.file_name,
    file_name: row.file_name,
    transcript: row.transcript,
    key_concepts: typeof row.key_concepts === 'string' ? JSON.parse(row.key_concepts || '[]') : (row.key_concepts || []),
    main_arguments: typeof row.main_arguments === 'string' ? JSON.parse(row.main_arguments || '[]') : (row.main_arguments || []),
    important_terms: typeof row.important_terms === 'string' ? JSON.parse(row.important_terms || '[]') : (row.important_terms || []),
    study_notes: typeof row.study_notes === 'string' ? JSON.parse(row.study_notes || '[]') : (row.study_notes || []),
    key_takeaways: typeof row.key_takeaways === 'string' ? JSON.parse(row.key_takeaways || '[]') : (row.key_takeaways || []),
    revision_questions: typeof row.revision_questions === 'string' ? JSON.parse(row.revision_questions || '[]') : (row.revision_questions || []),
    notes_markdown: row.notes_markdown,
    tutor_history: typeof row.tutor_history === 'string' ? JSON.parse(row.tutor_history || '[]') : (row.tutor_history || []),
    created_at: row.created_at,
    updated_at: row.updated_at,
    date: row.created_at,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS & OPERATIONAL LOGGING (PRIVACY-PRESERVING)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Log an operational analytics event.
 * @param {Object} eventData
 * @param {string} eventData.event_name - e.g. 'upload_completed', 'user_login', 'trial_used'
 * @param {string} [eventData.route] - e.g. '/api/upload', '/api/auth/login'
 * @param {string} [eventData.anon_session_token] - stored in DB only, NEVER exposed via admin stream
 * @param {Object} [eventData.metadata] - stored in DB only, NEVER exposed via admin stream
 * @returns {Promise<void>}
 */
export async function logAnalyticsEvent({
  event_name,
  route = '',
  anon_session_token = null,
  metadata = {},
}) {
  if (!event_name) return
  const now = new Date().toISOString()

  try {
    if (usePostgres && pool) {
      await pool.query(
        `INSERT INTO analytics_events (
          event_name, route, anon_session_token, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          event_name,
          route || '',
          anon_session_token || null,
          JSON.stringify(metadata || {}),
          now,
        ]
      )
      return
    }

    const events = getLocalEvents()
    const newRecord = {
      id: randomUUID(),
      event_name,
      route: route || '',
      anon_session_token: anon_session_token || null,
      metadata: metadata || {},
      created_at: now,
    }
    // Keep newest first
    events.unshift(newRecord)
    // Keep max 2000 events locally to prevent excessive memory usage
    if (events.length > 2000) events.length = 2000
    saveLocalEvents(events)
  } catch (err) {
    console.warn('[analytics log error]', err.message)
  }
}

/**
 * Get aggregated live metrics for today (UTC start of day).
 * @returns {Promise<Object>}
 */
export async function getLiveAnalyticsToday() {
  const startOfDayUtc = new Date()
  startOfDayUtc.setUTCHours(0, 0, 0, 0)
  const startIso = startOfDayUtc.toISOString()

  if (usePostgres && pool) {
    try {
      const res = await pool.query(
        `SELECT
          COUNT(*) FILTER (WHERE event_name IN ('upload_completed', 'upload_failed', 'upload_processed')) as uploads_today,
          COUNT(*) FILTER (WHERE event_name IN ('upload_completed', 'upload_processed')) as success_today,
          COUNT(*) FILTER (WHERE event_name = 'upload_failed') as failure_today,
          COUNT(*) FILTER (WHERE metadata->>'engine' ILIKE '%whisper%' OR event_name = 'transcription_whisper') as engine_whisper,
          COUNT(*) FILTER (WHERE metadata->>'engine' ILIKE '%griot%' OR event_name = 'transcription_griot') as engine_griot,
          COUNT(*) FILTER (WHERE event_name = 'user_signup') as signups_today,
          COUNT(*) FILTER (WHERE event_name = 'user_login') as logins_today,
          COUNT(*) FILTER (WHERE event_name = 'trial_upload' OR (metadata->>'is_trial')::text = 'true') as trial_uploads_today
        FROM analytics_events
        WHERE created_at >= $1`,
        [startIso]
      )

      const row = res.rows[0] || {}
      return {
        uploadsToday: parseInt(row.uploads_today || '0', 10),
        successToday: parseInt(row.success_today || '0', 10),
        failureToday: parseInt(row.failure_today || '0', 10),
        engineSplit: {
          whisper: parseInt(row.engine_whisper || '0', 10),
          griot: parseInt(row.engine_griot || '0', 10),
        },
        signupsToday: parseInt(row.signups_today || '0', 10),
        loginsToday: parseInt(row.logins_today || '0', 10),
        trialUploadsToday: parseInt(row.trial_uploads_today || '0', 10),
        timestamp: new Date().toISOString(),
      }
    } catch (err) {
      console.warn('[db live analytics error]', err.message)
    }
  }

  const events = getLocalEvents()
  const todayEvents = events.filter((e) => new Date(e.created_at) >= startOfDayUtc)

  let uploadsToday = 0
  let successToday = 0
  let failureToday = 0
  let whisperCount = 0
  let griotCount = 0
  let signupsToday = 0
  let loginsToday = 0
  let trialUploadsToday = 0

  for (const ev of todayEvents) {
    const name = ev.event_name
    const meta = ev.metadata || {}

    if (name === 'upload_completed' || name === 'upload_processed') {
      uploadsToday++
      successToday++
      if (meta.engine?.includes('griot') || name === 'transcription_griot') {
        griotCount++
      } else {
        whisperCount++
      }
      if (meta.is_trial) {
        trialUploadsToday++
      }
    } else if (name === 'upload_failed') {
      uploadsToday++
      failureToday++
    } else if (name === 'transcription_whisper') {
      whisperCount++
    } else if (name === 'transcription_griot') {
      griotCount++
    } else if (name === 'user_signup') {
      signupsToday++
    } else if (name === 'user_login') {
      loginsToday++
    } else if (name === 'trial_upload') {
      trialUploadsToday++
    }
  }

  return {
    uploadsToday,
    successToday,
    failureToday,
    engineSplit: {
      whisper: whisperCount,
      griot: griotCount,
    },
    signupsToday,
    loginsToday,
    trialUploadsToday,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Get the recent anonymous operational activity stream.
 * PRIVACY GUARANTEE: Returns ONLY event_name, route, and created_at.
 * Structurally omits anon_session_token, metadata, IP address, user_id, or content.
 * @param {number} [limit=50]
 * @returns {Promise<Array<{event_name: string, route: string, created_at: string}>>}
 */
export async function getAnalyticsStream(limit = 50) {
  const safeLimit = Math.min(Math.max(1, limit), 100)

  if (usePostgres && pool) {
    try {
      const res = await pool.query(
        `SELECT event_name, route, created_at
         FROM analytics_events
         ORDER BY created_at DESC
         LIMIT $1`,
        [safeLimit]
      )
      return res.rows.map((row) => ({
        event_name: row.event_name,
        route: row.route || '',
        created_at: row.created_at,
      }))
    } catch (err) {
      console.warn('[db analytics stream error]', err.message)
      return []
    }
  }

  const events = getLocalEvents()
  return events.slice(0, safeLimit).map((ev) => ({
    event_name: ev.event_name,
    route: ev.route || '',
    created_at: ev.created_at,
  }))
}

