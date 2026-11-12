import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree, Fraunces, Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";

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

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "PORTFOLIO-VERSE: your portfolio, ready in ten minutes",
    template: "%s · PORTFOLIO-VERSE",
  },
  description:
    "A free portfolio website builder for students and first-job seekers. Fill in your details, add photos, pick a template and download your site.",
  openGraph: {
    title: "PORTFOLIO-VERSE",
    description:
      "Create and host your portfolio website for free. No code, no developer, no cost.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${serif.variable} ${tech.variable} ${elegant.variable}`}>
      <head>
        {/* Template styles live in public/ so the editor can also copy them into downloaded portfolios. */}
        <link rel="stylesheet" href="/portfolio.css" precedence="default" />
      </head>
      <body>{children}</body>
    </html>
  );
}
