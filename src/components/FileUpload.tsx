import { useRef, useState } from 'react';
import { FileUploadProps } from './types';

const FileUpload = ({ onUpload }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {  
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setError(null);
      
      // Validate file type
      const validTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !validTypes.includes(`.${fileExtension}`)) {
        setError('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      // Pass the file to the parent component
      onUpload(file);
      
      // Show success message
      alert('File uploaded successfully! For now, please fill in your information manually.');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Upload Your CV</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={handleClick}
      >
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
        </div>
        
        <p className="text-gray-600 mb-4">Drag & drop your CV file here or click to browse</p>
        <p className="text-sm text-gray-500 mb-4">Supported formats: PDF, DOC, DOCX (max 5MB)</p>
        
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
        />
        
        <button 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Choose File
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-semibold">Note:</p>
        <p>Resume parsing is temporarily unavailable. Please fill in your information manually after uploading your file.</p>
      </div>
    </div>
  );
};

export default FileUpload;