import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StartButton from "@/components/StartButton";
import ScaledPreview from "@/components/ScaledPreview";
import HeroShowcase from "@/components/HeroShowcase";
import RevealOnScroll from "@/components/RevealOnScroll";
import FeatureDemos from "@/components/FeatureDemos";
import { TemplateCard } from "@/components/TemplateCard";
import { READY_TEMPLATES } from "@/lib/templates";

const STEPS = [
  { title: "Start building", text: "One click. No account or password needed." },
  { title: "Fill in your details", text: "A short form, one step at a time. Leave and come back whenever you like." },
  { title: "Pick a template", text: "See your own details in every template, or build your own from blank." },
  { title: "Download", text: "Get your whole portfolio as one HTML file and host it anywhere." },
];

const EXTRAS = [
  { title: "Looks right on every screen", text: "Recruiters open links on phones. Your site adapts on its own." },
  { title: "Saves as you type", text: "Your work is kept in this browser, so you can come back to it." },
  { title: "Download the HTML", text: "The site is yours. Take the file and host it wherever you like." },
];

// Who the builder is for. Shown as a moving strip under the hero.
const ROLES = [
  "Data analysts",
  "CA students",
  "Mechanical engineers",
  "Software engineers",
  "Illustrators",
  "Photographers",
  "UX designers",
  "Motion designers",
  "Architects",
  "MBA freshers",
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <RevealOnScroll />
      <main>
        <div className="hero-zone">
        <section className="wrap hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              Free for students and first-job seekers
            </div>
            <h1 className="display h-hero">
              Your portfolio, ready in <span className="mark">ten minutes.</span>
            </h1>
            <p className="lead">
              Fill in your details, add your photos, pick a template and download your site. No
              sign-up, no code, no cost.
            </p>
            <div className="hero-actions">
              <StartButton />
              <Link href="/templates" className="btn btn-outline">
                See templates
              </Link>
            </div>
            <p className="small">Free during beta. No sign-up. Download your HTML any time.</p>
          </div>

          <div className="hero-demo">
            <HeroShowcase />
          </div>
        </section>
        </div>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[...ROLES, ...ROLES].map((role, i) => (
              <span key={i}>
                Built for <strong>{role}</strong>
              </span>
            ))}
          </div>
        </div>

        <section className="band-dark">
          <div className="wrap section">
            <h2 className="display h-section" data-reveal>Four steps. That is all.</h2>
            <ol className="steps">
              {STEPS.map((step, i) => (
                <li key={step.title} className="step" data-reveal style={{ "--i": i } as React.CSSProperties}>
                  <span className="step-num" aria-hidden="true">{i + 1}</span>
                  <div className="step-title">{step.title}</div>
                  <div className="step-text">{step.text}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="wrap section" id="templates">
          <div className="section-head">
            <h2 className="display h-section" data-reveal>Nine templates. Switch whenever you like.</h2>
            <p>
              Five Professional looks for placements and job applications, four Creative ones for designers,
              photographers and makers. Tap any to see the full page.
            </p>
          </div>
          <div className="tg-grid tg-grid-home">
            {READY_TEMPLATES.map((t) => (
              <TemplateCard key={t.id} template={t} compact />
            ))}
          </div>
          <p className="tpl-own" data-reveal>
            Want none of them? <Link href="/templates">Build your own from a blank canvas</Link>.
          </p>
        </section>

        <section className="band" id="features">
          <div className="wrap section">
            <div className="section-head">
              <h2 className="display h-section" data-reveal>Three things you can try right here.</h2>
              <p>These are working pieces of a real portfolio, not pictures of one.</p>
            </div>
            <FeatureDemos />
            <div className="features">
              {EXTRAS.map((f, i) => (
                <div key={f.title} className="feature" data-reveal style={{ "--i": i } as React.CSSProperties}>
                  <strong>{f.title}</strong>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="band-accent">
          <div className="wrap closing" data-reveal>
            <h2 className="display h-section">Ten minutes from now, you could have a portfolio.</h2>
            <p>No sign-up and nothing to install. Your work stays in your browser until you download it.</p>
            <div className="hero-actions">
              <StartButton />
              <Link href="/templates" className="btn btn-outline">
                See the templates
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
