
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDiscountValidation } from '@/hooks/useDiscountValidation';
import { usePaymentMethod } from '@/hooks/usePaymentMethod';
import { useOrderSubmission } from '@/hooks/useOrderSubmission';
import { CartItem, CheckoutFormData } from '@/types/checkout';

export const useCheckoutForm = (cartItems: CartItem[], onOrderComplete: () => void) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CheckoutFormData>({
    customer_name: '',
    customer_email: user?.email || '',
    customer_phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Pakistan'
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const {
    discountCode,
    setDiscountCode,
    appliedDiscount,
    discountAmount,
    validateDiscount
  } = useDiscountValidation(subtotal);

  const {
    paymentMethod,
    setPaymentMethod,
    transactionId,
    setTransactionId,
    handleFileUpload
  } = usePaymentMethod();

  const { loading, submitOrder } = useOrderSubmission();

  const total = Math.max(0, subtotal - discountAmount);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitOrder(
      cartItems,
      formData,
      subtotal,
      discountAmount,
      appliedDiscount,
      total,
      paymentMethod,
      transactionId,
      null, // qrScreenshot is handled internally in usePaymentMethod
      onOrderComplete
    );
  };

  return {
    loading,
    discountCode,
    setDiscountCode,
    appliedDiscount,
    paymentMethod,
    setPaymentMethod,
    transactionId,
    setTransactionId,
    formData,
    updateFormData,
    subtotal,
    discountAmount,
    total,
    validateDiscount,
    handleFileUpload,
    handleSubmit
  };
};
