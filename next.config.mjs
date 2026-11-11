/** @type {import('next').NextConfig} */
const nextConfig = {
  // /studio is the original builder, kept private-by-address for testing before login exists.
  async redirects() {
    return [{ source: "/studio", destination: "/studio/index.html", permanent: false }];
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
