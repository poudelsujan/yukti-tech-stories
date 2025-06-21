
import { useState } from 'react';

export const usePaymentMethod = () => {
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [qrScreenshot, setQrScreenshot] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrScreenshot(file);
    }
  };

  return {
    paymentMethod,
    setPaymentMethod,
    qrScreenshot,
    transactionId,
    setTransactionId,
    handleFileUpload
  };
};
