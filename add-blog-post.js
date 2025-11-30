// add-blog-post.js - Enhanced Blog Post Management with Delete Support (ES Modules)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlogManager {
  constructor() {
    this.blogDataPath = path.join(__dirname, 'public', 'blog-data.json');
    this.blogContentDir = path.join(__dirname, 'public', 'blog-content');
    this.blogImagesDir = path.join(__dirname, 'public', 'blog-images');
    this.ensureDirectories();
  }

  ensureDirectories() {
    // Create blog-content directory
    if (!fs.existsSync(this.blogContentDir)) {
      fs.mkdirSync(this.blogContentDir, { recursive: true });
      console.log('✅ Created blog-content directory');
    }
    
    // Create blog-images directory
    if (!fs.existsSync(this.blogImagesDir)) {
      fs.mkdirSync(this.blogImagesDir, { recursive: true });
      console.log('✅ Created blog-images directory');
    }
  }

  readBlogData() {
    try {
      const data = fs.readFileSync(this.blogDataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error reading blog-data.json:', error.message);
      return { posts: [] };
    }
  }

  writeBlogData(data) {
    try {
      fs.writeFileSync(this.blogDataPath, JSON.stringify(data, null, 2));
      console.log('✅ Updated blog-data.json');
      return true;
    } catch (error) {
      console.error('❌ Error writing blog-data.json:', error.message);
      return false;
    }
  }

  createMarkdownFile(slug, title, excerpt, category) {
    const markdownContent = this.generateMarkdownTemplate(title, excerpt, category, slug);
    const filePath = path.join(this.blogContentDir, `${slug}.md`);
    
    try {
      fs.writeFileSync(filePath, markdownContent);
      console.log(`✅ Created blog-content/${slug}.md`);
      return true;
    } catch (error) {
      console.error(`❌ Error creating ${slug}.md:`, error.message);
      return false;
    }
  }

  generateMarkdownTemplate(title, excerpt, category, slug) {
    const baseImageUrl = '/blog-images';

    const categoryTemplates = {
      'resume-tips': `# ${title}

## Introduction

${excerpt}

## Key Resume Writing Tips for Indian Job Market

### 1. Formatting Guidelines
- Use clean, professional fonts (Arial, Calibri, Times New Roman)
- Maintain consistent spacing and margins
- Keep resume to 1-2 pages maximum

### 2. Content Structure
- Start with a strong professional summary
- Highlight relevant skills for Indian companies
- Include quantifiable achievements

### 3. Indian Market Specifics
- Mention familiarity with Indian industry standards
- Include relevant Indian certifications
- Highlight experience with Indian companies if any

## Best Practices

- Customize for each job application
- Use keywords from job description
- Proofread multiple times for errors

## Conclusion

A well-crafted resume is your first step towards landing your dream job in India.`,

      'career-advice': `# ${title}

## Introduction

${excerpt}

## Career Development Strategies for Indian Professionals

### 1. Skill Development
- Identify in-demand skills in your industry
- Pursue relevant certifications and courses
- Stay updated with industry trends

### 2. Networking in India
- Build professional connections
- Attend industry events and meetups
- Leverage LinkedIn for networking

### 3. Career Growth
- Set clear career objectives
- Seek mentorship opportunities
- Plan your career path strategically

## Actionable Tips

- Update your skills regularly
- Build a strong online presence
- Seek feedback and continuously improve`,

      'industry-specific': `# ${title}

## Introduction

${excerpt}

## Industry Overview

### Current Market Trends in India
- Growing demand for skilled professionals
- Emerging technologies and methodologies
- Changing hiring practices

### Required Skills and Qualifications
- Technical skills specific to the industry
- Soft skills and interpersonal abilities
- Relevant certifications and training

### Career Opportunities
- Entry-level positions and requirements
- Mid-career advancement opportunities
- Senior roles and leadership positions

## Preparation Guide

- Build relevant project portfolio
- Network with industry professionals
- Prepare for industry-specific interviews`,

      'ats-optimization': `# ${title}

## Introduction

${excerpt}

## Understanding ATS for Indian Companies

### How ATS Works
- Keyword scanning and matching
- Format compatibility checks
- Content relevance assessment

### Optimization Strategies
- Use standard section headings
- Incorporate relevant keywords
- Maintain clean formatting

### Common ATS Pitfalls to Avoid
- Complex layouts and tables
- Graphics and images
- Uncommon file formats

## ATS Checklist

- Use standard headings (Work Experience, Education, Skills)
- Include industry-specific keywords
- Save in ATS-friendly format (PDF/DOCX)
- Keep design simple and clean`,

      'fresh-graduate': `# ${title}

## Introduction

${excerpt}

## Guide for Fresh Graduates in India

### Building Your First Resume
- Highlight academic achievements
- Showcase projects and internships
- Emphasize learning and growth potential

### Skill Development for Freshers
- Technical skills relevant to your field
- Soft skills and communication abilities
- Tools and software proficiency

### Job Search Strategy
- Where to find entry-level positions
- How to approach campus placements
- Networking tips for freshers

## Success Tips

- Focus on learning and growth
- Be open to entry-level opportunities
- Build a strong foundation for your career`
    };

    return categoryTemplates[category] || `# ${title}

## Introduction

${excerpt}

## Main Content

Start writing your blog post here...

## Key Points

- Point 1
- Point 2
- Point 3

## Conclusion

Wrap up your post with actionable advice for Indian job seekers.`;
  }

  addNewPost(slug, title, excerpt, category, readTime = '5 min read') {
    // Validate inputs
    if (!slug || !title || !excerpt || !category) {
      console.log('❌ Error: All fields (slug, title, excerpt, category) are required');
      return false;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      console.log('❌ Error: Slug must be lowercase with hyphens (e.g., "my-new-post")');
      return false;
    }

    // Read current blog data
    const blogData = this.readBlogData();
    
    // Check for duplicate slug
    if (blogData.posts.some(post => post.slug === slug)) {
      console.log(`❌ Error: A post with slug "${slug}" already exists`);
      return false;
    }

    // Create new post object
    const newPost = {
      id: Date.now(),
      slug: slug,
      title: title,
      excerpt: excerpt,
      category: category,
      date: new Date().toISOString().split('T')[0],
      readTime: readTime,
      author: 'CareerCraft Team',
      authorBio: 'Indian Career Experts with 10+ years HR experience',
      contentFile: `${slug}.md`
    };

    // Add to blog data
    blogData.posts.push(newPost);
    
    // Write updated blog data
    if (!this.writeBlogData(blogData)) {
      return false;
    }

    // Create markdown file
    if (!this.createMarkdownFile(slug, title, excerpt, category)) {
      return false;
    }

    // Success message
    console.log(`
🎉 BLOG POST CREATED SUCCESSFULLY! 🎉

📝 Post Details:
- Title: ${title}
- Slug: ${slug}
- Category: ${category}
- File: blog-content/${slug}.md
- URL: /blog/${slug}

📁 Files Created/Updated:
✅ public/blog-data.json
✅ public/blog-content/${slug}.md

🖼️ Image Guide:
You can add images to your blog post by:
1. Adding images to public/blog-images/ folder
2. Using this syntax in your markdown:
   ![Alt text](/blog-images/your-image.jpg)

🚀 Next Steps:
1. Review and edit public/blog-content/${slug}.md
2. Add images to public/blog-images/ if needed
3. Test locally: npm start
4. Commit changes: 
   git add public/blog-data.json public/blog-content/${slug}.md public/blog-images/
   git commit -m "Add blog post: ${title}"
5. Push to GitHub: git push origin main

🌐 After push, your post will be live at:
https://careercraft.in/blog/${slug}
    `);

    return true;
  }

  deletePost(slug) {
    // Read current blog data
    const blogData = this.readBlogData();
    
    // Find the post to delete
    const postIndex = blogData.posts.findIndex(post => post.slug === slug);
    
    if (postIndex === -1) {
      console.log(`❌ Error: No post found with slug "${slug}"`);
      return false;
    }

    const postToDelete = blogData.posts[postIndex];
    
    // Remove from blog data
    blogData.posts.splice(postIndex, 1);
    
    // Write updated blog data
    if (!this.writeBlogData(blogData)) {
      return false;
    }

    // Delete markdown file
    const markdownPath = path.join(this.blogContentDir, `${slug}.md`);
    if (fs.existsSync(markdownPath)) {
      try {
        fs.unlinkSync(markdownPath);
        console.log(`✅ Deleted blog-content/${slug}.md`);
      } catch (error) {
        console.log(`⚠️ Could not delete markdown file: ${error.message}`);
      }
    } else {
      console.log(`⚠️ Markdown file not found: blog-content/${slug}.md`);
    }

    console.log(`
🗑️ BLOG POST DELETED SUCCESSFULLY!

📝 Deleted Post:
- Title: ${postToDelete.title}
- Slug: ${slug}
- Category: ${postToDelete.category}

📁 Files Removed:
✅ Removed from public/blog-data.json
✅ Deleted public/blog-content/${slug}.md

💡 Note: If this post had images, remember to manually delete them from public/blog-images/
    `);

    return true;
  }

  listPosts() {
    const blogData = this.readBlogData();
    console.log('\n📚 CURRENT BLOG POSTS:');
    console.log('=====================');
    
    if (blogData.posts.length === 0) {
      console.log('No blog posts found.');
      return;
    }
    
    blogData.posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} (/${post.slug}) [${post.category}]`);
    });
    console.log(`\nTotal: ${blogData.posts.length} posts`);
  }

  showImageGuide() {
    console.log(`
🖼️ BLOG IMAGE GUIDE
===================

1. SUPPORTED IMAGE FORMATS:
   • JPG/JPEG - For photographs
   • PNG - For screenshots, graphics with transparency
   • WebP - Modern format (smaller file size)
   • SVG - For logos and icons

2. OPTIMAL IMAGE SIZES:
   • Cover images: 1200x630 pixels
   • Content images: 800x450 pixels
   • Thumbnails: 400x225 pixels

3. HOW TO ADD IMAGES:

   Step 1: Save your image in public/blog-images/
          Example: public/blog-images/my-feature-image.jpg

   Step 2: Reference it in your markdown:
          ![Alt text describing the image](/blog-images/my-feature-image.jpg)

4. BEST PRACTICES:
   • Compress images before uploading
   • Use descriptive file names
   • Include alt text for accessibility
   • Maintain consistent aspect ratios
   • Keep file sizes under 500KB

5. EXAMPLE MARKDOWN WITH IMAGES:

   # My Blog Post

   ![Cover Image](/blog-images/cover.jpg)

   ## Section 1

   This is some text with an inline image:

   ![Feature Screenshot](/blog-images/feature-screenshot.png)

   ## Section 2

   More content...
    `);
  }
}

// CLI interface
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
📖 LOCAL BLOG POST MANAGER
=========================

Usage:
node add-blog-post.js <command> [arguments]

Commands:
• add <slug> "<title>" "<excerpt>" <category> [readTime] - Add new post
• delete <slug> - Delete a post
• list - List all current posts
• images - Show image guide
• help - Show this help message

Categories:
• resume-tips       - Resume Writing Tips
• career-advice     - Career Advice
• industry-specific - Industry Specific Guides  
• ats-optimization  - ATS Optimization
• fresh-graduate    - Fresh Graduate Guide

Examples:
node add-blog-post.js add "indian-resume-tips" "Top Resume Tips for Indian Market" "Discover the best resume practices for Indian companies" "resume-tips"
node add-blog-post.js delete "test-post"
node add-blog-post.js list
node add-blog-post.js images
  `);
  process.exit(0);
}

const manager = new BlogManager();
const command = args[0];

if (command === 'add' && args.length >= 5) {
  const [_, slug, title, excerpt, category, readTime] = args;
  manager.addNewPost(slug, title, excerpt, category, readTime);
} else if (command === 'delete' && args.length >= 2) {
  const slug = args[1];
  manager.deletePost(slug);
} else if (command === 'list') {
  manager.listPosts();
} else if (command === 'images') {
  manager.showImageGuide();
} else if (command === 'help') {
  console.log('Run without arguments to see usage guide');
} else {
  console.log('❌ Invalid command. Run without arguments for help.');
  process.exit(1);
}

export default BlogManager;