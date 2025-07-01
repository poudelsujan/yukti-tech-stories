
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CartItem, CheckoutFormData, DiscountCode } from '@/types/checkout';

export const useOrderSubmission = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const submitOrder = async (
    cartItems: CartItem[],
    formData: CheckoutFormData & { deliveryLocation?: { lat: number; lng: number; address: string } | null },
    subtotal: number,
    discountAmount: number,
    appliedDiscount: DiscountCode | null,
    total: number,
    paymentMethod: string,
    transactionId: string,
    qrScreenshot: File | null,
    onOrderComplete: () => void
  ) => {
    setLoading(true);

    if (paymentMethod === 'qr' && (!qrScreenshot || !transactionId)) {
      toast({
        variant: "destructive",
        title: "Missing Payment Information",
        description: "Please upload QR payment screenshot and enter transaction ID."
      });
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        user_id: user?.id || null,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        shipping_address: {
          address: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
          country: formData.country
        },
        delivery_location: formData.deliveryLocation || null,
        order_items: cartItems as any,
        subtotal: subtotal,
        discount_amount: discountAmount,
        discount_code: appliedDiscount?.code || null,
        total_amount: total,
        payment_method: paymentMethod,
        transaction_id: transactionId || null,
        payment_status: paymentMethod === 'qr' ? 'pending_verification' : 'pending'
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      // Update discount usage if applied
      if (appliedDiscount) {
        await supabase
          .from('discount_codes')
          .update({ current_uses: appliedDiscount.current_uses + 1 })
          .eq('id', appliedDiscount.id);
      }

      // Add initial order status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: data.id,
          status: 'processing',
          notes: 'Order placed successfully'
        });

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${data.id.slice(0, 8)} has been placed. ${paymentMethod === 'qr' ? 'Payment verification is pending.' : 'You will receive a confirmation email shortly.'}`
      });

      onOrderComplete();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submitOrder
  };
};
