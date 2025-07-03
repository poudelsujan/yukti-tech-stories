
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Clock, Eye, ExternalLink } from 'lucide-react';

interface PreOrder {
  id: string;
  user_id: string;
  item_name: string;
  product_link: string;
  category: string;
  original_price: number;
  quantity: number;
  description: string;
  estimated_cost_npr: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  created_at: string;
  admin_notes?: string;
  quoted_price?: number;
}

const PreOrderManagement = () => {
  const { toast } = useToast();
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PreOrder | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadPreOrders();
  }, []);

  const loadPreOrders = () => {
    try {
      const orders = JSON.parse(localStorage.getItem('preOrders') || '[]');
      setPreOrders(orders);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pre-orders"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreOrderStatus = () => {
    if (!selectedOrder || !newStatus) return;

    try {
      const orders = JSON.parse(localStorage.getItem('preOrders') || '[]');
      const updatedOrders = orders.map((order: PreOrder) => {
        if (order.id === selectedOrder.id) {
          return {
            ...order,
            status: newStatus,
            quoted_price: quotedPrice ? parseFloat(quotedPrice) : order.quoted_price,
            admin_notes: adminNotes || order.admin_notes,
            updated_at: new Date().toISOString()
          };
        }
        return order;
      });

      localStorage.setItem('preOrders', JSON.stringify(updatedOrders));

      toast({
        title: "Success",
        description: "Pre-order status updated successfully"
      });

      loadPreOrders();
      setSelectedOrder(null);
      setNewStatus('');
      setQuotedPrice('');
      setAdminNotes('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update pre-order status"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_quote': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'ordered': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading pre-orders...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Pre-Order Management
        </CardTitle>
        <CardDescription>Manage international pre-order requests</CardDescription>
      </CardHeader>
      <CardContent>
        {preOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pre-orders found</h3>
            <p className="text-gray-600">Pre-orders will appear here once customers start submitting requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pre-Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Original Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-sm text-gray-600">{order.customer_email}</div>
                        {order.customer_phone && (
                          <div className="text-sm text-gray-600">{order.customer_phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate">{order.item_name}</div>
                    </TableCell>
                    <TableCell>{order.category}</TableCell>
                    <TableCell>${order.original_price} x {order.quantity}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Pre-Order Details - {order.id}</DialogTitle>
                            <DialogDescription>
                              Manage pre-order status and provide quotes
                            </DialogDescription>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-6">
                              {/* Product Details */}
                              <div>
                                <h4 className="font-medium mb-2">Product Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Product Name:</strong> {selectedOrder.item_name}
                                  </div>
                                  <div>
                                    <strong>Category:</strong> {selectedOrder.category}
                                  </div>
                                  <div>
                                    <strong>Original Price:</strong> ${selectedOrder.original_price}
                                  </div>
                                  <div>
                                    <strong>Quantity:</strong> {selectedOrder.quantity}
                                  </div>
                                  <div className="md:col-span-2">
                                    <strong>Product Link:</strong>
                                    <a 
                                      href={selectedOrder.product_link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="ml-2 text-blue-600 hover:underline inline-flex items-center gap-1"
                                    >
                                      View Product <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                  {selectedOrder.description && (
                                    <div className="md:col-span-2">
                                      <strong>Description:</strong> {selectedOrder.description}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Cost Information */}
                              {selectedOrder.estimated_cost_npr && (
                                <div>
                                  <h4 className="font-medium mb-2">Cost Estimation</h4>
                                  <div className="text-sm">
                                    <strong>Estimated Cost:</strong> Rs. {selectedOrder.estimated_cost_npr.toLocaleString()}
                                  </div>
                                </div>
                              )}

                              {/* Update Status */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="status">Update Status</Label>
                                  <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending_quote">Pending Quote</SelectItem>
                                      <SelectItem value="quoted">Quoted</SelectItem>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="ordered">Ordered</SelectItem>
                                      <SelectItem value="shipped">Shipped</SelectItem>
                                      <SelectItem value="delivered">Delivered</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor="quoted_price">Quoted Price (NPR)</Label>
                                  <Input
                                    id="quoted_price"
                                    type="number"
                                    value={quotedPrice}
                                    onChange={(e) => setQuotedPrice(e.target.value)}
                                    placeholder="Enter quoted price"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="admin_notes">Admin Notes</Label>
                                <Input
                                  id="admin_notes"
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="Add notes for this pre-order"
                                />
                              </div>

                              <Button 
                                onClick={updatePreOrderStatus}
                                className="w-full"
                                disabled={!newStatus}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Update Pre-Order
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreOrderManagement;
