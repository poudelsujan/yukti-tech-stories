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
      
      // Get all profiles (this contains all registered users)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('id');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Get user roles for all users
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      }

      console.log(`Found ${profiles?.length || 0} profiles in database`);
      console.log(`Found ${userRoles?.length || 0} user roles`);

      if (!profiles || profiles.length === 0) {
        console.log('No user profiles found. Users may not have completed signup or profiles are not being created properly.');
        setUsers([]);
        return;
      }

      // Create user list from profiles
      const combinedUsers: UserProfile[] = profiles.map(profile => {
        const roles = userRoles?.filter(ur => ur.user_id === profile.id).map(ur => ur.role) || [];
        
        return {
          id: profile.id,
          full_name: profile.full_name || 'Unknown User',
          email: 'Email not available via client API', // Cannot get email from client-side auth API
          roles: roles,
          created_at: new Date().toISOString(), // Cannot get exact creation date from client-side
          last_sign_in_at: null // Cannot get last sign in from client-side
        };
      });

      console.log(`Successfully loaded ${combinedUsers.length} users`);
      console.log('User roles distribution:', {
        totalUsers: combinedUsers.length,
        usersWithRoles: combinedUsers.filter(u => u.roles.length > 0).length,
        admins: combinedUsers.filter(u => u.roles.includes('admin')).length,
        moderators: combinedUsers.filter(u => u.roles.includes('moderator')).length
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
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
