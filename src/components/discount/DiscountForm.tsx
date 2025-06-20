
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface DiscountCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  created_at: string;
}

interface FormData {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  min_order_amount: string;
  max_uses: string;
  valid_until: string;
  active: boolean;
}

interface DiscountFormProps {
  showForm: boolean;
  editingDiscount: DiscountCode | null;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

const DiscountForm = ({
  showForm,
  editingDiscount,
  formData,
  setFormData,
  loading,
  onSubmit,
  onCancel
}: DiscountFormProps) => {
  if (!showForm) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingDiscount ? 'Edit Discount Code' : 'Add New Discount Code'}</CardTitle>
        <CardDescription>
          Create discount codes to offer special deals to your customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Discount Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                placeholder="SAVE20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_type">Discount Type</Label>
              <Select value={formData.discount_type} onValueChange={(value: 'percentage' | 'fixed') => setFormData({...formData, discount_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (Rs.)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_value">
                Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(Rs.)'}
              </Label>
              <Input
                id="discount_value"
                type="number"
                step="0.01"
                value={formData.discount_value}
                onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_order_amount">Minimum Order Amount (Rs.)</Label>
              <Input
                id="min_order_amount"
                type="number"
                step="0.01"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_uses">Maximum Uses (Optional)</Label>
              <Input
                id="max_uses"
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                placeholder="Unlimited"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_until">Valid Until (Optional)</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({...formData, active: checked})}
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingDiscount ? 'Update' : 'Create Discount Code')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DiscountForm;
