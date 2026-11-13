"use client";

import { useEffect, useRef, useState } from "react";
import { getTemplate } from "@/lib/templates";
import { hasDetails, normalize, type Item, type Portfolio, type Section } from "@/lib/portfolio";
import { imageToDataUrl, loadPortfolio, savePortfolio, startNew } from "@/lib/store";

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

// The saved portfolio, but only once it has the user's own details in it.
// Template previews use this to show the user's details in place of the sample person.
export function useSavedDetails() {
  const [saved, setSaved] = useState<Portfolio | null>(null);
  useEffect(() => {
    loadPortfolio().then((p) => {
      if (p && Array.isArray(p.sections) && hasDetails(p)) setSaved(normalize(p));
    });
  }, []);
  return saved;
}
