
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Package, MapPin, Clock, Truck, Phone, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
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
      
      // Transform the data to match our Order interface
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'pending_verification': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in</h3>
                <p className="text-gray-600">You need to be signed in to view your orders.</p>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600">Track your order status and delivery information</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-lg">Loading your orders...</div>
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">You haven't placed any orders yet.</p>
                <Button className="mt-4" onClick={() => window.location.href = '/products'}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription>
                          Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">Rs. {order.total_amount.toLocaleString()}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getStatusColor(order.order_status)}>
                            {order.order_status?.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPaymentStatusColor(order.payment_status)}>
                            {order.payment_status?.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.order_items?.map((item: any, index: number) => (
                            <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                              <img 
                                src={item.image_url || '/placeholder.svg'} 
                                alt={item.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <div className="font-medium">{item.title}</div>
                                <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Information */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Delivery Address
                          </h4>
                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {order.shipping_address?.address}<br />
                            {order.shipping_address?.city}, {order.shipping_address?.postal_code}<br />
                            {order.shipping_address?.country}
                          </div>
                        </div>

                        {order.tracking_number && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              Tracking Information
                            </h4>
                            <div className="text-sm bg-blue-50 p-3 rounded">
                              <div className="font-mono">{order.tracking_number}</div>
                            </div>
                          </div>
                        )}

                        {order.estimated_delivery && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Estimated Delivery
                            </h4>
                            <div className="text-sm text-gray-600">
                              {new Date(order.estimated_delivery).toLocaleDateString()}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium mb-2">Contact Information</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {order.customer_email}
                            </div>
                            {order.customer_phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {order.customer_phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Orders;
