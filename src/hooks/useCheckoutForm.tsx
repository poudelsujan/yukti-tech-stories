
import { useState, useEffect } from 'react';
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
    country: 'Nepal'
  });
  const [productDiscountApplied, setProductDiscountApplied] = useState<any>(null);
  const [productDiscountAmount, setProductDiscountAmount] = useState(0);
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const {
    discountCode,
    setDiscountCode,
    appliedDiscount,
    discountAmount: manualDiscountAmount,
    validateDiscount
  } = useDiscountValidation(subtotal);

  const {
    paymentMethod,
    setPaymentMethod,
    qrScreenshot,
    transactionId,
    setTransactionId,
    handleFileUpload
  } = usePaymentMethod();

  const { loading, submitOrder } = useOrderSubmission();

  // Use the higher discount (product-specific or manual)
  const finalDiscountAmount = Math.max(productDiscountAmount, manualDiscountAmount);
  const finalAppliedDiscount = finalDiscountAmount === productDiscountAmount ? productDiscountApplied : appliedDiscount;
  
  const total = Math.max(0, subtotal - finalDiscountAmount);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductDiscountApplied = (discount: any, amount: number) => {
    setProductDiscountApplied(discount);
    setProductDiscountAmount(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Include delivery location in the order
    const orderData = {
      ...formData,
      deliveryLocation
    };
    
    await submitOrder(
      cartItems,
      orderData,
      subtotal,
      finalDiscountAmount,
      finalAppliedDiscount,
      total,
      paymentMethod,
      transactionId,
      qrScreenshot,
      onOrderComplete
    );
  };

  return {
    loading,
    discountCode,
    setDiscountCode,
    appliedDiscount: finalAppliedDiscount,
    paymentMethod,
    setPaymentMethod,
    qrScreenshot,
    transactionId,
    setTransactionId,
    formData,
    updateFormData,
    subtotal,
    discountAmount: finalDiscountAmount,
    total,
    validateDiscount,
    handleFileUpload,
    handleSubmit,
    handleProductDiscountApplied,
    deliveryLocation,
    setDeliveryLocation
  };
};
