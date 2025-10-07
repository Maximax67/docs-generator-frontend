/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_FRONTEND_URL,
  generateRobotsTxt: true,
  outDir: `${__dirname}/out`,
  exclude: [
    '/login',
    '/logout',
    '/register',
    '/reset-password',
    '/verify-email',
    '/profile',
    '/users',
    '/documents/result',
  ],
  changefreq: 'monthly',
  priority: 0.7,
  trailingSlash: true,
};
