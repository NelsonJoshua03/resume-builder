import { useRef, useState } from 'react';
import { FileUploadProps } from './types';
import { SimpleResumeParser, extractTextFromFile } from '../utils/simpleResumeParser';

const FileUpload = ({ onUpload }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualText, setManualText] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {  
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setError(null);
      setIsParsing(true);
      
      // Validate file type
      const validTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !validTypes.includes(`.${fileExtension}`)) {
        setError('Please upload a PDF, DOC, DOCX, or TXT file');
        setIsParsing(false);
        return;
      }
      
      try {
        console.log('Starting file processing for:', file.name);
        
        // Extract text from file
        const fileText = await extractTextFromFile(file);
        
        console.log('File text extracted, length:', fileText.length);
        
        if (!fileText || fileText.length < 50 || 
            fileText === 'PDF_CONTENT_NEEDS_MANUAL_INPUT' || 
            fileText === 'UNSUPPORTED_FILE_TYPE') {
          setError('Could not extract text automatically. Please use the manual input option below.');
          setIsParsing(false);
          setShowManualInput(true);
          return;
        }
        
        // Parse the resume text
        const parser = new SimpleResumeParser(fileText);
        const parsedData = parser.parse();
        
        console.log('Parsed resume data:', parsedData);
        
        // Pass the parsed data to the parent component
        onUpload(parsedData);
        
        setTimeout(() => {
          alert('Resume information has been auto-filled! Please review and make any necessary edits.');
        }, 100);
        
      } catch (err) {
        console.error('File parsing error:', err);
        setError('Failed to parse the file. Please use the manual input option.');
        setShowManualInput(true);
      } finally {
        setIsParsing(false);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleManualParse = () => {
    if (manualText.trim().length < 100) {
      setError('Please paste at least 100 characters of your resume text.');
      return;
    }
    
    setIsParsing(true);
    setError(null);
    
    // Use setTimeout to avoid blocking UI and catch any async errors
    setTimeout(() => {
      try {
        console.log('Manual parsing started with text length:', manualText.length);
        const parser = new SimpleResumeParser(manualText);
        const parsedData = parser.parse();
        
        console.log('Manual parse successful:', parsedData);
        onUpload(parsedData);
        
        setTimeout(() => {
          alert('Resume information has been parsed! Please review and make any necessary edits.');
          setShowManualInput(false);
          setManualText('');
        }, 100);
      } catch (err) {
        console.error('Manual parse error details:', err);
        setError(`Failed to parse the text: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsParsing(false);
      }
    }, 0);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Removed the unused 'file' variable declaration
      const event = {
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
        <i className="fas fa-upload mr-2 text-blue-500"></i> Upload Your CV
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div 
        className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer ${isParsing ? 'opacity-50' : ''}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isParsing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Processing your resume...</p>
            <p className="text-sm text-gray-500 mt-2">Extracting and analyzing your information</p>
          </div>
        ) : (
          <>
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            
            <p className="text-gray-600 mb-2 font-medium">Drag & drop your CV file here</p>
            <p className="text-gray-500 mb-4">or click to browse</p>
            <p className="text-sm text-gray-500 mb-4">Supported formats: PDF, DOC, DOCX, TXT (max 5MB)</p>
            
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
            />
            
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              disabled={isParsing}
            >
              <i className="fas fa-file-upload mr-2"></i>
              Choose File
            </button>
          </>
        )}
      </div>

      {/* Manual Input Section */}
      <div className="mt-6">
        <button
          type="button"
          className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center"
          onClick={() => setShowManualInput(!showManualInput)}
        >
          <i className={`fas ${showManualInput ? 'fa-chevron-up' : 'fa-chevron-down'} mr-2`}></i>
          {showManualInput ? 'Hide Manual Input' : 'Having Trouble? Try Manual Input'}
        </button>

        {showManualInput && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">Paste Your Resume Text</h3>
            <p className="text-blue-700 text-sm mb-3">
              Copy and paste the text content from your resume below:
            </p>
            
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 resize-none font-mono text-sm"
            />
            
            <div className="flex space-x-3">
              <button
                onClick={handleManualParse}
                disabled={isParsing || manualText.length < 100}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isParsing ? 'Processing...' : 'Parse Resume Text'}
              </button>
              <button
                onClick={() => {
                  setManualText('');
                  setShowManualInput(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
            
            <div className="mt-3 text-xs text-blue-600">
              <p><strong>Tip:</strong> Select all text from your resume (Ctrl+A), copy (Ctrl+C), and paste here (Ctrl+V).</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;