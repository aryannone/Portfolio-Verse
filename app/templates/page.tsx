import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TemplateGallery from "@/components/TemplateGallery";

export const metadata: Metadata = {
  title: "Templates",
  description: "Five Professional and four Creative portfolio templates, all fully editable.",
};

export default function TemplatesPage() {
  return (
    <>
      <SiteHeader current="templates" />
      <main>
        <section className="wrap page-head tg-head">
          <span className="tg-eyebrow">Templates</span>
          <h1 className="display h-page">Pick a starting point.</h1>
          <p>
            Every template is fully editable, shows your own details, and can be switched at any time without losing
            anything. Open any one to see the full page.
          </p>
        </section>
        <TemplateGallery />
      </main>
      <SiteFooter />
    </>
  );
}
