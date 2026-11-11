// Small static previews of each template, filled with Indian sample content.
// The real templates arrive in step 5; these show the direction of each one.

export default function TemplateThumb({ id }: { id: string }) {
  switch (id) {
    case "clarity":
      return (
        <div className="thumb t-clarity">
          <div className="t-eyebrow">DATA ANALYST · BENGALURU</div>
          <div className="t-name">Priya Nair</div>
          <div className="t-text">I turn messy spreadsheets into dashboards teams use every morning.</div>
          <div className="t-rows">
            <div className="t-row"><strong>Sales dashboard</strong><span>2026</span></div>
            <div className="t-row"><strong>IPL batting analysis</strong><span>2025</span></div>
          </div>
        </div>
      );
    case "ledger":
      return (
        <div className="thumb t-ledger">
          <div className="t-side">
            <div className="t-avatar" aria-hidden="true">RM</div>
            <div className="t-name">Rohan Mehta</div>
            <div className="t-sub">CA Final student<br />Mumbai</div>
          </div>
          <div className="t-main">
            <div className="t-label">EXPERIENCE</div>
            <strong>Articleship, audit team</strong>
            <div className="t-text">Statutory audits for manufacturing clients.</div>
            <div className="t-label">SKILLS</div>
            <div className="t-text">Tally, Excel, GST filing, Ind AS</div>
          </div>
        </div>
      );
    case "column":
      return (
        <div className="thumb t-column">
          <div className="t-band">
            <div className="t-name">Ananya Iyer</div>
            <div className="t-sub">Mechanical Engineer · Chennai</div>
          </div>
          <div className="t-cards">
            <div className="t-card"><strong>Baja SAE buggy</strong><span>Suspension lead</span></div>
            <div className="t-card"><strong>Solar dryer</strong><span>Final-year project</span></div>
          </div>
        </div>
      );
    case "rangoli":
      return (
        <div className="thumb t-rangoli">
          <div className="t-tags">
            <span className="t-tag t-tag-yellow">Illustrator</span>
            <span className="t-tag t-tag-pink">Jaipur</span>
          </div>
          <div className="t-name">Kabir<br />Singh</div>
          <div className="t-text">Posters, book covers and wall art.</div>
        </div>
      );
    case "monsoon":
      return (
        <div className="thumb t-monsoon">
          <div className="t-top"><span>MEERA JOSHI</span><span>KOCHI</span></div>
          <div className="t-photos" aria-hidden="true">
            <div className="t-photo t-photo-a" />
            <div className="t-photo-col">
              <div className="t-photo t-photo-b" />
              <div className="t-photo t-photo-c" />
            </div>
          </div>
          <div className="t-name">Photographs of the backwaters</div>
        </div>
      );
    case "bazaar":
      return (
        <div className="thumb t-bazaar">
          <div className="t-name">Hi, I am Zoya.</div>
          <div className="t-sub">UX Designer in Hyderabad</div>
          <div className="t-stickers">
            <div className="t-sticker t-sticker-light">Chai ordering app</div>
            <div className="t-sticker t-sticker-dark">Metro card redesign</div>
          </div>
        </div>
      );
    default:
      return <div className="thumb" />;
  }
}
