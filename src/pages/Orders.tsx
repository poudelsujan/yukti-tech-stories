
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingBag, Calendar, MapPin, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PreOrderQuote from '@/components/PreOrderQuote';
import PreOrderTracking from '@/components/PreOrderTracking';

const Orders = () => {
  const { user } = useAuth();
  const [preOrders, setPreOrders] = useState<any[]>([]);

  // Fetch regular orders from Supabase
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_status_history (
            status,
            created_at,
            notes
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Load pre-orders from localStorage
  useEffect(() => {
    const loadPreOrders = () => {
      try {
        const stored = localStorage.getItem('preOrders');
        if (stored) {
          const allPreOrders = JSON.parse(stored);
          const userPreOrders = allPreOrders.filter((order: any) => order.user_id === user?.id);
          setPreOrders(userPreOrders);
        }
      } catch (error) {
        console.error('Error loading pre-orders:', error);
      }
    };

    if (user?.id) {
      loadPreOrders();
    }
  }, [user?.id]);

  const handlePreOrderQuoteAction = (preOrderId: string, action: 'accept' | 'reject', installmentPlan?: any) => {
    try {
      const allPreOrders = JSON.parse(localStorage.getItem('preOrders') || '[]');
      const updatedPreOrders = allPreOrders.map((order: any) => {
        if (order.id === preOrderId) {
          return {
            ...order,
            status: action === 'accept' ? 'quote_accepted' : 'quote_rejected',
            installment_plan: installmentPlan,
            updated_at: new Date().toISOString()
          };
        }
        return order;
      });
      
      localStorage.setItem('preOrders', JSON.stringify(updatedPreOrders));
      
      // Update local state
      const userPreOrders = updatedPreOrders.filter((order: any) => order.user_id === user?.id);
      setPreOrders(userPreOrders);
    } catch (error) {
      console.error('Error updating pre-order:', error);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sign In Required</h3>
              <p className="text-gray-600">Please sign in to view your orders.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600">Track your orders and pre-orders</p>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="orders">Regular Orders ({orders?.length || 0})</TabsTrigger>
              <TabsTrigger value="preorders">Pre-Orders ({preOrders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <div className="space-y-6">
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading orders...</p>
                  </div>
                ) : orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge className={getOrderStatusColor(order.order_status)}>
                            {order.order_status?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="font-medium text-sm text-gray-600">Total Amount</p>
                            <p className="text-lg font-bold">Rs. {order.total_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-600">Payment Status</p>
                            <Badge variant="outline">
                              {order.payment_status?.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-600">Items</p>
                            <p>{Array.isArray(order.order_items) ? order.order_items.length : 0} items</p>
                          </div>
                        </div>
                        
                        {order.tracking_number && (
                          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            Tracking: {order.tracking_number}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600">When you place orders, they'll appear here.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preorders">
              <div className="space-y-6">
                {preOrders.length > 0 ? (
                  preOrders.map((preOrder) => (
                    <div key={preOrder.id}>
                      {preOrder.status === 'quoted' ? (
                        <PreOrderQuote
                          preOrder={preOrder}
                          onQuoteAction={(action, installmentPlan) => 
                            handlePreOrderQuoteAction(preOrder.id, action, installmentPlan)
                          }
                          isUser={true}
                        />
                      ) : (
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Package className="h-5 w-5" />
                                  {preOrder.item_name}
                                </CardTitle>
                                <CardDescription>
                                  Pre-Order ID: {preOrder.id}
                                </CardDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                                      <Eye className="h-4 w-4" />
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Pre-Order Tracking</DialogTitle>
                                    </DialogHeader>
                                    <PreOrderTracking preOrder={preOrder} />
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="font-medium text-sm text-gray-600">Category</p>
                                <p>{preOrder.category}</p>
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-600">Quantity</p>
                                <p>{preOrder.quantity}</p>
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-600">Original Price</p>
                                <p>${preOrder.original_price}</p>
                              </div>
                            </div>
                            
                            {preOrder.quoted_price && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="font-medium text-blue-900">
                                  Quoted Price: Rs. {preOrder.quoted_price.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No pre-orders yet</h3>
                      <p className="text-gray-600">When you submit pre-order requests, they'll appear here.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Orders;
