"use client";

import { useRouter } from "next/navigation";
import { hasDetails } from "@/lib/portfolio";
import { loadPortfolio } from "@/lib/store";

type Props = {
  label?: string;
  variant?: "primary" | "outline";
  template?: string;
};

// The single way into the product. No account is needed for now.
// New visitors fill in their details first. Returning ones go to the templates, which show
// their details, or straight to the editor when they picked a template (a template id is passed).
export default function StartButton({ label = "Start building", variant = "primary", template }: Props) {
  const router = useRouter();

  async function start() {
    if (template) {
      try {
        window.localStorage.setItem("pv_template", template);
      } catch {
        // Storage can be blocked; the template can be picked again later.
      }
    }
    const saved = await loadPortfolio();
    if (!hasDetails(saved)) router.push("/start");
    else router.push(template ? "/editor" : "/templates");
  }

  return (
    <button
      type="button"
      className={variant === "primary" ? "btn btn-primary" : "btn btn-outline"}
      onClick={start}
    >
      {label}
    </button>
  );
}
