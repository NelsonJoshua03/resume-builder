// netlify/functions/jobs-rss.js
const Parser = require('rss-parser');

const parser = new Parser();

exports.handler = async function(event, context) {
  // Free Indian job RSS feeds
  const rssFeeds = [
    'https://rss.indeed.com/rss?q=developer&l=india',
    'https://rss.indeed.com/rss?q=software+engineer&l=india',
    'https://rss.indeed.com/rss?q=it+jobs&l=india',
    'https://rss.indeed.com/rss?q=mechanical+engineer&l=india',
    'https://rss.indeed.com/rss?q=civil+engineer&l=india'
  ];

  try {
    let allJobs = [];
    
    for (const feedUrl of rssFeeds) {
      try {
        console.log(`Fetching from: ${feedUrl}`);
        const feed = await parser.parseURL(feedUrl);
        
        const jobs = feed.items.map(item => {
          return {
            id: `rss-${Buffer.from(item.link + item.title).toString('base64').slice(0, 10)}`,
            title: item.title || 'Job Title',
            company: extractCompany(item.title || '') || 'Company not specified',
            location: extractLocation(item.content || item.contentSnippet || '') || 'India',
            type: 'Full-time',
            sector: extractSector(item.title || ''),
            salary: 'As per company standards',
            description: item.contentSnippet || 'No description available',
            requirements: ['Visit company website for detailed requirements'],
            postedDate: item.pubDate || new Date().toISOString(),
            applyLink: item.link || '#',
            featured: Math.random() > 0.9, // 10% chance to be featured
            source: 'rss_indeed',
            isReal: true
          };
        });
        
        allJobs = [...allJobs, ...jobs];
        console.log(`Found ${jobs.length} jobs from ${feedUrl}`);
        
      } catch (feedError) {
        console.error(`Error with feed ${feedUrl}:`, feedError.message);
        continue; // Continue with next feed if one fails
      }
    }

    // Remove duplicates based on title + company
    const uniqueJobs = allJobs.filter((job, index, self) =>
      index === self.findIndex(j => 
        j.title === job.title && j.company === job.company
      )
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        jobs: uniqueJobs.slice(0, 50), // Limit to 50 jobs
        total: uniqueJobs.length,
        sources: rssFeeds.length,
        lastUpdated: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('RSS function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to fetch RSS feeds',
        message: error.message 
      })
    };
  }
};

// Helper functions
function extractCompany(title) {
  // Extract company from title patterns like "Software Engineer - Google" 
  const patterns = [
    /-\s*([^-]+)$/,
    /at\s+([^-]+)$/,
    /\|\s*([^-]+)$/
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return match[1].trim();
  }
  
  return 'Company not specified';
}

function extractLocation(content) {
  const locations = [
    'Bangalore', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 
    'Chennai', 'Pune', 'Kolkata', 'Gurgaon', 'Noida',
    'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi', 'Coimbatore'
  ];
  
  const contentLower = content.toLowerCase();
  for (const location of locations) {
    if (contentLower.includes(location.toLowerCase())) {
      return location;
    }
  }
  
  return 'India';
}

function extractSector(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('software') || titleLower.includes('developer') || titleLower.includes('programmer')) {
    return 'IT/Software';
  }
  if (titleLower.includes('mechanical')) {
    return 'Engineering';
  }
  if (titleLower.includes('civil')) {
    return 'Engineering';
  }
  if (titleLower.includes('data') || titleLower.includes('analyst')) {
    return 'Data Science';
  }
  if (titleLower.includes('marketing') || titleLower.includes('digital')) {
    return 'Marketing';
  }
  if (titleLower.includes('hr') || titleLower.includes('human resources')) {
    return 'HR';
  }
  
  return 'IT/Software';
}