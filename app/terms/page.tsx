import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <ComingSoon
      title="Terms"
      text="Our terms of use are being written and will be published here before sign-ups open."
    />
  );
}
