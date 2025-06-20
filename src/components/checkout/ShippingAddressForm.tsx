
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface ShippingAddressFormProps {
  formData: {
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
  onChange: (field: string, value: string) => void;
}

const ShippingAddressForm = ({ formData, onChange }: ShippingAddressFormProps) => {
  return (
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
          onChange={(e) => onChange('address', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => onChange('city', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => onChange('postal_code', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => onChange('country', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingAddressForm;
