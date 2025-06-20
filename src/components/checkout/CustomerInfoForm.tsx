
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomerInfoFormProps {
  formData: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  onChange: (field: string, value: string) => void;
}

const CustomerInfoForm = ({ formData, onChange }: CustomerInfoFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="customer_name">Full Name</Label>
        <Input
          id="customer_name"
          value={formData.customer_name}
          onChange={(e) => onChange('customer_name', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_email">Email</Label>
        <Input
          id="customer_email"
          type="email"
          value={formData.customer_email}
          onChange={(e) => onChange('customer_email', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="customer_phone">Phone Number</Label>
        <Input
          id="customer_phone"
          value={formData.customer_phone}
          onChange={(e) => onChange('customer_phone', e.target.value)}
          required
        />
      </div>
    </div>
  );
};

export default CustomerInfoForm;
