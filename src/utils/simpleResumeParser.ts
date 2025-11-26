// src/utils/simpleResumeParser.ts

export interface ParsedResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string[];
  };
  experiences: Array<{
    id: number;
    title: string;
    company: string;
    period: string;
    description: string[];
  }>;
  education: Array<{
    id: number;
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  skills: Array<{
    name: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  }>;
  projects: Array<{
    id: number;
    name: string;
    description: string[];
    technologies: string[];
    period: string;
    link?: string;
  }>;
}

export class SimpleResumeParser {
  private text: string;
  private lines: string[];

  constructor(text?: string) {
    this.text = text || '';
    this.lines = [];
  }

  setText(text: string): void {
    this.text = text;
  }

  parse(): ParsedResumeData {
    try {
      if (!this.text) {
        return this.getDefaultData();
      }

      // Clean and split text
      const cleanText = this.text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\t/g, ' ')
        .replace(/[ ]+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .replace(/\n+/g, '\n')
        .trim();

      this.lines = cleanText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      console.log('Total lines:', this.lines.length);
      console.log('First 20 lines:', this.lines.slice(0, 20));

      return {
        personalInfo: this.parsePersonalInfo(),
        experiences: this.parseExperiences(),
        education: this.parseEducation(),
        skills: this.parseSkills(),
        projects: this.parseProjects()
      };
    } catch (error) {
      console.error('Parser error:', error);
      return this.getDefaultData();
    }
  }

  private parsePersonalInfo(): any {
    const info = {
      name: '',
      title: '',
      email: '',
      phone: '',
      summary: [] as string[]
    };

    // IMPROVED NAME EXTRACTION - Look for name patterns in first few lines
    for (let i = 0; i < Math.min(5, this.lines.length); i++) {
      const line = this.lines[i];
      
      // Check if this looks like a name line (contains name and possibly title)
      if (this.looksLikeNameLine(line)) {
        // Extract name (part before comma if exists)
        const namePart = line.split(',')[0].trim();
        if (this.looksLikeName(namePart)) {
          info.name = namePart;
          console.log('Found name:', info.name);
        }
        
        // Extract title from the same line if available
        if (line.includes(',')) {
          const titlePart = line.split(',').slice(1).join(',').trim();
          if (titlePart && this.looksLikeJobTitle(titlePart)) {
            info.title = titlePart;
            console.log('Found title from name line:', info.title);
          }
        }
        break;
      }
    }

    // Extract email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    for (const line of this.lines) {
      const match = line.match(emailRegex);
      if (match) {
        info.email = match[0].toLowerCase();
        console.log('Found email:', info.email);
        break;
      }
    }

