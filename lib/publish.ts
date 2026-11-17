// Publishing: a signed-in person's site goes live at /u/<username>.
// The browser uploads the HTML to Supabase Storage (sites/<user id>/index.html, only into its own folder),
// then /api/publish marks the site as live. /u/<username> serves it.

export const SITE_BUCKET = "sites";
export const MAX_SITE_BYTES = 10 * 1024 * 1024;
export const USERNAME = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export const siteFile = (userId: string) => `${userId}/index.html`;
export const sitePath = (username: string) => `/u/${username}`;

// Published pages run in a sandbox: as if on their own separate site, so their scripts can never reach
// this site's cookies or storage (where the sign-in session lives). Links, pop-ups, downloads and forms still work.
export const SITE_CSP = "sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads allow-modals";
