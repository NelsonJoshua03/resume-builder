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
        .filter(line => line.length > 0);

      console.log('Total lines:', this.lines.length);

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

    // Extract name - usually first line or within first 3 lines
    for (let i = 0; i < Math.min(5, this.lines.length); i++) {
      const line = this.lines[i];
      const words = line.split(/\s+/);
      
      // Name is typically 2-4 words, all caps or title case
      if (words.length >= 2 && words.length <= 4) {
        const hasValidChars = /^[A-Za-z\s.'-]+$/.test(line);
        const hasNoContactInfo = !this.hasEmail(line) && !this.hasPhone(line);
        const hasNoAddressIndicators = !/(street|st|road|rd|avenue|ave|lane|ln|drive|dr|city|state|zip|nagar|mumbai|maharashtra|india)/i.test(line);
        
        if (hasValidChars && hasNoContactInfo && hasNoAddressIndicators && line.length < 50) {
          info.name = line;
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
        info.email = match[0];
        console.log('Found email:', info.email);
        break;
      }
    }

    // Extract phone - improved pattern matching
    for (const line of this.lines) {
      const phoneMatch = line.match(/(\+\d{1,3}[\s-]?)?\d{8,15}/g);
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

    // Extract professional title from CAREER OBJECTIVE or similar section
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const lower = line.toLowerCase();
      
      if (lower.includes('career objective') || lower.includes('objective') || lower.includes('professional summary')) {
        // Look at next few lines for professional title
        for (let j = i + 1; j < Math.min(i + 5, this.lines.length); j++) {
          const nextLine = this.lines[j];
          if (this.looksLikeJobTitle(nextLine)) {
            info.title = nextLine;
            console.log('Found title from objective:', info.title);
            break;
          }
        }
        break;
      }
    }

    // Extract summary
    let inSummary = false;
    let summaryLines: string[] = [];
    
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const lower = line.toLowerCase();
      
      if (lower.includes('career objective') || lower.includes('professional summary') || 
          (lower.includes('summary') && line.length < 50)) {
        inSummary = true;
        continue;
      }
      
      if (inSummary) {
        if (this.looksLikeSectionHeader(line) && 
            !lower.includes('objective') && 
            !lower.includes('summary')) {
          break;
        }
        
        if (line.length > 20 && !this.looksLikeSectionHeader(line)) {
          summaryLines.push(line);
        }
      }
    }

    info.summary = summaryLines.length > 0 ? summaryLines : ['Professional with experience in document control and management.'];
    console.log('Found summary lines:', info.summary.length);

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

      // Detect EXPERIENCE section
      if ((lower === 'experience' || lower === 'work experience' || lower === 'professional experience') && 
          this.looksLikeSectionHeader(line)) {
        inExperienceSection = true;
        console.log('Found EXPERIENCE section at line', i);
        continue;
      }

      if (inExperienceSection) {
        // Stop at next major section
        if (this.looksLikeSectionHeader(line) && 
            (lower.includes('education') || lower.includes('project') || lower.includes('certification') || 
             lower.includes('skill') || lower.includes('achievement'))) {
          if (currentExp && currentBullets.length > 0) {
            currentExp.description = currentBullets;
            experiences.push(currentExp);
          }
          break;
        }

        // Detect company name (line without bullet, reasonable length)
        if (!this.isBulletPoint(line) && line.length > 3 && line.length < 80 && 
            !this.looksLikeJobTitle(line) && !this.looksLikeDate(line)) {
          
          // Check if next lines contain job title and date
          let hasJobTitle = false;
          let hasDate = false;
          
          for (let j = i + 1; j < Math.min(i + 4, this.lines.length); j++) {
            if (this.looksLikeJobTitle(this.lines[j])) hasJobTitle = true;
            if (this.looksLikeDate(this.lines[j])) hasDate = true;
          }

          if (hasJobTitle || hasDate) {
            // Save previous experience
            if (currentExp && currentBullets.length > 0) {
              currentExp.description = currentBullets;
              experiences.push(currentExp);
            }

            currentExp = {
              id: Date.now() + experiences.length,
              company: line,
              title: '',
              period: '',
              description: []
            };
            currentBullets = [];
            console.log('Found company:', line);

            // Look ahead for title and date
            for (let j = i + 1; j < Math.min(i + 4, this.lines.length); j++) {
              const nextLine = this.lines[j];
              if (!currentExp.title && this.looksLikeJobTitle(nextLine)) {
                currentExp.title = nextLine;
                console.log('Found title:', nextLine);
              }
              if (!currentExp.period && this.looksLikeDate(nextLine)) {
                currentExp.period = nextLine;
                console.log('Found period:', nextLine);
              }
            }
          }
        }
        // Collect bullet points
        else if (currentExp && this.isBulletPoint(line)) {
          const clean = this.cleanBulletPoint(line);
          if (clean.length > 10) {
            currentBullets.push(clean);
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
      if (lower === 'education' && this.looksLikeSectionHeader(line)) {
        inEducationSection = true;
        console.log('Found EDUCATION section at line', i);
        continue;
      }

      if (inEducationSection) {
        // Stop at next major section
        if (this.looksLikeSectionHeader(line) && 
            !lower.includes('education') && 
            (lower.includes('achievement') || lower.includes('skill') || lower.includes('experience') || 
             lower.includes('project') || lower.includes('certification'))) {
          if (currentEdu) {
            education.push(currentEdu);
          }
          break;
        }

        // Detect institution name (contains college, university, school, etc.)
        if (this.looksLikeInstitution(line)) {
          // Save previous education entry
          if (currentEdu) {
            education.push(currentEdu);
          }

          currentEdu = {
            id: Date.now() + education.length,
            institution: line,
            degree: '',
            year: '',
            gpa: ''
          };
          console.log('Found institution:', line);

          // Look ahead for degree, GPA, and year
          for (let j = i + 1; j < Math.min(i + 5, this.lines.length); j++) {
            const nextLine = this.lines[j];
            
            // Degree/field of study (longer line, not a year or percentage)
            if (!currentEdu.degree && nextLine.length > 5 && !this.looksLikeYear(nextLine) && 
                !this.looksLikePercentage(nextLine) && !this.looksLikeInstitution(nextLine)) {
              currentEdu.degree = nextLine;
              console.log('Found degree:', nextLine);
            }
            // GPA/Percentage
            else if (!currentEdu.gpa && this.looksLikePercentage(nextLine)) {
              currentEdu.gpa = nextLine;
              console.log('Found GPA:', nextLine);
            }
            // Year
            else if (!currentEdu.year && this.looksLikeYear(nextLine)) {
              currentEdu.year = nextLine;
              console.log('Found year:', nextLine);
            }
            // Stop if we hit another institution
            else if (this.looksLikeInstitution(nextLine)) {
              break;
            }
          }
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
      if ((lower === 'technical skills' || lower === 'skills' || lower.includes('technical')) && 
          this.looksLikeSectionHeader(line)) {
        inSkillsSection = true;
        console.log('Found SKILLS section at line', i);
        continue;
      }

      if (inSkillsSection) {
        // Stop at next major section
        if (this.looksLikeSectionHeader(line) && !lower.includes('skill')) {
          break;
        }

        if (line.length > 0) {
          // Check for common technical skills
          const commonSkills = [
            'aconex', 'wrench', 'sharepoint', 'docusign', 'powerbi', 'power bi', 'excel',
            'document management', 'version control', 'compliance', 'workflow', 'edms',
            'python', 'javascript', 'sql', 'vba', 'macro', 'cfihos'
          ];
          
          const lowerLine = lower;
          
          // Extract skills from comma-separated list
          if (line.includes(',')) {
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
          }
          // Check for known skills in the line
          else {
            commonSkills.forEach(skill => {
              if (lowerLine.includes(skill)) {
                const skillName = this.capitalizeWords(skill);
                if (!skills.some(s => s.name.toLowerCase() === skill)) {
                  skills.push({
                    name: skillName,
                    proficiency: 'Intermediate'
                  });
                }
              }
            });
          }
        }
      }
    }

    console.log('Total skills found:', skills.length);
    return skills.length > 0 ? skills.slice(0, 12) : this.getDefaultSkills();
  }

  private parseProjects(): any[] {
    const projects: any[] = [];
    let inProjectSection = false;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const lower = line.toLowerCase();

      // Detect PROJECTS section
      if (lower === 'projects' && this.looksLikeSectionHeader(line)) {
        inProjectSection = true;
        console.log('Found PROJECTS section at line', i);
        continue;
      }

      if (inProjectSection) {
        // Stop at next major section
        if (this.looksLikeSectionHeader(line) && !lower.includes('project')) {
          break;
        }

        // Project names are typically short lines without bullets
        if (line.length > 5 && line.length < 100 && !this.isBulletPoint(line)) {
          projects.push({
            id: Date.now() + projects.length,
            name: line,
            description: [`Worked on ${line} with focus on documentation and control.`],
            technologies: [],
            period: '',
            link: ''
          });
          console.log('Found project:', line);
        }
      }
    }

    console.log('Total projects found:', projects.length);
    return projects.length > 0 ? projects : this.getDefaultProjects();
  }

  // Helper methods
  private looksLikeSectionHeader(line: string): boolean {
    const upper = line.toUpperCase();
    return upper === line && line.length < 50 && /^[A-Z][A-Z\s&]*$/.test(line);
  }

  private isBulletPoint(line: string): boolean {
    return line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || 
           line.startsWith('°') || /^\d+\./.test(line);
  }

  private cleanBulletPoint(line: string): string {
    return line.replace(/^[•\-*°\s\d\.]+/, '').trim();
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
      'technician', 'officer', 'associate', 'executive', 'lead', 'head'
    ];
    const lower = line.toLowerCase();
    return titleWords.some(word => lower.includes(word)) && line.length < 80;
  }

  private looksLikeDate(line: string): boolean {
    // Matches: "May 2022-Nov 2024", "November 2024 - present", "Feb 2018-March 2019"
    return /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s*\d{4}/i.test(line) ||
           /\d{4}\s*[-–]\s*(present|current|\d{4})/i.test(line);
  }

  private looksLikeYear(line: string): boolean {
    return /^\d{4}$/.test(line.trim());
  }

  private looksLikePercentage(line: string): boolean {
    return /\d+%/.test(line) || /\d+\.\d+/.test(line);
  }

  private looksLikeInstitution(line: string): boolean {
    const eduWords = ['university', 'college', 'school', 'institute', 'academy', 'matriculation'];
    const lower = line.toLowerCase();
    return eduWords.some(word => lower.includes(word));
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