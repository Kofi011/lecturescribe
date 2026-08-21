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
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

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
        `)
        usePostgres = true
        console.log('[db] Connected to PostgreSQL & verified users and lectures tables ✓')
      } finally {
        client.release()
      }
      return
    } catch (err) {
      console.warn('[db] PostgreSQL connection failed (' + err.message + '). Falling back to persistent local storage for dev.')
      usePostgres = false
    }
  } else {
    console.log('[db] DATABASE_URL not set. Operating in local persistent mode (data/users.json, data/lectures.json).')
    usePostgres = false
  }

  // Ensure local directories and files exist
  getLocalUsers()
  getLocalLectures()
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
    return res.rows[0] || null
  }

  const users = getLocalUsers()
  return users.find((u) => u.email.toLowerCase() === normalizedEmail) || null
}

/**
 * Look up a user by ID.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function findUserById(id) {
  if (usePostgres && pool) {
    const res = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1 LIMIT 1', [id])
    return res.rows[0] || null
  }

  const users = getLocalUsers()
  const user = users.find((u) => u.id === id)
  if (!user) return null
  return { id: user.id, email: user.email, created_at: user.created_at }
}

/**
 * Create a new user in the database.
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.password_hash
 * @returns {Promise<Object>}
 */
export async function createUser({ email, password_hash }) {
  const normalizedEmail = email.toLowerCase().trim()

  if (usePostgres && pool) {
    const res = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [normalizedEmail, password_hash]
    )
    return res.rows[0]
  }

  const users = getLocalUsers()
  const newUser = {
    id: randomUUID(),
    email: normalizedEmail,
    password_hash,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  users.push(newUser)
  saveLocalUsers(users)

  return { id: newUser.id, email: newUser.email, created_at: newUser.created_at }
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
