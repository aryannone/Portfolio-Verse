import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy",
  description: "PORTFOLIO-VERSE keeps your portfolio in your own browser until you publish it. Google sign-in, no tracking.",
};

// What the site does with people's information, in plain words. Keep it true to the code:
// update this page whenever something new leaves the browser.
export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap simple legal">
        <h1 className="display h-page">Privacy</h1>
        <p className="lead">
          Short version: your portfolio stays in your browser until you choose to publish it. Your account holds only your name, email and Google
          photo, and we do not track you.
        </p>

        <h2>What stays on your device</h2>
        <ul>
          <li>
            Everything you type into the builder, every photo you add and every portfolio you save is kept in your own browser (IndexedDB and
            local storage). It is not sent to us, and we have no copy of it, unless you press Publish (see below).
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
            No analytics services, advertising or tracking across other sites. To show how many people have visited, your
            browser gets a random number in a cookie (it says nothing about you) and is counted once. If you sign in, that
            number is linked to your account, so you count once on all your devices. Downloads are a single count with
            nothing about you stored with it.
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
            You need to sign in with Google to add a note to the feedback wall. Its name, topic and message are stored on our
            database (Supabase) with your account, which allows one note per person and lets you edit it from any device.
          </li>
          <li>Notes are checked by us before anyone else can see them. Once approved, a note is public on the home page.</li>
          <li>Only add a name you are happy to show publicly; a first name is enough. To have a note removed, ask us.</li>
        </ul>

        <h2>Publishing your site</h2>
        <ul>
          <li>
            When you press Publish, the portfolio open in the editor is turned into one HTML file and stored on our storage
            (Supabase), linked to your account. Anyone with your link (/u/your-username) can see it.
          </li>
          <li>You can publish one site at a time. Publishing again replaces it; Take down deletes the file and the link stops working.</li>
          <li>Downloaded and published portfolios end with a small &quot;Made in • PORTFOLIO-VERSE&quot; link back to this site.</li>
        </ul>

        <h2>Your portfolio is public once you publish it</h2>
        <p>
          Whether you publish here or put your downloaded file online yourself, everything in it, including your email, phone
          number and any résumé file you added, can be seen by anyone. Only include what you are happy to share.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
