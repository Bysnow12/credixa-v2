/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 🔥 Esto evita el error de micromatch en Vercel
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        '**/node_modules/**',
        '**/.next/**',
        '**/.git/**'
      ]
    }
  }
}

module.exports = nextConfig