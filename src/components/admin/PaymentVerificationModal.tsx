
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, Download, ExternalLink } from 'lucide-react';
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
  const [imageViewOpen, setImageViewOpen] = useState(false);

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

      // Create notification
      await supabase
        .from('admin_notifications')
        .insert({
          title: `Payment ${approve ? 'Approved' : 'Rejected'}`,
          message: `Order #${order.id.slice(0, 8)} payment has been ${approve ? 'approved' : 'rejected'}`,
          type: approve ? 'success' : 'warning',
          related_id: order.id,
          related_type: 'order'
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

  const downloadImage = () => {
    if (order.qr_screenshot_url) {
      const link = document.createElement('a');
      link.href = order.qr_screenshot_url;
      link.download = `payment_screenshot_${order.id.slice(0, 8)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <strong>Email:</strong> {order.customer_email}
                </div>
                <div>
                  <strong>Amount:</strong> Rs. {order.total_amount.toLocaleString()}
                </div>
                <div>
                  <strong>Payment Method:</strong> {order.payment_method}
                </div>
                <div className="col-span-2">
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
                <div className="space-y-3">
                  <strong>Payment Screenshot:</strong>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {order.qr_screenshot_url ? (
                      <div className="space-y-3">
                        <img 
                          src={order.qr_screenshot_url} 
                          alt="Payment Screenshot" 
                          className="max-w-full max-h-64 mx-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setImageViewOpen(true)}
                        />
                        <div className="flex gap-2 justify-center flex-wrap">
                          <Button variant="outline" size="sm" onClick={() => setImageViewOpen(true)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Size
                          </Button>
                          <Button variant="outline" size="sm" onClick={downloadImage}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={order.qr_screenshot_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open in New Tab
                            </a>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
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
                  {isVerifying ? 'Processing...' : 'Approve Payment'}
                </Button>
                <Button
                  onClick={() => verifyPayment(false)}
                  disabled={isVerifying}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isVerifying ? 'Processing...' : 'Reject Payment'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Size Image Modal */}
      <Dialog open={imageViewOpen} onOpenChange={setImageViewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot - Full Size</DialogTitle>
          </DialogHeader>
          {order?.qr_screenshot_url && (
            <div className="flex justify-center">
              <img 
                src={order.qr_screenshot_url} 
                alt="Payment Screenshot Full Size" 
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentVerificationModal;
