// netlify/functions/jobs-india.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { what, where, page = 1, results_per_page = 20 } = event.queryStringParameters;
  
  const APP_ID = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;
  
  // Use India-specific endpoint
  const baseUrl = 'https://api.adzuna.com/v1/api/jobs';
  const country = 'in'; // India country code
  
  let url = `${baseUrl}/${country}/search/${page}?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=${results_per_page}`;
  
  if (what) url += `&what=${encodeURIComponent(what)}`;
  if (where) url += `&where=${encodeURIComponent(where)}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch jobs' })
    };
  }
};