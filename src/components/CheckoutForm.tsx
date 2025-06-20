
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingCart, CreditCard, MapPin, Percent, QrCode, Users } from 'lucide-react';

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

interface CheckoutFormProps {
  cartItems: CartItem[];
  onOrderComplete: () => void;
}

const CheckoutForm = ({ cartItems, onOrderComplete }: CheckoutFormProps) => {
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
        order_items: cartItems as any, // Convert CartItem[] to Json
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

          {/* Discount Code */}
          <div className="space-y-2">
            <Label htmlFor="discount">Discount Code</Label>
            <div className="flex gap-2">
              <Input
                id="discount"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Enter discount code"
              />
              <Button type="button" variant="outline" onClick={validateDiscount}>
                Apply
              </Button>
            </div>
            {appliedDiscount && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Percent className="h-4 w-4" />
                Discount applied: {appliedDiscount.code}
              </div>
            )}
          </div>

          <Separator />

          {/* Pricing */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Full Name</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customer_phone">Phone Number</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Shipping Address */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <h3 className="font-medium">Shipping Address</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Method */}
            <div className="space-y-4">
              <h3 className="font-medium">Payment Method</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="qr" id="qr" />
                  <Label htmlFor="qr" className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Pay Via QR Code
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partner" id="partner" />
                  <Label htmlFor="partner" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Pay Via Partner
                  </Label>
                </div>
              </RadioGroup>

              {/* QR Payment Details */}
              {paymentMethod === 'qr' && (
                <Card className="p-4 bg-blue-50">
                  <div className="space-y-4">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 mx-auto mb-2 text-blue-600" />
                      <h4 className="font-medium">QR Code Payment</h4>
                      <p className="text-sm text-gray-600">Scan our QR code to make payment</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="transaction_id">Transaction ID</Label>
                      <Input
                        id="transaction_id"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter transaction ID from your payment"
                        required={paymentMethod === 'qr'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qr_screenshot">Upload Payment Screenshot</Label>
                      <Input
                        id="qr_screenshot"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        required={paymentMethod === 'qr'}
                      />
                      <p className="text-xs text-gray-500">Upload a screenshot of your successful payment</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Partner Payment Details */}
              {paymentMethod === 'partner' && (
                <Card className="p-4 bg-green-50">
                  <div className="text-center">
                    <Users className="h-16 w-16 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium">Partner Payment</h4>
                    <p className="text-sm text-gray-600">Our partner will contact you for payment arrangements</p>
                  </div>
                </Card>
              )}
            </div>

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
