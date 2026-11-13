import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SavedList from "@/components/SavedList";

export const metadata: Metadata = { title: "My portfolios" };

export default function SavedPage() {
  return (
    <>
      <SiteHeader current="saved" />
      <main>
        <section className="wrap page-head">
          <h1 className="display h-page">My portfolios.</h1>
          <p>Every portfolio you have made in this browser. Each one saves by itself as you edit, and none replaces another.</p>
        </section>
        <SavedList />
      </main>
      <SiteFooter />
    </>
  );
}
