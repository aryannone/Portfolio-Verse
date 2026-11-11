import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <>
      <SiteHeader />
      <main className="wrap simple">
        <h1 className="display h-page">{title}</h1>
        <p>{text}</p>
      </main>
      <SiteFooter />
    </>
  );
}
