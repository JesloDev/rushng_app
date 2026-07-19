/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Fixed: Using remotePatterns instead of deprecated domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.rushng.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // ✅ Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion'],
  },

  // ✅ Turbopack configuration (silences warning)
  turbopack: {
    // Empty config is fine - just having it silences the warning
  },

  // ✅ API rewrites (proxy to backend)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://localhost:8000/api/:path*',
      },
    ];
  },

  // ✅ Webpack fallback (for compatibility)
  webpack: (config, { isServer }) => {
    // Fix for packages that need polyfills
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },

  // ✅ Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ✅ Powered by header (optional)
  poweredByHeader: false,

  // ✅ React strict mode
  reactStrictMode: true,

  // ✅ Compression
  compress: true,

  // ✅ Production source maps
  productionBrowserSourceMaps: false,

  // ✅ SWC minification
  swcMinify: true,
};

module.exports = nextConfig;