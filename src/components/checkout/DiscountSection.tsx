
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DiscountSectionProps {
  discountCode: string;
  setDiscountCode: (code: string) => void;
  onValidateDiscount: () => void;
}

const DiscountSection = ({ 
  discountCode, 
  setDiscountCode, 
  onValidateDiscount 
}: DiscountSectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="discount">Discount Code</Label>
      <div className="flex gap-2">
        <Input
          id="discount"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Enter discount code"
        />
        <Button type="button" variant="outline" onClick={onValidateDiscount}>
          Apply
        </Button>
      </div>
    </div>
  );
};

export default DiscountSection;
