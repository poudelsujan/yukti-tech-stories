
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateAddress, validateCity, validatePostalCode } from '@/utils/validation';

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
      case 'address':
        error = validateAddress(value) || '';
        break;
      case 'city':
        error = validateCity(value) || '';
        break;
      case 'postal_code':
        error = validatePostalCode(value) || '';
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Shipping Address</h3>
      
      <div className="space-y-2">
        <Label htmlFor="address">Street Address *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          onBlur={(e) => handleBlur('address', e.target.value)}
          required
          className={errors.address ? 'border-red-500' : ''}
          placeholder="Enter your street address"
        />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            onBlur={(e) => handleBlur('city', e.target.value)}
            required
            className={errors.city ? 'border-red-500' : ''}
            placeholder="Enter your city"
          />
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code *</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => handleInputChange('postal_code', e.target.value)}
            onBlur={(e) => handleBlur('postal_code', e.target.value)}
            required
            className={errors.postal_code ? 'border-red-500' : ''}
            placeholder="44600"
          />
          {errors.postal_code && (
            <p className="text-sm text-red-500">{errors.postal_code}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country *</Label>
        <Select value={formData.country} onValueChange={(value) => onChange('country', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Nepal">Nepal</SelectItem>
            <SelectItem value="Pakistan">Pakistan</SelectItem>
            <SelectItem value="India">India</SelectItem>
            <SelectItem value="Bangladesh">Bangladesh</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ShippingAddressForm;
