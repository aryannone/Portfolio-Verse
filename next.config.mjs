/** @type {import('next').NextConfig} */
const nextConfig = {
  // /studio is the original builder, open to everyone until the new editor is built.
  async redirects() {
    return [
      { source: "/studio", destination: "/studio/index.html", permanent: false },
      // Login is switched off for now, so old links go straight in.
      { source: "/login", destination: "/dashboard", permanent: false },
      { source: "/admin", destination: "/dashboard", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/studio/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
