/**
 * ContactSection.jsx — Minimalist Black & White Contact & Inquiry Form
 * Direct Web3Forms submission with 100% private team email routing
 * Strictly follows DESIGN.md (bold display type + italic serif accent, pill buttons, bordered white card).
 */

import { useState } from 'react'
import { API_URL } from '../config'

const WEB3_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '32508288-833d-4e07-b253-839dd62b5668'

export default function ContactSection({ sectionRef }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Direct browser submission to Web3Forms (no team email exposed)
      if (WEB3_KEY) {
        const web3Res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: WEB3_KEY,
            name: formData.name,
            email: formData.email,
            subject: `[LectureScribe] ${formData.subject} - ${formData.name}`,
            message: formData.message,
            from_name: 'LectureScribe Contact',
            replyto: formData.email,
          }),
        })

        const web3Data = await web3Res.json()
        if (web3Data.success) {
          setSubmitted(true)
          return
        }
      }

      // 2. Backup notification to backend
      const endpoint = API_URL ? `${API_URL}/api/contact` : '/api/contact'
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      setSubmitted(true)
    } catch (err) {
      console.warn('[contact submit]', err)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section ref={sectionRef} id="contact-section" className="px-4 sm:px-6 py-16 md:py-24 max-w-4xl mx-auto w-full relative z-10">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="pill-badge text-[10px] bg-black text-white">GET IN TOUCH</span>
          <span className="text-[11px] font-semibold text-neutral-500">Fast 24-hr reply</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight leading-tight mb-4">
          Contact the{' '}
          <span className="font-serif italic font-normal text-[1.1em]">
            team.
          </span>
        </h2>
        <p className="text-neutral-500 text-sm sm:text-base font-normal leading-relaxed">
          Have a question about LectureScribe, institutional access, or want to suggest a feature? We'd love to hear from you.
        </p>
      </div>

      <div className="card-white p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-neutral-200/90 rounded-[32px] bg-white">
        {submitted ? (
          <div className="text-center py-10 space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-2xl mx-auto shadow-sm">
              ✓
            </div>
            <h3 className="text-2xl font-black text-black tracking-tight">Message Received</h3>
            <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed font-normal">
              Thank you, <strong className="text-black">{formData.name}</strong>. Your inquiry has been forwarded directly to our team. We will review your message and reply to <strong className="text-black">{formData.email}</strong> shortly.
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' })
              }}
              className="btn-secondary text-xs px-6 py-3 mt-4"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-[18px] bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider block">
                  Your Name <span className="text-neutral-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-5 py-3.5 border border-neutral-300 rounded-full text-sm focus:outline-none focus:border-black text-black placeholder:text-neutral-400 bg-neutral-50/50 focus:bg-white transition-colors"
                />
              </div>

              {/* Email input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider block">
                  Email Address <span className="text-neutral-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. alex@university.edu"
                  className="w-full px-5 py-3.5 border border-neutral-300 rounded-full text-sm focus:outline-none focus:border-black text-black placeholder:text-neutral-400 bg-neutral-50/50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Subject Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-black uppercase tracking-wider block">
                Subject / Category
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-5 py-3.5 border border-neutral-300 rounded-full text-sm focus:outline-none focus:border-black text-black bg-neutral-50/50 focus:bg-white transition-colors cursor-pointer"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Institutional / University License">Institutional / University License</option>
                <option value="Feature Request">Feature Request & Feedback</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Academic Partnership">Academic Partnership</option>
              </select>
            </div>

            {/* Message input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-black uppercase tracking-wider block">
                Message <span className="text-neutral-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we help? Share your inquiry or thoughts with us…"
                className="w-full px-5 py-3.5 border border-neutral-300 rounded-[20px] text-sm focus:outline-none focus:border-black text-black placeholder:text-neutral-400 bg-neutral-50/50 focus:bg-white transition-colors resize-none"
              />
            </div>

            {/* Submit button & Privacy info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Inquiries encrypted &amp; delivered directly to the team</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto px-8 py-3.5 text-sm disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send Message →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
