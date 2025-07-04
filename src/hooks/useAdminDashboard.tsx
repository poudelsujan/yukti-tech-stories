
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeDiscounts: number;
  pendingOrders: number;
  pendingPayments: number;
}

export const useAdminDashboard = (isAdmin: boolean) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeDiscounts: 0,
    pendingOrders: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardStats();
    }
  }, [isAdmin]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Get total orders and revenue
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, order_status, payment_status');

      if (ordersError) throw ordersError;

      // Get total products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id');

      if (productsError) throw productsError;

      // Get active discounts
      const { data: discounts, error: discountsError } = await supabase
        .from('discount_codes')
        .select('id')
        .eq('active', true);

      if (discountsError) throw discountsError;

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const pendingOrders = orders?.filter(order => 
        ['processing', 'confirmed'].includes(order.order_status || '')
      ).length || 0;
      const pendingPayments = orders?.filter(order => 
        order.payment_status === 'pending_verification'
      ).length || 0;

      setStats({
        totalUsers: 0, // We don't have direct access to auth.users count
        totalProducts: products?.length || 0,
        totalOrders,
        totalRevenue,
        activeDiscounts: discounts?.length || 0,
        pendingOrders,
        pendingPayments
      });
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard statistics"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    loadDashboardStats
  };
};
