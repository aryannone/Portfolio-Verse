"use client";

import { useEffect, useState } from "react";

// A row of real, counted numbers under the home page's headline: unique visitors, HTML downloads and
// approved feedback notes. Each browser counts once (the server keeps an anonymous id for it in a cookie),
// and a signed-in person counts once across all their devices. This browser checks in once a day, which
// also links it to the account if someone has signed in. Shows nothing until the numbers have loaded.
const VISIT_KEY = "pv_visit_day";

type Stats = { visitors: number; downloads: number; notes: number };

export function countEvent(event: "download") {
  fetch("/api/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event }), keepalive: true }).catch(() => {});
}

export default function SiteStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    let checkIn = false;
    try {
      checkIn = window.localStorage.getItem(VISIT_KEY) !== today;
      if (checkIn) window.localStorage.setItem(VISIT_KEY, today);
    } catch {
      // Without storage the browser checks in every time; the server still counts it only once.
      checkIn = true;
    }
    // Checking in answers with the up-to-date visitor number; the shared numbers are cached for a minute.
    const visit: Promise<number | null> = checkIn
      ? fetch("/api/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "visit" }) })
          .then((r) => r.json())
          .then((d: { visitors?: number | null }) => (typeof d.visitors === "number" ? d.visitors : null))
          .catch(() => null)
      : Promise.resolve(null);
    Promise.all([fetch("/api/stats").then((r) => r.json()), visit])
      .then(([d, fresh]: [Partial<Stats> & { ready?: boolean }, number | null]) => {
        if (!d.ready) return;
        setStats({ visitors: Math.max(fresh ?? 0, d.visitors ?? 0), downloads: d.downloads ?? 0, notes: d.notes ?? 0 });
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
