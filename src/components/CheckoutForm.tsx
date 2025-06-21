import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard } from 'lucide-react';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import DiscountSection from '@/components/checkout/DiscountSection';
import CustomerInfoForm from '@/components/checkout/CustomerInfoForm';
import ShippingAddressForm from '@/components/checkout/ShippingAddressForm';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import { CartItem } from '@/types/checkout';

interface CheckoutFormProps {
  cartItems: CartItem[];
  onOrderComplete: () => void;
}

const CheckoutForm = ({ cartItems, onOrderComplete }: CheckoutFormProps) => {
  const {
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
  } = useCheckoutForm(cartItems, onOrderComplete);

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600">Add some products to your cart to proceed with checkout.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Order Summary */}
      <OrderSummary 
        cartItems={cartItems}
        subtotal={subtotal}
        discountAmount={discountAmount}
        total={total}
        appliedDiscount={appliedDiscount}
      />

      {/* Checkout Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing & Payment
          </CardTitle>
          <CardDescription>Please fill in your details to complete the order</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Information */}
            <CustomerInfoForm formData={formData} onChange={updateFormData} />

            <Separator />

            {/* Shipping Address */}
            <ShippingAddressForm formData={formData} onChange={updateFormData} />

            <Separator />

            {/* Discount Code */}
            <DiscountSection 
              discountCode={discountCode}
              setDiscountCode={setDiscountCode}
              onValidateDiscount={validateDiscount}
            />

            <Separator />

            {/* Payment Method */}
            <PaymentMethodSelector 
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              transactionId={transactionId}
              setTransactionId={setTransactionId}
              onFileUpload={handleFileUpload}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing Order...' : `Place Order - Rs. ${total.toLocaleString()}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutForm;
