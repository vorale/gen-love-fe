/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Required for static export
    domains: [
      'amplify-amplifynextjschatapp-dev-f7550-deployment.s3.amazonaws.com',
      // Add other image domains you're using
    ]
  },
  // // If you're using static export
  // output: 'export'  // Only if using static export
}

module.exports = nextConfig
