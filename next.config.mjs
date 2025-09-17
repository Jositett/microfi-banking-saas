/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  // Remove build error ignoring for production readiness
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
}

export default nextConfig
