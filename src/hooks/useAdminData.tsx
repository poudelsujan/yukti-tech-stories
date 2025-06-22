
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
      
      // Get all profiles first
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

      // Try to get auth users (this might fail in client-side code)
      let authUsers: any[] = [];
      try {
        // This will likely fail due to RLS, but we'll try anyway
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        if (!authError && authData?.users) {
          authUsers = authData.users;
          console.log(`Successfully fetched ${authUsers.length} auth users`);
        } else {
          console.warn('Could not fetch auth users via admin API:', authError);
        }
      } catch (error) {
        console.warn('Auth admin access not available:', error);
      }

      // If we couldn't get auth users, we'll work with what we have from profiles
      // and create a more comprehensive user list
      const allUserIds = new Set<string>();
      
      // Add profile IDs
      if (profiles) {
        profiles.forEach(profile => allUserIds.add(profile.id));
      }
      
      // Add auth user IDs if available
      authUsers.forEach(authUser => allUserIds.add(authUser.id));

      // If we have very few users from profiles, it might mean users aren't creating profiles
      // In this case, we should inform the admin
      if (profiles && profiles.length === 0 && authUsers.length === 0) {
        console.log('No users found in profiles or auth. This might indicate users are not signing up or profiles are not being created.');
      }

      const combinedUsers: UserProfile[] = [];

      // Process each unique user ID
      Array.from(allUserIds).forEach(userId => {
        const profile = profiles?.find(p => p.id === userId);
        const authUser = authUsers.find(u => u.id === userId);
        const roles = userRoles?.filter(ur => ur.user_id === userId).map(ur => ur.role) || [];
        
        // Include all users we have data for
        combinedUsers.push({
          id: userId,
          full_name: profile?.full_name || authUser?.user_metadata?.full_name || 'Unknown User',
          email: authUser?.email || 'Email not available',
          roles: roles,
          created_at: authUser?.created_at || new Date().toISOString(),
          last_sign_in_at: authUser?.last_sign_in_at || null
        });
      });

      // Sort users by creation date (newest first)
      combinedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log(`Loaded ${combinedUsers.length} total users`);
      console.log('Users summary:', {
        profilesCount: profiles?.length || 0,
        authUsersCount: authUsers.length,
        combinedCount: combinedUsers.length,
        usersWithRoles: combinedUsers.filter(u => u.roles.length > 0).length
      });

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
