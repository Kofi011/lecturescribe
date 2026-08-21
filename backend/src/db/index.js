/**
 * db/index.js — Database connection pool and user repository (PostgreSQL with local fallback)
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
        `)
        usePostgres = true
        console.log('[db] Connected to PostgreSQL & verified users table ✓')
      } finally {
        client.release()
      }
      return
    } catch (err) {
      console.warn('[db] PostgreSQL connection failed (' + err.message + '). Falling back to persistent local storage for dev.')
      usePostgres = false
    }
  } else {
    console.log('[db] DATABASE_URL not set. Operating in local persistent mode (data/users.json).')
    usePostgres = false
  }

  // Ensure local directory exists
  getLocalUsers()
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
