
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const useDiscountManager = () => {
  const { toast } = useToast();
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState<FormData>({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    valid_until: '',
    active: true
  });

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscounts(data || []);
    } catch (error) {
      console.error('Error loading discounts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const discountData = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : 0,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        active: formData.active
      };

      if (editingDiscount) {
        const { error } = await supabase
          .from('discount_codes')
          .update(discountData)
          .eq('id', editingDiscount.id);

        if (error) throw error;
        toast({
          title: "Discount Updated",
          description: "Discount code has been updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('discount_codes')
          .insert(discountData);

        if (error) throw error;
        toast({
          title: "Discount Created",
          description: "Discount code has been created successfully"
        });
      }

      resetForm();
      loadDiscounts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save discount code"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (discount: DiscountCode) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      discount_type: discount.discount_type as 'percentage' | 'fixed',
      discount_value: discount.discount_value.toString(),
      min_order_amount: discount.min_order_amount.toString(),
      max_uses: discount.max_uses?.toString() || '',
      valid_until: discount.valid_until ? new Date(discount.valid_until).toISOString().split('T')[0] : '',
      active: discount.active
    });
    setShowAddForm(true);
  };

  const handleDelete = async (discountId: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;

    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', discountId);

      if (error) throw error;
      
      toast({
        title: "Discount Deleted",
        description: "Discount code has been deleted successfully"
      });
      loadDiscounts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete discount code"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '',
      max_uses: '',
      valid_until: '',
      active: true
    });
    setEditingDiscount(null);
    setShowAddForm(false);
  };

  return {
    discounts,
    loading,
    showAddForm,
    setShowAddForm,
    editingDiscount,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm
  };
};
