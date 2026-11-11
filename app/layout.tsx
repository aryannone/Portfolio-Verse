import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "PORTFOLIO-VERSE: your portfolio, live in ten minutes",
    template: "%s · PORTFOLIO-VERSE",
  },
  description:
    "A free portfolio website builder for students and first-job seekers. Sign in with Google, fill in your details, pick a template and publish.",
  openGraph: {
    title: "PORTFOLIO-VERSE",
    description:
      "Create and host your portfolio website for free. No code, no developer, no cost.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
