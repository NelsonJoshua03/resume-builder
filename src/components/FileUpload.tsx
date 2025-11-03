// src/components/FileUpload.tsx
import { useState } from 'react';
import { FileUploadProps } from './types';

const FileUpload = ({ onUpload }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }

      const parsedData = await response.json();
      onUpload(parsedData);
    } catch (error) {
      console.error('Error parsing resume:', error);
      alert('Failed to parse resume. Please try again or enter information manually.');
    }
  };

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
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('resume-file-input')?.click()}
      >
        <input 
          type="file" 
          id="resume-file-input"
          className="hidden" 
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileInput}
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <i className="fas fa-file-upload text-4xl text-gray-400"></i>
          <div>
            <p className="text-lg font-medium text-gray-700">Upload your resume</p>
            <p className="text-sm text-gray-500 mt-1">
              Drag & drop your resume file here or click to browse
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-500">
            <span>PDF</span>
            <span>•</span>
            <span>DOC</span>
            <span>•</span>
            <span>DOCX</span>
            <span>•</span>
            <span>TXT</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-blue-500 mt-0.5">
            <i className="fas fa-info-circle"></i>
          </div>
          <div className="text-sm text-blue-800">
            <strong>How it works:</strong> Upload your existing resume and we'll automatically extract your information to pre-fill the form. Supported formats: PDF, DOC, DOCX, TXT.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;