    // Extract phone
    const phoneRegex = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3,4}[\s.-]?\d{4}/g;
    for (const line of this.lines) {
      const match = line.match(phoneRegex);
      if (match) {
        info.phone = match[0].trim();
        console.log('Found phone:', info.phone);
        break;
      }
    }

    // Extract title from experience section if not found
    if (!info.title) {
      const experiences = this.parseExperiences();
      if (experiences.length > 0 && experiences[0].title) {
        info.title = experiences[0].title;
        console.log('Found title from experience:', info.title);
      }
    }

    // Extract summary from profile section
    let inSummary = false;
    let summaryLines: string[] = [];

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const normalizedLine = this.normalizeSpacedText(line);
      const lower = normalizedLine.toLowerCase();
      
      if ((lower.includes('profile') || lower.includes('summary') || 
          lower.includes('objective')) && this.looksLikeSectionHeader(line)) {
        inSummary = true;
        // Skip the header line
        continue;
      }
      
      if (inSummary) {
        // Stop if we hit another major section
        if (this.looksLikeSectionHeader(line) && 
            !lower.includes('profile') && !lower.includes('summary') && 
            !lower.includes('objective')) {
          break;
        }
        
        if (line.length > 20 && !this.looksLikeSectionHeader(line) && 
            !this.isBulletPoint(line) && !this.looksLikeDate(line)) {
          summaryLines.push(line);
        }
        
        if (summaryLines.length >= 3) break;
      }
    }

    info.summary = summaryLines.length > 0 ? summaryLines : ['Professional with diverse experience.'];
    console.log('Summary lines found:', summaryLines.length);

    return info;
  }

  private parseExperiences(): any[] {
    const experiences: any[] = [];
    let inExperienceSection = false;
    let currentExp: any = null;
    let currentBullets: string[] = [];
    let collectingBullets = false;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const normalizedLine = this.normalizeSpacedText(line);
      const lower = normalizedLine.toLowerCase();

      // Look for experience section header (with spaced text normalization)
      if ((lower.includes('employment') || lower.includes('work experience') || 
           lower.includes('experience')) && this.looksLikeSectionHeader(line)) {
        inExperienceSection = true;
        console.log('Found EXPERIENCE section:', line);
        continue;
      }

      if (inExperienceSection) {
        // Check if we've moved to another major section
        const nextNormalized = this.normalizeSpacedText(line);
        const nextLower = nextNormalized.toLowerCase();
        if (this.looksLikeSectionHeader(line) && 
            (nextLower.includes('education') || nextLower.includes('project') || 
             nextLower.includes('skill') || nextLower.includes('certification') ||
             nextLower.includes('award'))) {
          // Save current experience before breaking
          if (currentExp && (currentBullets.length > 0 || currentExp.title)) {
            currentExp.description = [...currentBullets];
            experiences.push(currentExp);
          }
          break;
        }

        // IMPROVED: Look for date patterns that indicate a new experience entry
        const dateMatch = this.extractDatePeriod(line);
        if (dateMatch && !this.isBulletPoint(line) && line.length > 10) {
          // Save previous experience if exists
          if (currentExp && (currentBullets.length > 0 || currentExp.title)) {
            currentExp.description = [...currentBullets];
            experiences.push(currentExp);
            currentBullets = [];
          }

          // Extract company and title from current line after date
          const remainingText = line.replace(dateMatch, '').trim();
          let company = '';
          let title = '';

          if (remainingText) {
            // Try to extract title and company
            const titleMatch = this.extractJobTitle(remainingText);
            if (titleMatch) {
              title = titleMatch;
              company = remainingText.replace(titleMatch, '').replace(/,/g, '').trim();
            } else {
              // If no clear title, assume the whole thing is company and extract title from it
              company = remainingText;
              title = this.extractTitleFromText(remainingText) || 'Professional';
            }
          }

          // If we have a title but no company, look for company in next line
          if (title && !company && i + 1 < this.lines.length) {
            const nextLine = this.lines[i + 1];
            if (!this.looksLikeDate(nextLine) && !this.isBulletPoint(nextLine) && 
                !this.looksLikeSectionHeader(nextLine) && nextLine.length > 2) {
              company = nextLine;
              i++; // Skip company line
            }
          }

          currentExp = {
            id: Date.now() + experiences.length,
            title: title.trim(),
            company: company.trim(),
            period: dateMatch,
            description: []
          };
          collectingBullets = true;
          console.log('Found experience:', { title, company, period: dateMatch });
          continue;
        }

        // Collect bullet points for current experience
        if (currentExp && collectingBullets) {
          if (this.isBulletPoint(line)) {
            const cleanBullet = this.cleanBulletPoint(line);
            if (cleanBullet.length > 5) {
              currentBullets.push(cleanBullet);
            }
          } else if (line.length > 0 && !this.looksLikeSectionHeader(line) && 
                     !this.looksLikeDate(line) && line.length > 20) {
            // Also collect longer descriptive lines that might be part of job description
            // But avoid adding duplicate company names or locations
            if (!line.includes(currentExp.company) && !this.looksLikeLocation(line)) {
              currentBullets.push(line);
            }
          }
        }

        // Stop collecting if we hit a new date pattern (new experience)
        if (collectingBullets && this.extractDatePeriod(line) && currentExp && 
            !this.isBulletPoint(line) && line.length > 10) {
          currentExp.description = [...currentBullets];
          experiences.push(currentExp);
          currentBullets = [];
          collectingBullets = false;
          
          // Process this line as new experience
          const dateMatch = this.extractDatePeriod(line);
          const remainingText = line.replace(dateMatch, '').trim();
          let company = '';
          let title = '';

          if (remainingText) {
            const titleMatch = this.extractJobTitle(remainingText);
            if (titleMatch) {
              title = titleMatch;
              company = remainingText.replace(titleMatch, '').replace(/,/g, '').trim();
            } else {
              company = remainingText;
              title = this.extractTitleFromText(remainingText) || 'Professional';
            }
          }

          currentExp = {
            id: Date.now() + experiences.length,
            title: title.trim(),
            company: company.trim(),
            period: dateMatch,
            description: []
          };
          collectingBullets = true;
        }
      }
    }

    // Add the last experience if exists
    if (currentExp && (currentBullets.length > 0 || currentExp.title)) {
      currentExp.description = currentBullets.length > 0 ? [...currentBullets] : ['Responsibilities included various professional duties.'];
      experiences.push(currentExp);
    }

    console.log('Total experiences found:', experiences.length);
    return experiences.length > 0 ? experiences : this.getDefaultExperiences();
  }

  private parseEducation(): any[] {
    const education: any[] = [];
    let inEducationSection = false;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const normalizedLine = this.normalizeSpacedText(line);
      const lower = normalizedLine.toLowerCase();

      // Check for education section header (with spaced text normalization)
      if (lower.includes('education') && this.looksLikeSectionHeader(line)) {
        inEducationSection = true;
        console.log('Found EDUCATION section:', line);
        continue;
      }

      if (inEducationSection) {
        // Check if we've moved to another section
        if (this.looksLikeSectionHeader(line) && !lower.includes('education')) {
          break;
        }

        // Look for education entries with dates
        const dateMatch = this.extractDatePeriod(line);
        if (dateMatch) {
          const remainingText = line.replace(dateMatch, '').trim();
          if (remainingText.length > 5) {
            let degree = '';
            let institution = '';
            
            // Check if remaining text contains degree and institution
            if (remainingText.includes(',')) {
              const parts = remainingText.split(',');
              degree = parts[0].trim();
              institution = parts.slice(1).join(',').trim();
            } else {
              // Try to determine if it's degree or institution
              if (this.looksLikeDegree(remainingText)) {
                degree = remainingText;
                // Look for institution in next line
                if (i + 1 < this.lines.length) {
                  const nextLine = this.lines[i + 1];
                  if (!this.looksLikeDate(nextLine) && !this.isBulletPoint(nextLine) && 
                      !this.looksLikeSectionHeader(nextLine) && nextLine.length > 2) {
                    institution = nextLine;
                    i++; // Skip institution line
                  }
                }
              } else {
                institution = remainingText;
              }
            }

            education.push({
              id: Date.now() + education.length,
              institution: institution || 'Not specified',
              degree: degree || 'Not specified',
              year: this.extractYearFromDate(dateMatch) || '',
              gpa: ''
            });
          }
        } else if (this.looksLikeEducationEntry(line) && line.length > 10) {
          // Education entry without explicit date
          education.push({
            id: Date.now() + education.length,
            institution: line,
            degree: 'Not specified',
            year: '',
            gpa: ''
          });
        }
      }
    }

    console.log('Total education entries:', education.length);
    // Filter out invalid entries
    const validEducation = education.filter(edu => 
      edu.institution !== 'Not specified' || edu.degree !== 'Not specified'
    );
    return validEducation.length > 0 ? validEducation : this.getDefaultEducation();
  }

  private parseSkills(): any[] {
    const skills: any[] = [];
    let inSkillsSection = false;
    let skillsText = '';

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const normalizedLine = this.normalizeSpacedText(line);
      const lower = normalizedLine.toLowerCase();

      // Check for skills section header (with spaced text normalization)
      if (lower.includes('skills') && this.looksLikeSectionHeader(line)) {
        inSkillsSection = true;
        console.log('Found SKILLS section:', line);
        continue;
      }

      if (inSkillsSection) {
        if (this.looksLikeSectionHeader(line) && !lower.includes('skill')) {
          break;
        }

        // Collect all skills text
        if (line.length > 0 && !this.looksLikeSectionHeader(line)) {
          skillsText += ' ' + line;
        }
      }
    }

    // IMPROVED: Extract skills from the collected text
    if (skillsText) {
      // Common skill patterns for different professions
      const commonSkills = [
        // UX/Design skills
        'HTML5', 'CSS', 'JavaScript', 'Adobe Photoshop', 'Illustrator', 'Sketch', 
        'InVision', 'Balsamiq', 'Figma', 'Adobe XD', 'Prototyping', 'Wireframing',
        'User Research', 'Usability Testing', 'User Interface', 'User Experience',
        'Interaction Design', 'Visual Design', 'Information Architecture',
        
        // General technical skills
        'React', 'Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'AWS', 'Azure',
        'Git', 'Docker', 'Kubernetes', 'REST API', 'GraphQL',
        
        // Soft skills
        'Time Management', 'Communication', 'Teamwork', 'Problem Solving',
        'Leadership', 'Project Management', 'Agile', 'Scrum'
      ];

      // Split by common delimiters
      const skillCandidates = skillsText.split(/[•,\-·•·\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 2 && s.length < 50);

      skillCandidates.forEach(skill => {
        // Check against common skills list
        const matchedSkill = commonSkills.find(commonSkill => 
          skill.toLowerCase().includes(commonSkill.toLowerCase())
        );

        if (matchedSkill && !skills.some(s => s.name.toLowerCase() === matchedSkill.toLowerCase())) {
          skills.push({
            name: matchedSkill,
            proficiency: this.determineProficiency(skill)
          });
        } else if (this.looksLikeTechnicalSkill(skill) && 
                   !skills.some(s => s.name.toLowerCase() === skill.toLowerCase())) {
          // Add if it looks like a technical skill
          skills.push({
            name: skill,
            proficiency: this.determineProficiency(skill)
          });
        }
      });

      // Also extract skills from profile/summary sections if few skills found
      if (skills.length < 3) {
        const profileText = this.lines.join(' ').toLowerCase();
        commonSkills.forEach(skill => {
          if (profileText.includes(skill.toLowerCase()) && 
              !skills.some(s => s.name.toLowerCase() === skill.toLowerCase())) {
            skills.push({
              name: skill,
              proficiency: 'Intermediate'
            });
          }
        });
      }
    }

    console.log('Total skills found:', skills.length);
    return skills.slice(0, 15); // Limit to 15 skills
  }

  private parseProjects(): any[] {
    const projects: any[] = [];
    let inProjectsSection = false;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const normalizedLine = this.normalizeSpacedText(line);
      const lower = normalizedLine.toLowerCase();

      if (lower.includes('projects') && this.looksLikeSectionHeader(line)) {
        inProjectsSection = true;
        continue;
      }

      if (inProjectsSection) {
        if (this.looksLikeSectionHeader(line) && !lower.includes('project')) {
          break;
        }

        // Look for project-like entries (usually have some structure)
        if (line.length > 10 && !this.looksLikeDate(line) && 
            !this.isBulletPoint(line) && !line.toLowerCase().includes('•')) {
          projects.push({
            id: Date.now() + projects.length,
            name: line,
            description: ['Project details from resume'],
            technologies: [],
            period: '',
            link: ''
          });
        }
      }
    }

    console.log('Total projects found:', projects.length);
    return projects;
  }

  // NEW METHOD: Normalize spaced-out text (e.g., "P R O F I L E" -> "PROFILE")
  private normalizeSpacedText(text: string): string {
    // If text has spaces between most letters and is relatively short, try to join them
    const words = text.split(/\s+/);
    if (words.length > 3 && text.length < 100) {
      // Check if this might be a spaced-out word (most words are 1-2 characters)
      const singleCharWords = words.filter(word => word.length === 1).length;
      if (singleCharWords > words.length * 0.6) {
        // It's likely a spaced-out word, join without spaces
        return words.join('');
      }
    }
    return text;
  }

  // NEW METHOD: Check if line looks like a name line
  private looksLikeNameLine(text: string): boolean {
    const cleanText = text.split(',')[0].trim();
    return this.looksLikeName(cleanText) && text.length < 100;
  }

  // IMPROVED HELPER METHODS

  private looksLikeName(text: string): boolean {
    // Name pattern: 2-4 words, title case or all caps, no special chars except spaces, periods, and commas
    const nameRegex = /^[A-Z][a-z]+(\s+[A-Z][a-z]*\.?)*(\s+[A-Z][a-z]+)$|^[A-Z\s]{2,}$/;
    const words = text.split(/\s+/);
    
    return (nameRegex.test(text) || (text === text.toUpperCase() && words.length >= 2 && words.length <= 4)) &&
           text.length < 50 && !this.hasEmail(text) && !this.hasPhone(text);
  }

  private extractJobTitle(text: string): string {
    const titlePatterns = [
      /(UX Designer|UI Designer|Developer|Engineer|Manager|Analyst|Specialist|Coordinator|Director|Consultant|Architect|Designer)/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    return '';
  }

  private looksLikeLocation(text: string): boolean {
    const locationWords = ['new york', 'london', 'san francisco', 'chicago', 'boston', 'austin', 'seattle'];
    const lower = text.toLowerCase();
    return locationWords.some(word => lower.includes(word)) || 
           /[A-Z][a-z]+,\s*[A-Z]{2}/.test(text); // City, ST format
  }

  private looksLikeEducationEntry(line: string): boolean {
    const eduWords = ['university', 'college', 'school', 'institute', 'academy', 'technology'];
    const lower = line.toLowerCase();
    return eduWords.some(word => lower.includes(word)) || 
           line.length > 10 && line.length < 80;
  }

  private looksLikeTechnicalSkill(skill: string): boolean {
    const techWords = ['html', 'css', 'javascript', 'python', 'java', 'sql', 'photoshop', 'illustrator', 'sketch'];
    const lower = skill.toLowerCase();
    return techWords.some(word => lower.includes(word)) || 
           skill.length > 3 && skill.length < 30;
  }

  private determineProficiency(skill: string): 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' {
    const lowerSkill = skill.toLowerCase();
    if (lowerSkill.includes('expert') || lowerSkill.includes('advanced')) return 'Advanced';
    if (lowerSkill.includes('intermediate')) return 'Intermediate';
    if (lowerSkill.includes('beginner') || lowerSkill.includes('basic')) return 'Beginner';
    
    // Default based on common patterns
    if (lowerSkill.includes('html') || lowerSkill.includes('css') || lowerSkill.includes('javascript')) {
      return 'Intermediate';
    }
    
    return 'Intermediate';
  }

  private extractDatePeriod(text: string): string {
    // Enhanced date patterns with em dash support
    const datePatterns = [
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\s*[—–\-]\s*(present|current|now|today|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}/gi,
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\s*[—–\-]\s*(present|current|now|today|\d{4})/gi,
      /\d{4}\s*[—–\-]\s*(present|current|now|today|\d{4})/gi,
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/gi,
      /\d{1,2}\/\d{4}\s*[—–\-]\s*(present|current|now|today|\d{1,2}\/\d{4})/gi
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    return '';
  }

  private extractYearFromDate(dateString: string): string {
    const yearMatch = dateString.match(/\d{4}/g);
    return yearMatch ? yearMatch[0] : '';
  }

  private looksLikeYear(text: string): boolean {
    return /^(19|20)\d{2}$/.test(text.trim());
  }

  private looksLikePercentage(text: string): boolean {
    return /\d+%/.test(text) || /\d+(\.\d+)?\/\d+/.test(text);
  }

  private looksLikeDegree(text: string): boolean {
    const degreeWords = ['bachelor', 'master', 'phd', 'diploma', 'degree', 'engineering', 'class x', 'class xii', 'mechanical', 'computer', 'science', 'human computer', 'interaction design'];
    const lower = text.toLowerCase();
    return degreeWords.some(word => lower.includes(word)) || text.length > 5 && text.length < 50;
  }

  private looksLikeSectionHeader(line: string): boolean {
    const normalizedLine = this.normalizeSpacedText(line);
    const upper = normalizedLine.toUpperCase();
    const isAllCaps = upper === normalizedLine && normalizedLine.length < 50 && normalizedLine.length > 3;
    const hasColon = normalizedLine.endsWith(':') && normalizedLine.length < 50;
    
    const lower = normalizedLine.toLowerCase();
    const sectionHeaders = [
      'profile', 'summary', 'career objective', 'professional summary', 'objective',
      'employment history', 'work experience', 'experience', 'employment',
      'education', 'academic background',
      'skills', 'technical skills', 'core competencies', 'professional skills',
      'projects', 'achievements', 'certifications', 'awards',
      'personal profile', 'declaration', 'links'
    ];
    
    const isSectionHeader = sectionHeaders.some(header => lower.includes(header));
    
    return isAllCaps || hasColon || isSectionHeader;
  }

  private isBulletPoint(line: string): boolean {
    return line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || 
           /^\d+\./.test(line) || line.startsWith('°') || line.startsWith('·');
  }

  private cleanBulletPoint(line: string): string {
    return line.replace(/^[•\-*°·\s\d\.]+/, '').trim();
  }

  private hasEmail(text: string): boolean {
    return /@/.test(text);
  }

  private hasPhone(text: string): boolean {
    return /\d{10,}/.test(text.replace(/\D/g, ''));
  }

  private looksLikeJobTitle(line: string): boolean {
    const titleWords = [
      'developer', 'engineer', 'manager', 'analyst', 'specialist', 'coordinator', 
      'director', 'consultant', 'architect', 'designer', 'administrator', 'controller',
      'technician', 'officer', 'associate', 'executive'
    ];
    const lower = line.toLowerCase();
    return titleWords.some(word => lower.includes(word)) && line.length < 100;
  }

  private looksLikeDate(line: string): boolean {
    return this.extractDatePeriod(line) !== '';
  }

  private extractTitleFromText(text: string): string {
    const titleKeywords = [
      'developer', 'engineer', 'manager', 'analyst', 'specialist', 'coordinator', 
      'director', 'consultant', 'architect', 'designer', 'administrator', 'controller',
      'technician', 'officer'
    ];
    
    const words = text.split(/\s+/);
    for (const word of words) {
      const lowerWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (titleKeywords.some(keyword => lowerWord.includes(keyword))) {
        // Return the relevant part of text containing the title
        const titleMatch = text.match(new RegExp(`\\b\\w*${lowerWord}\\w*\\b`, 'i'));
        return titleMatch ? titleMatch[0] : text;
      }
    }
    
    return '';
  }

  private getDefaultData(): ParsedResumeData {
    return {
      personalInfo: { 
        name: '', 
        title: '', 
        email: '', 
        phone: '', 
        summary: [''] 
      },
      experiences: this.getDefaultExperiences(),
      education: this.getDefaultEducation(),
      skills: this.getDefaultSkills(),
      projects: []
    };
  }

  private getDefaultExperiences() {
    return [{ 
      id: Date.now(), 
      title: '', 
      company: '', 
      period: '', 
      description: [''] 
    }];
  }

  private getDefaultEducation() {
    return [{ 
      id: Date.now(), 
      degree: '', 
      institution: '', 
      year: '', 
      gpa: '' 
    }];
  }

  private getDefaultSkills() {
    return [{ name: '', proficiency: 'Intermediate' as const }];
  }
}

