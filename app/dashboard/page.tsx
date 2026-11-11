import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DashboardShell from "@/components/DashboardShell";
import { isAdmin } from "@/lib/admin";
import { exitAdmin } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const admin = await isAdmin();

  return (
    <>
      <SiteHeader />
      <main className="wrap simple">
        {admin ? (
          <>
            <h1 className="display h-page">Welcome, admin.</h1>
            <p>
              You are in admin preview, with no Google sign-in. Your dashboard and the create flow
              are the next things being built.
            </p>
            <div className="admin-form">
              <a className="btn btn-primary" href="/studio">
                Open the original builder
              </a>
              <form action={exitAdmin}>
                <button type="submit" className="btn btn-outline">
                  Exit admin
                </button>
              </form>
            </div>
          </>
        ) : (
          <DashboardShell />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
