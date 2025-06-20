
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Percent, DollarSign } from 'lucide-react';

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

interface DiscountTableProps {
  discounts: DiscountCode[];
  onEdit: (discount: DiscountCode) => void;
  onDelete: (discountId: string) => void;
}

const DiscountTable = ({ discounts, onEdit, onDelete }: DiscountTableProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discount Codes ({discounts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell className="font-mono font-medium">{discount.code}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {discount.discount_type === 'percentage' ? (
                      <Percent className="h-4 w-4" />
                    ) : (
                      <DollarSign className="h-4 w-4" />
                    )}
                    {discount.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}
                  </div>
                </TableCell>
                <TableCell>
                  {discount.discount_type === 'percentage' ? 
                    `${discount.discount_value}%` : 
                    `Rs. ${discount.discount_value}`
                  }
                </TableCell>
                <TableCell>
                  {discount.current_uses}/{discount.max_uses || '∞'}
                </TableCell>
                <TableCell>{formatDate(discount.valid_until)}</TableCell>
                <TableCell>
                  <Badge variant={discount.active ? "default" : "secondary"}>
                    {discount.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(discount)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(discount.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DiscountTable;
