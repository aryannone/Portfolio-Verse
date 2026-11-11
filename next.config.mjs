/** @type {import('next').NextConfig} */
const nextConfig = {
  // Old addresses all lead to the editor now.
  async redirects() {
    return ["/studio", "/studio/index.html", "/dashboard", "/login", "/admin"].map((source) => ({
      source,
      destination: "/editor",
      permanent: false,
    }));
  },
};

export default nextConfig;
