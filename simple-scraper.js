// simple-scraper.js
import axios from 'axios';
import * as cheerio from 'cheerio';

// This is our simple robot that can scrape jobs
async function scrapeSimpleJobs() {
  try {
    console.log('🚗 Driving to the website...');
    
    // Let's try a simple job board that allows scraping
    const response = await axios.get('https://remoteok.io/remote-dev-jobs', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('✅ Website loaded successfully!');
    
    // Our robot starts reading the website
    const $ = cheerio.load(response.data);
    
    const jobs = [];
    
    // Let's look for job listings (like looking for Pokémon cards)
    $('tr.job').each((index, element) => {
      // For each job card we find, let's read the information
      const title = $(element).find('h2').text().trim();
      const company = $(element).find('h3').text().trim();
      const tags = $(element).find('.tags .tag').map((i, tag) => $(tag).text()).get();
      
      if (title && company) {
        jobs.push({
          id: `scraped-${index}`,
          title: title,
          company: company,
          location: 'Remote', // This site is mostly remote jobs
          type: 'Remote',
          sector: 'IT/Software',
          salary: 'Competitive salary',
          description: `Join ${company} as a ${title}. Remote opportunity.`,
          requirements: tags.length > 0 ? tags : ['Strong technical skills required'],
          postedDate: new Date().toISOString().split('T')[0],
          applyLink: `https://remoteok.io${$(element).attr('data-url')}`,
          featured: false,
          source: 'remoteok.io',
          isReal: true
        });
      }
    });
    
    console.log(`🎉 Found ${jobs.length} jobs!`);
    
    // Show us what we found
    if (jobs.length > 0) {
      console.log('\n📋 First few jobs:');
      jobs.slice(0, 3).forEach(job => {
        console.log(`- ${job.title} at ${job.company}`);
      });
    }
    
    return jobs;
    
  } catch (error) {
    console.log('❌ Oops! Our robot had a problem:', error.message);
    return [];
  }
}

// Let's test our scraper
async function testScraper() {
  console.log('🤖 Starting our simple job scraper...\n');
  const jobs = await scrapeSimpleJobs();
  console.log(`\n✨ Total jobs found: ${jobs.length}`);
}

testScraper();