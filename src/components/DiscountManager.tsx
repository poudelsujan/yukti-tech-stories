
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDiscountManager } from '@/hooks/useDiscountManager';
import DiscountForm from '@/components/discount/DiscountForm';
import DiscountTable from '@/components/discount/DiscountTable';

const DiscountManager = () => {
  const {
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
  } = useDiscountManager();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Discount Codes</h2>
          <p className="text-gray-600">Manage discount codes for your customers</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Discount Code
        </Button>
      </div>

      <DiscountForm
        showForm={showAddForm}
        editingDiscount={editingDiscount}
        formData={formData}
        setFormData={setFormData}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />

      <DiscountTable
        discounts={discounts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default DiscountManager;
