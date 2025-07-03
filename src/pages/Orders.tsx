import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, ShoppingBag, FileText, Eye, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_amount: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  shipping_address: any;
  order_items: any[];
  tracking_number: string | null;
  estimated_delivery: string | null;
  delivery_location: any;
}

interface PreOrder {
  id: string;
  user_id: string;
  item_name: string;
  product_link: string;
  category: string;
  original_price: number;
  quantity: number;
  status: string;
  created_at: string;
  quoted_price?: number;
  admin_notes?: string;
}

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedPreOrder, setSelectedPreOrder] = useState<PreOrder | null>(null);

  useEffect(() => {
    if (user) {
      loadOrders();
      loadPreOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedOrders = data?.map(order => ({
        ...order,
        order_items: Array.isArray(order.order_items) ? order.order_items : 
                    typeof order.order_items === 'string' ? JSON.parse(order.order_items) : []
      })) || [];
      
      setOrders(transformedOrders);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders"
      });
    }
  };

  const loadPreOrders = () => {
    try {
      const allPreOrders = JSON.parse(localStorage.getItem('preOrders') || '[]');
      const userPreOrders = allPreOrders.filter((order: PreOrder) => 
        order.user_id === user?.id
      );
      setPreOrders(userPreOrders);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending_quote': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'ordered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Please Sign In</CardTitle>
            <CardDescription>You need to be signed in to view your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/auth">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track your orders and pre-order requests</p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Regular Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="preorders" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pre-Orders ({preOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Regular Orders</CardTitle>
                <CardDescription>Your completed and pending orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
                    <Button asChild>
                      <a href="/products">Browse Products</a>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">
                              #{order.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>
                              {order.order_items?.length || 0} items
                            </TableCell>
                            <TableCell>Rs. {order.total_amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.order_status)}>
                                {order.order_status?.replace('_', ' ')}
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
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Order Details - #{order.id.slice(0, 8)}</DialogTitle>
                                  </DialogHeader>
                                  {selectedOrder && (
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Order Items</h4>
                                        <div className="space-y-2">
                                          {selectedOrder.order_items?.map((item: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                              <span>{item.title} x {item.quantity}</span>
                                              <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      {selectedOrder.tracking_number && (
                                        <div>
                                          <h4 className="font-medium mb-2">Tracking Information</h4>
                                          <p className="text-sm">Tracking Number: {selectedOrder.tracking_number}</p>
                                        </div>
                                      )}
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
          </TabsContent>

          <TabsContent value="preorders">
            <Card>
              <CardHeader>
                <CardTitle>Pre-Orders</CardTitle>
                <CardDescription>Your international pre-order requests</CardDescription>
              </CardHeader>
              <CardContent>
                {preOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pre-orders yet</h3>
                    <p className="text-gray-600 mb-4">Submit a pre-order request to import products internationally</p>
                    <Button asChild>
                      <a href="/preorder">Submit Pre-Order</a>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pre-Order ID</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Original Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preOrders.map((preOrder) => (
                          <TableRow key={preOrder.id}>
                            <TableCell className="font-mono text-sm">
                              {preOrder.id}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-32 truncate">{preOrder.item_name}</div>
                            </TableCell>
                            <TableCell>{preOrder.category}</TableCell>
                            <TableCell>${preOrder.original_price} x {preOrder.quantity}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(preOrder.status)}>
                                {preOrder.status?.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(preOrder.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setSelectedPreOrder(preOrder)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Pre-Order Details - {preOrder.id}</DialogTitle>
                                  </DialogHeader>
                                  {selectedPreOrder && (
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Product Information</h4>
                                        <div className="space-y-2 text-sm">
                                          <div><strong>Product:</strong> {selectedPreOrder.item_name}</div>
                                          <div><strong>Category:</strong> {selectedPreOrder.category}</div>
                                          <div><strong>Original Price:</strong> ${selectedPreOrder.original_price}</div>
                                          <div><strong>Quantity:</strong> {selectedPreOrder.quantity}</div>
                                          <div>
                                            <strong>Product Link:</strong>
                                            <a 
                                              href={selectedPreOrder.product_link} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="ml-2 text-blue-600 hover:underline inline-flex items-center gap-1"
                                            >
                                              View Product <ExternalLink className="h-3 w-3" />
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                      {selectedPreOrder.quoted_price && (
                                        <div>
                                          <h4 className="font-medium mb-2">Quote Information</h4>
                                          <p className="text-sm">
                                            <strong>Quoted Price:</strong> Rs. {selectedPreOrder.quoted_price.toLocaleString()}
                                          </p>
                                        </div>
                                      )}
                                      {selectedPreOrder.admin_notes && (
                                        <div>
                                          <h4 className="font-medium mb-2">Notes</h4>
                                          <p className="text-sm">{selectedPreOrder.admin_notes}</p>
                                        </div>
                                      )}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Orders;
