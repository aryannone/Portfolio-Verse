import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GoogleButton from "@/components/GoogleButton";
import TemplateThumb from "@/components/TemplateThumb";

const STEPS = [
  { title: "Sign in with Google", text: "One tap. No new password to remember." },
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

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="wrap hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              Free for students and first-job seekers
            </div>
            <h1 className="display h-hero">Your portfolio, live in ten minutes.</h1>
            <p className="lead">
              Sign in with Google, fill in your details, pick a template and publish. No code, no
              developer, no cost.
            </p>
            <GoogleButton />
            <p className="small">Free during beta. Download your HTML any time.</p>
          </div>

          <div className="hero-demo">
            <div className="browser">
              <div className="browser-bar">
                <div className="browser-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="browser-url">
                  portfolio-verse.vercel.app/<strong>aarav-sharma</strong>
                </div>
              </div>
              <div className="demo">
                <div className="demo-head">
                  <div className="demo-avatar" aria-hidden="true">AS</div>
                  <div>
                    <div className="demo-name">Aarav Sharma</div>
                    <div className="demo-role">Final-year B.Tech, Computer Engineering · Pune</div>
                  </div>
                </div>
                <p className="demo-bio">
                  I build small, useful web apps for my college and my city. Looking for a software
                  internship for summer 2027.
                </p>
                <div className="chips">
                  <span className="chip">Python</span>
                  <span className="chip">React</span>
                  <span className="chip">SQL</span>
                  <span className="chip">Figma</span>
                </div>
                <div className="demo-projects">
                  <div className="demo-project">
                    <strong>Pune Metro route finder</strong>
                    <span>Shortest route and fare between any two stations.</span>
                  </div>
                  <div className="demo-project">
                    <strong>Hostel mess feedback app</strong>
                    <span>Daily ratings that the mess committee reads.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="band">
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
              <TemplateThumb id="clarity" />
              <div className="style-foot">
                <strong>Professional</strong>
                <span>Clean, calm and recruiter-friendly.</span>
              </div>
            </div>
            <div className="style-card">
              <TemplateThumb id="rangoli" />
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
