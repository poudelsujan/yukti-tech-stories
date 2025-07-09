
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Search, Filter, CheckCircle, XCircle, Clock, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PaymentVerificationModal from './PaymentVerificationModal';

const EnhancedOrderManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Add status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: newStatus,
          notes: `Status updated to ${newStatus} by admin`
        });

      // Create notification
      try {
        await supabase.rpc('create_admin_notification', {
          p_title: 'Order Status Updated',
          p_message: `Order #${orderId.slice(0, 8)} status changed to ${newStatus}`,
          p_type: 'info',
          p_related_id: orderId,
          p_related_type: 'order'
        });
      } catch (notificationError) {
        console.warn('Failed to create admin notification:', notificationError);
      }

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`
      });

      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update order status"
      });
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Add status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: `payment_${newStatus}`,
          notes: `Payment status updated to ${newStatus} by admin`
        });

      // Create notification
      try {
        await supabase.rpc('create_admin_notification', {
          p_title: 'Payment Status Updated',
          p_message: `Order #${orderId.slice(0, 8)} payment status changed to ${newStatus}`,
          p_type: newStatus === 'completed' ? 'success' : 'info',
          p_related_id: orderId,
          p_related_type: 'order'
        });
      } catch (notificationError) {
        console.warn('Failed to create admin notification:', notificationError);
      }

      toast({
        title: "Success",
        description: `Payment status updated to ${newStatus}`
      });

      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update payment status"
      });
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

  const handleVerifyPayment = (order: any) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true);
  };

  // Enhanced filter orders with date support
  const filteredOrders = orders?.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
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

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>Loading orders...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>Manage customer orders and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Enhanced Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order ID, customer name, or email..."
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

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      #{order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      Rs. {order.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.order_status || 'processing'}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <div className="flex items-center gap-2">
                            <Badge className={getOrderStatusColor(order.order_status)}>
                              {order.order_status?.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.payment_status || 'pending'}
                        onValueChange={(value) => updatePaymentStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-36">
                          <div className="flex items-center gap-2">
                            <Badge className={getPaymentStatusColor(order.payment_status)}>
                              {order.payment_status?.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="pending_verification">Pending Verification</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="capitalize">
                      {order.payment_method?.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(order.created_at).toLocaleDateString()}</p>
                        <p className="text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {order.payment_method === 'qr' && order.payment_status === 'pending_verification' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyPayment(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || dateFrom || dateTo
                  ? 'No orders match your search criteria'
                  : 'No orders found'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Verification Modal */}
      <PaymentVerificationModal
        order={selectedOrder}
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedOrder(null);
        }}
        onVerificationComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        }}
      />
    </>
  );
};

export default EnhancedOrderManagement;
