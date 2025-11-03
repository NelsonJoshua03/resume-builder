javascript:(function(){
  // CareerCraft Job Capture Bookmarklet
  var jobData = {
    title: document.title.replace(/ - [^-]*$/, '').replace(' hiring', '').replace(' Careers', ''),
    company: '',
    location: '',
    description: ''
  };
  
  // Try to extract company name from page
  var companySelectors = [
    '.company-name',
    '.employer',
    '[data-company-name]',
    '.org',
    '.organization'
  ];
  
  companySelectors.forEach(selector => {
    var element = document.querySelector(selector);
    if (element && !jobData.company) {
      jobData.company = element.textContent.trim();
    }
  });
  
  // Try to extract location
  var locationSelectors = [
    '.location',
    '[data-location]',
    '.job-location',
    '.locality'
  ];
  
  locationSelectors.forEach(selector => {
    var element = document.querySelector(selector);
    if (element && !jobData.location) {
      jobData.location = element.textContent.trim();
    }
  });
  
  // Try to extract description
  var descSelectors = [
    '.description',
    '.job-description',
    '[data-description]',
    '.summary'
  ];
  
  descSelectors.forEach(selector => {
    var element = document.querySelector(selector);
    if (element && !jobData.description) {
      jobData.description = element.textContent.trim().substring(0, 200) + '...';
    }
  });
  
  // Open prepopulated form with CareerCraft.in domain
  var formUrl = 'https://careercraft.in/admin/job-posting?' + 
    'title=' + encodeURIComponent(jobData.title) +
    '&company=' + encodeURIComponent(jobData.company) +
    '&location=' + encodeURIComponent(jobData.location) +
    '&description=' + encodeURIComponent(jobData.description);
  
  window.open(formUrl, '_blank');
})();