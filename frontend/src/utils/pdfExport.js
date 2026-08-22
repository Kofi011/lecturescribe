/**
 * utils/pdfExport.js — High-quality client-side Academic PDF Export with LectureScribe Stamp
 */

import { jsPDF } from 'jspdf'

/**
 * Generate and download a branded LectureScribe study notes PDF document.
 * @param {Object} lecture - The lecture object with notes, overview, key concepts, etc.
 */
export function exportLectureToPdf(lecture) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 18
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const title = lecture?.title || 'Lecture Study Notes'
  const dateStr = lecture?.date ? new Date(lecture.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString()
  const durationText = lecture?.durationSec ? `${Math.round(lecture.durationSec / 60)} min` : ''
  const engineText = 'LectureScribe Neural Acoustic Engine'

  // Helper to add new page and maintain headers/footers
  function checkPageBreak(spaceNeeded = 15) {
    if (y + spaceNeeded > pageHeight - 20) {
      doc.addPage()
      y = margin + 5
      drawPageHeaderStamp()
    }
  }

  function drawPageHeaderStamp() {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('LECTURESCRIBE • ACADEMIC STUDY SYSTEM', margin, 12)
    doc.text(title.length > 40 ? title.substring(0, 37) + '…' : title, pageWidth - margin, 12, { align: 'right' })
    doc.setDrawColor(230, 230, 230)
    doc.line(margin, 14, pageWidth - margin, 14)
  }

  // ─── 1. COVER / DOCUMENT HEADER STAMP ──────────────────────────────────────
  // Top Banner Pill Badge
  doc.setFillColor(0, 0, 0)
  doc.roundedRect(margin, y, 42, 6.5, 3.25, 3.25, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(255, 255, 255)
  doc.text('OFFICIAL SYNTHESIS', margin + 21, y + 4.5, { align: 'center' })

  // Academic Stamp Seal Box (Right)
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.6)
  doc.roundedRect(pageWidth - margin - 45, y, 45, 14, 2, 2, 'D')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(0, 0, 0)
  doc.text('LECTURESCRIBE VERIFIED', pageWidth - margin - 22.5, y + 5.5, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(100, 100, 100)
  doc.text(`${dateStr} • AI STAMP`, pageWidth - margin - 22.5, y + 10, { align: 'center' })

  y += 12

  // Brand Wordmark
  doc.setFont('times', 'italic')
  doc.setFontSize(20)
  doc.setTextColor(0, 0, 0)
  doc.text('LectureScribe', margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(120, 120, 120)
  doc.text('Grounded Academic Note Generation & Knowledge Synthesis', margin, y + 5)

  y += 13

  // Divider Line
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // Document Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  const titleLines = doc.splitTextToSize(title, contentWidth)
  doc.text(titleLines, margin, y)
  y += titleLines.length * 7.5 + 2

  // Meta details bar
  doc.setFillColor(248, 248, 248)
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(80, 80, 80)
  let metaInfo = `Date: ${dateStr}`
  if (durationText) metaInfo += `   |   Duration: ~${durationText}`
  if (engineText) metaInfo += `   |   Speech Engine: ${engineText}`
  if (lecture?.fileName) metaInfo += `   |   Source: ${lecture.fileName}`
  doc.text(metaInfo, margin + 4, y + 5.2)

  y += 14

  // ─── 2. EXECUTIVE OVERVIEW ────────────────────────────────────────────────
  if (lecture?.overview) {
    checkPageBreak(30)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Executive Overview', margin, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(50, 50, 50)
    const overviewLines = doc.splitTextToSize(lecture.overview, contentWidth)
    doc.text(overviewLines, margin, y)
    y += overviewLines.length * 5 + 8
  }

  // ─── 3. KEY CONCEPTS ─────────────────────────────────────────────────────
  if (Array.isArray(lecture?.key_concepts) && lecture.key_concepts.length > 0) {
    checkPageBreak(35)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Key Concepts Explained', margin, y)
    y += 6

    lecture.key_concepts.forEach((c) => {
      checkPageBreak(18)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(0, 0, 0)
      doc.text(`• ${c.concept}`, margin + 2, y)
      y += 4.5

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(70, 70, 70)
      const expLines = doc.splitTextToSize(c.explanation, contentWidth - 6)
      doc.text(expLines, margin + 6, y)
      y += expLines.length * 4.5 + 4
    })
    y += 4
  }

  // ─── 4. MAIN ARGUMENTS & IDEAS ───────────────────────────────────────────
  if (Array.isArray(lecture?.main_arguments) && lecture.main_arguments.length > 0) {
    checkPageBreak(30)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Main Arguments & Core Theses', margin, y)
    y += 6

    lecture.main_arguments.forEach((arg) => {
      checkPageBreak(14)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(60, 60, 60)
      const argLines = doc.splitTextToSize(`— ${arg}`, contentWidth - 4)
      doc.text(argLines, margin + 4, y)
      y += argLines.length * 4.5 + 2.5
    })
    y += 6
  }

  // ─── 5. DETAILED STUDY NOTES ──────────────────────────────────────────────
  if (Array.isArray(lecture?.study_notes) && lecture.study_notes.length > 0) {
    checkPageBreak(35)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Detailed Study Notes', margin, y)
    y += 6

    lecture.study_notes.forEach((section) => {
      checkPageBreak(20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text(section.heading, margin + 2, y)
      y += 5

      if (Array.isArray(section.points)) {
        section.points.forEach((pt) => {
          checkPageBreak(12)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9)
          doc.setTextColor(60, 60, 60)
          const ptLines = doc.splitTextToSize(`• ${pt}`, contentWidth - 8)
          doc.text(ptLines, margin + 6, y)
          y += ptLines.length * 4.5 + 2
        })
      }
      y += 4
    })
    y += 4
  }

  // ─── 6. ESSENTIAL GLOSSARY ────────────────────────────────────────────────
  if (Array.isArray(lecture?.important_terms) && lecture.important_terms.length > 0) {
    checkPageBreak(35)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Essential Glossary & Terminology', margin, y)
    y += 6

    lecture.important_terms.forEach((item) => {
      checkPageBreak(16)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(0, 0, 0)
      doc.text(`${item.term}:`, margin + 2, y)

      const termWidth = doc.getTextWidth(`${item.term}: `)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(70, 70, 70)

      if (termWidth < 50) {
        const defLines = doc.splitTextToSize(item.definition, contentWidth - termWidth - 4)
        doc.text(defLines, margin + 2 + termWidth, y)
        y += defLines.length * 4.5 + 3
      } else {
        y += 4.5
        const defLines = doc.splitTextToSize(item.definition, contentWidth - 6)
        doc.text(defLines, margin + 6, y)
        y += defLines.length * 4.5 + 3
      }
    })
    y += 4
  }

  // ─── 7. HIGH-YIELD TAKEAWAYS ──────────────────────────────────────────────
  if (Array.isArray(lecture?.key_takeaways) && lecture.key_takeaways.length > 0) {
    checkPageBreak(35)
    doc.setFillColor(245, 245, 245)
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.4)

    // Calculate height of takeaways block
    let takeawayTextLines = []
    lecture.key_takeaways.forEach((t) => {
      const lines = doc.splitTextToSize(`✓  ${t}`, contentWidth - 12)
      takeawayTextLines.push(lines)
    })
    const totalLinesCount = takeawayTextLines.reduce((acc, l) => acc + l.length, 0)
    const blockHeight = 12 + totalLinesCount * 4.8

    if (y + blockHeight > pageHeight - 20) {
      doc.addPage()
      y = margin + 5
      drawPageHeaderStamp()
    }

    doc.roundedRect(margin, y, contentWidth, blockHeight, 3, 3, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(0, 0, 0)
    doc.text('High-Yield Takeaways', margin + 6, y + 7)

    let subY = y + 13
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(40, 40, 40)

    takeawayTextLines.forEach((lines) => {
      doc.text(lines, margin + 6, subY)
      subY += lines.length * 4.8 + 1.5
    })

    y += blockHeight + 8
  }

  // ─── 8. SELF-TEST REVISION QUESTIONS ──────────────────────────────────────
  if (Array.isArray(lecture?.revision_questions) && lecture.revision_questions.length > 0) {
    checkPageBreak(35)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Self-Test Revision Questions & Solutions', margin, y)
    y += 6

    lecture.revision_questions.forEach((q, idx) => {
      checkPageBreak(22)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(0, 0, 0)
      const qLines = doc.splitTextToSize(`Q${idx + 1}: ${q.question}`, contentWidth - 4)
      doc.text(qLines, margin + 2, y)
      y += qLines.length * 4.5 + 2

      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8.5)
      doc.setTextColor(80, 80, 80)
      const aLines = doc.splitTextToSize(`Answer: ${q.answer}`, contentWidth - 8)
      doc.text(aLines, margin + 6, y)
      y += aLines.length * 4.2 + 4
    })
  }

  // ─── STAMP FOOTERS ON ALL PAGES ───────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Footer line
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.4)
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12)

    // Footer text
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(140, 140, 140)
    doc.text('Generated by LectureScribe • Academic Study System', margin, pageHeight - 7.5)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 7.5, { align: 'right' })
  }

  // Download PDF
  const safeName = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  doc.save(`${safeName}-lecturescribe.pdf`)
}
