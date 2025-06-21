
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  roles: string[];
  created_at: string;
  last_sign_in_at: string | null;
}

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeDiscounts: number;
}

export const useAdminData = (isAdmin: boolean) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeDiscounts: 0
  });

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadDashboardStats();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      console.log('Loading users...');
      
      // Get profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      }

      // Try to get auth users - this might fail due to RLS
      let authUsers: any[] = [];
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
          console.warn('Could not fetch auth users (this is normal for non-service-role keys):', authError);
        } else {
          authUsers = authData?.users || [];
        }
      } catch (error) {
        console.warn('Auth admin access not available:', error);
      }

      // Combine the data we have
      const combinedUsers: UserProfile[] = [];
      
      // Start with profiles if we have them
      if (profiles && Array.isArray(profiles)) {
        profiles.forEach(profile => {
          const authUser = authUsers.find(u => u.id === profile.id);
          const roles = userRoles?.filter(ur => ur.user_id === profile.id).map(ur => ur.role) || [];
          
          combinedUsers.push({
            id: profile.id,
            full_name: profile.full_name || 'Unknown User',
            email: authUser?.email || 'Email not available',
            roles: roles,
            created_at: authUser?.created_at || new Date().toISOString(),
            last_sign_in_at: authUser?.last_sign_in_at || null
          });
        });
      }

      // Add auth-only users if we have auth access and they're not already included
      authUsers.forEach(authUser => {
        if (!combinedUsers.find(u => u.id === authUser.id)) {
          const roles = userRoles?.filter(ur => ur.user_id === authUser.id).map(ur => ur.role) || [];
          
          combinedUsers.push({
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || 'Unknown User',
            email: authUser.email || 'Unknown Email',
            roles: roles,
            created_at: authUser.created_at || new Date().toISOString(),
            last_sign_in_at: authUser.last_sign_in_at || null
          });
        }
      });

      console.log('Loaded users:', combinedUsers);
      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      // Get total users count from profiles
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total products count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get total orders count and revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount');

      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      // Get active discount codes count
      const { count: discountCount } = await supabase
        .from('discount_codes')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      setStats({
        totalUsers: userCount || 0,
        totalProducts: productCount || 0,
        totalOrders: orders?.length || 0,
        totalRevenue,
        activeDiscounts: discountCount || 0
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  return {
    users,
    stats,
    loadUsers,
    loadDashboardStats
  };
};
