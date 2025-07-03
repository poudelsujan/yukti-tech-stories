
import { useState } from 'react';

export const usePaymentMethod = () => {
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [qrScreenshot, setQrScreenshot] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        console.error('Invalid file type. Please upload an image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        console.error('File size too large. Please upload a file smaller than 5MB.');
        return;
      }
      
      setQrScreenshot(file);
      console.log('QR Screenshot uploaded:', file.name, 'Size:', file.size, 'Type:', file.type);
    }
  };

  const resetPaymentData = () => {
    setQrScreenshot(null);
    setTransactionId('');
  };

  return {
    paymentMethod,
    setPaymentMethod,
    qrScreenshot,
    transactionId,
    setTransactionId,
    handleFileUpload,
    resetPaymentData
  };
};
