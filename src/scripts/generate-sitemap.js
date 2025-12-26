// scripts/generate-seo-sitemap.js
const fs = require('fs');
const path = require('path');

const cities = [
  'bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai',
  'pune', 'kolkata', 'ahmedabad', 'gurgaon', 'noida', 'remote'
];

const industries = [
  'it', 'software-development', 'engineering', 'data-science',
  'marketing', 'finance', 'hr', 'sales', 'design', 'healthcare'
];

const combinedPages = [
  {city: 'bangalore', industry: 'it'},
  {city: 'bangalore', industry: 'software-development'},
  {city: 'mumbai', industry: 'finance'},
  {city: 'delhi', industry: 'marketing'},
  {city: 'hyderabad', industry: 'data-science'},
  {city: 'chennai', industry: 'engineering'}
];

function generateSitemap() {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <!-- SEO Fresher Job Pages 2026 -->`;

  const today = new Date().toISOString().split('T')[0];
  const year = 2026;

  // Main page
  sitemap += `
  <url>
    <loc>https://careercraft.in/latest-jobs-for-freshers-india-${year}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

  // City pages
  cities.forEach(city => {
    sitemap += `
  <url>
    <loc>https://careercraft.in/latest-jobs-for-freshers-india-${year}/${city}-jobs-for-freshers-india-${year}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  // Industry pages
  industries.forEach(industry => {
    sitemap += `
  <url>
    <loc>https://careercraft.in/latest-jobs-for-freshers-india-${year}/${industry}-jobs-for-freshers-india-${year}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // Combined pages
  combinedPages.forEach(({city, industry}) => {
    sitemap += `
  <url>
    <loc>https://careercraft.in/latest-jobs-for-freshers-india-${year}/${city}-${industry}-jobs-for-freshers-india-${year}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  sitemap += '\n</urlset>';

  const outputPath = path.join(__dirname, '../public/sitemap-seo-jobs.xml');
  fs.writeFileSync(outputPath, sitemap);
  console.log(`✅ Generated SEO sitemap with ${1 + cities.length + industries.length + combinedPages.length} URLs`);
}

generateSitemap();