/**
 * MarkdownRenderer.jsx — Structured, beautifully aligned typography renderer for AI Tutor & study notes
 *
 * Supports:
 * - Markdown Tables with clean column headers, zebra striping, and cell formatting
 * - Headings (H1 - H4) with hierarchy
 * - Ordered & Unordered Lists with aligned indentation
 * - Code blocks & Inline code
 * - Bold, Italic, Links, and Blockquotes
 * - Horizontal dividers
 */

import React from 'react'

function parseInlineFormatting(text) {
  if (!text) return null

  // Replace <br> or <br/> with line breaks
  const parts = text.split(/(<br\s*\/?>)/gi)

  return parts.map((part, pIdx) => {
    if (part.toLowerCase().startsWith('<br')) {
      return <br key={`br-${pIdx}`} />
    }

    // Tokenize for bold (**), italic (*), inline code (`), and links
    const tokens = []
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|https?:\/\/[^\s)]+)/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(part)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(part.substring(lastIndex, match.index))
      }

      const matchText = match[0]
      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        tokens.push(
          <strong key={`b-${pIdx}-${match.index}`} className="font-bold text-neutral-950">
            {matchText.slice(2, -2)}
          </strong>
        )
      } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
        tokens.push(
          <em key={`i-${pIdx}-${match.index}`} className="italic text-neutral-800">
            {matchText.slice(1, -1)}
          </em>
        )
      } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
        tokens.push(
          <code
            key={`c-${pIdx}-${match.index}`}
            className="px-1.5 py-0.5 bg-neutral-100 text-neutral-800 rounded text-xs font-mono border border-neutral-200"
          >
            {matchText.slice(1, -1)}
          </code>
        )
      } else if (matchText.startsWith('http')) {
        tokens.push(
          <a
            key={`a-${pIdx}-${match.index}`}
            href={matchText}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {matchText}
          </a>
        )
      }

      lastIndex = regex.lastIndex
    }

    if (lastIndex < part.length) {
      tokens.push(part.substring(lastIndex))
    }

    return <React.Fragment key={`part-${pIdx}`}>{tokens}</React.Fragment>
  })
}

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null

  // Strip internal reasoning tags (<think>...</think>) if present
  const cleanContent = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  const lines = cleanContent.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // 1. Table Detection (| Header | Header |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < lines.length && lines[i + 1].includes('|-')) {
      const headerLine = trimmed
      const alignLine = lines[i + 1].trim()
      const headers = headerLine
        .split('|')
        .slice(1, -1)
        .map((h) => h.trim())

      i += 2 // skip header and alignment divider

      const rows = []
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        const rowCells = lines[i]
          .trim()
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim())
        rows.push(rowCells)
        i++
      }

      elements.push(
        <div key={`table-${i}`} className="my-4 overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-neutral-200 text-left text-xs sm:text-sm">
            <thead className="bg-neutral-100/80 text-neutral-900 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                {headers.map((h, hIdx) => (
                  <th key={hIdx} className="px-4 py-3 font-bold border-b border-neutral-200">
                    {parseInlineFormatting(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="even:bg-neutral-50/50 hover:bg-neutral-100/40 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 text-neutral-800 leading-relaxed align-top">
                      {parseInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // 2. Fenced Code Block (``` ... ```)
    if (trimmed.startsWith('```')) {
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // Skip closing ```
      elements.push(
        <pre
          key={`code-${i}`}
          className="my-3 p-4 bg-neutral-900 text-neutral-100 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-neutral-800 shadow-inner"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      continue
    }

    // 3. Headings (# H1, ## H2, ### H3, #### H4)
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${i}`} className="text-base font-bold text-neutral-950 mt-4 mb-2 tracking-tight">
          {parseInlineFormatting(trimmed.slice(4))}
        </h4>
      )
      i++
      continue
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h2-${i}`} className="text-lg font-extrabold text-neutral-950 mt-5 mb-2.5 tracking-tight border-b border-neutral-100 pb-1">
          {parseInlineFormatting(trimmed.slice(3))}
        </h3>
      )
      i++
      continue
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h1-${i}`} className="text-xl font-black text-neutral-950 mt-6 mb-3 tracking-tight">
          {parseInlineFormatting(trimmed.slice(2))}
        </h2>
      )
      i++
      continue
    }

    // 4. Horizontal Rule (---, ***)
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      elements.push(<hr key={`hr-${i}`} className="my-4 border-t border-neutral-200" />)
      i++
      continue
    }

    // 5. Blockquote (> Note:)
    if (trimmed.startsWith('> ')) {
      const quoteLines = [trimmed.slice(2)]
      i++
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2))
        i++
      }
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 pl-4 py-1 border-l-3 border-black bg-neutral-50/70 rounded-r-xl text-neutral-700 italic text-xs sm:text-sm"
        >
          {parseInlineFormatting(quoteLines.join(' '))}
        </blockquote>
      )
      continue
    }

    // 6. Unordered List Items (- item, * item, • item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      const listItems = []
      while (
        i < lines.length &&
        (lines[i].trim().startsWith('- ') ||
          lines[i].trim().startsWith('* ') ||
          lines[i].trim().startsWith('• '))
      ) {
        const itemText = lines[i].trim().replace(/^[-*•]\s+/, '')
        listItems.push(itemText)
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2.5 space-y-1.5 pl-2 text-xs sm:text-sm">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-2.5 text-neutral-800 leading-relaxed">
              <span className="text-neutral-400 mt-1 select-none text-[10px]">✦</span>
              <span className="flex-1">{parseInlineFormatting(item)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    // 7. Numbered List Items (1. item, 2. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const numItems = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s+/, '')
        numItems.push(itemText)
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2.5 space-y-1.5 pl-2 text-xs sm:text-sm">
          {numItems.map((item, nIdx) => (
            <li key={nIdx} className="flex items-start gap-2.5 text-neutral-800 leading-relaxed">
              <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-neutral-200">
                {nIdx + 1}
              </span>
              <span className="flex-1">{parseInlineFormatting(item)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }

    // 8. Empty lines
    if (!trimmed) {
      i++
      continue
    }

    // 9. Standard Paragraph
    elements.push(
      <p key={`p-${i}`} className="mb-2.5 last:mb-0 leading-relaxed text-xs sm:text-sm text-neutral-800 font-normal">
        {parseInlineFormatting(line)}
      </p>
    )
    i++
  }

  return <div className={`markdown-body space-y-1 ${className}`}>{elements}</div>
}