// The rest of the file remains the same...
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

function loadPDFJSFromCDN(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      console.log('✅ PDF.js already loaded');
      resolve(window.pdfjsLib);
      return;
    }

    const PDFJS_VERSION = '3.11.174';
    const scriptId = 'pdfjs-lib-script';
    
    if (document.getElementById(scriptId)) {
      const checkInterval = setInterval(() => {
        if (window.pdfjsLib) {
          clearInterval(checkInterval);
          resolve(window.pdfjsLib);
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        if (window.pdfjsLib) {
          resolve(window.pdfjsLib);
        } else {
          reject(new Error('PDF.js script loaded but library not available'));
        }
      }, 5000);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
    script.async = true;

    script.onload = () => {
      console.log('✅ PDF.js script loaded from CDN');
      
      const checkInterval = setInterval(() => {
        if (window.pdfjsLib) {
          clearInterval(checkInterval);
          
          const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
          console.log('✅ Worker configured');
          
          resolve(window.pdfjsLib);
        }
      }, 50);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (window.pdfjsLib) {
          resolve(window.pdfjsLib);
        } else {
          reject(new Error('PDF.js loaded but pdfjsLib not available'));
        }
      }, 5000);
    };

    script.onerror = () => {
      reject(new Error('Failed to load PDF.js from CDN'));
    };

    document.head.appendChild(script);
    console.log('📦 Loading PDF.js from CDN...');
  });
}

