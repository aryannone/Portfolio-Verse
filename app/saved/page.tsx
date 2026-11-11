import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SavedList from "@/components/SavedList";

export const metadata: Metadata = { title: "My saved templates" };

export default function SavedPage() {
  return (
    <>
      <SiteHeader current="saved" />
      <main>
        <section className="wrap page-head">
          <h1 className="display h-page">My saved templates.</h1>
          <p>Portfolios you saved from the editor. They are kept in this browser only.</p>
        </section>
        <SavedList />
      </main>
      <SiteFooter />
    </>
  );
}
