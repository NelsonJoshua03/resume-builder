import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { ParsedResumeData } from './types';

export async function parseResume(file: Express.Multer.File): Promise<ParsedResumeData> {
  const fileType = file.mimetype;
  let text = '';

  if (fileType === 'application/pdf') {
    text = await parsePDF(file.buffer);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword'
  ) {
    text = await parseDOCX(file.buffer);
  } else {
    text = file.buffer.toString('utf8');
  }

  return extractInformation(text);
}

async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

function extractInformation(text: string): ParsedResumeData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract name with improved detection
  const name = extractName(lines);
  
  // Extract email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  
  // Extract phone
  const phoneMatch = text.match(/\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/);
  
  // Find experience section
  const experienceSection = findSection(text, ['experience', 'work experience', 'employment', 'work history', 'professional experience']);
  
  // Extract experiences
  const experiences = extractExperiences(text, experienceSection);
  
  return {
    personalInfo: {
      name: name || 'Your Name',
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      summary: ['Summary extracted from your resume. Please review and edit.']
    },
    experiences: experiences.length > 0 ? experiences : [{
      title: 'Extracted Position',
      company: 'Company Name',
      period: '2020 - Present',
      description: ['Responsibilities and achievements extracted from your resume.']
    }],
    education: [{
      degree: 'Degree Name',
      institution: 'University Name',
      year: '2020'
    }],
    skills: ['React', 'Node.js', 'JavaScript']
  };
}

function extractName(lines: string[]): string {
  // Look for name patterns - typically at the beginning of the resume
  const namePatterns = [
    /^[A-Z][a-z]+ [A-Z][a-z]+( [A-Z][a-z]+)?$/, // First Last or First Middle Last
    /^[A-Z]+ [A-Z]+$/, // ALL CAPS names
    /^[A-Z]\. [A-Z][a-z]+$/ // Initial + Last name
  ];
  
  // Check first few lines for a name pattern
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // Skip lines that are clearly not names
    if (line.includes('@') || line.match(/\d/) || 
        line.toLowerCase().includes('resume') || 
        line.toLowerCase().includes('curriculum') ||
        line.toLowerCase().includes('vitae') ||
        line.length > 40) {
      continue;
    }
    
    // Check if line matches any name pattern
    for (const pattern of namePatterns) {
      if (pattern.test(line)) {
        return line;
      }
    }
  }
  
  return '';
}

function findSection(text: string, patterns: string[]): { start: number; end: number } {
  const lowerText = text.toLowerCase();
  let start = -1;
  
  for (const pattern of patterns) {
    const index = lowerText.indexOf(pattern);
    if (index !== -1) {
      start = index;
      break;
    }
  }
  
  if (start === -1) return { start: -1, end: -1 };
  
  // Find the end of the section by looking for the next section heading
  const sectionEndPatterns = ['education', 'skills', 'projects', 'awards', 'certifications'];
  let end = text.length;
  
  for (const pattern of sectionEndPatterns) {
    const index = lowerText.indexOf(pattern, start + 1);
    if (index !== -1 && index < end) {
      end = index;
    }
  }
  
  return { start, end };
}

function extractExperiences(text: string, section: { start: number; end: number }): Array<{ title: string; company: string; period: string; description: string[] }> {
  if (section.start === -1) return [];
  
  const experiences: Array<{ title: string; company: string; period: string; description: string[] }> = [];
  const experienceText = text.substring(section.start, section.end);
  const lines = experienceText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentExperience: { title: string; company: string; period: string; description: string[] } | null = null;
  
  for (const line of lines) {
    // Skip section headers
    if (line.toLowerCase().includes('experience') || line.toLowerCase().includes('employment')) continue;
    
    // Look for date patterns that might indicate a job period
    const dateMatch = line.match(/(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*-\s*(?:Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b)|(\d{4}\s*-\s*(?:Present|\d{4}))/i);
    
    if (dateMatch && currentExperience) {
      // If we find a date and have a current experience, assume it's the period
      currentExperience.period = dateMatch[0];
    } else if (line.length > 2 && line.length < 50 && !line.match(/\d/) && !currentExperience) {
      // If it's a short line without numbers, it might be a job title
      currentExperience = {
        title: line,
        company: '',
        period: '',
        description: []
      };
    } else if (currentExperience) {
      if (!currentExperience.company && line.length < 60) {
        // Assume the line after title is company
        currentExperience.company = line;
      } else {
        // Everything else is description
        currentExperience.description.push(line);
      }
    }
    
    // If we have a complete experience, add it to the list
    if (currentExperience && currentExperience.title && currentExperience.company && currentExperience.period) {
      experiences.push(currentExperience);
      currentExperience = null;
    }
  }
  
  return experiences;
}