
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

interface AuthUser {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string | null;
  user_metadata?: {
    full_name?: string;
    [key: string]: any;
  };
  [key: string]: any;
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
      // Get users with their profiles - simplified query
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) throw profilesError;

      // Get user roles separately
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.warn('Could not fetch user roles:', rolesError);
      }

      // Get auth users metadata
      const { data: authUsersResponse, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.warn('Could not fetch auth users:', authError);
      }

      // Type the auth users properly
      const authUsers: AuthUser[] = (authUsersResponse?.users as AuthUser[]) || [];

      // Combine profiles with auth data and roles
      const allUsers: UserProfile[] = [];
      
      // First, add users from profiles
      if (profiles && Array.isArray(profiles)) {
        profiles.forEach(profile => {
          const authUser = authUsers.find(u => u.id === profile.id);
          const roles = userRoles?.filter(ur => ur.user_id === profile.id).map(ur => ur.role) || [];
          
          allUsers.push({
            id: profile.id,
            full_name: profile.full_name || 'Unknown',
            email: authUser?.email || 'Unknown',
            roles: roles,
            created_at: authUser?.created_at || new Date().toISOString(),
            last_sign_in_at: authUser?.last_sign_in_at || null
          });
        });
      }

      // Then, add any auth users not in profiles
      if (authUsers && Array.isArray(authUsers)) {
        authUsers.forEach(authUser => {
          if (!allUsers.find(u => u.id === authUser.id)) {
            const roles = userRoles?.filter(ur => ur.user_id === authUser.id).map(ur => ur.role) || [];
            
            allUsers.push({
              id: authUser.id,
              full_name: authUser.user_metadata?.full_name || 'Unknown',
              email: authUser.email || 'Unknown',
              roles: roles,
              created_at: authUser.created_at || new Date().toISOString(),
              last_sign_in_at: authUser.last_sign_in_at || null
            });
          }
        });
      }

      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      // Get total users count
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
