import { SITE_BUCKET, SITE_CSP, USERNAME, siteFile } from "@/lib/publish";
import { feedbackReady, rest, storageFetch } from "@/lib/supabaseRest";

// A published site, shown full-page at /u/<username>, with nothing of the builder around it.
// It runs sandboxed (SITE_CSP), so it can never read this site's cookies or the sign-in session.
export const dynamic = "force-dynamic";

const notFound = () =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Not found</title>
<body style="font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:90vh;margin:0;padding:16px;text-align:center;color:#12141a">
<div><h1 style="font-size:28px">This site is not published.</h1><p>The link may be wrong, or its owner has taken it down.</p>
<p><a href="/" style="color:#6d28d9">Make your own portfolio with PORTFOLIO-VERSE</a></p></div></body>`,
    { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=30" } },
  );

export async function GET(_request: Request, { params }: { params: Promise<{ username: string }> }) {
  const username = (await params).username.toLowerCase();
  if (!feedbackReady || !USERNAME.test(username)) return notFound();

  const res = await rest(`profiles?select=id,published_at&username=eq.${username}&limit=1`);
  const [profile] = res.ok ? ((await res.json()) as { id: string; published_at: string | null }[]) : [];
  if (!profile?.published_at) return notFound();

  const file = await storageFetch(`object/${SITE_BUCKET}/${siteFile(profile.id)}`);
  if (!file.ok) return notFound();
  return new Response(file.body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": SITE_CSP,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      // A minute at the edge, so a new version shows soon after publishing again.
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
