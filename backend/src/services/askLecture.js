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

  const systemPrompt = `You are LectureScribe's Academic AI Professor & Master Tutor.
Your goal is to provide a comprehensive, engaging, and exceptionally clear explanation directly answering the student's question, grounded on the provided lecture transcript.

STRICT OUTPUT RULES:
- Output ONLY the final academic response. NEVER output <think> tags, internal reasoning scratchpads, drafting notes, or meta commentary.
- Write in a natural, authoritative, and welcoming pedagogical tone.

FORMATTING GUIDELINES:
- Begin directly with a clear, engaging overview of the concept or answer.
- Organize the explanation with descriptive Markdown headings (e.g. ### Core Intuition, ### Step-by-Step Breakdown, ### Practical Example, ### Summary Matrix).
- Use **bold** for key technical terms.
- Use Markdown tables (| Concept | Description |) where comparing ideas or summarizing takeaways.
- Use bullet points (- item) or numbered lists for sequential processes.
- Ensure the answer is thorough and in-depth, offering clear analogies and concrete examples where helpful.

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
    'mixtral-8x7b-32768',
    'qwen/qwen3.6-27b',
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
      if (reply) {
        // Strip any residual think tags or CoT scratchpad
        reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
        if (reply) break
      }
    } catch (err) {
      lastErr = err
      console.warn(`[askLecture] model ${model} failed:`, err.message)
    }
  }

  if (!reply && lastErr) {
    throw new Error(`Failed to generate answer: ${lastErr.message}`)
  }

  return reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}
