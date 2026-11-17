import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProfileForm from "@/components/ProfileForm";
import { serverSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your profile", robots: { index: false, follow: false } };

// The signed-in person's profile: their Google photo and email, a name and a username (for their site's link).
export default async function ProfilePage() {
  const supabase = await serverSupabase();
  if (!supabase) redirect("/");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/profile");
  const { data: profile } = await supabase.from("profiles").select("username, display_name, avatar_url").eq("id", user.id).maybeSingle();

  const photo = profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined) ?? null;
  const name = profile?.display_name ?? (user.user_metadata?.full_name as string | undefined) ?? "";
  return (
    <>
      <SiteHeader />
      <main className="wrap simple profile">
        <div className="profile-head">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" width={72} height={72} referrerPolicy="no-referrer" />
          ) : (
            <span className="profile-initial" aria-hidden="true">
              {(name || user.email || "?").slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="display h-page">{name || "Your profile"}</h1>
            <p className="small">Signed in with Google as {user.email}</p>
          </div>
        </div>

        <ProfileForm initialName={name} initialUsername={profile?.username ?? ""} userId={user.id} />

        <div className="profile-links">
          <a className="btn btn-outline" href="/saved">
            My portfolios
          </a>
          <form action="/auth/signout" method="post">
            <button className="btn btn-quiet" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
