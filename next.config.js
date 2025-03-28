/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // 配置TypeScript支持
  typescript: {
    ignoreBuildErrors: false
  },
  // 配置静态资源优化
  images: {
    domains: ['github.com', 'gitlab.com']
  },
  // 配置环境变量
  env: {
    GITHUB_API_URL: 'https://api.github.com',
    GITLAB_API_URL: 'https://gitlab.com/api/v4',
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITLAB_TOKEN: process.env.GITLAB_TOKEN
  }
};

module.exports = nextConfig;