export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise(async (resolve) => {
    try {
      console.log('=== FILE UPLOAD STARTED ===');
      console.log('File name:', file.name);
      console.log('File type:', file.type);
      console.log('File size:', file.size, 'bytes');
      
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          console.log('🔵 Attempting PDF extraction...');
          
          const pdfjsLib = await loadPDFJSFromCDN();
          console.log('✅ PDF.js library ready');
          
          const text = await extractPDFText(pdfjsLib, file);
          
          if (text && text.length > 0) {
            console.log('✅ PDF extracted successfully');
            resolve(text);
            return;
          }
          
          console.log('⚠️ No text found in PDF');
          resolve('MANUAL_INPUT_REQUIRED');
          
        } catch (error) {
          console.error('❌ PDF extraction failed:', error);
          resolve('MANUAL_INPUT_REQUIRED');
        }
      }
      else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        console.log('📄 Processing text file...');
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          console.log('✅ Text file extracted, length:', text.length);
          resolve(text);
        };
        reader.onerror = (error) => {
          console.error('❌ Text file read error:', error);
          resolve('UNSUPPORTED_FILE_TYPE');
        };
        reader.readAsText(file);
      }
      else if (file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')) {
        console.log('📝 DOC/DOCX file detected - manual input required');
        resolve('MANUAL_INPUT_REQUIRED');
      }
      else {
        console.log('❌ Unsupported file type:', file.type);
        resolve('UNSUPPORTED_FILE_TYPE');
      }
    } catch (error) {
      console.error('❌ File extraction error:', error);
      resolve('UNSUPPORTED_FILE_TYPE');
    }
  });
}

