
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, Package, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';

interface PreOrderQuoteProps {
  preOrder: {
    id: string;
    item_name?: string;
    items?: any[];
    product_link?: string;
    category?: string;
    original_price?: number;
    quantity?: number;
    total_items?: number;
    total_value_usd?: number;
    estimated_cost_npr: number | null;
    status: string;
    quoted_price?: number;
    admin_notes?: string;
    created_at: string;
  };
  onQuoteAction: (action: 'accept' | 'reject', installmentPlan?: any) => void;
  isUser?: boolean;
}

const PreOrderQuote = ({ preOrder, onQuoteAction, isUser = false }: PreOrderQuoteProps) => {
  const { toast } = useToast();
  const [installmentMonths, setInstallmentMonths] = useState(3);
  const [downPayment, setDownPayment] = useState(preOrder.quoted_price ? preOrder.quoted_price * 0.3 : 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_quote': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'quote_accepted': return 'bg-green-100 text-green-800';
      case 'quote_rejected': return 'bg-red-100 text-red-800';
      case 'payment_pending': return 'bg-orange-100 text-orange-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateInstallmentPlan = () => {
    if (!preOrder.quoted_price) return null;
    
    const totalPrice = preOrder.quoted_price;
    const remainingAmount = totalPrice - downPayment;
    const monthlyPayment = remainingAmount / installmentMonths;
    
    return {
      totalPrice,
      downPayment,
      remainingAmount,
      monthlyPayment: Math.round(monthlyPayment),
      installmentMonths
    };
  };

  const handleAcceptQuote = () => {
    const installmentPlan = calculateInstallmentPlan();
    
    // Update status in localStorage
    const existingOrders = JSON.parse(localStorage.getItem('preOrders') || '[]');
    const updatedOrders = existingOrders.map((order: any) => 
      order.id === preOrder.id 
        ? { ...order, status: 'quote_accepted', installment_plan: installmentPlan }
        : order
    );
    localStorage.setItem('preOrders', JSON.stringify(updatedOrders));
    
    onQuoteAction('accept', installmentPlan);
    toast({
      title: "Quote Accepted",
      description: "Your pre-order quote has been accepted. Proceed with payment."
    });
  };

  const handleRejectQuote = () => {
    // Update status in localStorage
    const existingOrders = JSON.parse(localStorage.getItem('preOrders') || '[]');
    const updatedOrders = existingOrders.map((order: any) => 
      order.id === preOrder.id 
        ? { ...order, status: 'quote_rejected' }
        : order
    );
    localStorage.setItem('preOrders', JSON.stringify(updatedOrders));
    
    onQuoteAction('reject');
    toast({
      title: "Quote Rejected",
      description: "The pre-order quote has been rejected."
    });
  };

  const installmentPlan = calculateInstallmentPlan();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Pre-Order Quote - {preOrder.id}
        </CardTitle>
        <Badge className={getStatusColor(preOrder.status)}>
          {preOrder.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Order Details</h4>
            <div className="space-y-2 text-sm">
              {preOrder.items ? (
                <>
                  <p><strong>Items:</strong> {preOrder.items.length} products</p>
                  <p><strong>Total Quantity:</strong> {preOrder.total_items}</p>
                  <p><strong>Total Value:</strong> ${preOrder.total_value_usd?.toFixed(2)}</p>
                </>
              ) : (
                <>
                  <p><strong>Product:</strong> {preOrder.item_name}</p>
                  <p><strong>Category:</strong> {preOrder.category}</p>
                  <p><strong>Quantity:</strong> {preOrder.quantity}</p>
                  <p><strong>Original Price:</strong> ${preOrder.original_price}</p>
                </>
              )}
              <p className="text-xs text-gray-500">
                Request created on {new Date(preOrder.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {preOrder.status === 'quoted' && preOrder.quoted_price && (
            <div>
              <h4 className="font-medium mb-2">Quote Details</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Quoted Price:</strong> Rs. {preOrder.quoted_price.toLocaleString()}</p>
                {preOrder.admin_notes && (
                  <p><strong>Notes:</strong> {preOrder.admin_notes}</p>
                )}
                <p className="text-xs text-gray-500">
                  Quote valid for 7 days
                </p>
              </div>
            </div>
          )}
        </div>

        {preOrder.items && preOrder.items.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Items List</h4>
            <div className="space-y-2">
              {preOrder.items.map((item: any, index: number) => (
                <div key={index} className="text-sm bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                  <p className="font-medium">{item.item_name}</p>
                  <p>Category: {item.category} | Price: ${item.original_price} × {item.quantity}</p>
                  <a 
                    href={item.product_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    View Product <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {preOrder.status === 'quoted' && preOrder.quoted_price && isUser && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Plan (Post-Delivery Installments)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="downPayment">Down Payment (Rs.)</Label>
                <Input
                  id="downPayment"
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  min={preOrder.quoted_price * 0.2}
                  max={preOrder.quoted_price * 0.5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 20%, Maximum 50% of total price
                </p>
              </div>
              
              <div>
                <Label htmlFor="installmentMonths">Installment Months (After Delivery)</Label>
                <Input
                  id="installmentMonths"
                  type="number"
                  value={installmentMonths}
                  onChange={(e) => setInstallmentMonths(Number(e.target.value))}
                  min={2}
                  max={12}
                />
                <p className="text-xs text-gray-500 mt-1">
                  2-12 months after delivery
                </p>
              </div>
            </div>

            {installmentPlan && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h5 className="font-medium mb-2">Payment Structure</h5>
                <div className="space-y-1 text-sm">
                  <p><strong>Total Price:</strong> Rs. {installmentPlan.totalPrice.toLocaleString()}</p>
                  <p><strong>Down Payment (Before Order):</strong> Rs. {installmentPlan.downPayment.toLocaleString()}</p>
                  <p><strong>Remaining Balance:</strong> Rs. {installmentPlan.remainingAmount.toLocaleString()}</p>
                  <p><strong>Monthly Payment (After Delivery):</strong> Rs. {installmentPlan.monthlyPayment.toLocaleString()} × {installmentPlan.installmentMonths} months</p>
                  <p className="text-blue-700 text-xs mt-2">
                    * Installment payments will begin after successful delivery
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleAcceptQuote} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Quote & Payment Plan
              </Button>
              <Button onClick={handleRejectQuote} variant="outline">
                <XCircle className="h-4 w-4 mr-2" />
                Reject Quote
              </Button>
            </div>
          </div>
        )}

        {preOrder.status === 'quote_accepted' && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800 font-medium">Quote Accepted!</p>
            <p className="text-green-700 text-sm mt-1">
              Your quote has been accepted. We will contact you for down payment processing.
            </p>
          </div>
        )}

        {preOrder.status === 'quote_rejected' && (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-800 font-medium">Quote Rejected</p>
            <p className="text-red-700 text-sm mt-1">
              This quote was rejected. You can submit a new pre-order request if needed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreOrderQuote;
