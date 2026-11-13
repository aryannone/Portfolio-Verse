# PORTFOLIO-VERSE

A free portfolio builder for students and beginner professionals.
Next.js (Vercel) + Supabase (Google login, Postgres, storage).

## What is built so far

- Landing page (`/`): a hero where visitors type a name and switch templates, all nine templates, and three working feature demos
- Template gallery (`/templates`), with nine templates
- Details form (`/start`): a step-by-step form filled in before choosing a template. Once it has details, every template preview shows them
- Editor (`/editor`): pick a template, colour and heading font, fill in details, add sections and entries, add photos to any entry
- Mix and match: page background, header layout, photo size, animation and each section's style can be set in any template, and "Build your own" starts from a blank canvas
- Photo panel: a visitor taps an entry that has photos and a panel slides in from the right (from the bottom on phones). It shows the entry's details and its photos in one of three layouts: stack, mosaic or slideshow
- Card sections arrange themselves by count: 2 or 3 side by side, 4 as two pairs, 5 and 7 with one tall card, 6 as two threes
- Download: the editor builds one self-contained HTML file of the portfolio
- Saved templates (`/saved`): named copies saved from the editor, each with download, open in editor and delete
- Contact section: a headline, a message form (through the visitor's email app, or straight to the inbox via FormSubmit if the owner chooses), the email with a copy button, links, and the photo on a card that tilts to the pointer
- Background removal for the contact photo, done in the browser with MediaPipe's selfie segmenter (`lib/cutout.ts`). The model is in `public/vendor/mediapipe/`; the engine is copied there from `node_modules` by `scripts/copy-vendor.mjs` on every build
- Entry links, and a quote block above Contact
- Sample pictures are drawn mock-ups matched to each sample person (charts, drawings, app screens, posters)
- Per-section look: each section can have its own background, text colour, accent and font
- Details panel: entries with photos or a full write-up show "See details", which opens the panel headed by the section name
- Login is switched off for now. Every page is open to everyone, and each visitor's work is saved in their own browser (IndexedDB)
- Not built yet: accounts, publishing to a personal link, résumé upload

## Brand

- Accent colour: purple `#8c52ff`, set once as `--accent` in `app/globals.css`
- Logo: `components/Logo.tsx` (used in the site), `public/logo-mark.svg` (standalone file), `app/icon.svg` (browser tab)

## Folders

- `app/` pages and routes
- `components/` shared UI. `PortfolioView` draws a portfolio, `StartForm` is the details form, `Editor` is the editor, `Fields` holds the form pieces they share
- `lib/` data model (`portfolio.ts`), sample people, template list, browser storage, HTML export
- `lib/runtime.ts` the photo panel and scroll animations. The same function is copied into downloaded files
- `public/portfolio.css` all template styles. Also copied into downloaded files
- `supabase/schema.sql` database tables and security rules, for when login returns
- `legacy-builder/` the original single-file builder, kept for reference

## Environment variables

See `.env.example`. They are not used while login is switched off.
