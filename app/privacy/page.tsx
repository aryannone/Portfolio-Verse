import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy",
  description: "PORTFOLIO-VERSE keeps your portfolio in your own browser. No account, no tracking.",
};

// What the site does with people's information, in plain words. Keep it true to the code:
// update this page whenever something new leaves the browser.
export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap simple legal">
        <h1 className="display h-page">Privacy</h1>
        <p className="lead">Short version: your portfolio stays in your browser. Your account holds only your name, email and Google photo, and we do not track you.</p>

        <h2>What stays on your device</h2>
        <ul>
          <li>
            Everything you type into the builder, every photo you add and every portfolio you save is kept in your own browser (IndexedDB and
            local storage). It is not sent to us, and we have no copy of it.
          </li>
          <li>
            Reading a résumé PDF and removing a photo&apos;s background both happen inside your browser. The files never leave
            your device.
          </li>
          <li>Clearing your browser&apos;s site data deletes your portfolios, so download the ones you want to keep.</li>
        </ul>

        <h2>Your account</h2>
        <ul>
          <li>
            You sign in with Google before you start building. We receive your name, email address and Google photo, and keep
            them, with the name and username you choose on your profile, in our database (Supabase). Nothing else from your
            Google account is shared with us.
          </li>
          <li>A sign-in cookie keeps you signed in on this site. Signing out removes it.</li>
          <li>Your portfolios are not in your account: they still stay in your browser.</li>
        </ul>

        <h2>What we do not do</h2>
        <ul>
          <li>
            No analytics, advertising or tracking cookies. The home page shows how many people have visited and downloaded:
            each browser adds one to a single anonymous count once a day, and nothing about you is stored with it.
          </li>
          <li>We never sell or share anything. We never receive your portfolio, only feedback notes you choose to send.</li>
        </ul>

        <h2>Outside services</h2>
        <ul>
          <li>
            <strong>Hosting.</strong> This site is served by Vercel, which, like any web host, sees basic request details
            such as IP addresses in its server logs.
          </li>
          <li>
            <strong>Fonts in downloaded portfolios.</strong> A portfolio you download loads its fonts from Google Fonts, so
            visitors to your portfolio connect to Google.
          </li>
          <li>
            <strong>Contact form, only if you turn it on.</strong> If you choose to receive messages straight to your inbox,
            they are sent through FormSubmit, an outside service. Otherwise the form simply opens the visitor&apos;s own email
            app.
          </li>
        </ul>

        <h2>The feedback wall</h2>
        <ul>
          <li>
            If you add a note to the feedback wall on the home page, its name, topic and message are stored on our database
            (Supabase), with a random code from your browser that allows one note per browser.
          </li>
          <li>Notes are checked by us before anyone else can see them. Once approved, a note is public on the home page.</li>
          <li>Only add a name you are happy to show publicly; a first name is enough. To have a note removed, ask us.</li>
        </ul>

        <h2>Your portfolio is public once you publish it</h2>
        <p>
          When you put your downloaded portfolio online, everything in it, including your email, phone number and any
          résumé file you added, can be seen by anyone. Only include what you are happy to share.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
