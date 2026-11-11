import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Dashboard" };

// Open to everyone for now. Accounts come back when login is added again.
export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap simple">
        <h1 className="display h-page">Welcome.</h1>
        <p>
          No account is needed right now. The new dashboard and create flow are still being built,
          so for now you can use the original builder. Your work saves in this browser only.
        </p>
        <p>
          <a className="btn btn-primary" href="/studio">
            Open the builder
          </a>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
