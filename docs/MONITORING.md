# MONITORING.md — LectureScribe Analytics & Operational Monitoring

## Privacy Principles & Architecture
- Operational reality only: Aggregate counts, live service health, and anonymous event stream.
- Zero user content or identity exposure: No names, emails, user accounts, IP addresses, audio data, transcripts, or notes.
- The `anon_session_token` from analytics_events is stored in the DB for abuse prevention / rate analysis but must NOT be displayed in the dashboard feed or grouped per visitor.
- Real-time live data: All data pulled live from the database and service health checks.

## Admin Dashboard
A `/admin` route, gated to users with `role = 'admin'`, showing live
operational data only:

**System health panel** (polls `GET /api/health` every ~10s)
- API status, DB connection status, Griot sidecar status — green/red indicators
- Last checked timestamp

**Live usage panel** (polls `GET /api/analytics/live` every ~10s)
- Uploads processed today (count)
- Success vs. failure count today
- Engine split today: Whisper vs. Griot Nano 1 (count each)
- Signups + logins today (count only)
- Trial uploads used today (count only)

**Anonymous activity stream** (polls `GET /api/analytics/stream` every ~10s,
or Server-Sent Events if the agent prefers true push updates)
- Last ~50 events, each shown as: event_name + route + relative timestamp
  ONLY — never the anon_session_token, never any field from `metadata`
  that could contain identifying detail
- This is a firehose of *what kind* of thing is happening, not *who* is
  doing it

**Explicitly excluded from the dashboard, permanently:**
- No list of users, emails, or accounts
- No lecture titles, transcripts, or notes content
- No per-session/per-visitor trails (no grouping by anon_session_token)
- No IP addresses
