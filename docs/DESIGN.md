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
- Logo/wordmark: italic serif, e.g. *LectureScribe* — same treatment as the "SasuSync" script logo
- Headlines: large, bold, sans-serif (Inter/Helvetica-style, 700-800 weight)
- Emphasis word inside a headline: switch to italic serif for one key word
  — e.g. "Turn your lecture into *notes*.", "Study without the *friction*."
- Body/subtext: regular weight, gray, smaller size, centered under headlines on landing sections

## Buttons
- Primary: solid black, fully rounded (pill shape), white bold text
- Secondary: white/transparent background, thin black outline, black text, same pill shape
- Nav "Menu" button: black pill, white text, chevron icon, top-right corner

## Navigation & Menu Dropdown
- Clean top bar: wordmark logo on the left, single "Menu" pill button on the right.
- Clicking the "Menu" pill opens a sleek, high-contrast dropdown containing four items in exact order:
  1. **HOME** — Returns to the landing page
  2. **TRY LECTURESCRIBE** — Navigates to the trial page (3 free uploads)
  3. **LOGIN** — Navigates to the account login/signup page
  4. **ABOUT** — Navigates to the static mission and overview page
- Styled with black/white high-contrast aesthetics, rounded borders, and subtle hover highlights.

## Page Layouts & Screens

### 1. Landing Page (`/`)
- Light background with subtle flowing spline waveforms below the header.
- Centered contained marquee above the main headline.
- Headline: "Turn your lecture into *notes*."
- Action buttons: "Upload a lecture" (solid black) and "See an example" (pill outline with badge).
- Feature cards: 3-column card grid ("Three things, done properly.").
- Dark hero card: "Studying with an *AI scribe*?"

### 2. Trial Page (`/trial`)
- Reuses the core upload → status → results UI.
- Gated by server-side signed trial session cookie tracking up to 3 uses:
  - If < 3 uses: Shows the standard clean upload card with a badge indicating remaining credits (e.g. "Free Trial • 3 of 3 remaining").
  - If 3 uses consumed: Displays a bordered card stating "You've completed your 3 free trials", highlighting the benefits of a full account, with a bold primary button: "Create an Account to Continue".

### 3. About Page (`/about`)
- Hero section: "Smarter lecture notes, built for *students*."
- Problem & Solution narrative with clean typography.
- 3-card "Architecture & Philosophy" grid (Speech Intelligence, Semantic Synthesis, Grounded Tutor).
- Clean footer with navigation links.

### 4. Auth Page (`/login`)
- Centered auth card on clean white background.
- Pill toggle between "Log in" and "Create account".
- Form inputs: Email address and Password with rounded pill outlines.
- Primary pill submit button: "Sign in" / "Create my account".
- Clean error messaging container for invalid credentials or email conflicts.

### 5. Protected Workspace (`/workspace`)
- Full academic hub for registered students.
- Header displays user email badge and a "Log out" button.
- Unlimited lecture upload zone, past lecture session history, and full study toolkit.

## What NOT to borrow
- No SMS/telecom-specific content (networks, credits, pricing bundles)
- No color accents beyond black/white/gray
- Keep it to LectureScribe's own copy and features only
