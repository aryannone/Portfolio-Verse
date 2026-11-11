import Link from "next/link";

export default function SiteHeader({ current }: { current?: "templates" }) {
  return (
    <header className="wrap site-header">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden="true" />
        PORTFOLIO-VERSE
      </Link>
      <nav className="site-nav">
        <Link
          href="/templates"
          className={current === "templates" ? "nav-link is-current" : "nav-link"}
          aria-current={current === "templates" ? "page" : undefined}
        >
          Templates
        </Link>
      </nav>
    </header>
  );
}
