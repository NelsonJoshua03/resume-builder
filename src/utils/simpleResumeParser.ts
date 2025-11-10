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
        .replace(/\n\s*\n/g, '\n\n') // Preserve paragraph breaks
        .replace(/\n+/g, '\n')
        .trim();

      this.lines = cleanText.split('\n')
        .map(line => line.trim())
        .map(line => this.normalizeSpacedOutText(line))
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

  private normalizeSpacedOutText(text: string): string {
    const words = text.trim().split(/\s+/);
    
    if (words.length > 3) {
      const singleCharCount = words.filter(word => word.length === 1).length;
      const totalChars = words.join('').length;
      
      if (singleCharCount > 0.7 * words.length && totalChars >= 3) {
        const potentialWord = words.join('').toUpperCase();
        const commonAcronyms = ['USA', 'UK', 'CEO', 'CFO', 'VP', 'HR', 'IT', 'UI', 'UX', 'API'];
        
        if (!commonAcronyms.includes(potentialWord) && potentialWord.length > 2) {
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
      
      // Check if line is all uppercase (common for names)
      const isAllCaps = line === line.toUpperCase() && /^[A-Z\s]+$/.test(line);
      
      if ((words.length >= 2 && words.length <= 4) || isAllCaps) {
        const hasValidChars = /^[A-Za-z\s.'-]+$/.test(line);
        const hasNoContactInfo = !this.hasEmail(line) && !this.hasPhone(line);
        const hasNoAddressIndicators = !/(street|st|road|rd|avenue|ave|lane|ln|drive|dr|city|state|zip)/i.test(line);
        const notSectionHeader = !this.looksLikeSectionHeader(line);
        
        if (hasValidChars && hasNoContactInfo && hasNoAddressIndicators && notSectionHeader && line.length >= 4 && line.length < 50) {
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
          if (digitCount >= 10 && digitCount <= 15) {
            info.phone = match.trim();
            console.log('Found phone:', info.phone);
            break;
          }
        }
      }
      if (info.phone) break;
    }

    // Extract professional title
    for (let i = 0; i < Math.min(20, this.lines.length); i++) {
      const line = this.lines[i];
      const lower = line.toLowerCase();
      
      if (line === info.name || this.hasEmail(line) || this.hasPhone(line) || this.looksLikeSectionHeader(line)) {
        continue;
      }
      
      const words = line.split(/\s+/);
      if (words.length >= 1 && words.length <= 5 && line.length < 80) {
        if (this.looksLikeJobTitle(line) || this.hasJobTitleKeywords(line)) {
          info.title = line;
          console.log('Found title:', info.title);
          break;
        }
      }
    }

    // Extract summary
    let inSummary = false;
    let summaryLines: string[] = [];

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const lower = line.toLowerCase();
      
      if ((lower === 'professional summary' || lower === 'summary' || 
          lower === 'profile' || lower === 'career objective' ||
          lower === 'objective' || lower === 'about me') && this.looksLikeSectionHeader(line)) {
        inSummary = true;
        console.log('Found summary section');
        continue;
      }
      
      if (inSummary) {
        if (this.looksLikeSectionHeader(line) && !lower.includes('summary') && !lower.includes('profile') && !lower.includes('objective')) {
          break;
        }
        
        if (line.length > 15 && !this.looksLikeSectionHeader(line)) {
          let cleanLine = line;
          if (this.isBulletPoint(line)) {
            cleanLine = this.cleanBulletPoint(line);
          }
          
          if (cleanLine.length > 15) {
            summaryLines.push(cleanLine);
          }
        }
        
        if (summaryLines.length >= 5) break;
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

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const lower = line.toLowerCase();

      if ((lower === 'work experience' || lower === 'experience' || 
           lower === 'professional experience' || lower === 'employment history' ||
           lower === 'employment') && this.looksLikeSectionHeader(line)) {
        inExperienceSection = true;
        console.log('Found EXPERIENCE section');
        continue;
      }

      if (inExperienceSection) {
        if (this.looksLikeSectionHeader(line) && 
            (lower.includes('education') || lower.includes('project') || lower.includes('skill') || 
             lower.includes('award') || lower.includes('language'))) {
          if (currentExp) {
            currentExp.description = currentBullets.length > 0 ? currentBullets : [''];
            experiences.push(currentExp);
          }
          break;
        }

        if (!this.isBulletPoint(line) && !this.looksLikeDate(line) && line.length > 3 && line.length < 100) {
          const words = line.split(/\s+/).length;
          
          if ((this.looksLikeJobTitle(line) || this.hasJobTitleKeywords(line)) && words <= 6) {
            if (currentExp) {
              currentExp.description = currentBullets.length > 0 ? currentBullets : [''];
              experiences.push(currentExp);
            }

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
                  !this.isBulletPoint(nextLine) && nextLine.length > 2 && nextLine.length < 100 &&
                  !this.looksLikeJobTitle(nextLine)) {
                
                if (nextLine.includes('|')) {
                  const parts = nextLine.split('|').map(p => p.trim());
                  currentExp.company = parts[0];
                  if (parts.length > 1 && this.looksLikeDate(parts[1])) {
                    currentExp.period = parts[1];
                  }
                  i = j;
                  break;
                } else {
                  currentExp.company = nextLine;
                }
              }
              
              if (!currentExp.period && this.looksLikeDate(nextLine)) {
                currentExp.period = nextLine;
                i = j;
                break;
              }
            }
            continue;
          }
        }

        if (currentExp) {
          if (this.isBulletPoint(line)) {
            const clean = this.cleanBulletPoint(line);
            if (clean.length > 10) {
              currentBullets.push(clean);
            }
          }
        }
      }
    }

    if (currentExp) {
      currentExp.description = currentBullets.length > 0 ? currentBullets : [''];
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

      if ((lower === 'education' || lower === 'academic background' || 
           lower === 'qualifications') && this.looksLikeSectionHeader(line)) {
        inEducationSection = true;
        console.log('Found EDUCATION section');
        continue;
      }

      if (inEducationSection) {
        if (this.looksLikeSectionHeader(line) && !lower.includes('education')) {
          if (currentEdu) {
            education.push(currentEdu);
          }
          break;
        }

        if (this.looksLikeDegree(line) && !currentEdu) {
          currentEdu = {
            id: Date.now() + education.length,
            degree: line,
            institution: '',
            year: '',
            gpa: ''
          };
          console.log('Found degree:', line);
          
          for (let j = i + 1; j < Math.min(i + 5, this.lines.length); j++) {
            const nextLine = this.lines[j];
            
            if (!currentEdu.institution && this.looksLikeInstitution(nextLine)) {
              currentEdu.institution = nextLine;
            } else if (!currentEdu.year && this.looksLikeDate(nextLine)) {
              currentEdu.year = nextLine;
            } else if (!currentEdu.gpa && this.looksLikePercentage(nextLine)) {
              currentEdu.gpa = nextLine;
            } else if (this.looksLikeDegree(nextLine)) {
              break;
            }
          }
          continue;
        }

        if (currentEdu && this.looksLikeDegree(line)) {
          education.push(currentEdu);
          currentEdu = null;
          i--;
        }
      }
    }

    if (currentEdu) {
      education.push(currentEdu);
    }

    console.log('Total education entries:', education.length);
    return education.length > 0 ? education : this.getDefaultEducation();
  }

  private parseSkills(): any[] {
    const skills: any[] = [];
    let inSkillsSection = false;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const lower = line.toLowerCase();

      if ((lower === 'skills' || lower === 'technical skills' || lower === 'core competencies' ||
           lower === 'key skills') && this.looksLikeSectionHeader(line)) {
        inSkillsSection = true;
        console.log('Found SKILLS section');
        continue;
      }

      if (inSkillsSection) {
        if (this.looksLikeSectionHeader(line)) {
          break;
        }

        if (line.length > 0 && !this.looksLikeSectionHeader(line)) {
          if (line.includes('•')) {
            const parts = line.split('•').map(s => s.trim()).filter(s => s.length > 0);
            parts.forEach(skill => {
              if (skill.length > 1 && skill.length < 50 && !skills.some(s => s.name.toLowerCase() === skill.toLowerCase())) {
                skills.push({ name: skill, proficiency: 'Intermediate' });
              }
            });
          } else if (line.includes(',')) {
            const parts = line.split(',').map(s => s.trim()).filter(s => s.length > 0);
            parts.forEach(skill => {
              if (skill.length > 1 && skill.length < 50 && !skills.some(s => s.name.toLowerCase() === skill.toLowerCase())) {
                skills.push({ name: skill, proficiency: 'Intermediate' });
              }
            });
          } else if (this.isBulletPoint(line)) {
            const cleaned = this.cleanBulletPoint(line);
            if (cleaned.length > 1 && cleaned.length < 50 && !skills.some(s => s.name.toLowerCase() === cleaned.toLowerCase())) {
              skills.push({ name: cleaned, proficiency: 'Intermediate' });
            }
          } else if (line.length > 1 && line.length < 50) {
            if (!skills.some(s => s.name.toLowerCase() === line.toLowerCase())) {
              skills.push({ name: line, proficiency: 'Intermediate' });
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
    let inProjectsSection = false;
    let currentProject: any = null;
    let currentBullets: string[] = [];

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const lower = line.toLowerCase();

      if ((lower === 'projects' || lower === 'project') && this.looksLikeSectionHeader(line)) {
        inProjectsSection = true;
        console.log('Found PROJECTS section');
        continue;
      }

      if (inProjectsSection) {
        if (this.looksLikeSectionHeader(line) && !lower.includes('project')) {
          if (currentProject) {
            currentProject.description = currentBullets.length > 0 ? currentBullets : [''];
            projects.push(currentProject);
          }
          break;
        }

        // Project name (not a bullet, not a date)
        if (!this.isBulletPoint(line) && !this.looksLikeDate(line) && line.length > 3 && line.length < 100) {
          if (currentProject) {
            currentProject.description = currentBullets.length > 0 ? currentBullets : [''];
            projects.push(currentProject);
          }

          currentProject = {
            id: Date.now() + projects.length,
            name: line,
            description: [],
            technologies: [],
            period: '',
            link: ''
          };
          currentBullets = [];
          console.log('Found project:', line);

          // Look for date in next line
          if (i + 1 < this.lines.length && this.looksLikeDate(this.lines[i + 1])) {
            currentProject.period = this.lines[i + 1];
            i++;
          }
          continue;
        }

        // Project description bullets
        if (currentProject && this.isBulletPoint(line)) {
          const clean = this.cleanBulletPoint(line);
          if (clean.length > 10) {
            currentBullets.push(clean);
          }
        }
      }
    }

    if (currentProject) {
      currentProject.description = currentBullets.length > 0 ? currentBullets : [''];
      projects.push(currentProject);
    }

    console.log('Total projects found:', projects.length);
    return projects;
  }

  // Helper methods
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
    return 'Intermediate';
  }

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
      'hobbies', 'interests', 'languages', 'references', 'details', 'awards'
    ];
    
    const isSectionHeader = sectionHeaders.some(header => lower === header);
    
    return isAllCaps || hasColon || isSectionHeader;
  }

  private isBulletPoint(line: string): boolean {
    return line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || 
           /^\d+\./.test(line) || line.startsWith('·');
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
    return line.replace(/^[•\-*·\s\d\.]+/, '').trim();
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
      'assistant', 'intern', 'trainee', 'apprentice'
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
    const eduWords = ['university', 'college', 'school', 'institute', 'academy'];
    const lower = line.toLowerCase();
    return eduWords.some(word => lower.includes(word)) && line.length < 100;
  }

  private looksLikeDegree(line: string): boolean {
    const degreeWords = ['bachelor', 'master', 'phd', 'diploma', 'degree', 'b.tech', 'b.e.', 
                         'm.tech', 'm.e.', 'bsc', 'msc', 'ba', 'ma', 'engineering', 'science',
                         'computer', 'information technology'];
    const lower = line.toLowerCase();
    return degreeWords.some(word => lower.includes(word)) && line.length < 150;
  }

  private capitalizeWords(str: string): string {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
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

// PDF.js CDN loader
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