import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <ComingSoon
      title="Privacy"
      text="Our privacy policy is being written and will be published here before sign-ups open."
    />
  );
}
