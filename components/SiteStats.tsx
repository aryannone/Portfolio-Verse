"use client";

import { useEffect, useState } from "react";

// A row of real, counted numbers under the home page's headline: visitors, HTML downloads and
// approved feedback notes. This browser is counted as a visitor once a day. Shows nothing until
// the numbers have loaded, or if counting is not set up.
const VISIT_KEY = "pv_visit_day";

type Stats = { visitors: number; downloads: number; notes: number };

export function countEvent(event: "visit" | "download") {
  fetch("/api/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event }), keepalive: true }).catch(() => {});
}

export default function SiteStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    let counted = false;
    try {
      if (window.localStorage.getItem(VISIT_KEY) !== today) {
        window.localStorage.setItem(VISIT_KEY, today);
        countEvent("visit");
        counted = true;
      }
    } catch {
      // Without storage this browser is not counted, rather than counted on every page load.
    }
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d: Partial<Stats> & { ready?: boolean }) => {
        if (!d.ready) return;
        // The numbers are cached for a minute, so this visit may not be in them yet.
        setStats({ visitors: (d.visitors ?? 0) + (counted ? 1 : 0), downloads: d.downloads ?? 0, notes: d.notes ?? 0 });
      })
      .catch(() => {});
  }, []);

  if (!stats) return null;
  const items = [
    { n: stats.visitors, one: "visitor", many: "visitors" },
    { n: stats.downloads, one: "portfolio downloaded", many: "portfolios downloaded" },
    { n: stats.notes, one: "feedback note", many: "feedback notes" },
  ];
  return (
    <ul className="stats" aria-label="PORTFOLIO-VERSE in numbers">
      {items.map((s) => (
        <li key={s.many}>
          <strong>{s.n.toLocaleString("en-IN")}</strong>
          <span>{s.n === 1 ? s.one : s.many}</span>
        </li>
      ))}
    </ul>
  );
}
