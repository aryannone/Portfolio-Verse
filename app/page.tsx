import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StartButton from "@/components/StartButton";
import ScaledPreview from "@/components/ScaledPreview";
import HeroShowcase from "@/components/HeroShowcase";

const STEPS = [
  { title: "Start free", text: "One click. No account or password needed." },
  { title: "Fill in your details", text: "Education, projects, skills, photo and résumé PDF, in one guided form." },
  { title: "Pick a template", text: "Click any text to edit it. Change colours, fonts and sections." },
  { title: "Publish", text: "Get your own link to share, or download the HTML and host it anywhere." },
];

const FEATURES = [
  { title: "Your own link", text: "A short address with your name, ready for your résumé and LinkedIn." },
  { title: "Looks right on every screen", text: "Recruiters open links on phones. Your site adapts on its own." },
  { title: "Click to edit", text: "Change any text right on the page. Your work saves by itself." },
  { title: "Download the HTML", text: "The site is yours. Take the file and host it wherever you like." },
  { title: "Résumé PDF", text: "Upload your résumé once and visitors can download it from your site." },
  { title: "A neat share preview", text: "Your name, photo and headline show up when you share the link on WhatsApp." },
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
              Fill in your details, pick a template and publish. No sign-up, no code, no
              developer, no cost.
            </p>
            <StartButton />
            <p className="small">Free during beta. Download your HTML any time.</p>
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
            <h2 className="display h-section">Four steps. That is all.</h2>
            <ol className="steps">
              {STEPS.map((step, i) => (
                <li key={step.title} className="step">
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
            <h2 className="display h-section">Two styles, six templates.</h2>
            <p>
              Professional for placements and job applications. Creative for designers,
              photographers and makers.
            </p>
          </div>
          <div className="styles">
            <div className="style-card">
              <ScaledPreview id="professional-1" ratio="16 / 10" flat />
              <div className="style-foot">
                <strong>Professional</strong>
                <span>Clean, calm and recruiter-friendly.</span>
              </div>
            </div>
            <div className="style-card">
              <ScaledPreview id="creative-1" ratio="16 / 10" flat />
              <div className="style-foot">
                <strong>Creative</strong>
                <span>Bold colour, big type, more personality.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="wrap section" style={{ paddingTop: 0 }}>
          <h2 className="display h-section">What you get, free.</h2>
          <div className="features">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature">
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
