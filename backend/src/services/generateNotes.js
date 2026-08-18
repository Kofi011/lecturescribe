/**
 * services/generateNotes.js — Comprehensive lecture analysis and structured note synthesis
 *
 * Produces:
 *   - title: string
 *   - overview: string (concise explanation of the lecture)
 *   - key_concepts: Array<{ concept: string, explanation: string }>
 *   - main_arguments: string[]
 *   - important_terms: Array<{ term: string, definition: string }>
 *   - study_notes: Array<{ heading: string, points: string[] }>
 *   - key_takeaways: string[]
 *   - revision_questions: Array<{ question: string, answer: string }>
 *   - notes_markdown: string (complete formatted markdown document)
 */

import Groq from 'groq-sdk'

let _client = null

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      'Analysis service is not configured. ' +
      'Please add GROQ_API_KEY to the backend .env file.'
    )
  }
  if (!_client) _client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _client
}

// ─── System Prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are LectureScribe's academic intelligence engine.
Analyze the provided raw lecture transcript and output structured study knowledge in valid JSON.

Return ONLY a JSON object with these exact keys:
{
  "title": "<Concise, academic title (5-10 words)>",
  "overview": "<A clear, 2-4 sentence overview of the lecture's core topic and objectives>",
  "key_concepts": [
    { "concept": "<Concept Name>", "explanation": "<Clear, intuitive explanation>" }
  ],
  "main_arguments": [
    "<Significant argument or key point raised>"
  ],
  "important_terms": [
    { "term": "<Term>", "definition": "<Precise definition or context>" }
  ],
  "study_notes": [
    {
      "heading": "<Topic Heading>",
      "points": ["<Key detail>", "<Bullet point>"]
    }
  ],
  "key_takeaways": [
    "<High-yield summary takeaway for exam revision>"
  ],
  "revision_questions": [
    { "question": "<Thoughtful review question testing comprehension>", "answer": "<Concise correct answer>" }
  ]
}

Rules:
- 3–5 key concepts with thorough explanations
- 3–6 main arguments / core ideas
- 3–6 important terms with definitions
- 3–5 study note sections with 3–5 bullet points each
- 3–5 key takeaways
- 3–5 revision questions with accurate answers
- Tone: academic, highly structured, clear, and student-focused`

function userPrompt(transcript) {
  return `TRANSCRIPT:\n${transcript}\n\nAnalyze and generate the structured JSON output now.`
}

function extractJson(raw) {
  const cleaned = raw.replace(/^```(?:json)?/m, '').replace(/```$/m, '').trim()
  return JSON.parse(cleaned)
}

function buildMarkdownDocument(parsed) {
  let md = `# ${parsed.title || 'Lecture Notes'}\n\n`

  if (parsed.overview) {
    md += `## Overview\n${parsed.overview}\n\n`
  }

  if (Array.isArray(parsed.key_concepts) && parsed.key_concepts.length > 0) {
    md += `## Key Concepts\n`
    for (const item of parsed.key_concepts) {
      md += `- **${item.concept}**: ${item.explanation}\n`
    }
    md += `\n`
  }

  if (Array.isArray(parsed.main_arguments) && parsed.main_arguments.length > 0) {
    md += `## Main Arguments & Ideas\n`
    for (const arg of parsed.main_arguments) {
      md += `- ${arg}\n`
    }
    md += `\n`
  }

  if (Array.isArray(parsed.important_terms) && parsed.important_terms.length > 0) {
    md += `## Important Terms\n`
    for (const term of parsed.important_terms) {
      md += `- **${term.term}**: ${term.definition}\n`
    }
    md += `\n`
  }

  if (Array.isArray(parsed.study_notes) && parsed.study_notes.length > 0) {
    md += `## Study Notes\n`
    for (const section of parsed.study_notes) {
      md += `### ${section.heading}\n`
      for (const pt of section.points || []) {
        md += `- ${pt}\n`
      }
      md += `\n`
    }
  }

  if (Array.isArray(parsed.key_takeaways) && parsed.key_takeaways.length > 0) {
    md += `## Key Takeaways\n`
    for (const t of parsed.key_takeaways) {
      md += `- ${t}\n`
    }
    md += `\n`
  }

  if (Array.isArray(parsed.revision_questions) && parsed.revision_questions.length > 0) {
    md += `## Questions for Revision\n`
    for (let i = 0; i < parsed.revision_questions.length; i++) {
      const q = parsed.revision_questions[i]
      md += `**Q${i + 1}: ${q.question}**\n- *Answer*: ${q.answer}\n\n`
    }
  }

  return md.trim()
}

/**
 * Generate comprehensive structured study knowledge from a transcript.
 *
 * @param {string} transcript  Plain-text lecture transcript
 * @returns {Promise<object>}
 */
export async function generateNotes(transcript) {
  const client = getClient()

  let raw = ''
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
        temperature: 0.3,
        max_tokens: 3500,
        response_format: { type: 'json_object' },
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
      throw new Error('Analysis service authentication failed. Check GROQ_API_KEY in your .env file.')
    }
    if (status === 429) {
      throw new Error('Processing limit reached. Please wait a moment and try again.')
    }
    if (lastErr?.code === 'ECONNRESET' || lastErr?.code === 'ETIMEDOUT') {
      throw new Error('Analysis timed out. Please try again.')
    }
    throw new Error(`Analysis failed: ${lastErr?.message || 'Unknown processing error.'}`)
  }

  let parsed
  try {
    parsed = extractJson(raw)
  } catch {
    throw new Error('Analysis returned an unexpected format. Please try again.')
  }

  const notes_markdown = buildMarkdownDocument(parsed)

  return {
    title:               parsed.title?.trim() || 'Untitled Lecture',
    overview:            parsed.overview?.trim() || '',
    key_concepts:        Array.isArray(parsed.key_concepts) ? parsed.key_concepts : [],
    main_arguments:      Array.isArray(parsed.main_arguments) ? parsed.main_arguments : [],
    important_terms:     Array.isArray(parsed.important_terms) ? parsed.important_terms : [],
    study_notes:         Array.isArray(parsed.study_notes) ? parsed.study_notes : [],
    key_takeaways:       Array.isArray(parsed.key_takeaways) ? parsed.key_takeaways : [],
    revision_questions:  Array.isArray(parsed.revision_questions) ? parsed.revision_questions : [],
    notes_markdown,
  }
}
