"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminCookieValue, keyMatches } from "@/lib/admin";

export async function enterAdmin(formData: FormData) {
  const key = String(formData.get("key") ?? "");
  if (!keyMatches(key)) redirect("/admin?error=1");

  (await cookies()).set(ADMIN_COOKIE, adminCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/dashboard");
}

export async function exitAdmin() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/");
}
