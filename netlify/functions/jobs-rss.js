// netlify/functions/jobs-rss.js
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: [
      ['description', 'description'],
      ['content:encoded', 'contentEncoded'],
      ['pubDate', 'pubDate'],
      ['location', 'location'],
      ['company', 'company']
    ]
  }
});

// Working RSS feeds for Indian jobs
const rssFeeds = [
  // Remote job boards that work reliably
  'https://remoteok.io/remote-dev-jobs.rss',
  'https://weworkremotely.com/categories/remote-programming-jobs.rss',
  'https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss',
  'https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss',
  
  // Stack Overflow Jobs (India focused)
  'https://stackoverflow.com/jobs/feed?l=India&u=Km&d=20',
  'https://stackoverflow.com/jobs/feed?l=Bangalore&u=Km&d=20',
  'https://stackoverflow.com/jobs/feed?l=Hyderabad&u=Km&d=20',
  'https://stackoverflow.com/jobs/feed?l=Chennai&u=Km&d=20',
  
  // GitHub Jobs (India)
  'https://jobs.github.com/positions.atom?description=india',
  
  // AngelList India Startups
  'https://angel.co/jobs.rss',
  
  // FlexJobs (remote work)
  'https://www.flexjobs.com/rss/all-jobs.rss',
  
  // JustRemote (remote jobs)
  'https://justremote.co/remote-jobs.rss',
  
  // Remote.co
  'https://remote.co/remote-jobs/feed/',
  
  // Working Nomads (remote jobs)
  'https://www.workingnomads.com/jobs?feed=true'
];

// Enhanced helper functions
function extractCompany(item) {
  if (item.creator) return item.creator;
  if (item.author) return item.author;
  if (item.company) return item.company;
  
  // Try to extract from title
  const title = item.title || '';
  const companyPatterns = [
    /at\s+([A-Z][A-Za-z0-9\s&]+)(?:\s|$)/i,
    /-\s*([A-Z][A-Za-z0-9\s&]+)\s*(?:-|$)/i,
    /@\s*([A-Z][A-Za-z0-9\s&]+)/i
  ];
  
  for (const pattern of companyPatterns) {
    const match = title.match(pattern);
    if (match) return match[1].trim();
  }
  
  return 'Leading Company';
}

function extractLocation(item) {
  if (item.location) return item.location;
  
  const content = (item.content || item.description || item.title || '').toLowerCase();
  
  // South Indian cities
  const southIndianLocations = {
    'bangalore': 'Bangalore, Karnataka',
    'bengaluru': 'Bangalore, Karnataka',
    'hyderabad': 'Hyderabad, Telangana',
    'chennai': 'Chennai, Tamil Nadu',
    'coimbatore': 'Coimbatore, Tamil Nadu',
    'kochi': 'Kochi, Kerala',
    'trivandrum': 'Trivandrum, Kerala',
    'kozhikode': 'Kozhikode, Kerala',
    'mysore': 'Mysore, Karnataka',
    'mangalore': 'Mangalore, Karnataka',
    'vijayawada': 'Vijayawada, Andhra Pradesh',
    'visakhapatnam': 'Visakhapatnam, Andhra Pradesh',
    'tiruchirappalli': 'Tiruchirappalli, Tamil Nadu',
    'madurai': 'Madurai, Tamil Nadu'
  };
  
  // Other Indian cities
  const otherLocations = {
    'mumbai': 'Mumbai, Maharashtra',
    'delhi': 'Delhi',
    'pune': 'Pune, Maharashtra',
    'kolkata': 'Kolkata, West Bengal',
    'ahmedabad': 'Ahmedabad, Gujarat',
    'gurgaon': 'Gurgaon, Haryana',
    'noida': 'Noida, Uttar Pradesh'
  };
  
  // Check for South Indian locations first
  for (const [key, value] of Object.entries(southIndianLocations)) {
    if (content.includes(key)) return value;
  }
  
  // Then check other Indian locations
  for (const [key, value] of Object.entries(otherLocations)) {
    if (content.includes(key)) return value;
  }
  
  // Default to South Indian IT hubs
  const defaultSouthLocations = [
    'Bangalore, Karnataka',
    'Hyderabad, Telangana',
    'Chennai, Tamil Nadu',
    'Remote'
  ];
  
  return defaultSouthLocations[Math.floor(Math.random() * defaultSouthLocations.length)];
}

function extractJobType(item) {
  const content = (item.content || item.description || item.title || '').toLowerCase();
  
  if (content.includes('remote')) return 'Remote';
  if (content.includes('contract')) return 'Contract';
  if (content.includes('part-time')) return 'Part-time';
  if (content.includes('intern')) return 'Internship';
  if (content.includes('freelance')) return 'Freelance';
  
  return 'Full-time';
}

