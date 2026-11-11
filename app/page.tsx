import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StartButton from "@/components/StartButton";
import ScaledPreview from "@/components/ScaledPreview";
import HeroShowcase from "@/components/HeroShowcase";
import RevealOnScroll from "@/components/RevealOnScroll";

const STEPS = [
  { title: "Start building", text: "One click. No account or password needed." },
  { title: "Fill in your details", text: "A short form, one step at a time. Leave and come back whenever you like." },
  { title: "Pick a template", text: "See your own details in all nine looks, or build your own from blank." },
  { title: "Download", text: "Get your whole portfolio as one HTML file and host it anywhere." },
];

const FEATURES = [
  { title: "Photos that open up", text: "Add photos to any project, job or course. Visitors tap it and a photo panel slides in." },
  { title: "Looks right on every screen", text: "Recruiters open links on phones. Your site adapts on its own." },
  { title: "Motion built in", text: "Sections rise in as visitors scroll. No settings, no code." },
  { title: "Mix and match", text: "Use any template's cards, timeline, colours or animation in any other." },
  { title: "Saves as you type", text: "Your work is kept in this browser, so you can come back to it." },
  { title: "Download the HTML", text: "The site is yours. Take the file and host it wherever you like." },
];

const SLUGS = [
  "aarav-sharma",
  "priya-nair",
  "kabir-singh",
  "ananya-iyer",
  "rohan-mehta",
  "zoya-khan",
  "meera-joshi",
  "arjun-reddy",
  "sneha-kulkarni",
  "farhan-ali",
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
              Your portfolio, live in <span className="mark">ten minutes.</span>
            </h1>
            <p className="lead">
              Fill in your details, add your photos, pick a template and download your site. No
              sign-up, no code, no cost.
            </p>
            <div className="hero-actions">
              <StartButton />
              <Link href="/start" className="btn btn-outline">
                Fill in your details
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
            {[...SLUGS, ...SLUGS].map((slug, i) => (
              <span key={i}>
                portfolio-verse.vercel.app/<strong>{slug}</strong>
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

        <section className="wrap section">
          <div className="section-head">
            <h2 className="display h-section" data-reveal>Two styles, nine templates.</h2>
            <p>
              Professional for placements and job applications. Creative for designers,
              photographers and makers.
            </p>
          </div>
          <div className="styles">
            <div className="style-card" data-reveal>
              <ScaledPreview id="professional-1" ratio="16 / 10" flat />
              <div className="style-foot">
                <strong>Professional</strong>
                <span>Clean, calm and recruiter-friendly.</span>
              </div>
            </div>
            <div className="style-card" data-reveal>
              <ScaledPreview id="creative-4" ratio="16 / 10" flat />
              <div className="style-foot">
                <strong>Creative</strong>
                <span>Bold colour, big type, more personality.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="wrap section" style={{ paddingTop: 0 }}>
          <h2 className="display h-section" data-reveal>What you get, free.</h2>
          <div className="features">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="feature" data-reveal style={{ "--i": i % 3 } as React.CSSProperties}>
                <strong>{f.title}</strong>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
