import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree, Fraunces } from "next/font/google";
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

// Only used when someone picks the serif heading font, so it is not preloaded.
const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "PORTFOLIO-VERSE: your portfolio, live in ten minutes",
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
    <html lang="en" className={`${display.variable} ${body.variable} ${serif.variable}`}>
      <head>
        {/* Template styles live in public/ so the editor can also copy them into downloaded portfolios. */}
        <link rel="stylesheet" href="/portfolio.css" precedence="default" />
      </head>
      <body>{children}</body>
    </html>
  );
}