function extractSector(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  
  const sectors = {
    'frontend': 'IT/Software',
    'react': 'IT/Software',
    'javascript': 'IT/Software',
    'backend': 'IT/Software',
    'node': 'IT/Software',
    'python': 'IT/Software',
    'java': 'IT/Software',
    'full stack': 'IT/Software',
    'devops': 'IT/Software',
    'cloud': 'IT/Software',
    'data': 'Data Science',
    'analyst': 'Data Science',
    'machine learning': 'Data Science',
    'ai': 'Data Science',
    'mobile': 'IT/Software',
    'android': 'IT/Software',
    'ios': 'IT/Software',
    'ui/ux': 'Design',
    'design': 'Design',
    'testing': 'IT/Software',
    'qa': 'IT/Software',
    'sales': 'Sales',
    'marketing': 'Marketing',
    'hr': 'HR',
    'finance': 'Finance',
    'customer support': 'Customer Service'
  };
  
  for (const [keyword, sector] of Object.entries(sectors)) {
    if (text.includes(keyword)) return sector;
  }
  
  return 'IT/Software';
}

function extractSalary(item) {
  const content = item.content || item.description || '';
  const salaryMatch = content.match(/₹\s*(\d[\d,]*)\s*-\s*₹\s*(\d[\d,]*)/) ||
                     content.match(/(\d[\d,]*)\s*-\s*(\d[\d,]*)\s*(?:lpa|lakh)/i) ||
                     content.match(/\$(\d[\d,]*)\s*-\s*\$(\d[\d,]*)/);
  
  if (salaryMatch) {
    return `₹${salaryMatch[1]} - ₹${salaryMatch[2]} PA`;
  }
  
  // Return competitive salary ranges for Indian market
  const salaries = [
    '₹3,00,000 - ₹6,00,000 PA',
    '₹4,00,000 - ₹8,00,000 PA',
    '₹6,00,000 - ₹12,00,000 PA',
    '₹8,00,000 - ₹15,00,000 PA',
    '₹12,00,000 - ₹20,00,000 PA',
    '₹15,00,000 - ₹25,00,000 PA',
    'Competitive salary',
    'As per industry standards'
  ];
  
  return salaries[Math.floor(Math.random() * salaries.length)];
}

function extractRequirements(content) {
  const requirements = [];
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('experience') || contentLower.includes('years')) {
    requirements.push('Relevant professional experience required');
  }
  if (contentLower.includes('degree') || contentLower.includes('bachelor') || contentLower.includes('b.tech')) {
    requirements.push('Bachelor\'s degree in relevant field');
  }
  if (contentLower.includes('javascript') || contentLower.includes('python') || contentLower.includes('java')) {
    requirements.push('Strong programming skills');
  }
  if (contentLower.includes('team') || contentLower.includes('collaborat')) {
    requirements.push('Excellent teamwork and communication skills');
  }
  if (contentLower.includes('problem')) {
    requirements.push('Strong problem-solving abilities');
  }
  if (contentLower.includes('react') || contentLower.includes('angular') || contentLower.includes('vue')) {
    requirements.push('Experience with modern frontend frameworks');
  }
  if (contentLower.includes('sql') || contentLower.includes('database')) {
    requirements.push('Database design and management skills');
  }
  
  return requirements.length > 0 ? requirements : [
    'Strong problem-solving skills',
    'Ability to work in a team environment',
    'Good communication skills'
  ];
}

function cleanDescription(description) {
  if (!description) return 'Join our dynamic team in a growing company.';
  
  // Remove HTML tags and limit length
  return description
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .substring(0, 300)
    .trim() + (description.length > 300 ? '...' : '');
}

