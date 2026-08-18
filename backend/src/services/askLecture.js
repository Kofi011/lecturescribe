/**
 * services/askLecture.js — Interactive Q&A grounded on a lecture's transcript
 */

import Groq from 'groq-sdk'

let _client = null

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Lecture Q&A service is not configured. Please add GROQ_API_KEY to .env.')
  }
  if (!_client) _client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _client
}

/**
 * Answer a student's question about a specific lecture transcript.
 *
 * @param {string} transcript  The lecture transcript
 * @param {string} question    The user's query
 * @param {Array}  history     Previous chat messages
 * @returns {Promise<string>}  The grounded AI response
 */
export async function askAboutLecture(transcript, question, history = []) {
  const client = getClient()

  const systemPrompt = `You are LectureScribe's academic tutor assistant.
Your goal is to answer the student's question accurately and helpfully, referencing the lecture transcript provided below.
Explain concepts clearly with examples, bullet points, or step-by-step reasoning where applicable.
If the transcript does not contain enough information to answer completely, provide the closest relevant context from the lecture and note any broader academic concepts.

LECTURE TRANSCRIPT:
${transcript}`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: question },
  ]

  const models = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b']
  let reply = ''
  let lastErr = null

  for (const model of models) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 1024,
      })
      reply = completion.choices[0]?.message?.content ?? ''
      if (reply) break
    } catch (err) {
      lastErr = err
      console.warn(`[askLecture] model ${model} failed:`, err.message)
    }
  }

  if (!reply && lastErr) {
    throw new Error(`Failed to generate answer: ${lastErr.message}`)
  }

  return reply.trim()
}
