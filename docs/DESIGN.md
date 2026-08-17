# DESIGN.md — Visual style guide (inspired by sms.sasusync.com)

This defines the look and feel for LectureScribe's frontend. Reference:
https://sms.sasusync.com/ — borrow the visual language below, not the content.

## Overall feel
Minimal, high-contrast, confident. Black-and-white only — no accent colors.
Generous whitespace. Bold display type mixed with an italic serif accent
word for emphasis. Feels premium and simple, not "startup gradient."

## Color palette
- `#000000` — primary black (text, buttons, dark hero backgrounds)
- `#FFFFFF` — primary white (backgrounds, button text on dark)
- Grayscale only for secondary text (`#6B7280`-ish gray for subtext/captions)
- No blue links, no brand accent color — contrast does the work

## Typography
- Logo/wordmark: italic serif, e.g. *LectureScribe* — same treatment as
  the "SasuSync" script logo
- Headlines: large, bold, sans-serif (e.g. Inter/Helvetica-style, 700-800 weight)
- Emphasis word inside a headline: switch to italic serif for one key word
  — e.g. "Turn your lecture into *notes*." (mirrors "Building with an
  *AI agent*?" and "Messages that *arrive* in Ghana.")
- Body/subtext: regular weight, gray, smaller size, centered under headlines
  on landing sections

## Buttons
- Primary: solid black, fully rounded (pill shape), white bold text
- Secondary: white/transparent background, thin black outline, black text,
  same pill shape
- Nav "Menu" button: black pill, white text, chevron icon, top-right corner

## Navigation
- Simple top bar: wordmark logo on the left, single "Menu" pill button on
  the right — no long inline nav link list
- Optional horizontal scrollable pill/tab row below the nav for categories
  (mirrors the network-name ticker in the reference)

## Sections & layout
- Alternate light and dark full-width sections down the page for rhythm
  (e.g. dark rounded hero card on a white page, then a plain white section,
  then a dark section again)
- Hero sections: centered headline + subtext + two buttons (one solid, one
  outline), generous vertical padding
- Feature sections: 3-column card grid on desktop, stacks to 1 column on
  mobile. Each card = icon (simple line icon) + short bold heading + 1-2
  sentence gray description
- Decorative subtle wavy line patterns can sit faded in the page margins on
  light sections (optional, purely decorative, low opacity)

## Cards
- White background, thin light-gray border, rounded corners (~16-20px)
- Optional small black pill label above a card for a "highlighted" option
  (e.g. "Popular" / "Best value" — same pattern for showcasing a
  recommended plan or notes template)

## Footer
- Minimal single row: copyright + short tagline on the left, a flat list of
  text links on the right (no columns of links)

## Applying this to LectureScribe

### Landing / Upload page
- Light background, wavy line decoration faint in the margins
- Headline: "Turn your lecture into **notes**." (italic serif on "notes")
- Subtext: one sentence on what it does (upload, transcribe, summarize)
- Two buttons: solid black "Upload a lecture", outline "See an example"
- Upload widget sits in a bordered card below the hero

### Processing page
- Dark rounded hero card (like the reference's dark hero), white bold
  headline e.g. "Processing your lecture."
- Status stages listed inside the dark card, checkmarks/dots in white/gray
  (✓ done, ● in progress, ○ pending) — same restrained, no-color approach

### Results page
- Light background
- Tab pills (Transcript / Notes) styled like the black "Menu" pill /
  network ticker tabs
- Notes shown in a bordered white card, headings bold, bullets plain
- Copy/Download as pill buttons (solid black + outline), placed together
  under the notes card

### Feature/how-it-works section (optional, for a marketing-style landing)
- "Three things, done properly." style section: 3 cards — Transcribe,
  Summarize, Export — each with a simple icon, bold heading, short
  description, matching the reference's Bulk SMS / One-time codes / Voice
  card layout

## What NOT to borrow
- No SMS/telecom-specific content (networks, credits, pricing bundles)
- No color accents beyond black/white/gray
- Keep it to LectureScribe's own copy and features only — this file is a
  **style** reference, not a content template
