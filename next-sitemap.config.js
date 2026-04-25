/** @type {import('next-sitemap').IConfig} */
const siteUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  outDir: `${__dirname}/out`,
  trailingSlash: true,
  changefreq: 'monthly',
  priority: 0.7,
  exclude: [
    '/*/login',
    '/*/logout',
    '/*/register',
    '/*/reset-password',
    '/*/verify-email',
    '/*/profile',
    '/*/users',
    '/*/generations',
    '/*/documents/selected',
    '/*/documents/result',
  ],
  transform: async (config, path) => {
    const base = {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };

    // Handle the Root Path (/) specifically for x-default
    if (path === '/') {
      return {
        ...base,
        alternateRefs: [
          {
            hreflang: 'x-default',
            href: `${config.siteUrl}/`,
            hrefIsAbsolute: true,
          },
          {
            hreflang: 'en',
            href: `${config.siteUrl}/en/`,
            hrefIsAbsolute: true,
          },
          {
            hreflang: 'uk',
            href: `${config.siteUrl}/uk/`,
            hrefIsAbsolute: true,
          },
        ],
      };
    }

    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;

    // Handle English paths
    if (normalizedPath.startsWith('/en')) {
      const altUk = normalizedPath.replace(/^\/en/, '/uk');
      return {
        ...base,
        alternateRefs: [
          { hreflang: 'en', href: `${config.siteUrl}${normalizedPath}/`, hrefIsAbsolute: true },
          { hreflang: 'uk', href: `${config.siteUrl}${altUk}/`, hrefIsAbsolute: true },
        ],
      };
    }

    // Handle Ukrainian paths
    if (normalizedPath.startsWith('/uk')) {
      const altEn = normalizedPath.replace(/^\/uk/, '/en');
      return {
        ...base,
        alternateRefs: [
          { hreflang: 'uk', href: `${config.siteUrl}${normalizedPath}/`, hrefIsAbsolute: true },
          { hreflang: 'en', href: `${config.siteUrl}${altEn}/`, hrefIsAbsolute: true },
        ],
      };
    }

    return base;
  },
};
