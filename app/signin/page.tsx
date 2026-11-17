import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GoogleSignIn from "@/components/GoogleSignIn";
import { safeNext } from "@/lib/supabase/config";
import { serverSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: true } };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNext(rawNext);
  const supabase = await serverSupabase();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (user) redirect(next);

  return (
    <>
      <SiteHeader />
      <main className="wrap simple signin">
        <h1 className="display h-page">Sign in to start building.</h1>
        <p className="lead">
          It is still free. Signing in gives you a profile and, soon, lets you publish your site with its own link. Your portfolios still stay in this browser.
        </p>
        {error ? (
          <p className="fw-error" role="alert">
            Sign-in did not finish. Please try again.
          </p>
        ) : null}
        <GoogleSignIn next={next} />
        <p className="small">
          We only get your name, email address and Google photo. Read the <a href="/privacy">privacy page</a>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
