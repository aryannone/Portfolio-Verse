import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { adminEnabled, isAdmin } from "@/lib/admin";
import { enterAdmin } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (await isAdmin()) redirect("/dashboard");

  return (
    <>
      <SiteHeader />
      <main className="wrap simple">
        <h1 className="display h-page">Admin access.</h1>
        {adminEnabled() ? (
          <>
            <p>Enter the admin key to open the app without signing in.</p>
            {params.error ? (
              <div className="notice" role="alert">
                That key is not correct.
              </div>
            ) : null}
            <form action={enterAdmin} className="admin-form">
              <input
                type="password"
                name="key"
                className="admin-input"
                placeholder="Admin key"
                aria-label="Admin key"
                autoComplete="current-password"
                required
              />
              <button type="submit" className="btn btn-primary">
                Enter
              </button>
            </form>
          </>
        ) : (
          <div className="notice">
            Admin access is off. Add an ADMIN_KEY environment variable in Vercel, then redeploy.
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
