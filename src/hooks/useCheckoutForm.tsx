
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

export const useCheckoutForm = (cartItems: CartItem[], onOrderComplete: () => void) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [qrScreenshot, setQrScreenshot] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: user?.email || '',
    customer_phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Pakistan'
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = appliedDiscount ? 
    (appliedDiscount.discount_type === 'percentage' ? 
      (subtotal * appliedDiscount.discount_value / 100) : 
      appliedDiscount.discount_value) : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateDiscount = async () => {
    if (!discountCode.trim()) {
      setAppliedDiscount(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('active', true)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Invalid Discount Code",
          description: "The discount code you entered is not valid or has expired."
        });
        setAppliedDiscount(null);
        return;
      }

      // Check if discount is still valid
      const now = new Date();
      if (data.valid_until && new Date(data.valid_until) < now) {
        toast({
          variant: "destructive",
          title: "Discount Expired",
          description: "This discount code has expired."
        });
        setAppliedDiscount(null);
        return;
      }

      // Check usage limits
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast({
          variant: "destructive",
          title: "Discount Limit Reached",
          description: "This discount code has reached its usage limit."
        });
        setAppliedDiscount(null);
        return;
      }

      // Check minimum order amount
      if (data.min_order_amount && subtotal < data.min_order_amount) {
        toast({
          variant: "destructive",
          title: "Minimum Order Not Met",
          description: `This discount requires a minimum order of Rs. ${data.min_order_amount}.`
        });
        setAppliedDiscount(null);
        return;
      }

      setAppliedDiscount(data);
      toast({
        title: "Discount Applied!",
        description: `You saved Rs. ${discountAmount.toFixed(2)}`
      });
    } catch (error) {
      console.error('Error validating discount:', error);
      setAppliedDiscount(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrScreenshot(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