async function extractPDFText(pdfjsLib: any, file: File): Promise<string> {
  console.log('🔄 Converting file to ArrayBuffer...');
  const arrayBuffer = await file.arrayBuffer();
  console.log('✅ ArrayBuffer created, size:', arrayBuffer.byteLength, 'bytes');
  
  if (arrayBuffer.byteLength === 0) {
    throw new Error('File is empty');
  }
  
  const uint8Array = new Uint8Array(arrayBuffer);
  
  console.log('📖 Loading PDF document...');
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    verbosity: 0,
  });
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('PDF loading timeout')), 30000);
  });
  
  const pdf = await Promise.race([
    loadingTask.promise,
    timeoutPromise
  ]);
  
  console.log('✅ PDF loaded successfully!');
  console.log('📄 Total pages:', pdf.numPages);
  
  if (!pdf.numPages || pdf.numPages === 0) {
    throw new Error('PDF has no pages');
  }
  
  let fullText = '';
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    try {
      console.log(`📄 Processing page ${pageNum}/${pdf.numPages}...`);
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      console.log(`   Found ${textContent.items.length} text items`);
      
      // Group text items by line (y-coordinate)
      const lines: { [key: number]: string[] } = {};
      
      textContent.items.forEach((item: any) => {
        if (item.str && typeof item.str === 'string') {
          const text = item.str.trim();
          if (text.length > 0) {
            // Use the y-coordinate to group items on the same line
            const y = Math.round(item.transform[5]); // y-coordinate from transform matrix
            
            if (!lines[y]) {
              lines[y] = [];
            }
            
            // Add text to the appropriate line
            lines[y].push(text);
          }
        }
      });
      
      // Sort lines by y-coordinate (top to bottom) and join each line
      const sortedYs = Object.keys(lines)
        .map(Number)
        .sort((a, b) => b - a); // PDF coordinates: higher y = top of page
      
      const pageLines: string[] = [];
      
      sortedYs.forEach(y => {
        const lineText = lines[y].join(' ').trim();
        if (lineText.length > 0) {
          pageLines.push(lineText);
        }
      });
      
      const pageText = pageLines.join('\n');
      console.log(`   Extracted ${pageText.length} characters in ${pageLines.length} lines`);
      
      if (pageText.length > 0) {
        fullText += pageText + '\n\n';
      }
      
    } catch (pageError) {
      console.error(`⚠️ Error processing page ${pageNum}:`, pageError);
    }
  }
  
  const finalText = fullText.trim();
  
  console.log('=== EXTRACTION COMPLETE ===');
  console.log('Total characters:', finalText.length);
  console.log('Total lines:', finalText.split('\n').length);
  console.log('Preview (first 500 chars):', finalText.substring(0, 500));
  console.log('First 10 lines:', finalText.split('\n').slice(0, 10));
  console.log('==========================');
  
  if (finalText.length === 0) {
    throw new Error('No text content found in PDF');
  }
  
  return finalText;
}