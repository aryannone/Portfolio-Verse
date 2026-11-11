"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PortfolioView from "@/components/PortfolioView";
import ScaledPreview from "@/components/ScaledPreview";
import StartButton from "@/components/StartButton";
import { getTemplate } from "@/lib/templates";
import { normalize } from "@/lib/portfolio";
import { deleteSaved, loadSaved, savePortfolio, type SavedItem } from "@/lib/store";
import { buildHtml, downloadHtml } from "@/lib/exportHtml";

export default function SavedList() {
  const router = useRouter();
  const [list, setList] = useState<SavedItem[] | null>(null);
  const [status, setStatus] = useState("");
  // The saved portfolio being turned into a file. It is drawn out of sight, then captured.
  const [exporting, setExporting] = useState<SavedItem | null>(null);
  const viewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadSaved().then((items) => setList(items.map((item) => ({ ...item, data: normalize(item.data) }))));
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
        downloadHtml(html, exporting.name);
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

  async function openInEditor(item: SavedItem) {
    if (!window.confirm(`Open "${item.name}" in the editor? It replaces what is in the editor now.`)) return;
    await savePortfolio(item.data);
    router.push("/editor");
  }

  async function remove(item: SavedItem) {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    const ok = await deleteSaved(item.id);
    if (!ok) return setStatus("Could not delete. Please try again.");
    setList((items) => (items ? items.filter((it) => it.id !== item.id) : items));
    setStatus(`Deleted "${item.name}"`);
  }

  if (list === null) {
    return (
      <p className="wrap saved-meta" role="status">
        Loading…
      </p>
    );
  }

  if (!list.length) {
    return (
      <section className="wrap saved-empty">
        <p>Nothing saved yet. In the editor, press Save to keep a copy of your portfolio here.</p>
        <StartButton />
        {status ? <p role="status">{status}</p> : null}
      </section>
    );
  }

  return (
    <>
      <p className="wrap gallery-note" role="status">
        {status}
      </p>
      <section className="wrap saved-grid">
        {list.map((item) => (
          <article key={item.id} className="tcard">
            <ScaledPreview id={item.data.template} data={item.data} exact />
            <div className="tcard-info">
              <div className="tcard-name">{item.name}</div>
              <div className="saved-meta">
                {getTemplate(item.data.template)?.name ?? "Template"} · saved {new Date(item.savedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="tcard-actions">
              <button type="button" className="btn btn-primary" onClick={() => setExporting(item)} disabled={exporting !== null}>
                {exporting?.id === item.id ? "Building…" : "Download"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => openInEditor(item)}>
                Open in editor
              </button>
              <button type="button" className="btn btn-danger" onClick={() => remove(item)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
      {exporting ? (
        <div className="offscreen" aria-hidden="true">
          <PortfolioView data={exporting.data} semantic rootRef={viewRef} />
        </div>
      ) : null}
    </>
  );
}
