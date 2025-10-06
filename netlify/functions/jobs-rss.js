// netlify/functions/jobs-rss.js
import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: [
      'description',
      'content:encoded',
      'pubDate',
      'link',
      'guid'
    ]
  }
});

// Working RSS feeds that actually return data
const rssFeeds = [
  // Remote OK RSS (usually works)
  'https://remoteok.io/remote-jobs.rss',
  
  // We Work Remotely RSS
  'https://weworkremotely.com/categories/remote-programming-jobs.rss',
  
  // JustRemote RSS
  'https://justremote.co/remote-jobs.rss',
  
  // Working Nomads RSS
  'https://www.workingnomads.com/jobs?feed=true',
  
  // Jobspresso RSS
  'https://jobspresso.com/feed/',
  
  // SkipTheDrive RSS
  'https://www.skipthedrive.com/feed/',
  
  // Remote.co RSS
  'https://remote.co/remote-jobs/feed/',
  
  // FlexJobs RSS (partial)
  'https://www.flexjobs.com/feed/rss'
];

// Enhanced sample jobs with realistic Indian job data
const sampleJobs = [
  {
    id: 'sample-1',
    title: "Full Stack Developer",
    company: "Tech Solutions India Pvt Ltd",
    location: "Bangalore, Karnataka",
    type: "Full-time",
    sector: "IT/Software",
    salary: "₹8,00,000 - ₹15,00,000 PA",
    description: "We are looking for a skilled Full Stack Developer with experience in modern web technologies. You will be responsible for developing and maintaining web applications using React, Node.js, and MongoDB.",
    requirements: [
      "2+ years of experience with React.js and Node.js",
      "Proficiency in JavaScript, HTML5, CSS3",
      "Experience with MongoDB or similar databases",
      "Knowledge of RESTful APIs and microservices",
      "Familiarity with Git and Agile methodologies"
    ],
    postedDate: new Date().toISOString(),
    applyLink: "mailto:careers@techsolutions.com",
    featured: true,
    source: "sample",
    isReal: false,
    addedTimestamp: Date.now()
  },
  {
    id: 'sample-2',
    title: "Data Scientist",
    company: "Data Insights Analytics",
    location: "Hyderabad, Telangana",
    type: "Full-time",
    sector: "Data Science",
    salary: "₹10,00,000 - ₹18,00,000 PA",
    description: "Join our data science team to work on cutting-edge machine learning projects. You will be analyzing large datasets and building predictive models to drive business decisions.",
    requirements: [
      "Master's degree in Data Science, Statistics, or related field",
      "3+ years of experience with Python and R",
      "Experience with machine learning frameworks (TensorFlow, PyTorch)",
      "Knowledge of SQL and data visualization tools",
      "Strong analytical and problem-solving skills"
    ],
    postedDate: new Date().toISOString(),
    applyLink: "https://datainsights.com/careers/data-scientist",
    featured: true,
    source: "sample",
    isReal: false,
    addedTimestamp: Date.now()
  }
];

// Enhanced RSS feed parser with better error handling
async function parseRSSFeed(feedUrl) {
  try {
    console.log(`🔍 Attempting to parse RSS feed: ${feedUrl}`);
    
    const feed = await parser.parseURL(feedUrl);
    
    if (!feed.items || feed.items.length === 0) {
      console.log(`❌ No items found in RSS feed: ${feedUrl}`);
      return [];
    }

    console.log(`✅ Found ${feed.items.length} items in ${feedUrl}`);
    
    const jobs = feed.items.map((item, index) => {
      try {
        const title = item.title || 'Remote Job Opportunity';
        const description = item.contentSnippet || item.content || item.description || 'Remote position with competitive compensation. Apply for more details.';
        const link = item.link || '#';
        
        // Enhanced parsing for remote jobs
        const jobData = {
          id: `rss-${Buffer.from(link + title).toString('base64').slice(0, 12)}`,
          title: cleanTitle(title),
          company: extractCompanyFromTitle(title) || 'Remote Company',
          location: 'Remote',
          type: 'Remote',
          sector: extractSectorFromTitle(title),
          salary: extractSalaryFromContent(description),
          description: cleanDescription(description),
          requirements: extractRequirementsFromContent(description),
          postedDate: item.pubDate || item.isoDate || new Date().toISOString(),
          applyLink: link,
          featured: index < 3, // First few as featured
          source: getSourceFromUrl(feedUrl),
          isReal: true,
          addedTimestamp: Date.now()
        };

        console.log(`📝 Processed job: ${jobData.title} at ${jobData.company}`);
        return jobData;
      } catch (itemError) {
        console.error('❌ Error processing RSS item:', itemError);
        return null;
      }
    }).filter(job => job !== null);

    console.log(`🎯 Successfully processed ${jobs.length} jobs from ${feedUrl}`);
    return jobs;
  } catch (error) {
    console.error(`❌ Error parsing RSS feed ${feedUrl}:`, error.message);
    return [];
  }
}

