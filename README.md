# PORTFOLIO-VERSE

[![CI](https://github.com/aryannone/Portfolio-Verse/actions/workflows/ci.yml/badge.svg?branch=app)](https://github.com/aryannone/Portfolio-Verse/actions/workflows/ci.yml)

**A free portfolio website builder for students and first-job seekers.** Fill in your details (or import your résumé), pick one of nine templates, tweak the design, and download your whole site as a single HTML file. No sign-up, no code, no cost.

**Live:** [portfolio-verse-tau.vercel.app](https://portfolio-verse-tau.vercel.app)

![Landing page](docs/landing.jpg)

## Why I built it

Most students need a portfolio site for internship and job applications, but website builders are either paid, need an account, or produce generic pages. PORTFOLIO-VERSE works entirely in the browser:
- nothing to sign up for
- nothing to pay
- your data never leaves your device

## Features

- **9 templates, one data model:** Classic, Résumé, Timeline, Case study, Split screen, Bold, Aurora, Editorial and Bento, plus "Build your own". Your details appear in every template, so you can switch at any time without retyping.
- **Live editor:**
  - colours, fonts, backgrounds, header layouts, photo frames and scroll animations, set for the whole page or per section
  - reorder sections and entries
  - desktop and phone preview
- **Résumé import:** reads a résumé PDF in the browser and fills in the details.
- **Résumé PDF export:** generates a clean résumé from the same details.
- **Photo background removal:** a person-segmentation model running in the browser cuts you out of your photo for the contact card.
- **Photos fit their frames:** every photo fills its frame in every template, whatever its shape, and you choose which part of your own photo stays in view.
- **Feedback wall:** visitors pick a sticky note, choose a topic and a handwriting style, sign it, and drag it onto a cork board on the home page. One note per browser; notes appear for everyone once the owner approves them, and the writer sees theirs straight away.
- **Interactive contact section:** a 3D character that follows the pointer, watches visitors type and cheers when a message is sent; or your photo, a design, or nothing. The message form works through the visitor's email app or straight to your inbox.
- **Details panel:** visitors tap a project or job to open a side panel (a bottom sheet on phones) with the full story and photos.
- **Section navigation:** a sticky section bar, reading progress and back-to-top in every portfolio.
- **Many portfolios per browser:** autosave, rename, copy and delete. Details and designs are independent, so any details can go in any template.
- **One-file export:** the downloaded `.html` holds the styles, photos and interactions, and works offline or on any host (GitHub Pages, Netlify, Vercel...).
- **Accessible:** keyboard-friendly, labelled controls, and every animation is turned off for people who ask for reduced motion.

| Template gallery | Editor |
| --- | --- |
| ![Templates](docs/templates.jpg) | ![Editor](docs/editor.jpg) |

| Case study template | On a phone |
| --- | --- |
| ![Case study](docs/template-case-study.jpg) | ![Phone](docs/phone.jpg) |

## Tech stack

- **Next.js 15 (App Router), React 19, TypeScript**, deployed on **Vercel**
- **IndexedDB** for everyone's portfolios, kept in their own browser
- **Supabase** (Postgres, through Next.js route handlers) only for the public feedback wall
- **MediaPipe Selfie Segmenter** (WebAssembly) for background removal
- **pdf.js** to read résumés, **jsPDF** to write them
- Hand-written CSS with custom properties and container queries; no UI library

## Engineering highlights

- **Portfolios never leave the device.**
  - Every builder feature, including machine-learning background removal and PDF parsing, runs on the user's device.
  - Running costs stay at zero, and the privacy story is simple: we never receive anyone's portfolio.
  - The only server code is the feedback wall: two small route handlers (`app/api/feedback`). They validate notes with the same rules as the browser (`lib/feedback.ts`), store them in Supabase with row-level security on and no public policies, and enforce one note per browser with a unique key. A private admin page approves notes.
  - The ML model and PDF engine are served by the site itself and loaded only when used (`scripts/copy-vendor.mjs`).
- **One renderer, three places.**
  - `components/PortfolioView.tsx` renders every template from one markup tree.
  - The template's interactions (`lib/runtime.ts`) are written as a self-contained function. It runs in the editor and on preview pages, and is serialised into the downloaded HTML file (`lib/exportHtml.ts`), so the exported site behaves exactly like the preview.
- **Templates as styles, not code.** Each template is a set of CSS rules over shared markup (`public/portfolio.css`), so the editor's options combine with any template.
- **Safe, versioned storage.**
  - Portfolios are saved per id in IndexedDB with transactional updates (`lib/store.ts`).
  - Older saved data is migrated on load (`normalize` in `lib/portfolio.ts`), including templates that were merged or retired.
- **Résumé parsing without AI APIs.** `lib/resumeImport.ts` rebuilds lines from pdf.js text positions, finds section headings and pulls out names, links, dates and bullet points with patterns. The user always checks the result, and the UI says so.

## Lighthouse

Landing page, Lighthouse 12 (mobile, simulated throttling), median of three runs:

| Performance | Accessibility | Best practices | SEO |
| :---: | :---: | :---: | :---: |
| ~88 | 100 | 100 | 100 |

Performance is measured with the opening animation playing. It covers the page for about 3.5 seconds on every load, which Lighthouse counts as slow visual progress. With reduced motion (no intro), Performance is about 92 and Speed Index drops from about 3 s to 1.2 s.

Work done for these scores:
- accent colour deepened wherever it is small text, or sits behind small white text, to pass WCAG AA contrast
- correct heading order in the template gallery
- template styles minified at build time
- below-the-fold landing sections drawn only when near the screen (`content-visibility`), which halved main-thread work
- previews sized through `ResizeObserver` to avoid forced reflows

## Tests

Every push runs the [CI workflow](.github/workflows/ci.yml): type-check, unit tests, a production build and browser tests.

- **Unit tests** (Vitest, `tests/unit`): link handling, file names, samples for every template, moving details between templates, upgrading portfolios saved by older versions, and the feedback note rules.
- **Browser tests** (Playwright, `tests/e2e`):
  - **Landing page:** the intro plays and can be skipped; every section appears on scroll; the four steps advance; the privacy page; the link preview image.
  - **Feedback wall:** a note needs a name; it sticks by button or by dragging; one per browser, even after a reload; the API without Supabase and the admin key check.
  - **Editor:** typing shows in the preview and survives a reload; the downloaded HTML file works on its own; photo format checks; a résumé PDF made by the site imports back; "Save a copy" adds a second portfolio.

```bash
npm run typecheck
npm test            # unit tests
npm run build
npm run test:e2e    # browser tests (starts the built site)
```

## Project structure

```
app/          pages: landing, /start (details form), /templates, /editor, /saved, /privacy, /admin/feedback
              api/feedback: the feedback wall's routes
components/   UI: PortfolioView (templates), Editor, Fields, StartForm, ContactBlock, StepsShowcase, FeedbackWall, Intro...
lib/          portfolio.ts (data model), store.ts (IndexedDB), runtime.ts (portfolio interactions), feedback.ts,
              exportHtml.ts, resumeImport.ts, resumePdf.ts, cutout.ts, templates.ts, samples.ts
public/       portfolio.css (all template styles, also copied into exports), logo
supabase/     feedback.sql (the feedback wall's table)
docs/         README screenshots
```

## Run it locally

Requires Node.js 18.18 or newer. The builder needs no settings. The feedback wall needs three environment variables; without them the wall shows as empty and closed:

| Variable | What it is |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL (Project Settings, API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key: server only, never exposed to the browser |
| `FEEDBACK_ADMIN_KEY` | Any long secret you choose, at least 12 characters; opens `/admin/feedback` |

Create the table once by running `supabase/feedback.sql` in Supabase's SQL editor.

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` makes a production build.

## Privacy

Portfolios are stored only in the user's browser. There is no account, analytics or tracking. Feedback notes (name, topic, message and a random browser id) are stored in Supabase, and shown publicly only after approval. See [/privacy](https://portfolio-verse-tau.vercel.app/privacy).
