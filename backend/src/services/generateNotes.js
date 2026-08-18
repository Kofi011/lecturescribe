/**
 * services/generateNotes.js — LLM note generation from transcript
 *
 * Uses Groq's LLM API (llama-3.3-70b-versatile) — same key as Whisper,
 * no separate LLM_API_KEY needed.
 *
 * Output format (parsed from LLM JSON response):
 *   {
 *     title:          string,   // suggested lecture title
 *     notes_markdown: string,   // full notes as Markdown (headings + bullets + takeaways)
 *   }
 */

import Groq from 'groq-sdk'

let _client = null

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      'Note generation service is not configured. ' +
      'Please add GROQ_API_KEY to the backend .env file.'
    )
  }
  if (!_client) _client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _client
}

// ─── Prompt ──────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert academic note-taker.
Given a raw lecture transcript, produce structured study notes in valid JSON.

Return ONLY a JSON object — no markdown fences, no explanation — with exactly these fields:
{
  "title": "<A short, descriptive title for the lecture (5-10 words)>",
  "notes_markdown": "<Full notes in Markdown format>"
}

The notes_markdown field must follow this exact structure:
# <Lecture title>

## <Section heading>
- <Bullet point>
- <Bullet point>

## <Section heading>
- <Bullet point>
...

## Key Takeaways
- <Concise takeaway>
- <Concise takeaway>
- <Concise takeaway>

Rules:
- Use ## for section headings (not ###)
- Use - for bullet points (not * or numbers)
- 3–6 sections, each with 3–6 bullets
- Key Takeaways section: exactly 3–5 bullets, at the end
- Write in clear, concise English — no filler, no repetition
- Do NOT include the transcript itself in the output`

function userPrompt(transcript) {
  return `TRANSCRIPT:\n${transcript}\n\nGenerate the structured notes JSON now.`
}

// ─── Helper: extract JSON from LLM output ────────────────────────────────────
function extractJson(raw) {
  // Strip any accidental markdown fences the model may have added
  const cleaned = raw.replace(/^```(?:json)?/m, '').replace(/```$/m, '').trim()
  return JSON.parse(cleaned)
}

/**
 * Generate structured notes from a transcript.
 *
 * @param {string} transcript  Plain-text lecture transcript
 * @returns {Promise<{ title: string, notes_markdown: string }>}
 */
export async function generateNotes(transcript) {
  const client = getClient()

  let raw
  const models = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b']
  let lastErr = null

  for (const model of models) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userPrompt(transcript) },
        ],
        temperature: 0.3,       // low temp = consistent structure
        max_tokens: 2048,
        response_format: { type: 'json_object' },  // enforce JSON mode
      })
      raw = completion.choices[0]?.message?.content ?? ''
      if (raw) break
    } catch (err) {
      lastErr = err
      console.warn(`[generateNotes] model ${model} failed, trying next:`, err.message)
    }
  }

  if (!raw && lastErr) {
    const status = lastErr?.status ?? lastErr?.statusCode
    if (status === 401) {
      throw new Error('Invalid Groq API key. Check GROQ_API_KEY in your .env file.')
    }
    if (status === 429) {
      throw new Error('Groq API rate limit reached. Please wait a moment and try again.')
    }
    if (lastErr?.code === 'ECONNRESET' || lastErr?.code === 'ETIMEDOUT') {
      throw new Error('Note generation timed out. Please try again.')
    }
    throw new Error(`Note generation failed: ${lastErr?.message || 'Unknown API error.'}`)
  }

  // Parse and validate the JSON response
  let parsed
  try {
    parsed = extractJson(raw)
  } catch {
    throw new Error('Note generation returned an unexpected format. Please try again.')
  }

  if (!parsed.title || !parsed.notes_markdown) {
    throw new Error('Note generation returned incomplete data. Please try again.')
  }

  return {
    title:          parsed.title.trim(),
    notes_markdown: parsed.notes_markdown.trim(),
  }
}
