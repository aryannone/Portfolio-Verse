"use client";

import { useEffect, useState } from "react";

type Status = { live: boolean; path: string | null; publishedAt: string | null };

// On the profile page: the person's published site, its link, and a way to take it down.
export default function MySite() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/publish")
      .then((r) => r.json())
      .then((d: Status) => setStatus(d))
      .catch(() => {});
  }, []);

  async function takeDown() {
    if (!window.confirm("Take your site down? The link will stop working until you publish again.")) return;
    setBusy(true);
    const res = await fetch("/api/publish", { method: "DELETE" });
    if (res.ok) setStatus(await res.json());
    setBusy(false);
  }

  if (!status) return null;
  const url = status.path ? `${typeof window === "undefined" ? "" : window.location.origin}${status.path}` : "";
  return (
    <section className="my-site">
      <h2>Your published site</h2>
      <p className="small one-site">You can publish one portfolio at a time. Publishing another one replaces your live site.</p>
      {status.live && status.path ? (
        <>
          <p>
            Live at{" "}
            <a href={status.path} target="_blank" rel="noopener noreferrer">
              {url.replace(/^https?:\/\//, "")}
            </a>
            {status.publishedAt ? <span className="small"> · updated {new Date(status.publishedAt).toLocaleDateString()}</span> : null}
          </p>
          <div className="profile-links">
            <a className="btn btn-outline" href="/editor">
              Edit and publish again
            </a>
            <button type="button" className="btn btn-quiet" onClick={takeDown} disabled={busy}>
              Take down
            </button>
          </div>
        </>
      ) : (
        <p>
          Not published yet. Open the <a href="/editor">editor</a> and press <strong>Publish</strong> to get your own link.
        </p>
      )}
    </section>
  );
}
