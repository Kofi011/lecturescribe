/**
 * routes/lectures.js — REST endpoints for lecture persistence & study intelligence history
 */

import { Router } from 'express'
import { requireAuth } from '../services/auth.js'
import {
  getLecturesByUserId,
  getLectureById,
  createLecture,
  updateLecture,
  deleteLecture,
} from '../db/index.js'

const router = Router()

/**
 * GET /api/lectures — List all lectures for the authenticated user
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const lectures = await getLecturesByUserId(req.user.id)
    res.json({ lectures })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/lectures/:id — Retrieve single lecture
 */
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const lecture = await getLectureById(req.params.id, req.user.id)
    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' })
    }
    res.json({ lecture })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/lectures — Save or import a lecture
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const payload = req.body || {}
    if (!payload.title && !payload.transcript) {
      return res.status(400).json({ error: 'Lecture title or transcript is required' })
    }

    const saved = await createLecture({
      ...payload,
      user_id: req.user.id,
    })

    res.status(201).json({ lecture: saved })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/lectures/:id — Update lecture title or notes
 */
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const updated = await updateLecture(req.params.id, req.user.id, req.body || {})
    if (!updated) {
      return res.status(404).json({ error: 'Lecture not found or unauthorized' })
    }
    res.json({ lecture: updated })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/lectures/:id — Delete lecture
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const deleted = await deleteLecture(req.params.id, req.user.id)
    if (!deleted) {
      return res.status(404).json({ error: 'Lecture not found or already deleted' })
    }
    res.json({ message: 'Lecture deleted successfully' })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/lectures/:id/tutor — Save tutor chat message history
 */
router.post('/:id/tutor', requireAuth, async (req, res, next) => {
  try {
    const { history } = req.body || {}
    if (!Array.isArray(history)) {
      return res.status(400).json({ error: 'Chat history array is required' })
    }

    const updated = await updateLecture(req.params.id, req.user.id, {
      tutor_history: history,
    })

    if (!updated) {
      return res.status(404).json({ error: 'Lecture not found' })
    }

    res.json({ tutor_history: updated.tutor_history })
  } catch (err) {
    next(err)
  }
})

export default router
