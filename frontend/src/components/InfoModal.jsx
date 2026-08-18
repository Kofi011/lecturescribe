/**
 * InfoModal.jsx — Informational & Policy Modal for footer and header tags
 * Requirement 2: Every Clickable Element Must Produce a Relevant Result
 */

export default function InfoModal({ type, isOpen, onClose }) {
  if (!isOpen || !type) return null

  const content = {
    terms: {
      title: 'Terms of Service',
      badge: 'LEGAL & USAGE',
      body: `LectureScribe provides academic speech intelligence and study synthesis tools for students, educators, and researchers.

By using LectureScribe, you agree to:
1. Upload only lecture audio recordings that you own or have permission to analyze.
2. Use generated notes and transcripts for personal study, research, and non-commercial educational purposes.
3. Understand that analysis outputs are intended as study aids and should be reviewed against primary course materials.`,
    },
    privacy: {
      title: 'Student Privacy Policy',
      badge: 'PRIVACY & DATA PROTECTION',
      body: `LectureScribe is built on strict data privacy principles:
1. Zero Permanent Audio Storage: Uploaded audio files are processed in-memory / temporary server storage and immediately deleted upon completion of transcription.
2. Zero Selling of Student Data: Your notes, transcripts, and recordings are never sold, shared with data brokers, or used to build commercial advertising profiles.
3. Local Client Storage: Lecture history is retained locally in your browser storage. You can delete or clear your history at any time.`,
    },
    acceptable_use: {
      title: 'Acceptable Use Guidelines',
      badge: 'COMMUNITY STANDARDS',
      body: `LectureScribe is dedicated to empowering student learning. 

Acceptable Use:
✓ Uploading university lectures, seminar recordings, conference presentations, and study groups.
✓ Generating study guides, flashcards, concept explanations, and revision questions.

Prohibited Use:
✗ Uploading copyrighted commercial audiobooks or unauthorized confidential corporate recordings.
✗ Attempting to bypass file limits through automated scripting or scraping.`,
    },
    contact: {
      title: 'Contact LectureScribe',
      badge: 'SUPPORT & FEEDBACK',
      body: `Have a question, feedback, or feature request? We would love to hear from you.

Email: support@lecturescribe.edu
Location: Kofi Labs · Built for university students worldwide
Response time: Within 24 hours`,
    },
    format_mp3: {
      title: 'MP3 Audio Compatibility',
      badge: 'AUDIO SPECIFICATION',
      body: `MP3 is the universal standard for digital audio recording.
- Supported Bitrates: 32 kbps to 320 kbps (CBR & VBR)
- Sample Rates: 16 kHz to 48 kHz
- Recommendation: 64–128 kbps mono or stereo provides optimal speed and quality for spoken lectures.`,
    },
    format_wav: {
      title: 'WAV Lossless Audio',
      badge: 'AUDIO SPECIFICATION',
      body: `WAV (RIFF PCM) provides uncompressed, studio-grade speech fidelity.
- Channels: Mono or Stereo
- Bit Depth: 16-bit or 24-bit PCM
- Recommendation: Ideal for high-clarity lecture capture with zero loss in acoustic precision.`,
    },
    format_m4a: {
      title: 'M4A / AAC Audio',
      badge: 'AUDIO SPECIFICATION',
      body: `M4A (MPEG-4 AAC) is the default recording format on iPhone Voice Memos and modern mobile devices.
- Compatibility: Direct upload from iOS Voice Memos, Android recorders, and QuickTime.
- Compression: High speech efficiency with low file size per minute.`,
    },
    format_markdown: {
      title: 'Structured Markdown Notes',
      badge: 'EXPORT STANDARD',
      body: `All LectureScribe study summaries export in clean, universal GitHub Flavored Markdown.
- Headings (##), Bullet Points (-), Bold Concept Keywords (**), and Q&A blocks.
- One-click copy or .md download natively compatible with Notion, Obsidian, Bear, and Apple Notes.`,
    },
    format_intelligence: {
      title: 'Speech Intelligence Engine',
      badge: 'CORE ARCHITECTURE',
      body: `LectureScribe analyzes speech acoustic patterns and synthesizes high-yield academic study knowledge in a single unified pipeline.
- Instant vocabulary recognition across STEM, humanities, medicine, and law.
- Automated extraction of definitions, core arguments, and self-test review questions.`,
    },
  }[type] || {
    title: 'LectureScribe Information',
    badge: 'INFO',
    body: 'Academic speech intelligence and study synthesis platform.',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white border border-neutral-200 rounded-[28px] w-full max-w-lg p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="pill-badge mb-3">{content.badge}</span>
        <h3 className="text-2xl font-black text-black tracking-tight mb-4 mt-2">
          {content.title}
        </h3>

        <div className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line mb-8 font-normal">
          {content.body}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary text-xs px-6 py-2.5"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
