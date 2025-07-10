
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileImage, X } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface CheckoutFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  orderItems: any[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentMethod: string;
  requiresPaymentScreenshot: boolean;
}

const CheckoutForm = ({
  onSubmit,
  loading,
  orderItems,
  subtotal,
  discountAmount,
  shippingCost,
  totalAmount,
  paymentMethod,
  requiresPaymentScreenshot
}: CheckoutFormProps) => {
  const { toast } = useToast();
  const { uploadToStorage, uploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Pakistan'
    },
    deliveryNotes: ''
  });

  // Handle screenshot file (don't upload immediately)
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const handleScreenshotSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)."
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB."
      });
      return;
    }

    setScreenshotFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshotPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.customerName || !formData.customerEmail) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields."
      });
      return;
    }

    if (requiresPaymentScreenshot && !screenshotFile) {
      toast({
        variant: "destructive",
        title: "Payment Screenshot Required",
        description: "Please upload a payment screenshot for this payment method."
      });
      return;
    }

    try {
      let screenshotUrl = null;

      // Upload screenshot only when submitting
      if (screenshotFile) {
        const fileName = `payment-${Date.now()}-${Math.random().toString(36).substring(2)}.${screenshotFile.name.split('.').pop()}`;
        const filePath = `payments/${fileName}`;
        
        screenshotUrl = await uploadToStorage(screenshotFile, 'payment-screenshots', filePath);
        
        if (!screenshotUrl) {
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Failed to upload payment screenshot. Please try again."
          });
          return;
        }
      }

      // Prepare order data
      const orderData = {
        ...formData,
        qrScreenshotUrl: screenshotUrl,
        orderItems,
        subtotal,
        discountAmount,
        shippingCost,
        totalAmount,
        paymentMethod
      };

      await onSubmit(orderData);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Failed to submit order. Please try again."
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Shipping Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.shippingAddress.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    shippingAddress: {...formData.shippingAddress, street: e.target.value}
                  })}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.shippingAddress.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    shippingAddress: {...formData.shippingAddress, city: e.target.value}
                  })}
                />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.shippingAddress.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    shippingAddress: {...formData.shippingAddress, state: e.target.value}
                  })}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">Zip/Postal Code</Label>
                <Input
                  id="zipCode"
                  value={formData.shippingAddress.zipCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    shippingAddress: {...formData.shippingAddress, zipCode: e.target.value}
                  })}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.shippingAddress.country}
                  onChange={(e) => setFormData({
                    ...formData,
                    shippingAddress: {...formData.shippingAddress, country: e.target.value}
                  })}
                />
              </div>
            </div>
          </div>

          {/* Payment Screenshot Upload */}
          {requiresPaymentScreenshot && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Payment Verification</h3>
              <div>
                <Label htmlFor="screenshot">Payment Screenshot *</Label>
                <div className="mt-2">
                  <Input
                    ref={fileInputRef}
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotSelect}
                    className="hidden"
                  />
                  
                  {!screenshotPreview ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-dashed border-2 flex flex-col items-center justify-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Click to upload payment screenshot
                      </span>
                      <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
                    </Button>
                  ) : (
                    <div className="relative">
                      <img
                        src={screenshotPreview}
                        alt="Payment Screenshot"
                        className="w-full max-w-md h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeScreenshot}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Badge className="absolute bottom-2 left-2">
                        <FileImage className="h-3 w-3 mr-1" />
                        {screenshotFile?.name}
                      </Badge>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Please upload a clear screenshot of your payment confirmation
                </p>
              </div>
            </div>
          )}

          {/* Delivery Notes */}
          <div>
            <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
            <Textarea
              id="deliveryNotes"
              value={formData.deliveryNotes}
              onChange={(e) => setFormData({...formData, deliveryNotes: e.target.value})}
              placeholder="Any special delivery instructions..."
              rows={3}
            />
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>Rs. {shippingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>Rs. {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || uploading}
            size="lg"
          >
            {loading ? 'Processing Order...' : uploading ? 'Uploading Screenshot...' : 'Place Order'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;
