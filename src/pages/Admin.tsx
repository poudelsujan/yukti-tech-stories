
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useAdminData } from '@/hooks/useAdminData';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import AccessDenied from '@/components/admin/AccessDenied';
import DashboardStats from '@/components/admin/DashboardStats';
import AdminTabs from '@/components/admin/AdminTabs';

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdminStatus();
  const { users, stats, loadUsers } = useAdminData(isAdmin);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <AccessDenied 
        message="Access Denied" 
        description="Please sign in to access the admin panel" 
      />
    );
  }

  if (!isAdmin) {
    return (
      <AccessDenied 
        message="Access Denied" 
        description="You don't have permission to access this page" 
      />
    );
  }

  return (
    <AdminLayout>
      <DashboardStats stats={stats} />
      <AdminTabs users={users} onUserUpdate={loadUsers} />
    </AdminLayout>
  );
};

export default Admin;
