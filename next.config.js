const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'platform-lookaside.fbsbx.com', // Facebook CDN
      'lh3.googleusercontent.com',    // Google user content (including profile pictures)
      'graph.facebook.com',           // Another Facebook domain that might be used
    ],
  },
}

module.exports = nextConfig

