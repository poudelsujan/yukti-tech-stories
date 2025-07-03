
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, Clock, CheckCircle, Truck, MapPin } from 'lucide-react';

interface PreOrderTrackingProps {
  preOrder: {
    id: string;
    item_name: string;
    status: string;
    created_at: string;
    quoted_price?: number;
    tracking_number?: string;
    estimated_delivery?: string;
    payment_history?: Array<{
      amount: number;
      date: string;
      type: 'down_payment' | 'installment';
      status: 'completed' | 'pending';
    }>;
    status_history?: Array<{
      status: string;
      date: string;
      notes?: string;
    }>;
  };
}

const PreOrderTracking = ({ preOrder }: PreOrderTrackingProps) => {
  const getStatusProgress = (status: string) => {
    const statusMap: { [key: string]: number } = {
      'pending_quote': 10,
      'quoted': 20,
      'quote_accepted': 30,
      'payment_pending': 40,
      'confirmed': 50,
      'ordered': 60,
      'shipped': 80,
      'delivered': 100
    };
    return statusMap[status] || 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_quote': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'quote_accepted': return 'bg-green-100 text-green-800';
      case 'payment_pending': return 'bg-orange-100 text-orange-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'ordered': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_quote':
      case 'quoted':
        return <Clock className="h-4 w-4" />;
      case 'quote_accepted':
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'ordered':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const statusSteps = [
    { key: 'pending_quote', label: 'Quote Requested', description: 'Waiting for admin review' },
    { key: 'quoted', label: 'Quote Provided', description: 'Review and accept quote' },
    { key: 'quote_accepted', label: 'Quote Accepted', description: 'Quote accepted by customer' },
    { key: 'payment_pending', label: 'Payment Processing', description: 'Processing payment' },
    { key: 'confirmed', label: 'Order Confirmed', description: 'Payment confirmed' },
    { key: 'ordered', label: 'Order Placed', description: 'Order placed with supplier' },
    { key: 'shipped', label: 'Shipped', description: 'Package in transit' },
    { key: 'delivered', label: 'Delivered', description: 'Package delivered' }
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.key === preOrder.status);
  const progress = getStatusProgress(preOrder.status);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pre-Order Tracking - {preOrder.id}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(preOrder.status)}>
              {preOrder.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {preOrder.tracking_number && (
              <Badge variant="outline">
                Tracking: {preOrder.tracking_number}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Order Progress</span>
              <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    isCurrent 
                      ? 'bg-blue-50 border border-blue-200' 
                      : isCompleted 
                        ? 'bg-green-50' 
                        : 'bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    isCurrent 
                      ? 'bg-blue-500 text-white' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                  }`}>
                    {getStatusIcon(step.key)}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-600'
                    }`}>
                      {step.label}
                    </h4>
                    <p className={`text-sm ${
                      isCurrent ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {preOrder.payment_history && preOrder.payment_history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {preOrder.payment_history.map((payment, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {payment.type === 'down_payment' ? 'Down Payment' : `Installment ${index}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Rs. {payment.amount.toLocaleString()}</p>
                    <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {preOrder.estimated_delivery && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>Estimated Delivery: {new Date(preOrder.estimated_delivery).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PreOrderTracking;
