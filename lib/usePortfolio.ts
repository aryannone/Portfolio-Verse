"use client";

import { useEffect, useRef, useState } from "react";
import { getTemplate } from "@/lib/templates";
import { hasDetails, normalize, type Item, type Portfolio, type Section } from "@/lib/portfolio";
import { imageToDataUrl, loadPortfolio, loadSaved, savePortfolio, startNew, type SavedItem } from "@/lib/store";

const PHOTO_SIDE = 1600;
const AVATAR_SIDE = 720;
export const MAX_PHOTOS_PER_ITEM = 12;

// Reads the template picked on another page ("Use this template").
function readChosenTemplate(forget: boolean) {
  try {
    const chosen = window.localStorage.getItem("pv_template") || "";
    if (forget) window.localStorage.removeItem("pv_template");
    return getTemplate(chosen)?.id;
  } catch {
    // Storage can be blocked; the template can still be changed in the editor.
    return undefined;
  }
}

// The user's portfolio: loaded from this browser, and saved back a moment after each change.
// "start" decides what to show given what was saved and which template was just picked.
export function usePortfolio(
  start: (saved: Portfolio | null, template: string | undefined) => Portfolio,
  options: { forgetTemplate: boolean },
) {
  const [data, setData] = useState<Portfolio | null>(null);
  const [status, setStatus] = useState("");
  const loaded = useRef(false);
  const startRef = useRef(start);

  useEffect(() => {
    const template = readChosenTemplate(options.forgetTemplate);
    loadPortfolio().then((saved) => {
      loaded.current = true;
      const usable = saved && Array.isArray(saved.sections) ? normalize(saved) : null;
      setData(startRef.current(usable, template));
    });
  }, [options.forgetTemplate]);

  // What still has to be written, if anything, so it can be written at once when the page is left.
  const unsaved = useRef<Portfolio | null>(null);
  // Set while one portfolio is being swapped for another, so a late save cannot land in the wrong place.
  const swapping = useRef(false);

  useEffect(() => {
    if (!data || !loaded.current) return;
    unsaved.current = data;
    const timer = window.setTimeout(async () => {
      if (swapping.current) return;
      unsaved.current = null;
      const ok = await savePortfolio(data);
      setStatus(ok ? "Saved in this browser" : "Could not save in this browser");
    }, 500);
    return () => window.clearTimeout(timer);
  }, [data]);

  // Leaving the page within that half second must not lose the last change.
  useEffect(() => {
    const flush = () => {
      if (unsaved.current && !swapping.current) {
        savePortfolio(unsaved.current);
        unsaved.current = null;
      }
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  // Starts another portfolio in the editor. The one that was open is saved first and keeps its own place.
  async function replaceWith(next: Portfolio) {
    swapping.current = true;
    if (data) await savePortfolio(data);
    await startNew(next);
    unsaved.current = null;
    swapping.current = false;
    setData(next);
  }

  const set = (patch: Partial<Portfolio>) => setData((d) => (d ? { ...d, ...patch, sample: false } : d));

  const setSection = (id: string, patch: Partial<Section>) =>
    setData((d) => (d ? { ...d, sample: false, sections: d.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) } : d));

  // Works on the latest state, so a slow photo upload cannot undo other edits.
  const changeItem = (sectionId: string, itemId: string, change: (item: Item) => Item) =>
    setData((d) =>
      d
        ? {
            ...d,
            sample: false,
            sections: d.sections.map((s) =>
              s.id === sectionId ? { ...s, items: s.items.map((it) => (it.id === itemId ? change(it) : it)) } : s,
            ),
          }
        : d,
    );

  const setItem = (sectionId: string, itemId: string, patch: Partial<Item>) =>
    changeItem(sectionId, itemId, (item) => ({ ...item, ...patch }));

  async function addPhotos(sectionId: string, item: Item, files: FileList | null) {
    if (!files || !files.length) return;
    const room = MAX_PHOTOS_PER_ITEM - item.photos.length;
    const chosen = Array.from(files).slice(0, Math.max(0, room));
    const added: string[] = [];
    for (const file of chosen) {
      try {
        added.push(await imageToDataUrl(file, PHOTO_SIDE));
      } catch {
        setStatus(`Could not read ${file.name}`);
      }
    }
    if (files.length > chosen.length) setStatus(`Up to ${MAX_PHOTOS_PER_ITEM} photos per entry`);
    if (added.length) changeItem(sectionId, item.id, (it) => ({ ...it, photos: [...it.photos, ...added] }));
  }

  async function setAvatar(files: FileList | null) {
    if (!files || !files[0]) return;
    try {
      // A new photo needs a new cut-out, so the old one is dropped.
      set({ photo: await imageToDataUrl(files[0], AVATAR_SIDE), photoCut: "" });
    } catch {
      setStatus("Could not read that picture");
    }
  }

  return { data, setData, set, setSection, setItem, addPhotos, setAvatar, replaceWith, status, setStatus };
}

export type PortfolioTools = ReturnType<typeof usePortfolio>;

// Details and templates are independent: any portfolio's details can be shown in any template.
// Which details the templates are showing is remembered in this browser under "pv_details"
// (a portfolio's id, or "sample" for the made-up sample people).
const DETAILS_KEY = "pv_details";

// Works out which saved portfolio's details are chosen: the remembered one, else the one open in the editor.
export function pickDetails(items: SavedItem[], current: string): SavedItem | null {
  const usable = items.filter((item) => hasDetails(item.data));
  let want = "";
  try {
    want = window.localStorage.getItem(DETAILS_KEY) || "";
  } catch {
    // Storage can be blocked; the portfolio open in the editor is used.
  }
  if (want === "sample") return null;
  return usable.find((item) => item.id === want) ?? usable.find((item) => item.id === current) ?? usable[0] ?? null;
}

// Drops a template picked earlier ("Use this template"), so it cannot be applied to a portfolio opened later.
export function forgetPickedTemplate() {
  try {
    window.localStorage.removeItem("pv_template");
  } catch {
    // Storage can be blocked; then nothing was remembered either.
  }
}

export function rememberDetails(id: string) {
  try {
    window.localStorage.setItem(DETAILS_KEY, id || "sample");
  } catch {
    // Storage can be blocked; the choice then lasts only for this page.
  }
}

// Every set of details in this browser, and the one the templates are showing.
export function useDetails() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [chosen, setChosen] = useState("");

  useEffect(() => {
    loadSaved().then(({ items: saved, current }) => {
      const usable = saved.filter((item) => hasDetails(item.data)).map((item) => ({ ...item, data: normalize(item.data) }));
      setItems(usable);
      setChosen(pickDetails(usable, current)?.id ?? "");
    });
  }, []);

  const choose = (id: string) => {
    setChosen(id);
    rememberDetails(id);
  };

  const item = items.find((it) => it.id === chosen) ?? null;
  return { items, chosen, choose, data: item ? item.data : null };
}
