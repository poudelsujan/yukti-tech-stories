
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DiscountCode } from '@/types/checkout';

export const useDiscountValidation = (subtotal: number) => {
  const { toast } = useToast();
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);

  const discountAmount = appliedDiscount ? 
    (appliedDiscount.discount_type === 'percentage' ? 
      (subtotal * appliedDiscount.discount_value / 100) : 
      appliedDiscount.discount_value) : 0;

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

  return {
    discountCode,
    setDiscountCode,
    appliedDiscount,
    discountAmount,
    validateDiscount
  };
};
