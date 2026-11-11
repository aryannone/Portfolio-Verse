"use client";

import { useRouter } from "next/navigation";

type Props = {
  label?: string;
  variant?: "primary" | "outline";
  template?: string;
};

// The single way into the product. No account is needed for now.
// If a template id is passed, the editor opens in that template.
export default function StartButton({ label = "Start building", variant = "primary", template }: Props) {
  const router = useRouter();

  function start() {
    if (template) {
      try {
        window.localStorage.setItem("pv_template", template);
      } catch {
        // Storage can be blocked; the template can be picked again in the editor.
      }
    }
    router.push("/editor");
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
