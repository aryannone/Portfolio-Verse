import type { Metadata } from "next";
import StartForm from "@/components/StartForm";

export const metadata: Metadata = {
  title: "Your details",
  description: "Fill in your details once, then see them in every template.",
};

export default function StartPage() {
  return <StartForm />;
}
