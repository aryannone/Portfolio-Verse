import type { Metadata } from "next";
import FeedbackAdmin from "@/components/FeedbackAdmin";

// The owner's page for the feedback wall. Not linked anywhere, kept out of search engines,
// and useless without the secret FEEDBACK_ADMIN_KEY.
export const metadata: Metadata = { title: "Feedback notes", robots: { index: false, follow: false } };

export default function FeedbackAdminPage() {
  return <FeedbackAdmin />;
}
