
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useAdminData } from '@/hooks/useAdminData';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import AccessDenied from '@/components/admin/AccessDenied';
import DashboardStats from '@/components/admin/DashboardStats';
import AdminTabs from '@/components/admin/AdminTabs';
import Header from '@/components/Header';

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdminStatus();
  const { users, stats, loadUsers } = useAdminData(isAdmin);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <>
        <Header />
        <AccessDenied 
          message="Access Denied" 
          description="Please sign in to access the admin panel" 
        />
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Header />
        <AccessDenied 
          message="Access Denied" 
          description="You don't have permission to access this page" 
        />
      </>
    );
  }

  return (
    <>
      <Header />
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your e-commerce platform</p>
        </div>
        <DashboardStats stats={stats} />
        <AdminTabs users={users} onUserUpdate={loadUsers} />
      </AdminLayout>
    </>
  );
};

export default Admin;
