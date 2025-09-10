import  { useRef } from 'react';
import { FileUploadProps } from './types';

const FileUpload = ({ onUpload }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {  
  const files = e.target.files;
  if (files && files.length > 0) {
    const file = files[0];
    onUpload(file);
  }
};

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Upload Your CV</h2>
      
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
        
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
        />
        
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Choose File
        </button>
      </div>
    </div>
  );
};

export default FileUpload;