import Link from "next/link";
import Logo from "@/components/Logo";

export default function SiteHeader({ current }: { current?: "templates" | "saved" }) {
  return (
    <header className="wrap site-header">
      <Link href="/" className="brand">
        <Logo />
      </Link>
      <nav className="site-nav">
        <Link
          href="/templates"
          className={current === "templates" ? "nav-link is-current" : "nav-link"}
          aria-current={current === "templates" ? "page" : undefined}
        >
          Templates
        </Link>
        <Link
          href="/saved"
          className={current === "saved" ? "nav-link is-current" : "nav-link"}
          aria-current={current === "saved" ? "page" : undefined}
        >
          My portfolios
        </Link>
      </nav>
    </header>
  );
}
