import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer-inner">
        <div>PORTFOLIO-VERSE · Free during beta</div>
        <div className="footer-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/report">Report a site</Link>
        </div>
      </div>
    </footer>
  );
}
