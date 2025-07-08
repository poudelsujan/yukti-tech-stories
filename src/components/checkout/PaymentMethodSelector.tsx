
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QrCode, Users, Upload, CheckCircle, Loader2 } from 'lucide-react';

interface PaymentMethodSelectorProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  transactionId: string;
  setTransactionId: (id: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  qrScreenshotUrl?: string | null;
  uploading?: boolean;
}

const PaymentMethodSelector = ({ 
  paymentMethod, 
  setPaymentMethod, 
  transactionId, 
  setTransactionId, 
  onFileUpload,
  qrScreenshotUrl,
  uploading = false
}: PaymentMethodSelectorProps) => {
  return (
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
              <div className="relative">
                <Input
                  id="qr_screenshot"
                  type="file"
                  accept="image/*"
                  onChange={onFileUpload}
                  required={paymentMethod === 'qr'}
                  disabled={uploading}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploading && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  </div>
                )}
                {qrScreenshotUrl && !uploading && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
              
              {qrScreenshotUrl && (
                <div className="mt-2">
                  <img 
                    src={qrScreenshotUrl} 
                    alt="Payment Screenshot" 
                    className="max-w-32 h-20 object-cover rounded border"
                  />
                  <p className="text-xs text-green-600 mt-1">Screenshot uploaded successfully</p>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                {uploading ? 'Uploading and compressing image...' : 'Upload a screenshot of your successful payment (max 5MB)'}
              </p>
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
  );
};

export default PaymentMethodSelector;
