/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // Ignorer les erreurs ESLint pendant le build en production
    // Décommentez cette ligne si vous voulez forcer le déploiement
    // ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig