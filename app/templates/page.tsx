import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TemplateGallery from "@/components/TemplateGallery";

export const metadata: Metadata = {
  title: "Templates",
  description: "Four Professional and four Creative portfolio templates, all fully editable.",
};

export default function TemplatesPage() {
  return (
    <>
      <SiteHeader current="templates" />
      <main>
        <section className="wrap page-head">
          <h1 className="display h-page">Pick a starting point.</h1>
          <p>
            Every template is editable: text, colours, fonts, sections and photos. You can switch
            later without losing your details. Hover a template to see it scroll.
          </p>
        </section>
        <TemplateGallery />
      </main>
      <SiteFooter />
    </>
  );
}
