/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: "https://mimora-sand.vercel.app",
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 50000,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/*",
          "/admin/*",
          "/private/*",
        ],
      },
    ],
    additionalSitemaps: [],
  },
  exclude: [
    "/admin",
    "/private",
    "/404",
    "/500",
    "/api/*",
  ],
  // Include all dynamic and static routes
  alternateRefs: [],
  // Custom transform function for additional control
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};

module.exports = config;
