
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
    qrScreenshotUrl: string | null,
    onOrderComplete: () => void
  ) => {
    setLoading(true);

    // Enhanced validation for QR payment
    if (paymentMethod === 'qr') {
      if (!transactionId.trim()) {
        toast({
          variant: "destructive",
          title: "Missing Transaction ID",
          description: "Please enter the transaction ID from your payment."
        });
        setLoading(false);
        return;
      }
      
      if (!qrScreenshot || !qrScreenshotUrl) {
        toast({
          variant: "destructive",
          title: "Missing Payment Screenshot",
          description: "Please upload a screenshot of your QR payment."
        });
        setLoading(false);
        return;
      }
    }

    try {
      console.log('Submitting order with payment method:', paymentMethod);
      console.log('Transaction ID:', transactionId);
      console.log('QR Screenshot URL:', qrScreenshotUrl);

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
        qr_screenshot_url: qrScreenshotUrl || null,
        payment_status: paymentMethod === 'qr' ? 'pending_verification' : 'pending'
      };

      console.log('Order data prepared:', orderData);

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Order created successfully:', data);

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

      // Create admin notification using raw SQL to avoid type issues
      try {
        await supabase.rpc('create_admin_notification', {
          p_title: 'New Order Received',
          p_message: `New order #${data.id.slice(0, 8)} from ${formData.customer_name} - Rs. ${total.toLocaleString()}`,
          p_type: 'info',
          p_related_id: data.id,
          p_related_type: 'order'
        });
      } catch (notificationError) {
        console.warn('Failed to create admin notification:', notificationError);
        // Don't fail the order if notification fails
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${data.id.slice(0, 8)} has been placed. ${paymentMethod === 'qr' ? 'Payment verification is pending.' : 'You will receive a confirmation email shortly.'}`
      });

      onOrderComplete();
    } catch (error: any) {
      console.error('Order submission error:', error);
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
