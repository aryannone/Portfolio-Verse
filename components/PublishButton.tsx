"use client";

import { useState } from "react";
import { MAX_SITE_BYTES, SITE_BUCKET, siteFile } from "@/lib/publish";
import { browserSupabase } from "@/lib/supabase/client";

type Status = { live: boolean; username: string | null; path: string | null };
type Panel = { kind: "live"; url: string } | { kind: "username" } | { kind: "error"; text: string } | null;

// The editor's Publish button: builds the same HTML file as Download, uploads it to the person's own folder
// in Supabase Storage, and puts it live at /u/<username>. Publishing again replaces the live version.
export default function PublishButton({ build, sample }: { build: () => Promise<string>; sample: boolean }) {
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [copied, setCopied] = useState(false);

  async function publish() {
    if (sample) return setPanel({ kind: "error", text: "This is still the sample content. Put in your own details first, then publish." });
    const supabase = browserSupabase();
    if (!supabase) return setPanel({ kind: "error", text: "Publishing is not set up on this copy of the site." });
    setBusy(true);
    setPanel(null);
    try {
      const status = (await (await fetch("/api/publish")).json()) as Status & { signedIn?: boolean };
      if (!status.signedIn) return setPanel({ kind: "error", text: "Please sign in again to publish." });
      if (!status.username) return setPanel({ kind: "username" });

      const html = await build();
      const file = new Blob([html], { type: "text/html" });
      if (file.size > MAX_SITE_BYTES)
        return setPanel({ kind: "error", text: "Your site is over 10 MB, mostly from photos. Please use fewer or smaller photos, then publish again." });

      const { data } = await supabase.auth.getUser();
      if (!data.user) return setPanel({ kind: "error", text: "Please sign in again to publish." });
      const upload = await supabase.storage.from(SITE_BUCKET).upload(siteFile(data.user.id), file, { upsert: true, contentType: "text/html", cacheControl: "60" });
      if (upload.error) return setPanel({ kind: "error", text: "Could not upload your site. Please try again." });

      const res = await fetch("/api/publish", { method: "POST" });
      const live = (await res.json().catch(() => ({}))) as Status & { error?: string };
      if (!res.ok || !live.path) return setPanel({ kind: "error", text: live.error ?? "Could not publish. Please try again." });
      setCopied(false);
      setPanel({ kind: "live", url: `${window.location.origin}${live.path}` });
    } catch {
      setPanel({ kind: "error", text: "Could not publish. Please check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  async function takeDown() {
    if (!window.confirm("Take your site down? The link will stop working until you publish again.")) return;
    setBusy(true);
    const res = await fetch("/api/publish", { method: "DELETE" });
    setBusy(false);
    setPanel(res.ok ? { kind: "error", text: "Your site is down. Publish again whenever you like." } : { kind: "error", text: "Could not take your site down. Please try again." });
  }

  return (
    <>
      <button type="button" className="btn btn-accent" onClick={publish} disabled={busy}>
        {busy ? "Publishing…" : "Publish"}
      </button>
      {panel ? (
        <div className="ed-publish" role="dialog" aria-label="Publish your site">
          <button type="button" className="ed-publish-close" aria-label="Close" onClick={() => setPanel(null)}>
            ×
          </button>
          {panel.kind === "live" ? (
            <>
              <strong>Your site is live!</strong>
              <p>Anyone with this link sees your portfolio. Publish again any time to update it.</p>
              <a className="ed-publish-link" href={panel.url} target="_blank" rel="noopener noreferrer">
                {panel.url.replace(/^https?:\/\//, "")}
              </a>
              <div className="ed-publish-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigator.clipboard?.writeText(panel.url).then(() => setCopied(true), () => {})}
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <a className="btn btn-outline" href={panel.url} target="_blank" rel="noopener noreferrer">
                  Open
                </a>
                <button type="button" className="btn btn-quiet" onClick={takeDown} disabled={busy}>
                  Take down
                </button>
              </div>
            </>
          ) : panel.kind === "username" ? (
            <>
              <strong>Pick a username first</strong>
              <p>Your username becomes your site&apos;s link, like portfolio-verse-tau.vercel.app/u/your-name.</p>
              <a className="btn btn-primary" href="/profile">
                Choose a username
              </a>
            </>
          ) : (
            <p role="alert">{panel.text}</p>
          )}
        </div>
      ) : null}
    </>
  );
}
