
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
import { Package, ExternalLink, Calculator, Plus, X, Eye } from 'lucide-react';

interface PreOrderItem {
  item_name: string;
  product_link: string;
  category: string;
  original_price: number;
  quantity: number;
  description: string;
  image?: File;
}

interface PreOrderFormData {
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
  const [showPreview, setShowPreview] = useState(false);
  
  const [items, setItems] = useState<PreOrderItem[]>([{
    item_name: '',
    product_link: '',
    category: '',
    original_price: 0,
    quantity: 1,
    description: '',
  }]);

  const [formData, setFormData] = useState<PreOrderFormData>({
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

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: string, value: string | number | File) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      item_name: '',
      product_link: '',
      category: '',
      original_price: 0,
      quantity: 1,
      description: '',
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateEstimatedCost = async () => {
    const validItems = items.filter(item => item.original_price && item.category && item.quantity);
    
    if (validItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in price, category, and quantity for at least one item."
      });
      return;
    }

    setCalculating(true);
    
    // Simulate cost calculation
    await new Promise(resolve => setTimeout(resolve, 2000));

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

    let totalEstimated = 0;
    validItems.forEach(item => {
      const basePrice = item.original_price * item.quantity;
      const multiplier = categoryMultipliers[item.category] || 1.6;
      const itemCost = basePrice * multiplier * 1.2; // Adding 20% for shipping
      totalEstimated += itemCost;
    });

    const exchangeRate = 133;
    const totalNPR = Math.round(totalEstimated * exchangeRate);

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

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalValue = () => {
    return items.reduce((total, item) => total + (item.original_price * item.quantity), 0);
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

    const validItems = items.filter(item => item.item_name && item.product_link && item.category && item.original_price);
    
    if (validItems.length === 0) {
      toast({
        variant: "destructive",
        title: "No Valid Items",
        description: "Please add at least one complete item to your pre-order."
      });
      return;
    }

    setLoading(true);

    try {
      const preOrderId = generatePreOrderId();
      const preOrderData = {
        id: preOrderId,
        user_id: user.id,
        items: validItems,
        total_items: getTotalItems(),
        total_value_usd: getTotalValue(),
        estimated_cost_npr: estimatedCost,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        status: 'pending_quote',
        created_at: new Date().toISOString()
      };

      // Store in localStorage for now
      const existingOrders = JSON.parse(localStorage.getItem('preOrders') || '[]');
      existingOrders.push(preOrderData);
      localStorage.setItem('preOrders', JSON.stringify(existingOrders));

      toast({
        title: "Pre-order Request Submitted!",
        description: `Your pre-order ID: ${preOrderId}. We'll contact you with a detailed quote within 24 hours.`
      });

      // Reset form
      setItems([{
        item_name: '',
        product_link: '',
        category: '',
        original_price: 0,
        quantity: 1,
        description: '',
      }]);
      setFormData({
        customer_name: '',
        customer_email: user?.email || '',
        customer_phone: ''
      });
      setEstimatedCost(null);
      setShowPreview(false);

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

  if (showPreview) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Pre-Order Preview
          </CardTitle>
          <CardDescription>
            Review your pre-order before submitting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Total Items: {getTotalItems()}</div>
                  <div>Total Value: ${getTotalValue().toFixed(2)}</div>
                  {estimatedCost && (
                    <div className="col-span-2 font-semibold text-green-600">
                      Estimated Cost: Rs. {estimatedCost.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Items ({items.length})</h3>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium">{item.item_name || `Item ${index + 1}`}</h4>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p>Category: {item.category}</p>
                      <p>Price: ${item.original_price} × {item.quantity}</p>
                      <p>Link: <a href={item.product_link} target="_blank" className="text-blue-600 hover:underline">View Product</a></p>
                      {item.description && <p>Notes: {item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <p>Name: {formData.customer_name}</p>
                <p>Email: {formData.customer_email}</p>
                <p>Phone: {formData.customer_phone}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setShowPreview(false)} variant="outline">
                Back to Edit
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? 'Submitting...' : 'Confirm & Submit Pre-Order'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Items ({items.length})</h3>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-6">
              {items.map((item, index) => (
                <Card key={index} className="relative">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Item {index + 1}</CardTitle>
                      {items.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`item_name_${index}`}>Product Name *</Label>
                        <Input
                          id={`item_name_${index}`}
                          value={item.item_name}
                          onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                          placeholder="Enter product name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`category_${index}`}>Category *</Label>
                        <Select value={item.category} onValueChange={(value) => updateItem(index, 'category', value)}>
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
                      <Label htmlFor={`product_link_${index}`}>Product Link *</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`product_link_${index}`}
                          type="url"
                          value={item.product_link}
                          onChange={(e) => updateItem(index, 'product_link', e.target.value)}
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
                        <Label htmlFor={`original_price_${index}`}>Original Price (USD) *</Label>
                        <Input
                          id={`original_price_${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.original_price}
                          onChange={(e) => updateItem(index, 'original_price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`quantity_${index}`}>Quantity *</Label>
                        <Input
                          id={`quantity_${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`description_${index}`}>Product Description</Label>
                      <Textarea
                        id={`description_${index}`}
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Additional details about the product..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`image_${index}`}>Product Image (Optional)</Label>
                      <Input
                        id={`image_${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) updateItem(index, 'image', file);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cost Calculator */}
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={calculateEstimatedCost}
              disabled={calculating}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              {calculating ? 'Calculating...' : 'Calculate Total Cost'}
            </Button>
            {estimatedCost && (
              <div className="flex items-center text-green-600 font-medium px-3 py-2 bg-green-50 rounded">
                Estimated: Rs. {estimatedCost.toLocaleString()}
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="border-t pt-6">
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

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowPreview(true)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Order
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Submitting Request...' : 'Submit Pre-Order Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PreOrderForm;
