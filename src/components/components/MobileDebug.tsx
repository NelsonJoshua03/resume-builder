import React from 'react';

const MobileDebug = () => {
  const [isMobilePreview, setIsMobilePreview] = React.useState(false);

  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        toggleMobilePreview();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const toggleMobilePreview = () => {
    const newState = !isMobilePreview;
    setIsMobilePreview(newState);
    document.documentElement.classList.toggle('mobile-preview');
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2 mb-2">
          <button
            onClick={toggleMobilePreview}
            className={`px-3 py-1 rounded text-sm ${
              isMobilePreview ? 'bg-green-600' : 'bg-gray-600'
            }`}
          >
            📱 {isMobilePreview ? 'Mobile ON' : 'Mobile OFF'}
          </button>
          <span className="text-xs text-gray-300">Ctrl+M</span>
        </div>
        {isMobilePreview && (
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Device:</span>
              <span className="text-green-400">iPhone 6/7/8</span>
            </div>
            <div className="flex justify-between">
              <span>Resolution:</span>
              <span>375×667</span>
            </div>
            <div className="text-yellow-400">Scroll to see full content</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileDebug;