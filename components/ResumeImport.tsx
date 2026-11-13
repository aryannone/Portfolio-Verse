"use client";

import { useState } from "react";
import { blankPortfolio, type Portfolio } from "@/lib/portfolio";

const MAX_KEEP = 3 * 1024 * 1024;

// "Fill in from my résumé": reads a PDF and turns what it finds into a set of details.
// When the portfolio open now already has the user's own details, the résumé becomes a new portfolio
// with the same look, and the open one is left exactly as it is. Otherwise it fills this one in.
// The original file is kept too (up to 3 MB), so it can be offered for download on the portfolio.
export default function ResumeImport({
  data,
  set,
  replaceWith,
  onDone,
  compact = false,
}: {
  data: Portfolio;
  set: (patch: Partial<Portfolio>) => void;
  // Opens a new portfolio in place of this one, keeping this one in My portfolios.
  replaceWith: (next: Portfolio) => Promise<void>;
  // Called with the message to show. The editor redraws its panel after an import, so it keeps the message itself.
  onDone?: (message: string) => void;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function pick(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) {
      setNote("Please choose a PDF file.");
      return;
    }
    const asNew = !data.sample && (Boolean(data.name.trim()) || data.sections.some((s) => s.items.length > 0));

    setBusy(true);
    setNote("Reading your résumé…");
    try {
      const { readResume, applyResume, describe } = await import("@/lib/resumeImport");
      const found = await readResume(file);
      const keep =
        file.size <= MAX_KEEP
          ? await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => resolve("");
              reader.readAsDataURL(file);
            })
          : "";
      // A clean set of details in the same look: nothing from the sample person or from the other portfolio.
      const clean: Portfolio = {
        ...data,
        name: "",
        role: "",
        city: "",
        bio: "",
        about: "",
        email: "",
        phone: "",
        links: [],
        skills: [],
        sections: blankPortfolio(data.template).sections,
        quote: "",
        quoteBy: "",
        contactNote: "",
        contactStatus: "",
        sample: false,
      };
      const next: Portfolio = { ...clean, ...applyResume(clean, found), resumeFile: keep, resumeName: keep ? file.name : "" };
      if (asNew) await replaceWith(next);
      else set(next);
      const message = asNew
        ? `Your résumé is now a new set of details, in the same design. Found ${describe(found)}. Your earlier portfolio is unchanged in My portfolios. Please check each part, as some details may need fixing.`
        : `Filled in from your résumé. Found ${describe(found)}. Please check each part, as some details may need fixing.`;
      setNote(message);
      onDone?.(message);
    } catch {
      setNote("Could not read text from this PDF. If it is a scanned image, please fill in your details by hand.");
    }
    setBusy(false);
  }

  return (
    <div className={compact ? "rs-import is-compact" : "rs-import"}>
      {!compact ? (
        <div>
          <strong>Have a résumé?</strong>
          <span>Import the PDF and we will fill in as much as we can. Nothing leaves your device.</span>
        </div>
      ) : null}
      <label className={busy ? "btn btn-outline is-busy" : "btn btn-outline"}>
        {busy ? "Reading…" : "Fill in from a résumé PDF"}
        <input type="file" accept="application/pdf,.pdf" disabled={busy} onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
      </label>
      {note ? (
        <p className="ed-hint rs-note" role="status">
          {note}
        </p>
      ) : null}
    </div>
  );
}
