import type { Metadata } from "next";
import { Bricolage_Grotesque, Caveat, Figtree, Fraunces, Indie_Flower, Kalam, Patrick_Hand, Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Intro from "@/components/Intro";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// The fonts below are only used when someone picks them in the editor, so they are not preloaded.
const tech = Space_Grotesk({ subsets: ["latin"], variable: "--font-tech", display: "swap", preload: false });
const elegant = Playfair_Display({ subsets: ["latin"], variable: "--font-elegant", display: "swap", preload: false });

// Handwriting for the feedback wall's sticky notes. Not preloaded: they download only when a note uses them.
const noteCaveat = Caveat({ subsets: ["latin"], variable: "--font-note-caveat", display: "swap", preload: false });
const noteKalam = Kalam({ subsets: ["latin"], weight: "400", variable: "--font-note-kalam", display: "swap", preload: false });
const notePatrick = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--font-note-patrick", display: "swap", preload: false });
const noteIndie = Indie_Flower({ subsets: ["latin"], weight: "400", variable: "--font-note-indie", display: "swap", preload: false });
const noteFonts = [noteCaveat, noteKalam, notePatrick, noteIndie].map((f) => f.variable).join(" ");

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

// The public address of the site. Shared-link previews (WhatsApp, LinkedIn...) need the preview image
// as a full public link; without this, Vercel deployments can point it at a protected preview address.
// Set NEXT_PUBLIC_SITE_URL in Vercel when the site moves to a new domain.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://portfolio-verse-tau.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PORTFOLIO-VERSE: your portfolio, ready in ten minutes",
    template: "%s · PORTFOLIO-VERSE",
  },
  description:
    "A free portfolio website builder for students and first-job seekers. Fill in your details, add photos, pick a template and download your site.",
  openGraph: {
    title: "PORTFOLIO-VERSE: your portfolio, ready in ten minutes",
    description:
      "A free portfolio builder for students. Nine templates, résumé import, no sign-up. Download your site as one HTML file.",
    type: "website",
    siteName: "PORTFOLIO-VERSE",
    url: "/",
  },
  // Shared links show the large preview picture (app/opengraph-image.tsx).
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${serif.variable} ${tech.variable} ${elegant.variable} ${noteFonts}`}>
      <head>
        {/* Template styles live in public/ so the editor can also copy them into downloaded portfolios. */}
        <link rel="stylesheet" href="/portfolio.min.css" precedence="default" />
      </head>
      <body>
        <Intro />
        {children}
      </body>
    </html>
  );
}
