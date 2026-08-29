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

  const systemPrompt = `You are LectureScribe's elite Academic AI Professor & Master Tutor.
Your goal is to provide comprehensive, thorough, and highly educational answers to the student's questions grounded in the provided lecture transcript and academic context.

CRITICAL INSTRUCTIONS:
1. Provide IN-DEPTH, DETAILED, AND RIGOROUS explanations. Avoid brief, superficial, or 1-2 sentence answers unless explicitly asked for brevity.
2. Structure your answer using clear, beautiful Markdown:
   - ### 1. Executive Summary & Core Principle
   - ### 2. Detailed Technical Breakdown & Mechanisms (use step-by-step logic, bold key concepts)
   - ### 3. Comparative Tables & Structured Matrices (where comparing concepts, trade-offs, or architectures)
   - ### 4. Concrete Examples, Analogies, or Code/Math Walkthroughs (to anchor understanding)
   - ### 5. Key Takeaways & Exam Review Checklist
3. Ground your explanations directly in the lecture transcript, and synthesize related fundamental knowledge where necessary to provide complete understanding.
4. Highlight technical terms in **bold** and provide precise definitions.

LECTURE TRANSCRIPT:
${transcript}`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: question },
  ]

  const models = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'qwen/qwen3.6-27b',
    'openai/gpt-oss-120b',
    'mixtral-8x7b-32768',
  ]
  let reply = ''
  let lastErr = null

  for (const model of models) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.35,
        max_tokens: 3500,
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