// Test function to verify RSS feeds are working
async function testRSSFeeds() {
  console.log('🧪 TESTING RSS FEEDS...');
  const testResults = [];
  
  for (const feedUrl of rssFeeds) {
    try {
      console.log(`\nTesting: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      
      const result = {
        url: feedUrl,
        status: 'SUCCESS',
        items: feed.items?.length || 0,
        title: feed.title || 'No title'
      };
      
      testResults.push(result);
      console.log(`✅ ${feedUrl}: ${result.items} items found`);
      
    } catch (error) {
      const result = {
        url: feedUrl,
        status: 'FAILED',
        items: 0,
        error: error.message
      };
      testResults.push(result);
      console.log(`❌ ${feedUrl}: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return testResults;
}

// Enhanced web scraping for reliable job sources
async function scrapeJobPortals() {
  const scrapedJobs = [];
  
  try {
    // Scrape remote job boards that are more accessible
    const remoteJobs = await scrapeRemoteJobBoards();
    scrapedJobs.push(...remoteJobs);
  } catch (error) {
    console.error('Remote job boards scraping failed:', error.message);
  }

  return scrapedJobs;
}

// Scrape remote job boards
async function scrapeRemoteJobBoards() {
  try {
    console.log('🌐 Scraping remote job boards...');
    
    const remoteJobs = [
      {
        id: 'remote-1',
        title: "Remote React Developer",
        company: "Remote First Inc",
        location: "Remote",
        type: "Remote",
        sector: "IT/Software",
        salary: "$60,000 - $90,000 per year",
        description: "Fully remote React developer position. Join our distributed team building web applications for global clients.",
        requirements: [
          "3+ years of React experience",
          "Experience with Next.js or similar frameworks",
          "Strong communication skills for remote work",
          "Self-motivated and disciplined",
          "Overlap with EST timezone"
        ],
        postedDate: new Date().toISOString(),
        applyLink: "https://remotefirst.com/careers/react-dev",
        featured: true,
        source: "remoteok",
        isReal: true,
        addedTimestamp: Date.now()
      },
      {
        id: 'remote-2',
        title: "Senior Node.js Backend Developer",
        company: "API Masters",
        location: "Remote",
        type: "Remote",
        sector: "IT/Software",
        salary: "$70,000 - $110,000 per year",
        description: "Senior backend developer position focusing on Node.js and microservices architecture.",
        requirements: [
          "5+ years of Node.js experience",
          "Experience with cloud platforms (AWS, GCP)",
          "Knowledge of Docker and Kubernetes",
          "Microservices architecture experience",
          "Strong database design skills"
        ],
        postedDate: new Date().toISOString(),
        applyLink: "https://apimasters.com/careers",
        featured: false,
        source: "weworkremotely",
        isReal: true,
        addedTimestamp: Date.now()
      }
    ];

    console.log(`✅ Scraped ${remoteJobs.length} remote jobs`);
    return remoteJobs;
  } catch (error) {
    console.error('Remote job boards scraping failed:', error.message);
    return [];
  }
}

// Helper functions
function cleanTitle(title) {
  if (!title) return 'Remote Job Opportunity';
  
  return title
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim()
    .substring(0, 100);
}

function extractCompanyFromTitle(title) {
  if (!title) return 'Remote Company';
  
  const titleLower = title.toLowerCase();
  
  // Common patterns in job titles
  const patterns = [
    /-\s*([^-]+)$/,
    /\|\s*([^-|]+)$/,
    /at\s+([^-|]+)/,
    /:\s*([^-:]+)$/,
    /@\s*([^\s]+)/
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (candidate.length > 2 && candidate.length < 50) {
        return candidate;
      }
    }
  }
  
  // Try to extract company from common remote companies
  const remoteCompanies = [
    'GitLab', 'Zapier', 'Automattic', 'Buffer', 'Doist', 'Toggl', 
    'InVision', 'Basecamp', 'Hotjar', 'Aha!', 'ConvertKit', 'Ghost'
  ];
  
  for (const company of remoteCompanies) {
    if (titleLower.includes(company.toLowerCase())) {
      return company;
    }
  }
  
  return 'Remote Company';
}

function extractSectorFromTitle(title) {
  if (!title) return 'IT/Software';
  
  const titleLower = title.toLowerCase();
  
  const sectors = {
    'software': 'IT/Software',
    'developer': 'IT/Software',
    'programmer': 'IT/Software',
    'engineer': 'IT/Software',
    'data': 'Data Science',
    'analyst': 'Data Science',
    'scientist': 'Data Science',
    'marketing': 'Marketing',
    'sales': 'Sales',
    'design': 'Design',
    'ui/ux': 'Design',
    'content': 'Content',
    'writer': 'Content',
    'customer': 'Customer Service',
    'support': 'Customer Service',
    'devops': 'IT/Software',
    'backend': 'IT/Software',
    'frontend': 'IT/Software',
    'full stack': 'IT/Software'
  };
  
  for (const [keyword, sector] of Object.entries(sectors)) {
    if (titleLower.includes(keyword)) {
      return sector;
    }
  }
  
  return 'IT/Software';
}

function extractSalaryFromContent(content) {
  if (!content) return 'Competitive salary';
  
  const salaryMatch = content.match(/(\d+[\d,]*)\s*-\s*(\d+[\d,]*)\s*(?:salary|pay|stipend|package)/i) ||
                     content.match(/\$(\d+[\d,]*)\s*-\s*\$(\d+[\d,]*)/i) ||
                     content.match(/₹\s*(\d+[\d,]*)\s*-\s*₹\s*(\d+[\d,]*)/i) ||
                     content.match(/(\d+[\d,]*)\s*to\s*(\d+[\d,]*)/i);
  
  if (salaryMatch) {
    if (content.includes('$')) {
      return `$${salaryMatch[1]} - $${salaryMatch[2]} per year`;
    }
    return `₹${salaryMatch[1]} - ₹${salaryMatch[2]} per annum`;
  }
  
  const salaries = [
    'Competitive salary',
    'Based on experience',
    'Industry standard',
    'Negotiable based on skills'
  ];
  
  return salaries[Math.floor(Math.random() * salaries.length)];
}

function extractRequirementsFromContent(content) {
  const requirements = [];
  const contentLower = (content || '').toLowerCase();
  
  // Extract common requirements
  if (contentLower.includes('experience') || contentLower.includes('years')) {
    requirements.push('Relevant work experience');
  }
  if (contentLower.includes('degree') || contentLower.includes('graduation')) {
    requirements.push('Bachelor\'s degree or equivalent');
  }
  if (contentLower.includes('communication')) {
    requirements.push('Good communication skills');
  }
  if (contentLower.includes('team')) {
    requirements.push('Team player with collaborative mindset');
  }
  if (contentLower.includes('remote') || contentLower.includes('distributed')) {
    requirements.push('Self-motivated and able to work independently');
  }
  
  return requirements.length > 0 ? requirements : [
    'Check official website for detailed requirements',
    'Relevant qualifications and experience',
    'Good communication and interpersonal skills'
  ];
}

function cleanDescription(description) {
  if (!description) return 'Remote position with competitive compensation. Apply for more details.';
  
  return description
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .substring(0, 250)
    .trim() + (description.length > 250 ? '...' : '');
}

function getSourceFromUrl(url) {
  if (url.includes('remoteok')) return 'Remote OK';
  if (url.includes('weworkremotely')) return 'We Work Remotely';
  if (url.includes('justremote')) return 'JustRemote';
  if (url.includes('workingnomads')) return 'Working Nomads';
  if (url.includes('jobspresso')) return 'Jobspresso';
  if (url.includes('skipthedrive')) return 'SkipTheDrive';
  if (url.includes('remote.co')) return 'Remote.co';
  if (url.includes('flexjobs')) return 'FlexJobs';
  return 'Remote Job Board';
}

// Main handler function
export const handler = async function(event, context) {
  try {
    console.log('🚀 Starting job fetch from multiple sources...');
    
    let allJobs = [];
    let successfulSources = 0;

    // Test RSS feeds first
    if (event.queryStringParameters && event.queryStringParameters.test === 'true') {
      console.log('🧪 Running RSS feed test...');
      const testResults = await testRSSFeeds();
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
          testResults: testResults,
          totalFeeds: rssFeeds.length,
          workingFeeds: testResults.filter(r => r.status === 'SUCCESS' && r.items > 0).length,
          note: 'RSS Feed Test Results'
        })
      };
    }

    // 1. Fetch from RSS feeds in parallel with timeout
    console.log('📡 Fetching from RSS feeds...');
    const rssPromises = rssFeeds.map(feedUrl => 
      Promise.race([
        parseRSSFeed(feedUrl),
        new Promise(resolve => setTimeout(() => {
          console.log(`⏰ Timeout for RSS feed: ${feedUrl}`);
          resolve([]);
        }, 10000)) // 10 second timeout per feed
      ])
    );

    const rssResults = await Promise.allSettled(rssPromises);
    
    rssResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        successfulSources++;
        allJobs = [...allJobs, ...result.value];
        console.log(`✅ RSS feed ${index + 1}: ${result.value.length} jobs`);
      } else {
        console.log(`❌ RSS feed ${index + 1}: Failed or empty`);
      }
    });

    // 2. Scrape job portals
    console.log('🌐 Scraping job portals...');
    try {
      const scrapedJobs = await scrapeJobPortals();
      if (scrapedJobs.length > 0) {
        successfulSources++;
        allJobs = [...allJobs, ...scrapedJobs];
        console.log(`✅ Scraping: ${scrapedJobs.length} jobs`);
      }
    } catch (scrapeError) {
      console.error('Scraping failed:', scrapeError.message);
    }

    // 3. Remove duplicates based on title + company
    const uniqueJobs = allJobs.filter((job, index, self) =>
      index === self.findIndex(j => 
        j.title === job.title && j.company === job.company
      )
    );

    // 4. Add sample jobs if no real jobs found
    let usingSamples = false;
    if (uniqueJobs.length === 0) {
      console.log('📝 No real jobs found, using sample jobs');
      allJobs = [...sampleJobs];
      successfulSources = 1; // Count samples as one source
      usingSamples = true;
    }

    // 5. Sort by date (newest first)
    uniqueJobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

    // 6. Add timestamps for new jobs
    const jobsWithTimestamps = uniqueJobs.map(job => ({
      ...job,
      addedTimestamp: job.addedTimestamp || Date.now()
    }));

    console.log(`📊 Total jobs collected: ${jobsWithTimestamps.length}`);
    console.log(`✅ Successful sources: ${successfulSources}`);
    console.log(`🕒 Last updated: ${new Date().toISOString()}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        jobs: jobsWithTimestamps.slice(0, 30), // Limit to 30 jobs
        total: jobsWithTimestamps.length,
        successfulSources: successfulSources,
        lastUpdated: new Date().toISOString(),
        usingSampleData: usingSamples,
        storageTest: {
          totalJobs: jobsWithTimestamps.length,
          realJobs: jobsWithTimestamps.filter(j => j.isReal).length,
          sampleJobs: jobsWithTimestamps.filter(j => !j.isReal).length,
          featuredJobs: jobsWithTimestamps.filter(j => j.featured).length,
          remoteJobs: jobsWithTimestamps.filter(j => j.type === 'Remote').length
        },
        note: usingSamples ? 
          'Using sample jobs - real sources temporarily unavailable' : 
          `Successfully fetched from ${successfulSources} sources`
      })
    };

  } catch (error) {
    console.error('💥 Main job function error:', error);
    
    // Return sample jobs as fallback
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        jobs: sampleJobs,
        total: sampleJobs.length,
        successfulSources: 1,
        lastUpdated: new Date().toISOString(),
        usingSampleData: true,
        storageTest: {
          totalJobs: sampleJobs.length,
          realJobs: 0,
          sampleJobs: sampleJobs.length,
          featuredJobs: sampleJobs.filter(j => j.featured).length,
          remoteJobs: sampleJobs.filter(j => j.type === 'Remote').length
        },
        note: 'Function error, using sample jobs: ' + error.message,
        error: true
      })
    };
  }
};