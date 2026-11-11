import { SAMPLES } from "@/lib/samples";

// A full sample portfolio in the look of one template.
// The markup is the same for all six; app/templates.css gives each its own layout and style.
export default function TemplatePreview({ id }: { id: string }) {
  const s = SAMPLES[id] ?? SAMPLES["professional-1"];

  return (
    <div className={`tp tp-${id}`}>
      <div className="tp-in">
        <div className="tp-hero">
          <div className="tp-avatar" aria-hidden="true">{s.initials}</div>
          <div className="tp-tags">
            <span>{s.role}</span>
            <span>{s.city}</span>
          </div>
          <div className="tp-name">{s.name}</div>
          <p className="tp-bio">{s.bio}</p>
          <div className="tp-links">
            <span>{s.email}</span>
            {s.links.map((link) => (
              <span key={link}>{link}</span>
            ))}
            <span className="tp-resume">Download résumé</span>
          </div>
        </div>

        <div className="tp-sec tp-about">
          <div className="tp-h">About</div>
          <p>{s.about}</p>
        </div>

        <div className="tp-sec tp-projects">
          <div className="tp-h">{s.workLabel}</div>
          <div className="tp-grid">
            {s.projects.map((p) => (
              <div key={p.title} className="tp-card">
                <div className="tp-shot" aria-hidden="true" />
                <strong>{p.title}</strong>
                <p>{p.text}</p>
                <div className="tp-chips">
                  {p.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tp-sec tp-skills">
          <div className="tp-h">Skills</div>
          <div className="tp-chips">
            {s.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>

        <div className="tp-sec tp-edu">
          <div className="tp-h">Education</div>
          <div>
            {s.education.map((e) => (
              <div key={e.title} className="tp-row">
                <div>
                  <strong>{e.title}</strong>
                  <div className="tp-place">{e.place}</div>
                </div>
                <span>{e.years}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="tp-sec tp-contact">
          <div className="tp-h">Contact</div>
          <p>{s.email}</p>
        </div>
      </div>
    </div>
  );
}
