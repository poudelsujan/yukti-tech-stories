import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Percent } from 'lucide-react';
import { CartItem, DiscountCode } from '@/types/checkout';

interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  appliedDiscount: DiscountCode | null;
}

const OrderSummary = ({ 
  cartItems, 
  subtotal, 
  discountAmount, 
  total, 
  appliedDiscount 
}: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-4">
            <img 
              src={item.image_url || '/placeholder.svg'} 
              alt={item.title}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</p>
            </div>
          </div>
        ))}

        <Separator />

        {appliedDiscount && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <Percent className="h-4 w-4" />
            Discount applied: {appliedDiscount.code}
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>Rs. {subtotal.toLocaleString()}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-Rs. {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
