import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = "https://lemonhousecraft.in";

const staticPages = [
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/shop", priority: "0.9", changefreq: "daily" },
  { url: "/cart", priority: "0.7", changefreq: "weekly" },
  { url: "/about", priority: "0.6", changefreq: "monthly" },
  { url: "/contact", priority: "0.6", changefreq: "monthly" },
];

const categories = [
  "resin",
  "beads",
  "fabric",
  "embroidery",
  "art",
  "paints",
  "jewelry",
  "paper",
  "packaging",
  "kits",
];

const sampleProductIds = [
  "p1",
  "p2",
  "p3",
  "p4",
  "p5",
  "p6",
  "p7",
  "p8",
];

function generateSitemap() {
  const currentDate = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static Pages
  staticPages.forEach((page) => {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}${page.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Categories
  categories.forEach((cat) => {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/shop?category=${encodeURIComponent(cat)}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  // Products
  sampleProductIds.forEach((pid) => {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/product/${pid}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  const publicDir = path.resolve(__dirname, "../public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, "sitemap.xml");
  fs.writeFileSync(sitemapPath, xml, "utf-8");
  console.log(`[Sitemap] Generated successfully at ${sitemapPath}`);
}

generateSitemap();
