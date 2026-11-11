"use client";

import { useRouter } from "next/navigation";

type Props = {
  label?: string;
  variant?: "primary" | "outline";
  template?: string;
};

// The single way into the product. No account is needed for now.
// If a template id is passed, it is remembered so the create flow can use it.
export default function StartButton({ label = "Start free", variant = "primary", template }: Props) {
  const router = useRouter();

  function start() {
    if (template) {
      try {
        window.localStorage.setItem("pv_template", template);
      } catch {
        // Storage can be blocked; the user can pick the template again later.
      }
    }
    router.push("/dashboard");
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
