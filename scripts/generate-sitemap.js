const fs = require('fs');
const path = require('path');

const generateSitemap = () => {
  const baseUrl = 'https://cuspark.live';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const routes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/home', priority: '1.0', changefreq: 'weekly' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/rules', priority: '0.9', changefreq: 'monthly' },
    { path: '/schedule', priority: '0.9', changefreq: 'weekly' },
    { path: '/keymaps', priority: '0.7', changefreq: 'monthly' },
    { path: '/prizes', priority: '0.8', changefreq: 'monthly' },
    { path: '/gallery', priority: '0.6', changefreq: 'weekly' },
    { path: '/result', priority: '0.8', changefreq: 'daily' },
    { path: '/login', priority: '0.5', changefreq: 'yearly' },
    { path: '/register', priority: '0.5', changefreq: 'yearly' }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${routes.map(route => `    
    <url>
        <loc>${baseUrl}${route.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${route.changefreq}</changefreq>
        <priority>${route.priority}</priority>
    </url>`).join('')}
    
</urlset>`;

  // Write to public directory
  const publicDir = path.join(__dirname, '../public');
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  
  // Also write to build directory if it exists
  const buildDir = path.join(__dirname, '../build');
  if (fs.existsSync(buildDir)) {
    fs.writeFileSync(path.join(buildDir, 'sitemap.xml'), sitemap);
  }
  
  console.log('✅ Sitemap generated successfully!');
};

// Run if called directly
if (require.main === module) {
  generateSitemap();
}

module.exports = generateSitemap;
