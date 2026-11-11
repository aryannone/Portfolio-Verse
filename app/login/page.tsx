import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GoogleButton from "@/components/GoogleButton";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="wrap simple">
        <h1 className="display h-page">Sign in to continue.</h1>
        <p>We use your Google account, so there is no new password to remember.</p>
        {params.error ? (
          <div className="notice" role="alert">
            Sign-in did not finish. Please try again.
          </div>
        ) : null}
        <GoogleButton label="Continue with Google" />
      </main>
      <SiteFooter />
    </>
  );
}
