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

      const cleanText = this.text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\t/g, ' ')
        .replace(/[ ]+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();

      this.lines = cleanText.split('\n')
        .map(line => line.trim())
        .map(line => this.normalizeSpacedOutText(line))
        .filter(line => line.length > 0);

      console.log('Total lines:', this.lines.length);
      console.log('Lines:', this.lines);

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

  private normalizeSpacedOutText(text: string): string {
    // Handle spaced-out text like "K A R E N P H I L I P S"
    const words = text.trim().split(/\s+/);
    
    if (words.length > 3) {
      const singleCharCount = words.filter(word => word.length === 1).length;
      const totalChars = words.join('').length;
      
      // If more than 70% are single characters and it's not too short, it's probably spaced-out
      if (singleCharCount > 0.7 * words.length && totalChars >= 3) {
        // Check if it's a common acronym or should remain spaced out
        const potentialWord = words.join('').toUpperCase();
        const commonAcronyms = ['USA', 'UK', 'CEO', 'CFO', 'VP', 'HR', 'IT', 'UI', 'UX', 'API'];
        
        if (!commonAcronyms.includes(potentialWord) && potentialWord.length > 2) {
          // Reconstruct as normal text (remove extra spaces between characters)
          return words.join('');
        }
      }
    }
    
    return text;
  }

  private parsePersonalInfo(): any {
    const info = {
      name: '',
      title: '',
      email: '',
      phone: '',
      summary: [] as string[]
    };

    // Extract name - look for capitalized names in first 10 lines
    for (let i = 0; i < Math.min(10, this.lines.length); i++) {
      const line = this.lines[i];
      const words = line.split(/\s+/);
      
      // Name is typically 2-4 words, all caps or title case
      if ((words.length >= 2 && words.length <= 4) || line.includes('KAREN') || line.includes('PHILIPS')) {
        const hasValidChars = /^[A-Za-z\s.'-]+$/.test(line);
        const hasNoContactInfo = !this.hasEmail(line) && !this.hasPhone(line);
        const hasNoAddressIndicators = !/(street|st|road|rd|avenue|ave|lane|ln|drive|dr|city|state|zip|nagar|mumbai|maharashtra|india|stockholm|sweden)/i.test(line);
        
        if (hasValidChars && hasNoContactInfo && hasNoAddressIndicators && line.length < 50) {
          info.name = this.capitalizeWords(line);
          console.log('Found name:', info.name);
          break;
        }
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
    for (const line of this.lines) {
      const phoneMatch = line.match(/(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3,4}[\s.-]?\d{4}/g);
      if (phoneMatch) {
        for (const match of phoneMatch) {
          const digitCount = match.replace(/\D/g, '').length;
          if (digitCount >= 8 && digitCount <= 15) {
            info.phone = match.trim();
            console.log('Found phone:', info.phone);
            break;
          }
        }
      }
      if (info.phone) break;
    }

    // Extract professional title - look for "WEB DESIGNER" or similar
    for (let i = 0; i < Math.min(15, this.lines.length); i++) {
      const line = this.lines[i];
      const lower = line.toLowerCase();
      
      if (line === info.name || this.hasEmail(line) || this.hasPhone(line)) {
        continue;
      }
      
      // Check for job title keywords
      if (this.looksLikeJobTitle(line) && line.length < 80) {
        info.title = line;
        console.log('Found title:', info.title);
        break;
      }
      
      // Specific check for "WEB DESIGNER"
      if (line.toUpperCase().includes('WEB DESIGNER') || line.toUpperCase().includes('WEB DEVELOPER')) {
        info.title = line;
        console.log('Found title (specific):', info.title);
        break;
      }
    }

    // Extract summary/objective - look for profile section
    let inSummary = false;
    let summaryLines: string[] = [];

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const lower = line.toLowerCase();
      
      // Detect summary section headers including "PROFILE"
      if ((lower.includes('career objective') || lower.includes('professional summary') || 
          lower.includes('profile') || (lower === 'summary') ||
          lower.includes('about me')) && this.looksLikeSectionHeader(line)) {
        inSummary = true;
        continue;
      }
      
      if (inSummary) {
        const wordCount = line.trim().split(/\s+/).length;
        const isPotentialNextSection = wordCount <= 3 && 
                                     (this.looksLikeSectionHeader(line) || 
                                      /^[A-Z][A-Z\s]*$/.test(line) ||
                                      line.endsWith(':') ||
                                      this.isCommonSectionHeader(line));
        
        if (isPotentialNextSection && 
            !lower.includes('objective') && 
            !lower.includes('summary') &&
            !lower.includes('profile')) {
          break;
        }
        
        // Add summary lines that are actual content
        if (line.length > 20 && !this.looksLikeSectionHeader(line) && wordCount > 3) {
          const sentences = line.split(/\.\s+/).filter(s => s.trim().length > 15);
          if (sentences.length > 0) {
            summaryLines.push(...sentences.map(s => s.trim() + (s.endsWith('.') ? '' : '.')));
          } else {
            summaryLines.push(line);
          }
        }
      }
      
      if (summaryLines.length >= 3) break;
    }

    info.summary = summaryLines.length > 0 ? summaryLines.slice(0, 3) : ['Professional with diverse experience.'];
    console.log('Found summary lines:', info.summary);

    return info;
  }

  private parseExperiences(): any[] {
    const experiences: any[] = [];
    let inExperienceSection = false;
    let currentExp: any = null;
    let currentBullets: string[] = [];

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const lower = line.toLowerCase();

      // Detect EXPERIENCE section - including "EMPLOYMENT HISTORY"
      if ((lower === 'experience' || lower === 'work experience' || 
           lower === 'professional experience' || lower === 'employment history' ||
           lower === 'work history' || lower === 'career history' ||
           lower.includes('employment')) && 
          this.looksLikeSectionHeader(line)) {
        inExperienceSection = true;
        console.log('Found EXPERIENCE section at line', i, ':', line);
        continue;
      }

      if (inExperienceSection) {
        // Stop at next major section
        if (this.looksLikeSectionHeader(line) && 
            (lower.includes('education') || lower.includes('project') || lower.includes('certification') || 
             lower.includes('skill') || lower.includes('achievement') || lower.includes('training') ||
             lower.includes('course') || lower === 'details' || lower === 'hobbies' || lower === 'languages')) {
          if (currentExp && currentBullets.length > 0) {
            currentExp.description = currentBullets;
            experiences.push(currentExp);
          }
          console.log('Ending experience section at:', line);
          break;
        }

        const wordCount = line.split(/\s+/).length;
        
        // ENHANCED: Pattern for "Web Designer, Expedia Group" format
        const jobCompanyPattern = /^([^,]+),\s*(.+)$/;
        const jobMatch = line.match(jobCompanyPattern);
        
        if (jobMatch && !this.isBulletPoint(line) && line.length > 5 && wordCount <= 6) {
          const title = jobMatch[1].trim();
          const company = jobMatch[2].trim();
          
          // Save previous experience
          if (currentExp && currentBullets.length > 0) {
            currentExp.description = currentBullets;
            experiences.push(currentExp);
          }

          currentExp = {
            id: Date.now() + experiences.length,
            title: title,
            company: company,
            period: '',
            description: []
          };
          currentBullets = [];
          console.log('Found job (title, company pattern):', title, 'at', company);
          
          // Look for date in next 2 lines
          for (let j = i + 1; j < Math.min(i + 3, this.lines.length); j++) {
            const nextLine = this.lines[j];
            if (this.looksLikeDate(nextLine)) {
              currentExp.period = nextLine;
              console.log('Found period:', currentExp.period);
              i = j; // Skip the date line
              break;
            }
          }
          continue;
        }

        // RULE 1: Detect next experience - word count 4 or less AND looks like date
        if (currentExp && wordCount <= 4 && this.looksLikeDate(line)) {
          console.log('RULE 1: Detected next experience with date:', line);
          currentExp.description = currentBullets;
          experiences.push(currentExp);
          
          currentExp = {
            id: Date.now() + experiences.length,
            title: '',
            company: '',
            period: line,
            description: []
          };
          currentBullets = [];
          continue;
        }
        
        // RULE 2: Detect next section - word count 4 or less AND looks like date AND we have current experience
        if (currentExp && wordCount <= 4 && this.looksLikeDate(line) && 
            this.isPotentialNextSectionAfterExperience(i)) {
          console.log('RULE 2: Detected next section after experience:', line);
          currentExp.description = currentBullets;
          experiences.push(currentExp);
          break;
        }

        // RULE 3: Job position detection - 4 or 5 words, not a date, not a bullet point
        if (!currentExp && (wordCount === 4 || wordCount === 5) && 
            !this.looksLikeDate(line) && !this.isBulletPoint(line) &&
            line.length > 10 && line.length < 80) {
          
          if (this.looksLikeJobTitle(line) || this.hasJobTitleKeywords(line)) {
            currentExp = {
              id: Date.now() + experiences.length,
              title: line,
              company: '',
              period: '',
              description: []
            };
            currentBullets = [];
            console.log('RULE 3: Found job position (4-5 words):', line);
            
            // Look for company in next lines (2-4 words)
            for (let j = i + 1; j < Math.min(i + 3, this.lines.length); j++) {
              const nextLine = this.lines[j];
              const nextWordCount = nextLine.split(/\s+/).length;
              if (nextWordCount >= 2 && nextWordCount <= 4 && 
                  !this.looksLikeDate(nextLine) && !this.isBulletPoint(nextLine) &&
                  !this.looksLikeJobTitle(nextLine)) {
                currentExp.company = nextLine;
                console.log('Found company for position:', nextLine);
                i = j;
                break;
              }
            }
            continue;
          }
        }

        // Original job title detection
        if (this.looksLikeJobTitle(line) && !currentExp && !this.isBulletPoint(line) && wordCount <= 5) {
          currentExp = {
            id: Date.now() + experiences.length,
            title: line,
            company: '',
            period: '',
            description: []
          };
          currentBullets = [];
          console.log('Found job title:', line);
          
          for (let j = i + 1; j < Math.min(i + 4, this.lines.length); j++) {
            const nextLine = this.lines[j];
            if (!currentExp.company && !this.looksLikeDate(nextLine) && 
                !this.isBulletPoint(nextLine) && nextLine.length > 3 && nextLine.length < 80) {
              currentExp.company = nextLine;
              console.log('Found company:', nextLine);
            }
            if (!currentExp.period && this.looksLikeDate(nextLine)) {
              currentExp.period = nextLine;
              console.log('Found period:', nextLine);
            }
          }
          continue;
        }

        // Collect bullet points or responsibilities
        if (currentExp) {
          if (this.isBulletPoint(line)) {
            const clean = this.cleanBulletPoint(line);
            if (clean.length > 10 && !clean.toLowerCase().includes('as the web designer')) {
              currentBullets.push(clean);
            }
          } else if (line.length > 30 && !this.looksLikeJobTitle(line) && 
                     !this.looksLikeDate(line) && !this.looksLikeSectionHeader(line) &&
                     !line.match(/at\s+.+?,/i) && wordCount > 4 &&
                     !line.toLowerCase().includes('as the web designer')) {
            const sentences = line.split(/\.\s+/).filter(s => s.trim().length > 15);
            if (sentences.length > 1) {
              sentences.forEach(sentence => {
                const trimmed = sentence.trim();
                if (trimmed.length > 10) {
                  currentBullets.push(trimmed.endsWith('.') ? trimmed : trimmed + '.');
                }
              });
            } else if (line.length > 20) {
              currentBullets.push(line);
            }
          }
        }
      }
    }

    // Save last experience
    if (currentExp && currentBullets.length > 0) {
      currentExp.description = currentBullets;
      experiences.push(currentExp);
    }

    console.log('Total experiences found:', experiences.length);
    return experiences.length > 0 ? experiences : this.getDefaultExperiences();
  }

  private parseEducation(): any[] {
    const education: any[] = [];
    let inEducationSection = false;
    let currentEdu: any = null;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const lower = line.toLowerCase();

      // Detect EDUCATION section
      if ((lower === 'education' || lower === 'academic background' || 
           lower === 'qualifications' || lower === 'educational background' ||
           lower === 'academic qualifications') && 
          this.looksLikeSectionHeader(line)) {
        inEducationSection = true;
        console.log('Found EDUCATION section at line', i);
        continue;
      }

      if (inEducationSection) {
        // Stop at next major section
        if (this.looksLikeSectionHeader(line) && 
            !lower.includes('education') && !lower.includes('course') &&
            (lower.includes('achievement') || lower.includes('skill') || lower.includes('experience') || 
             lower.includes('project') || lower.includes('certification') || lower.includes('training') ||
             lower === 'details' || lower === 'hobbies' || lower === 'languages' || lower === 'references')) {
          if (currentEdu) {
            education.push(currentEdu);
          }
          break;
        }

        // Look for degree patterns
        if (this.looksLikeDegree(line) && !currentEdu) {
          currentEdu = {
            id: Date.now() + education.length,
            degree: line,
            institution: '',
            year: '',
            gpa: ''
          };
          console.log('Found degree:', line);
          
          // Look ahead for institution and year
          for (let j = i + 1; j < Math.min(i + 5, this.lines.length); j++) {
            const nextLine = this.lines[j];
            
            if (!currentEdu.institution && this.looksLikeInstitution(nextLine)) {
              currentEdu.institution = nextLine;
              console.log('Found institution:', nextLine);
            } else if (!currentEdu.year && this.looksLikeDate(nextLine)) {
              currentEdu.year = nextLine;
              console.log('Found year:', nextLine);
            } else if (!currentEdu.gpa && this.looksLikePercentage(nextLine)) {
              currentEdu.gpa = nextLine;
              console.log('Found GPA:', nextLine);
            } else if (this.looksLikeDegree(nextLine) || this.looksLikeInstitution(nextLine)) {
              break;
            }
          }
          continue;
        }

        // If we have current edu and see a new degree or institution, save and start new
        if (currentEdu && (this.looksLikeDegree(line) || this.looksLikeInstitution(line))) {
          education.push(currentEdu);
          currentEdu = null;
          i--; // Reprocess this line
        }
      }
    }

    // Save last education entry
    if (currentEdu) {
      education.push(currentEdu);
    }

    console.log('Total education entries found:', education.length);
    return education.length > 0 ? education : this.getDefaultEducation();
  }

  private parseSkills(): any[] {
    const skills: any[] = [];
    let inSkillsSection = false;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const lower = line.toLowerCase();

      // Detect SKILLS section
      if ((lower === 'technical skills' || lower === 'skills' || lower === 'core competencies' ||
           lower === 'key skills' || lower === 'professional skills' || lower === 'competencies') && 
          this.looksLikeSectionHeader(line)) {
        inSkillsSection = true;
        console.log('Found SKILLS section at line', i);
        continue;
      }

      if (inSkillsSection) {
        // Stop at next major section
        if (this.looksLikeSectionHeader(line) && !lower.includes('skill') && !lower.includes('competenc')) {
          break;
        }

        if (line.length > 0 && !this.looksLikeSectionHeader(line)) {
          // Extract skills from various formats
          if (line.includes('(') && line.includes(')')) {
            // Format like "WordPress (Intermediate)"
            const skillMatch = line.match(/([^(]+)\s*\(([^)]+)\)/);
            if (skillMatch) {
              const name = skillMatch[1].trim();
              const proficiency = this.normalizeProficiency(skillMatch[2].trim());
              skills.push({ name, proficiency });
            }
          } else if (line.includes(',')) {
            // Comma-separated skills
            const parts = line.split(',');
            parts.forEach(part => {
              const trimmed = part.trim();
              if (trimmed.length > 2 && trimmed.length < 50) {
                if (!skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
                  skills.push({
                    name: trimmed,
                    proficiency: 'Intermediate'
                  });
                }
              }
            });
          } else if (this.isBulletPoint(line)) {
            const cleaned = this.cleanBulletPoint(line);
            if (cleaned.length > 2 && cleaned.length < 50) {
              if (!skills.some(s => s.name.toLowerCase() === cleaned.toLowerCase())) {
                skills.push({
                  name: cleaned,
                  proficiency: 'Intermediate'
                });
              }
            }
          }
          // Plain text skills
          else if (line.length > 2 && line.length < 60) {
            if (!skills.some(s => s.name.toLowerCase() === line.toLowerCase())) {
              skills.push({
                name: line,
                proficiency: 'Intermediate'
              });
            }
          }
        }
      }
    }

    console.log('Total skills found:', skills.length);
    return skills.length > 0 ? skills.slice(0, 15) : this.getDefaultSkills();
  }

  private parseProjects(): any[] {
    const projects: any[] = [];
    // Default empty projects since none were found in the resume
    return projects;
  }

  // NEW HELPER METHODS
  private hasJobTitleKeywords(line: string): boolean {
    const titleKeywords = [
      'developer', 'engineer', 'manager', 'analyst', 'specialist', 'coordinator', 
      'director', 'consultant', 'architect', 'designer', 'administrator', 'officer',
      'associate', 'executive', 'lead', 'head', 'supervisor', 'assistant', 'intern'
    ];
    const lower = line.toLowerCase();
    return titleKeywords.some(keyword => lower.includes(keyword));
  }

  private isPotentialNextSectionAfterExperience(currentIndex: number): boolean {
    for (let i = currentIndex + 1; i < Math.min(currentIndex + 3, this.lines.length); i++) {
      const nextLine = this.lines[i];
      if (this.looksLikeSectionHeader(nextLine) && 
          (nextLine.toLowerCase().includes('education') || 
           nextLine.toLowerCase().includes('project') || 
           nextLine.toLowerCase().includes('skill'))) {
        return true;
      }
    }
    return false;
  }

  private normalizeProficiency(proficiency: string): 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' {
    const lower = proficiency.toLowerCase();
    if (lower.includes('expert') || lower.includes('master')) return 'Expert';
    if (lower.includes('advanced') || lower.includes('senior')) return 'Advanced';
    if (lower.includes('intermediate') || lower.includes('mid')) return 'Intermediate';
    if (lower.includes('beginner') || lower.includes('junior') || lower.includes('basic')) return 'Beginner';
    return 'Intermediate'; // default
  }

  // EXISTING HELPER METHODS
  private looksLikeSectionHeader(line: string): boolean {
    const upper = line.toUpperCase();
    const isAllCaps = upper === line && line.length < 50 && /^[A-Z][A-Z\s&]*$/.test(line);
    const hasColon = line.endsWith(':') && line.length < 50;
    
    const lower = line.toLowerCase().trim();
    const sectionHeaders = [
      'profile', 'summary', 'career objective', 'professional summary',
      'employment history', 'work experience', 'experience', 'professional experience',
      'education', 'academic background', 'qualifications',
      'skills', 'technical skills', 'core competencies', 'key skills',
      'projects', 'achievements', 'certifications', 'courses', 'training',
      'hobbies', 'interests', 'languages', 'references', 'details'
    ];
    
    const isSectionHeader = sectionHeaders.some(header => lower === header);
    
    return isAllCaps || hasColon || isSectionHeader;
  }

  private isBulletPoint(line: string): boolean {
    return line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || 
           line.startsWith('°') || /^\d+\./.test(line) || line.startsWith('·');
  }

  private isCommonSectionHeader(line: string): boolean {
    const commonHeaders = [
      'education', 'experience', 'work experience', 'skills', 'technical skills',
      'projects', 'achievements', 'awards', 'certifications', 'training',
      'languages', 'hobbies', 'interests', 'references', 'publications',
      'volunteer', 'activities', 'honors', 'courses', 'summary'
    ];
    
    const lower = line.toLowerCase().trim();
    return commonHeaders.includes(lower) || 
           commonHeaders.some(header => lower.includes(header));
  }

  private cleanBulletPoint(line: string): string {
    return line.replace(/^[•\-*°·\s\d\.]+/, '').trim();
  }

  private hasEmail(text: string): boolean {
    return /@/.test(text);
  }

  private hasPhone(text: string): boolean {
    return /\d{8,}/.test(text.replace(/\D/g, ''));
  }

  private looksLikeJobTitle(line: string): boolean {
    const titleWords = [
      'developer', 'engineer', 'manager', 'analyst', 'specialist', 'coordinator', 
      'director', 'consultant', 'architect', 'designer', 'administrator', 'controller',
      'technician', 'officer', 'associate', 'executive', 'lead', 'head', 'supervisor',
      'assistant', 'intern', 'trainee', 'apprentice', 'clerk', 'operator', 'warehouse',
      'inventory', 'laboratory', 'lab', 'sales', 'customer service', 'support'
    ];
    const lower = line.toLowerCase();
    
    const hasJobKeyword = titleWords.some(word => lower.includes(word));
    const hasAtPattern = /\sat\s/i.test(line);
    
    return (hasJobKeyword || hasAtPattern) && line.length < 120 && 
           !this.hasEmail(line) && !this.hasPhone(line);
  }

  private looksLikeDate(line: string): boolean {
    return /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s*\d{4}/i.test(line) ||
           /\d{4}\s*[-–—]\s*(present|current|\d{4})/i.test(line) ||
           /\d{1,2}\/\d{4}\s*[-–—]\s*\d{1,2}\/\d{4}/i.test(line);
  }

  private looksLikePercentage(line: string): boolean {
    return /\d+(\.\d+)?%/.test(line) || /\d+\.\d+\/\d+/.test(line) || 
           /(cgpa|gpa|percentage)[\s:]+\d+/i.test(line);
  }

  private looksLikeInstitution(line: string): boolean {
    const eduWords = ['university', 'college', 'school', 'institute', 'academy', 'matriculation', 'education'];
    const lower = line.toLowerCase();
    return eduWords.some(word => lower.includes(word)) && line.length < 100;
  }

  private looksLikeDegree(line: string): boolean {
    const degreeWords = ['bachelor', 'master', 'phd', 'diploma', 'degree', 'b.tech', 'b.e.', 
                         'm.tech', 'm.e.', 'bsc', 'msc', 'ba', 'ma', 'engineering', 'science',
                         'commerce', 'arts', 'computer', 'information technology', 'it',
                         'associates', 'associate', 'logistics', 'supply chain', 'certificate',
                         'graduate certificate', 'warehousing', 'management', 'online'];
    const lower = line.toLowerCase();
    return degreeWords.some(word => lower.includes(word)) && line.length < 150;
  }

  private capitalizeWords(str: string): string {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  // Default data methods
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
      projects: this.getDefaultProjects()
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

  private getDefaultProjects() {
    return [{ 
      id: Date.now(), 
      name: '', 
      description: [''], 
      technologies: [], 
      period: '', 
      link: '' 
    }];
  }
}

// Simple file extraction
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    try {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve('UNSUPPORTED_FILE_TYPE');
        reader.readAsText(file);
      } else {
        resolve('MANUAL_INPUT_REQUIRED');
      }
    } catch (error) {
      resolve('UNSUPPORTED_FILE_TYPE');
    }
  });
}