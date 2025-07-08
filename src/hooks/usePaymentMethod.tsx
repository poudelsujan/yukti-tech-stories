
import { useState } from 'react';
import { useImageUpload } from './useImageUpload';

export const usePaymentMethod = () => {
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [qrScreenshot, setQrScreenshot] = useState<File | null>(null);
  const [qrScreenshotUrl, setQrScreenshotUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const { uploadToStorage, uploading } = useImageUpload();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        console.error('Invalid file type. Please upload an image file.');
        return;
      }
      
      // Validate file size (max 5MB before compression)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        console.error('File size too large. Please upload a file smaller than 5MB.');
        return;
      }
      
      setQrScreenshot(file);
      console.log('QR Screenshot selected:', file.name, 'Size:', file.size, 'Type:', file.type);

      // Upload to storage
      const timestamp = Date.now();
      const fileName = `payment_${timestamp}_${file.name}`;
      const uploadedUrl = await uploadToStorage(file, 'payment-screenshots', fileName);
      
      if (uploadedUrl) {
        setQrScreenshotUrl(uploadedUrl);
        console.log('Payment screenshot uploaded successfully:', uploadedUrl);
      }
    }
  };

  const resetPaymentData = () => {
    setQrScreenshot(null);
    setQrScreenshotUrl(null);
    setTransactionId('');
  };

  return {
    paymentMethod,
    setPaymentMethod,
    qrScreenshot,
    qrScreenshotUrl,
    transactionId,
    setTransactionId,
    handleFileUpload,
    resetPaymentData,
    uploading
  };
};
