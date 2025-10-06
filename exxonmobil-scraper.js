// exxonmobil-scraper.js
import axios from 'axios';
import * as cheerio from 'cheerio';

// URL of the ExxonMobil job search page you provided
const url = 'https://jobs.exxonmobil.com/go/Engineering/3845600/?q=&q2=&alertId=&locationsearch=&title=&location=India&department=&shifttype=&date=';

async function scrapeExxonMobilJobs() {
  try {
    // Fetch the HTML of the page
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Load the HTML into Cheerio
    const $ = cheerio.load(response.data);

    const jobs = [];

    // TODO: This selector is a placeholder. You MUST find the correct one.
    // It should target the element that repeats for every job on the page.
    $('.job-listing-container').each((index, element) => {
      
      // TODO: Find the correct selectors for each piece of data.
      // Use the inspector to find the right classes or tags.
      const title = $(element).find('.job-title-selector').text().trim();
      const link = $(element).find('a').attr('href');
      const location = $(element).find('.job-location-selector').text().trim();
      const datePosted = $(element).find('.posting-date-selector').text().trim();

      // Use a default if no date is found
      const postedDate = datePosted || new Date().toISOString().split('T')[0];

      // Build an absolute URL if the link is relative
      const absoluteLink = link ? new URL(link, url).href : '#';

      if (title) {
        jobs.push({
          id: `exxon-${index}`,
          title: title,
          company: 'ExxonMobil',
          location: location || 'India',
          type: 'Full-time', // You may need to find a selector for this or set a default
          sector: 'Engineering',
          salary: 'Competitive salary', // Typically not listed on main pages
          description: `Engineering role at ExxonMobil in ${location}.`, // You might need to scrape a detail page for a full description.
          requirements: ['See job description for requirements'], // You would scrape this from the job's detail page.
          postedDate: postedDate,
          applyLink: absoluteLink,
          featured: false,
          source: 'exxonmobil.com',
          isReal: true
        });
      }
    });

    console.log(`🎉 Successfully scraped ${jobs.length} jobs from ExxonMobil!`);
    
    if (jobs.length > 0) {
      console.log('\n📋 Sample job found:');
      console.log(`- Title: ${jobs[0].title}`);
      console.log(`- Location: ${jobs[0].location}`);
      console.log(`- Link: ${jobs[0].applyLink}`);
    } else {
      console.log('\n❌ No jobs found. The CSS selectors likely need to be updated.');
    }

    return jobs;

  } catch (error) {
    console.error('❌ Error scraping the website:', error.message);
    return [];
  }
}

// Run the scraper
scrapeExxonMobilJobs();