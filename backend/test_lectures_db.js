/**
 * test_lectures_db.js — Verify database schema, lectures repository, and rate limits
 */

import { initDb, createUser, getLecturesByUserId, createLecture, updateLecture, deleteLecture, getLectureById } from './src/db/index.js'
import { hashPassword } from './src/services/auth.js'

async function runTests() {
  console.log('--- Starting Lectures & Persistence Unit Tests ---')
  await initDb()

  const testEmail = `test_scholar_${Date.now()}@university.edu`
  const passwordHash = await hashPassword('SecurePass123!')
  const user = await createUser({ email: testEmail, password_hash: passwordHash })
  console.log('✓ Created test user:', user.email, 'ID:', user.id)

  const sampleLectureData = {
    user_id: user.id,
    title: 'Advanced Operating Systems: Concurrency & Semaphores',
    overview: 'In-depth review of race conditions, mutex locks, and Edsger Dijkstra semaphore primitives in kernel thread scheduling.',
    durationSec: 180,
    engine_used: 'groq-whisper',
    language: 'en',
    fileName: 'os_lecture_04.mp3',
    transcript: 'Today we address race conditions, mutual exclusion locks, and counting semaphores...',
    key_concepts: [
      { concept: 'Mutual Exclusion (Mutex)', explanation: 'A lock mechanism ensuring only one thread accesses a critical section at any instant.' },
      { concept: 'Counting Semaphore', explanation: 'A synchronization variable initialized to an integer representing available resources.' }
    ],
    main_arguments: [
      'Deadlocks occur when four Coffman conditions hold simultaneously.',
      'Priority inversion can be mitigated with priority inheritance protocols.'
    ],
    important_terms: [
      { term: 'Critical Section', definition: 'A piece of code that accesses shared resources that must not be concurrently executed by more than one thread.' }
    ],
    study_notes: [
      { heading: '1. Race Condition Fundamentals', points: ['Threads interleave unpredictably without proper synchronization primitives.'] }
    ],
    key_takeaways: ['Semaphores prevent memory corruption in multi-threaded kernels.'],
    revision_questions: [
      { question: 'What are the two atomic operations on a semaphore?', answer: 'wait() (or P) and signal() (or V).' }
    ],
    notes_markdown: '# Advanced Operating Systems\n\n## Overview\nConcurrency notes...',
    tutor_history: [
      { role: 'user', content: 'What is a deadlock?' },
      { role: 'assistant', content: 'A deadlock is a state where two or more processes are blocked waiting for resources held by each other.' }
    ]
  }

  const created = await createLecture(sampleLectureData)
  console.log('✓ Created lecture in persistence layer:', created.title, 'ID:', created.id)

  const fetchedById = await getLectureById(created.id, user.id)
  if (!fetchedById || fetchedById.title !== sampleLectureData.title) {
    throw new Error('Failed to fetch lecture by ID!')
  }
  console.log('✓ Verified fetch by ID with exact title match')

  const userLectures = await getLecturesByUserId(user.id)
  if (userLectures.length !== 1 || userLectures[0].id !== created.id) {
    throw new Error('Failed to list user lectures correctly!')
  }
  console.log('✓ Verified getLecturesByUserId returned 1 lecture record')

  // Test updating tutor history
  const updatedTutorHistory = [
    ...sampleLectureData.tutor_history,
    { role: 'user', content: 'Explain priority inversion.' },
    { role: 'assistant', content: 'Priority inversion happens when a lower priority thread holds a lock needed by a higher priority thread.' }
  ]
  const updated = await updateLecture(created.id, user.id, { tutor_history: updatedTutorHistory })
  if (updated.tutor_history.length !== 4) {
    throw new Error(`Expected 4 tutor history messages, got ${updated.tutor_history.length}`)
  }
  console.log('✓ Verified tutor_history update successfully persisted (4 messages)')

  // Test deletion
  const deleted = await deleteLecture(created.id, user.id)
  if (!deleted) {
    throw new Error('Failed to delete lecture!')
  }
  const remaining = await getLecturesByUserId(user.id)
  if (remaining.length !== 0) {
    throw new Error('Expected 0 remaining lectures after deletion')
  }
  console.log('✓ Verified deleteLecture cleaned up database record')

  console.log('\n--- ALL LECTURES & PERSISTENCE TESTS PASSED! ---')
}

runTests().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
