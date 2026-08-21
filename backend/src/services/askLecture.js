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

  const systemPrompt = `You are LectureScribe's expert academic tutor assistant.
Your goal is to answer the student's question accurately, thoughtfully, and in a beautifully structured, highly readable format grounded on the lecture transcript provided below.

Formatting Guidelines:
- Use clear Markdown headings (### Section Title) to organize long explanations.
- Use Markdown tables (| Column | Column |) whenever comparing items, presenting structured steps, or technical breakdowns.
- Use bold (**keyword**) for key terms and concepts.
- Use clean bullet points (- item) or numbered lists (1. step) for steps and takeaways.
- If the student asks about broader topics or the technical stack, provide a clear, structured summary while referencing relevant lecture concepts where applicable.

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
