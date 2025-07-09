
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrderFilters from '@/components/orders/OrderFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  qr_screenshot_url?: string;
  order_items: any[];
  shipping_address: any;
}

const Orders = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Filter orders based on search and filter criteria
  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
    
    // Date filtering
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const orderDate = new Date(order.created_at);
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && orderDate >= fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && orderDate <= toDate;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const {
    displayedItems: displayedOrders,
    hasMore,
    isLoadingMore,
    loadMore
  } = useInfiniteScroll({
    data: filteredOrders,
    itemsPerPage: 10,
    loading: isLoading
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Package className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'pending_verification': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadScreenshot = async (url: string, orderId: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `payment_screenshot_${orderId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Failed to download screenshot:', error);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
            <p className="text-gray-600">You need to sign in to view your orders.</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">Track and manage your orders</p>
          </div>

          <OrderFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            paymentFilter={paymentFilter}
            setPaymentFilter={setPaymentFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            onClearFilters={clearFilters}
            showPaymentFilter={true}
            isAdmin={false}
          />

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : displayedOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filteredOrders.length === 0 && orders.length > 0 ? 'No orders match your filters' : 'No orders found'}
                </h3>
                <p className="text-gray-600">
                  {filteredOrders.length === 0 && orders.length > 0 
                    ? 'Try adjusting your search criteria'
                    : 'Your orders will appear here once you make a purchase'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {displayedOrders.map((order: Order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                        <CardDescription>
                          Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                          {new Date(order.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          Rs. {order.total_amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {order.payment_method?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Order Status */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Order Status:</span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.order_status)}
                            <Badge className={getStatusColor(order.order_status)}>
                              {order.order_status?.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Payment Status:</span>
                          <Badge className={getPaymentStatusColor(order.payment_status)}>
                            {order.payment_status?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>

                        {/* Payment Screenshot */}
                        {order.qr_screenshot_url && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Payment Screenshot:</span>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Payment Screenshot</DialogTitle>
                                  </DialogHeader>
                                  <div className="mt-4">
                                    <img 
                                      src={order.qr_screenshot_url} 
                                      alt="Payment Screenshot"
                                      className="w-full h-auto rounded-lg"
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => downloadScreenshot(order.qr_screenshot_url!, order.id)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Items Ordered:</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {order.order_items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="truncate">{item.title}</span>
                              <span className="ml-2 flex-shrink-0">
                                {item.quantity}x Rs. {item.price.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Loading More Indicator */}
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              )}

              {/* Load More Button - shown when not auto-loading */}
              {hasMore && !isLoadingMore && (
                <div className="flex justify-center py-4">
                  <Button onClick={loadMore} variant="outline">
                    Load More Orders
                  </Button>
                </div>
              )}

              {/* End of results */}
              {!hasMore && displayedOrders.length > 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>You've reached the end of your orders</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Orders;
