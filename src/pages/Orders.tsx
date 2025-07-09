
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, ShoppingBag, Calendar, MapPin, Eye, Search, Filter, Download, ExternalLink, CalendarDays } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PreOrderQuote from '@/components/PreOrderQuote';
import PreOrderTracking from '@/components/PreOrderTracking';

const Orders = () => {
  const { user } = useAuth();
  const [preOrders, setPreOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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

  // Enhanced filtering function
  const filteredOrders = orders?.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
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
  }) || [];

  // Filter pre-orders with date support
  const filteredPreOrders = preOrders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filtering for pre-orders
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
    
    return matchesSearch && matchesDate;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setDateFrom('');
    setDateTo('');
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

          {/* Enhanced Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order ID or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Order Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="pending_verification">Pending Verification</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 flex-wrap">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Date Range:</span>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40"
                  placeholder="From"
                />
                <span className="text-gray-400">to</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40"
                  placeholder="To"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="orders">Regular Orders ({filteredOrders.length})</TabsTrigger>
              <TabsTrigger value="preorders">Pre-Orders ({filteredPreOrders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <div className="space-y-6">
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading orders...</p>
                  </div>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getOrderStatusColor(order.order_status)}>
                              {order.order_status?.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge className={getPaymentStatusColor(order.payment_status)}>
                              {order.payment_status?.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="font-medium text-sm text-gray-600">Total Amount</p>
                            <p className="text-lg font-bold">Rs. {order.total_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-600">Payment Method</p>
                            <p className="capitalize">{order.payment_method?.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-600">Items</p>
                            <p>{Array.isArray(order.order_items) ? order.order_items.length : 0} items</p>
                          </div>
                        </div>

                        {/* Enhanced Payment Details */}
                        {order.payment_method === 'qr' && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Payment Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {order.transaction_id && (
                                <div>
                                  <p className="text-sm text-gray-600">Transaction ID</p>
                                  <p className="font-mono text-sm">{order.transaction_id}</p>
                                </div>
                              )}
                              {order.qr_screenshot_url && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-2">Payment Screenshot</p>
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
                                        <img 
                                          src={order.qr_screenshot_url} 
                                          alt="Payment Screenshot" 
                                          className="max-w-full h-auto rounded"
                                        />
                                      </DialogContent>
                                    </Dialog>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => window.open(order.qr_screenshot_url, '_blank')}
                                    >
                                      <ExternalLink className="h-4 w-4 mr-1" />
                                      Open
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = order.qr_screenshot_url;
                                        link.download = `payment_screenshot_${order.id.slice(0, 8)}.jpg`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      }}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
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
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || dateFrom || dateTo
                          ? 'No matching orders found' 
                          : 'No orders yet'
                        }
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || dateFrom || dateTo
                          ? 'Try adjusting your search or filters'
                          : 'When you place orders, they\'ll appear here.'
                        }
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preorders">
              <div className="space-y-6">
                {filteredPreOrders.length > 0 ? (
                  filteredPreOrders.map((preOrder) => (
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
                                <CardDescription className="flex items-center gap-2 mt-1">
                                  <Calendar className="h-4 w-4" />
                                  Pre-Order ID: {preOrder.id}
                                  <span className="ml-2">
                                    {new Date(preOrder.created_at).toLocaleDateString()} at {new Date(preOrder.created_at).toLocaleTimeString()}
                                  </span>
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
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm || dateFrom || dateTo ? 'No matching pre-orders found' : 'No pre-orders yet'}
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm || dateFrom || dateTo ? 'Try adjusting your search or date filters' : 'When you submit pre-order requests, they\'ll appear here.'}
                      </p>
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
