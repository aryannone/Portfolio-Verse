import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Report a site" };

export default function ReportPage() {
  return (
    <ComingSoon
      title="Report a site"
      text="The report form arrives together with publishing. Nothing is hosted on PORTFOLIO-VERSE yet."
    />
  );
}
