
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentVerificationModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: () => void;
}

const PaymentVerificationModal = ({ order, isOpen, onClose, onVerificationComplete }: PaymentVerificationModalProps) => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPayment = async (approve: boolean) => {
    setIsVerifying(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: approve ? 'completed' : 'failed',
          order_status: approve ? 'confirmed' : 'cancelled'
        })
        .eq('id', order.id);

      if (error) throw error;

      // Add status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: order.id,
          status: approve ? 'confirmed' : 'cancelled',
          notes: `Payment ${approve ? 'verified and approved' : 'rejected'} by admin`
        });

      toast({
        title: "Success",
        description: `Payment ${approve ? 'approved' : 'rejected'} successfully`
      });

      onVerificationComplete();
      onClose();
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update payment status"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Verification - Order #{order?.id?.slice(0, 8)}</DialogTitle>
          <DialogDescription>Review and verify the payment details</DialogDescription>
        </DialogHeader>
        
        {order && (
          <div className="space-y-6">
            {/* Order Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <strong>Customer:</strong> {order.customer_name}
              </div>
              <div>
                <strong>Amount:</strong> Rs. {order.total_amount.toLocaleString()}
              </div>
              <div>
                <strong>Payment Method:</strong> {order.payment_method}
              </div>
              <div>
                <strong>Transaction ID:</strong> {order.transaction_id || 'N/A'}
              </div>
            </div>

            {/* Payment Status */}
            <div className="flex items-center gap-2">
              <strong>Current Status:</strong>
              <Badge variant={order.payment_status === 'pending_verification' ? 'secondary' : 'default'}>
                {order.payment_status?.replace('_', ' ')}
              </Badge>
            </div>

            {/* Payment Screenshot Section */}
            {order.payment_method === 'qr' && (
              <div className="space-y-2">
                <strong>Payment Screenshot:</strong>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {order.qr_screenshot_url ? (
                    <div className="space-y-2">
                      <img 
                        src={order.qr_screenshot_url} 
                        alt="Payment Screenshot" 
                        className="max-w-full max-h-64 mx-auto rounded"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <p>No payment screenshot uploaded</p>
                      <p className="text-sm">Customer may need to provide payment proof</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verification Actions */}
            <div className="flex gap-4 pt-4 border-t">
              <Button
                onClick={() => verifyPayment(true)}
                disabled={isVerifying}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Payment
              </Button>
              <Button
                onClick={() => verifyPayment(false)}
                disabled={isVerifying}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Payment
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentVerificationModal;
