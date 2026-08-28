# Design Brief — Frontend

## Your creative freedom

You are **NOT** bound by the project's existing `DESIGN.md` (the black/white, sms.sasusync.com-inspired style used in the earlier build). Design your own visual direction for LectureScribe from scratch — palette, typography, button style, layout language, all your call.

## Requirements that still apply regardless of your visual choices

### Screens you must design

Your design must cover every page and state in your `TASKS.md` and `CONTEXT.md`:

| Screen | Key elements |
|---|---|
| **Landing page** (`/`) | Hero section with headline + CTAs, feature highlights, mid-page call-to-action, contact/inquiry section, footer |
| **Trial page** (`/trial`) | Upload interface, processing status indicator, results display, remaining trial credits badge, trial exhaustion state with registration CTA |
| **Auth page** (`/login`) | Login form, signup form, toggle between modes, validation errors |
| **Workspace** (`/workspace`) | Upload zone, past lecture library grid, lecture detail view (transcript + notes + tutor), user profile/logout |
| **About page** (`/about`) | Mission/hero section, problem statement, solution narrative, technology/philosophy highlights |
| **Results view** | Tab switcher (Transcript / Notes), structured notes with sections/concepts/terms/questions, copy/download/export controls, audio player, AI Tutor chat panel |
| **Processing states** | Upload progress, staged indicator (Uploaded → Transcribing → Summarizing → Complete), error states |
| **Navigation** | Top nav bar, menu dropdown (HOME, TRY LECTURESCRIBE, LOGIN, ABOUT), mobile navigation |

### Hard constraints (non-negotiable)

- **Mobile-responsive** across all pages (phones, tablets, desktops)
- **Accessible contrast** and readable type at every size (aim for WCAG AA)
- **Consistent** — whatever system you choose, apply it uniformly across all screens
- **No API keys or secrets** in frontend code
- **Specific error messages** — every failure state gets a clear, human-readable message

### Document your design decisions

As you make design choices, create a **new `DESIGN.md`** in this same folder (`docs/team/frontend/DESIGN.md`) documenting:

- Color palette (with hex values and usage rules)
- Typography choices (font families, weights, sizes for headings/body/captions)
- Button styles (primary, secondary, states)
- Spacing system (if using a scale)
- Component patterns (cards, modals, inputs, badges)
- Any motion/animation guidelines

This becomes the reference for the rest of the team and future-you to stay consistent across screens. Update it as your design evolves.

## Inspiration (optional starting points)

If you want inspiration, consider looking at:
- Modern academic/study tools (Notion, Linear, Vercel's dashboard)
- Premium SaaS product pages (Stripe, Framer, Arc browser)
- Minimal but warm palettes (not necessarily black-and-white)

But you're free to go in any direction. Make it yours.
