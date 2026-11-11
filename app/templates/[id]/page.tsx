import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import TemplatePreview from "@/components/TemplatePreview";
import GoogleButton from "@/components/GoogleButton";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const template = getTemplate(id);
  return { title: template ? `${template.name} preview` : "Template preview" };
}

// Full-size preview of one template, open to everyone. No login needed.
export default async function TemplatePreviewPage({ params }: Params) {
  const { id } = await params;
  const template = getTemplate(id);
  if (!template) notFound();

  return (
    <>
      <div className="preview-bar">
        <div className="wrap preview-bar-in">
          <Link href="/templates" className="nav-link">
            ← All templates
          </Link>
          <div className="preview-title">
            {template.name}
            <span>Sample content</span>
          </div>
          <GoogleButton label="Use this template" variant="outline" template={template.id} />
        </div>
      </div>
      <main>
        <TemplatePreview id={template.id} />
      </main>
    </>
  );
}
