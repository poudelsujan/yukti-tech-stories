
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, DiscountCode } from '@/types/checkout';

interface ProductDiscountHandlerProps {
  cartItems: CartItem[];
  onDiscountApplied: (discount: DiscountCode, amount: number) => void;
  subtotal: number;
}

const ProductDiscountHandler = ({ cartItems, onDiscountApplied, subtotal }: ProductDiscountHandlerProps) => {
  const [productDiscounts, setProductDiscounts] = useState<any[]>([]);

  useEffect(() => {
    loadProductDiscounts();
  }, [cartItems]);

  const loadProductDiscounts = async () => {
    if (cartItems.length === 0) return;

    try {
      const productIds = cartItems.map(item => item.id);
      
      const { data, error } = await supabase
        .from('product_discounts')
        .select(`
          *,
          discount_codes (*)
        `)
        .in('product_id', productIds);

      if (error) {
        console.error('Error loading product discounts:', error);
        return;
      }

      // Find the best discount for products in cart
      let bestDiscount: any = null;
      let bestDiscountAmount = 0;

      data?.forEach(productDiscount => {
        const discountCode = productDiscount.discount_codes;
        if (!discountCode?.active) return;

        // Check if discount is still valid
        const now = new Date();
        if (discountCode.valid_until && new Date(discountCode.valid_until) < now) return;
        if (discountCode.max_uses && discountCode.current_uses >= discountCode.max_uses) return;
        if (discountCode.min_order_amount && subtotal < discountCode.min_order_amount) return;

        // Calculate discount amount
        const discountAmount = discountCode.discount_type === 'percentage' 
          ? (subtotal * discountCode.discount_value / 100)
          : discountCode.discount_value;

        if (discountAmount > bestDiscountAmount) {
          bestDiscount = discountCode;
          bestDiscountAmount = discountAmount;
        }
      });

      if (bestDiscount && bestDiscountAmount > 0) {
        onDiscountApplied({
          ...bestDiscount,
          discount_type: bestDiscount.discount_type as 'percentage' | 'fixed'
        }, bestDiscountAmount);
      }

      setProductDiscounts(data || []);
    } catch (error) {
      console.error('Error loading product discounts:', error);
    }
  };

  return null; // This is a logic-only component
};

export default ProductDiscountHandler;
