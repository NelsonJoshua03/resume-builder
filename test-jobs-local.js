// test-jobs-local.js
import { handler } from './netlify/functions/jobs-rss.js';

async function testLocal() {
  console.log('Testing jobs function locally...');
  
  const result = await handler({}, {});
  
  console.log('\n=== FUNCTION RESULT ===');
  console.log('Status:', result.statusCode);
  console.log('Jobs found:', JSON.parse(result.body).total);
  console.log('Sources:', JSON.parse(result.body).successfulSources);
  
  // Display first few jobs
  const jobs = JSON.parse(result.body).jobs;
  console.log('\n=== SAMPLE JOBS ===');
  jobs.slice(0, 3).forEach((job, index) => {
    console.log(`\n${index + 1}. ${job.title}`);
    console.log(`   Company: ${job.company}`);
    console.log(`   Location: ${job.location}`);
    console.log(`   Source: ${job.source}`);
    console.log(`   Link: ${job.applyLink}`);
  });
}

testLocal().catch(console.error);