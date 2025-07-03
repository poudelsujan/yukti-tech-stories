
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Package, ExternalLink, Calculator } from 'lucide-react';

interface PreOrderFormData {
  item_name: string;
  product_link: string;
  category: string;
  original_price: number;
  quantity: number;
  description: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

const PreOrderForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [formData, setFormData] = useState<PreOrderFormData>({
    item_name: '',
    product_link: '',
    category: '',
    original_price: 0,
    quantity: 1,
    description: '',
    customer_name: '',
    customer_email: user?.email || '',
    customer_phone: ''
  });

  const categories = [
    'Electronics',
    'Clothing & Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Health & Beauty',
    'Automotive',
    'Industrial Equipment',
    'Toys & Games',
    'Books & Media',
    'Other'
  ];

  const updateFormData = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateEstimatedCost = async () => {
    if (!formData.original_price || !formData.category || !formData.quantity) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in price, category, and quantity to calculate cost."
      });
      return;
    }

    setCalculating(true);
    
    // Simulate cost calculation based on category and price
    await new Promise(resolve => setTimeout(resolve, 2000));

    const basePrice = formData.original_price * formData.quantity;
    
    // Category-based cost multipliers for Nepal import
    const categoryMultipliers: Record<string, number> = {
      'Electronics': 1.8,
      'Clothing & Fashion': 1.5,
      'Home & Garden': 1.6,
      'Sports & Outdoors': 1.7,
      'Health & Beauty': 1.9,
      'Automotive': 2.2,
      'Industrial Equipment': 2.0,
      'Toys & Games': 1.4,
      'Books & Media': 1.3,
      'Other': 1.6
    };

    const multiplier = categoryMultipliers[formData.category] || 1.6;
    const shippingRate = 0.2;
    const estimatedUSD = basePrice * multiplier;
    const shippingCost = basePrice * shippingRate;
    const totalUSD = estimatedUSD + shippingCost;
    const exchangeRate = 133;
    const totalNPR = Math.round(totalUSD * exchangeRate);

    setEstimatedCost(totalNPR);
    setCalculating(false);

    toast({
      title: "Cost Calculated",
      description: `Estimated total cost: Rs. ${totalNPR.toLocaleString()}`
    });
  };

  const generatePreOrderId = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PO-${timestamp.slice(-6)}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to submit a pre-order request."
      });
      return;
    }

    setLoading(true);

    try {
      const preOrderId = generatePreOrderId();
      const preOrderData = {
        id: preOrderId,
        user_id: user.id,
        item_name: formData.item_name,
        product_link: formData.product_link,
        category: formData.category,
        original_price: formData.original_price,
        quantity: formData.quantity,
        description: formData.description,
        estimated_cost_npr: estimatedCost,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        status: 'pending_quote',
        created_at: new Date().toISOString()
      };

      // Store in localStorage for now (since we don't have the pre_orders table yet)
      const existingOrders = JSON.parse(localStorage.getItem('preOrders') || '[]');
      existingOrders.push(preOrderData);
      localStorage.setItem('preOrders', JSON.stringify(existingOrders));

      toast({
        title: "Pre-order Request Submitted!",
        description: `Your pre-order ID: ${preOrderId}. We'll contact you with a detailed quote within 24 hours.`
      });

      // Reset form
      setFormData({
        item_name: '',
        product_link: '',
        category: '',
        original_price: 0,
        quantity: 1,
        description: '',
        customer_name: '',
        customer_email: user?.email || '',
        customer_phone: ''
      });
      setEstimatedCost(null);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Failed to submit pre-order request"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please sign in to submit a pre-order request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          International Pre-Order Request
        </CardTitle>
        <CardDescription>
          Request a quote for products from Alibaba, eBay, Made in China, and other international platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item_name">Product Name *</Label>
              <Input
                id="item_name"
                value={formData.item_name}
                onChange={(e) => updateFormData('item_name', e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_link">Product Link *</Label>
            <div className="flex gap-2">
              <Input
                id="product_link"
                type="url"
                value={formData.product_link}
                onChange={(e) => updateFormData('product_link', e.target.value)}
                placeholder="https://www.alibaba.com/product/..."
                required
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="original_price">Original Price (USD) *</Label>
              <Input
                id="original_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.original_price}
                onChange={(e) => updateFormData('original_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => updateFormData('quantity', parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Product Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Additional details about the product, specifications, color preferences, etc."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={calculateEstimatedCost}
              disabled={calculating}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              {calculating ? 'Calculating...' : 'Calculate Cost'}
            </Button>
            {estimatedCost && (
              <div className="flex items-center text-green-600 font-medium px-3 py-2 bg-green-50 rounded">
                Estimated: Rs. {estimatedCost.toLocaleString()}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Full Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => updateFormData('customer_name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_phone">Phone Number *</Label>
                <Input
                  id="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => updateFormData('customer_phone', e.target.value)}
                  placeholder="+977-XXXXXXXXXX"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="customer_email">Email Address *</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => updateFormData('customer_email', e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting Request...' : 'Submit Pre-Order Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PreOrderForm;
