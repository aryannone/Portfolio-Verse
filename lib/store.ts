import type { Portfolio } from "@/lib/portfolio";
import { getTemplate } from "@/lib/templates";

// Everything is kept in this browser (IndexedDB), because there are no accounts yet.
// IndexedDB is used and not localStorage, so that photos fit.
//
// A browser can hold many portfolios. Three things are stored:
//   "saved"     - the list of portfolios, each with a name
//   "current"   - the id of the one open in the editor
//   "portfolio" - the editor's working copy of that one
// The editor saves into the working copy and into its place in the list at the same time,
// so opening another portfolio, or starting a new one, never overwrites earlier work.
const DB = "portfolio-verse";
const STORE = "kv";
const DRAFT = "portfolio";
const SAVED = "saved";
const CURRENT = "current";

// auto: the name still follows the person's name and template, because the user has not named it.
export type SavedItem = { id: string; name: string; savedAt: number; data: Portfolio; auto?: boolean };

let connection: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (!connection) {
    connection = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).catch((error) => {
      connection = null;
      throw error;
    });
  }
  return connection;
}

type State = { draft: Portfolio | null; list: SavedItem[]; current: string };

// Reads the three stored things, lets "change" alter them, and writes back whatever it returns,
// all in one step, so two pages saving at once cannot undo each other.
async function update<T>(change: (state: State) => { write?: Partial<State>; result: T }): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const state: State = { draft: null, list: [], current: "" };
    let result: T;
    const draftRequest = store.get(DRAFT);
    const listRequest = store.get(SAVED);
    const currentRequest = store.get(CURRENT);
    currentRequest.onsuccess = () => {
      state.draft = (draftRequest.result as Portfolio) ?? null;
      state.list = Array.isArray(listRequest.result) ? (listRequest.result as SavedItem[]) : [];
      state.current = typeof currentRequest.result === "string" ? currentRequest.result : "";
      const outcome = change(state);
      result = outcome.result;
      const write = outcome.write ?? {};
      if ("draft" in write) {
        if (write.draft) store.put(write.draft, DRAFT);
        else store.delete(DRAFT);
      }
      if ("list" in write) store.put(write.list, SAVED);
      if ("current" in write) {
        if (write.current) store.put(write.current, CURRENT);
        else store.delete(CURRENT);
      }
    };
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

const newId = () => Math.random().toString(36).slice(2, 10);

function autoName(data: Portfolio) {
  return `${data.name.trim() || "Untitled"} \u00b7 ${getTemplate(data.template)?.name ?? "Portfolio"}`;
}

// A portfolio is worth a place in the list once it has something of the user's in it.
function worthKeeping(data: Portfolio | null): data is Portfolio {
  if (!data || data.sample) return false;
  return Boolean(data.name.trim()) || data.sections.some((section) => section.items.length > 0);
}

// Puts the working copy into the list: into its own place if it has one, into a new place if not.
function keep(state: State, data: Portfolio): { list: SavedItem[]; current: string } {
  if (!worthKeeping(data)) return { list: state.list, current: state.current };
  const at = state.list.findIndex((item) => item.id === state.current);
  if (at >= 0) {
    const item = state.list[at];
    const list = state.list.slice();
    list[at] = { ...item, data, savedAt: Date.now(), name: item.auto ? autoName(data) : item.name };
    return { list, current: state.current };
  }
  const id = newId();
  return { list: [{ id, name: autoName(data), savedAt: Date.now(), data, auto: true }, ...state.list], current: id };
}

// The editor's working copy.
export async function loadPortfolio(): Promise<Portfolio | null> {
  try {
    return await update((state) => ({ result: state.draft }));
  } catch {
    return null;
  }
}

// Saves the working copy, and its place in the list of portfolios.
export async function savePortfolio(portfolio: Portfolio): Promise<boolean> {
  try {
    return await update((state) => ({ write: { draft: portfolio, ...keep(state, portfolio) }, result: true }));
  } catch {
    return false;
  }
}

export async function loadSaved(): Promise<{ items: SavedItem[]; current: string }> {
  try {
    return await update((state) => {
      // Work from before portfolios had their own places is given one now, so it shows in the list.
      const kept = state.draft ? keep(state, state.draft) : { list: state.list, current: state.current };
      return { write: kept, result: { items: kept.list, current: kept.current } };
    });
  } catch {
    return { items: [], current: "" };
  }
}

// Opens one of the saved portfolios in the editor. What was open before stays safe in its own place.
export async function openSaved(id: string): Promise<boolean> {
  try {
    return await update((state) => {
      const kept = state.draft ? keep(state, state.draft) : { list: state.list, current: state.current };
      const item = kept.list.find((it) => it.id === id);
      if (!item) return { write: kept, result: false };
      return { write: { list: kept.list, current: id, draft: item.data }, result: true };
    });
  } catch {
    return false;
  }
}

// Starts another portfolio. "next" becomes the working copy; leave it out to start with an empty editor.
// It gets its own place in the list as soon as it has something in it.
export async function startNew(next: Portfolio | null): Promise<boolean> {
  try {
    return await update((state) => {
      const kept = state.draft ? keep(state, state.draft) : { list: state.list, current: state.current };
      return { write: { list: kept.list, current: "", draft: next }, result: true };
    });
  } catch {
    return false;
  }
}

// Keeps a separate, named copy of a portfolio as it is now.
export async function addSaved(name: string, data: Portfolio): Promise<boolean> {
  try {
    return await update((state) => ({
      write: { list: [{ id: newId(), name, savedAt: Date.now(), data: { ...data, sample: false } }, ...state.list] },
      result: true,
    }));
  } catch {
    return false;
  }
}

export async function renameSaved(id: string, name: string): Promise<boolean> {
  try {
    return await update((state) => ({
      write: { list: state.list.map((item) => (item.id === id ? { ...item, name, auto: false } : item)) },
      result: true,
    }));
  } catch {
    return false;
  }
}

export async function deleteSaved(id: string): Promise<boolean> {
  try {
    return await update((state) => {
      const list = state.list.filter((item) => item.id !== id);
      // Deleting the one that is open also empties the editor, or it would come straight back.
      return { write: id === state.current ? { list, current: "", draft: null } : { list }, result: true };
    });
  } catch {
    return false;
  }
}

// Shrinks a chosen photo so pages stay fast and downloads stay small.
export function imageToDataUrl(file: File, maxSide: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) return reject(new Error("No canvas"));
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Not an image"));
    };
    img.src = url;
  });
}
