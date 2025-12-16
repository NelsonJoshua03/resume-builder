// src/components/FileUpload.tsx
import { useState } from 'react';
import type { FileUploadProps } from './types';
import { SimpleResumeParser, extractTextFromFile } from '../utils/simpleResumeParser';

const FileUpload = ({ onUpload }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setProcessingStatus('Reading file...');

    try {
      // Extract text from the file
      const extractedText = await extractTextFromFile(file);
      
      if (extractedText === 'UNSUPPORTED_FILE_TYPE') {
        alert('Unsupported file type. Please upload a PDF, TXT, DOC, or DOCX file.');
        setIsProcessing(false);
        setProcessingStatus('');
        return;
      }

      if (extractedText === 'MANUAL_INPUT_REQUIRED') {
        alert('Unable to extract text from this file automatically. This might be because:\n\n• The PDF is image-based (scanned document)\n• The PDF is password-protected\n• The file format requires manual processing\n\nPlease copy and paste your resume content manually, or try converting your resume to a text-based PDF.');
        setIsProcessing(false);
        setProcessingStatus('');
        return;
      }

      // ====== DEBUG: Show extracted text ======
      console.log('=== EXTRACTED TEXT FROM PDF ===');
      console.log('Length:', extractedText.length);
      console.log('Full text:', extractedText);
      console.log('First 500 chars:', extractedText.substring(0, 500));
      console.log('First 20 lines:', extractedText.split('\n').slice(0, 20));
      console.log('===============================');

      setProcessingStatus('Parsing resume data...');
      
      // Parse the extracted text
      const parser = new SimpleResumeParser(extractedText);
      const parsedData = parser.parse();
      
      console.log('=== PARSED RESUME DATA ===');
      console.log('Personal Info:', JSON.stringify(parsedData.personalInfo, null, 2));
      console.log('Experiences:', JSON.stringify(parsedData.experiences, null, 2));
      console.log('Education:', JSON.stringify(parsedData.education, null, 2));
      console.log('Skills:', JSON.stringify(parsedData.skills, null, 2));
      console.log('Projects:', JSON.stringify(parsedData.projects, null, 2));
      console.log('========================');
      
      setProcessingStatus('Filling form...');
      
      onUpload(parsedData);
      
      setProcessingStatus('');
      alert('✅ Resume uploaded successfully! Please review and edit the auto-filled information.');
      
    } catch (error) {
      console.error('Error parsing resume:', error);
      alert('❌ Failed to parse resume. Please try again or enter information manually.\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // ... rest of the component remains the same
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // TEST PARSER FUNCTION
  const testParser = () => {
    const testText = `JOHN DOE
Software Developer
john.doe@email.com | (555) 123-4567
PROFESSIONAL SUMMARY
• Full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies.
• Passionate about building scalable web applications with clean architecture.
• Strong problem-solving skills and experience in agile development environments.
EDUCATION
Bachelor of Computer Science
University of Technology
2018 | GPA: 3.8/4.0
WORK EXPERIENCE
Senior Developer
Tech Solutions Inc. | 2020 - Present
• Led frontend development team and implemented new features
• Mentored junior developers and conducted code reviews
• Optimized application performance reducing load time by 40%
Junior Developer
StartUp Co. | 2018 - 2020
• Developed and maintained web applications using React
• Collaborated with design team to implement responsive UI
• Participated in agile development processes
PROJECTS
E-commerce Platform
2022
• Developed a full-stack e-commerce solution with React and Node.js
• Implemented payment processing with Stripe API
• Designed responsive UI with Tailwind CSS
SKILLS
React • Node.js • JavaScript • HTML/CSS • MongoDB • AWS
AWARDS & HONORS
Best Hackathon Project
Tech Conference 2021 | 2021
Awarded for innovative use of AI in healthcare application
LANGUAGES
English (Native), Spanish (Intermediate)`;

    console.log('=== TESTING PARSER ===');
    console.log('Input text length:', testText.length);
    console.log('Input text:', testText);
    
    const parser = new SimpleResumeParser(testText);
    const result = parser.parse();
    
    console.log('\n=== PARSER RESULTS ===');
    console.log('Name:', result.personalInfo.name);
    console.log('Title:', result.personalInfo.title);
    console.log('Email:', result.personalInfo.email);
    console.log('Phone:', result.personalInfo.phone);
    console.log('Summary:', result.personalInfo.summary);
    console.log('\nExperiences:', result.experiences.length);
    result.experiences.forEach((exp, i) => {
      console.log(`  ${i + 1}. ${exp.title} at ${exp.company} (${exp.period})`);
      console.log(`     Bullets: ${exp.description.length}`);
    });
    console.log('\nEducation:', result.education.length);
    result.education.forEach((edu, i) => {
      console.log(`  ${i + 1}. ${edu.degree} - ${edu.institution} (${edu.year})`);
    });
    console.log('\nSkills:', result.skills.length);
    console.log('Skills list:', result.skills.map(s => s.name).join(', '));
    console.log('\nProjects:', result.projects.length);
    result.projects.forEach((proj, i) => {
      console.log(`  ${i + 1}. ${proj.name} (${proj.period})`);
    });
    console.log('====================\n');
    
    alert('✅ Parser test complete! Check console for detailed results.');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
        <i className="fas fa-upload mr-2 text-blue-500"></i> Upload Existing Resume
      </h2>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && document.getElementById('resume-file-input')?.click()}
      >
        <input 
          type="file" 
          id="resume-file-input"
          className="hidden" 
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileInput}
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          {isProcessing ? (
            <>
              <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
              <p className="text-lg font-medium text-gray-700">Processing your resume...</p>
              {processingStatus && (
                <p className="text-sm text-gray-500">{processingStatus}</p>
              )}
            </>
          ) : (
            <>
              <i className="fas fa-file-upload text-4xl text-gray-400"></i>
              <div>
                <p className="text-lg font-medium text-gray-700">Upload your resume</p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag & drop your resume file here or click to browse
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">PDF (Recommended)</span>
                <span>•</span>
                <span className="bg-gray-100 px-2 py-1 rounded">TXT</span>
                <span>•</span>
                <span className="bg-gray-100 px-2 py-1 rounded">DOC</span>
                <span>•</span>
                <span className="bg-gray-100 px-2 py-1 rounded">DOCX</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-blue-500 mt-0.5">
            <i className="fas fa-info-circle"></i>
          </div>
          <div className="text-sm text-blue-800">
            <strong>How it works:</strong> Upload your existing resume and we'll automatically extract your information to pre-fill the form. 
            <strong className="block mt-2">💡 For best results:</strong>
            <ul className="list-disc ml-4 mt-1 space-y-1">
              <li>Use text-based PDFs (not scanned images)</li>
              <li>Ensure your PDF is not password-protected</li>
              <li>TXT files work great for plain text resumes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* TEMPORARY DEBUG BUTTON - Remove after testing */}
      <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-start gap-3 mb-3">
          <div className="text-purple-500 mt-0.5">
            <i className="fas fa-flask"></i>
          </div>
          <div className="text-sm text-purple-800">
            <strong>🧪 Debug Mode:</strong> Test the parser with sample data to verify it's working correctly.
          </div>
        </div>
        <button 
          onClick={testParser}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
        >
          <i className="fas fa-vial"></i>
          Test Parser with Sample Resume
        </button>
      </div>
    </div>
  );
};

export default FileUpload;