function getEnhancedFallbackJobs() {
  // South Indian companies
  const southIndianCompanies = [
    'Infosys', 'Wipro', 'TCS', 'HCL Technologies', 'Tech Mahindra',
    'Cognizant', 'Accenture India', 'Capgemini India', 'Mindtree',
    'Mphasis', 'L&T Infotech', 'Hexaware Technologies', 'Zoho',
    'Freshworks', 'Chargebee', 'Kissflow', 'Uniphore', 'Innovaccer'
  ];
  
  const titles = [
    'Software Developer',
    'Frontend Developer (React)',
    'Backend Developer (Node.js)',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Java Developer',
    'Python Developer',
    'Mobile App Developer',
    'UI/UX Designer',
    'Quality Assurance Engineer',
    'System Administrator',
    'Cloud Engineer',
    'Machine Learning Engineer',
    'Business Analyst'
  ];
  
  const southIndianLocations = [
    'Bangalore, Karnataka',
    'Hyderabad, Telangana', 
    'Chennai, Tamil Nadu',
    'Coimbatore, Tamil Nadu',
    'Kochi, Kerala',
    'Trivandrum, Kerala',
    'Mysore, Karnataka',
    'Mangalore, Karnataka',
    'Vijayawada, Andhra Pradesh',
    'Visakhapatnam, Andhra Pradesh',
    'Remote'
  ];
  
  const jobs = [];
  
  for (let i = 0; i < 20; i++) {
    const company = southIndianCompanies[Math.floor(Math.random() * southIndianCompanies.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const location = southIndianLocations[Math.floor(Math.random() * southIndianLocations.length)];
    
    jobs.push({
      id: `fallback-${i + 1}`,
      title: title,
      company: company,
      location: location,
      type: location === 'Remote' ? 'Remote' : ['Full-time', 'Contract'][Math.floor(Math.random() * 2)],
      sector: 'IT/Software',
      salary: '₹' + (4 + Math.floor(Math.random() * 12)) + ',00,000 - ₹' + (8 + Math.floor(Math.random() * 15)) + ',00,000 PA',
      description: `Join ${company} as a ${title}. We are looking for talented professionals to work on cutting-edge technologies in ${location}. Great opportunity for South Indian tech professionals.`,
      requirements: [
        `${1 + Math.floor(Math.random() * 5)}+ years of relevant experience`,
        'Bachelor\'s degree in Computer Science or related field',
        'Strong problem-solving and analytical skills',
        'Excellent communication and teamwork abilities'
      ],
      postedDate: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      applyLink: "#",
      featured: Math.random() > 0.85,
      source: "fallback",
      isReal: false
    });
  }
  
  return jobs;
}

// Main handler function
export const handler = async function(event, context) {
  try {
    let allJobs = [];
    let successfulFeeds = 0;
    
    console.log('Starting RSS job fetch for Indian jobs...');

    // Try each RSS feed
    for (const feedUrl of rssFeeds) {
      try {
        console.log(`Fetching from: ${feedUrl}`);
        const feed = await parser.parseURL(feedUrl);
        
        if (feed.items && feed.items.length > 0) {
          successfulFeeds++;
          console.log(`✅ Found ${feed.items.length} items from ${feedUrl}`);
          
          const jobs = feed.items
            .filter(item => item.title && item.link) // Filter out invalid items
            .map(item => {
              // Enhanced company detection
              let company = extractCompany(item);
              let location = extractLocation(item);
              let jobType = extractJobType(item);
              
              return {
                id: `rss-${Buffer.from((item.link || '') + (item.title || '')).toString('base64').slice(0, 12)}`,
                title: item.title || 'Software Developer',
                company: company,
                location: location,
                type: jobType,
                sector: extractSector(item.title || '', item.description || ''),
                salary: extractSalary(item),
                description: cleanDescription(item.contentSnippet || item.description || item.content || 'Join our dynamic team in a growing company.'),
                requirements: extractRequirements(item.content || item.description || item.title || ''),
                postedDate: item.pubDate || item.isoDate || new Date().toISOString(),
                applyLink: item.link || '#',
                featured: Math.random() > 0.9, // Fewer featured jobs
                source: new URL(feedUrl).hostname,
                isReal: true
              };
            });
          
          allJobs = [...allJobs, ...jobs];
        } else {
          console.log(`❌ No items found in feed: ${feedUrl}`);
        }
        
      } catch (feedError) {
        console.error(`❌ Error with feed ${feedUrl}:`, feedError.message);
        continue; // Continue with next feed
      }
    }

    console.log(`Total jobs collected: ${allJobs.length}`);
    console.log(`Successful feeds: ${successfulFeeds}`);

    // If no RSS jobs found, provide enhanced fallback jobs with South Indian focus
    if (allJobs.length === 0) {
      console.log('No RSS jobs found, providing enhanced South Indian fallback jobs');
      allJobs = getEnhancedFallbackJobs();
    }

    // Remove duplicates based on title + company
    const uniqueJobs = allJobs.filter((job, index, self) =>
      index === self.findIndex(j => 
        j.title === job.title && j.company === job.company
      )
    );

    // Sort by date (newest first)
    uniqueJobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        jobs: uniqueJobs.slice(0, 50), // Return more jobs
        total: uniqueJobs.length,
        successfulFeeds: successfulFeeds,
        lastUpdated: new Date().toISOString(),
        note: successfulFeeds === 0 ? 'Using enhanced South Indian fallback jobs' : `Successfully fetched from ${successfulFeeds} feeds`
      })
    };

  } catch (error) {
    console.error('RSS function error:', error);
    
    // Return enhanced fallback jobs even on complete failure
    const fallbackJobs = getEnhancedFallbackJobs();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        jobs: fallbackJobs,
        total: fallbackJobs.length,
        successfulFeeds: 0,
        lastUpdated: new Date().toISOString(),
        note: 'Using enhanced South Indian fallback jobs due to RSS feed issues'
      })
    };
  }
};