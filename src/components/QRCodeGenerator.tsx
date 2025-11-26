import React from 'react';
import QRCode from 'qrcode.react';

const QRCodeGenerator = () => {
  const [showQR, setShowQR] = React.useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setShowQR(!showQR)}
        className="bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        📲 QR Code
      </button>
      
      {showQR && (
        <div className="absolute bottom-16 left-0 bg-white p-4 rounded-lg shadow-xl border">
          <div className="text-center mb-2">
            <div className="text-sm font-semibold text-gray-800">Scan with Phone</div>
            <div className="text-xs text-gray-500">Make sure you're on same Wi-Fi</div>
          </div>
          <QRCode value={window.location.href} size={128} />
          <div className="text-xs mt-2 text-center break-all max-w-[150px] text-gray-600">
            {window.location.href}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;