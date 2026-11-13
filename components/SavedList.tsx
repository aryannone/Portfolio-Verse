"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PortfolioView from "@/components/PortfolioView";
import ScaledPreview from "@/components/ScaledPreview";
import { getTemplate } from "@/lib/templates";
import { normalize } from "@/lib/portfolio";
import { addSaved, deleteSaved, loadSaved, openSaved, renameSaved, startNew, type SavedItem } from "@/lib/store";
import { buildHtml, downloadHtml } from "@/lib/exportHtml";

// Every portfolio kept in this browser: open, rename, copy, download or delete each one.
export default function SavedList() {
  const router = useRouter();
  const [list, setList] = useState<SavedItem[] | null>(null);
  // The one that is open in the editor.
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState("");
  // The portfolio being turned into a file. It is drawn out of sight, then captured.
  const [exporting, setExporting] = useState<SavedItem | null>(null);
  const viewRef = useRef<HTMLDivElement | null>(null);

  const refresh = () =>
    loadSaved().then((saved) => {
      setList(saved.items.map((item) => ({ ...item, data: normalize(item.data) })));
      setCurrent(saved.current);
    });

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!exporting) return;
    let cancelled = false;
    // Wait a frame so the hidden copy is in the page before it is captured.
    const frame = window.requestAnimationFrame(async () => {
      try {
        if (!viewRef.current) throw new Error("Nothing to capture");
        const html = await buildHtml(viewRef.current, exporting.data);
        if (cancelled) return;
        downloadHtml(html, exporting.data.name || exporting.name);
        setStatus(`Downloaded "${exporting.name}"`);
      } catch {
        if (!cancelled) setStatus("Could not build the file. Please try again.");
      }
      if (!cancelled) setExporting(null);
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [exporting]);

  async function open(item: SavedItem) {
    // Whatever is open in the editor now keeps its own place, so nothing needs confirming.
    const ok = await openSaved(item.id);
    if (!ok) return setStatus("Could not open that portfolio. Please try again.");
    router.push("/editor");
  }

  async function startAnother() {
    await startNew(null);
    router.push("/start");
  }

  async function rename(item: SavedItem) {
    const name = window.prompt("Name this portfolio:", item.name);
    if (name === null || !name.trim()) return;
    await renameSaved(item.id, name.trim());
    refresh();
  }

  async function copy(item: SavedItem) {
    const ok = await addSaved(`${item.name} (copy)`, item.data);
    setStatus(ok ? `Made a copy of "${item.name}"` : "Could not copy. This browser may be out of space.");
    refresh();
  }

  async function remove(item: SavedItem) {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    const ok = await deleteSaved(item.id);
    if (!ok) return setStatus("Could not delete. Please try again.");
    setStatus(`Deleted "${item.name}"`);
    refresh();
  }

  if (list === null) {
    return (
      <p className="wrap saved-meta" role="status">
        Loading…
      </p>
    );
  }

  return (
    <>
      <div className="wrap saved-top">
        <button type="button" className="btn btn-primary" onClick={startAnother}>
          + New portfolio
        </button>
        <span className="saved-meta" role="status">
          {status}
        </span>
      </div>

      {list.length ? (
        <section className="wrap saved-grid">
          {list.map((item) => (
            <article key={item.id} className="tcard">
              <ScaledPreview id={item.data.template} data={item.data} exact />
              <div className="tcard-info">
                <div className="tcard-name">
                  {item.name}
                  {item.id === current ? <span className="saved-badge">Open in the editor</span> : null}
                </div>
                <div className="saved-meta">
                  {getTemplate(item.data.template)?.name ?? "Template"} · last changed {new Date(item.savedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="tcard-actions">
                <button type="button" className="btn btn-primary" onClick={() => open(item)}>
                  {item.id === current ? "Continue editing" : "Open"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setExporting(item)} disabled={exporting !== null}>
                  {exporting?.id === item.id ? "Building…" : "Download"}
                </button>
                <button type="button" className="btn btn-quiet" onClick={() => rename(item)}>
                  Rename
                </button>
                <button type="button" className="btn btn-quiet" onClick={() => copy(item)}>
                  Copy
                </button>
                <button type="button" className="btn btn-danger" onClick={() => remove(item)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="wrap saved-empty">
          <p>No portfolios yet. Start one and it will appear here, saved as you go.</p>
        </section>
      )}

      {exporting ? (
        <div className="offscreen" aria-hidden="true">
          <PortfolioView data={exporting.data} semantic rootRef={viewRef} />
        </div>
      ) : null}
    </>
  );
}
