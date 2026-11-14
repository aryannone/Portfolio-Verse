import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer-inner">
        <div>PORTFOLIO-VERSE · Free, no sign-up</div>
        <div className="footer-links">
          <Link href="/templates">Templates</Link>
          <Link href="/saved">My portfolios</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
