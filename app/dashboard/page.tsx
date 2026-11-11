import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DashboardShell from "@/components/DashboardShell";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap simple">
        <DashboardShell />
      </main>
      <SiteFooter />
    </>
  );
}
