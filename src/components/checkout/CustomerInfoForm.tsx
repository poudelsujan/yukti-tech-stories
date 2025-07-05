
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateFullName, validateEmail, validateNepalPhoneNumber } from '@/utils/validation';

interface CustomerInfoFormProps {
  formData: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  onChange: (field: string, value: string) => void;
}

const CustomerInfoForm = ({ formData, onChange }: CustomerInfoFormProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    onChange(field, value);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'customer_name':
        error = validateFullName(value) || '';
        break;
      case 'customer_email':
        error = validateEmail(value) || '';
        break;
      case 'customer_phone':
        error = validateNepalPhoneNumber(value) || '';
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="customer_name">Full Name *</Label>
        <Input
          id="customer_name"
          value={formData.customer_name}
          onChange={(e) => handleInputChange('customer_name', e.target.value)}
          onBlur={(e) => handleBlur('customer_name', e.target.value)}
          required
          className={errors.customer_name ? 'border-red-500' : ''}
          placeholder="Enter your full name"
        />
        {errors.customer_name && (
          <p className="text-sm text-red-500">{errors.customer_name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_email">Email Address *</Label>
        <Input
          id="customer_email"
          type="email"
          value={formData.customer_email}
          onChange={(e) => handleInputChange('customer_email', e.target.value)}
          onBlur={(e) => handleBlur('customer_email', e.target.value)}
          required
          className={errors.customer_email ? 'border-red-500' : ''}
          placeholder="Enter your email address"
        />
        {errors.customer_email && (
          <p className="text-sm text-red-500">{errors.customer_email}</p>
        )}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="customer_phone">Phone Number (Nepal) *</Label>
        <Input
          id="customer_phone"
          value={formData.customer_phone}
          onChange={(e) => handleInputChange('customer_phone', e.target.value)}
          onBlur={(e) => handleBlur('customer_phone', e.target.value)}
          required
          className={errors.customer_phone ? 'border-red-500' : ''}
          placeholder="98XXXXXXXX or 01XXXXXXX"
        />
        {errors.customer_phone && (
          <p className="text-sm text-red-500">{errors.customer_phone}</p>
        )}
        <p className="text-xs text-gray-500">
          Enter Nepal mobile (98XXXXXXXX, 97XXXXXXXX) or landline (01XXXXXXX) number
        </p>
      </div>
    </div>
  );
};

export default CustomerInfoForm;
