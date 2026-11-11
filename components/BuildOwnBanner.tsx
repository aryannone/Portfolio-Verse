import type { ReactNode } from "react";

// A compact banner for "Build your own". The small picture on the left plays a loop of a page
// being put together: blocks drop in, the colour changes, a pointer moves between them.
// It is decoration, so it is hidden from screen readers.
export default function BuildOwnBanner({ action }: { action: ReactNode }) {
  return (
    <div className="own">
      <div className="own-art" aria-hidden="true">
        <span className="own-b own-b1" />
        <span className="own-b own-b2" />
        <span className="own-b own-b3" />
        <span className="own-b own-b4" />
        <span className="own-b own-b5" />
        <span className="own-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="own-pointer" />
      </div>
      <div className="own-text">
        <div className="tcard-name">Build your own</div>
        <div className="tcard-blurb">
          Start from a blank canvas. Add sections one by one and choose the colours, layouts and animation
          yourself.
        </div>
      </div>
      <div className="own-action">{action}</div>
    </div>
  );
}
