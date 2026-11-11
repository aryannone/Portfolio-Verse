export const SITE_NAME = "PORTFOLIO-VERSE";

// Free beta limits. Change the numbers here, nowhere else.
export const FREE_SITE_LIMIT = 1;
export const MAX_IMAGE_BYTES = 1024 * 1024; // images are compressed to about 1 MB
export const MAX_STORAGE_BYTES = 20 * 1024 * 1024; // 20 MB per user

// Usernames nobody can claim, because they clash with our own pages.
export const RESERVED_USERNAMES = [
  "admin",
  "api",
  "auth",
  "dashboard",
  "editor",
  "login",
  "logout",
  "privacy",
  "report",
  "saved",
  "start",
  "templates",
  "terms",
  "www",
];
