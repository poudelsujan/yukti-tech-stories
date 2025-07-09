
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminTabs from '@/components/admin/AdminTabs';
import AdminNotifications from '@/components/admin/AdminNotifications';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useAdminData } from '@/hooks/useAdminData';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import AccessDenied from '@/components/admin/AccessDenied';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

const Admin = () => {
  const { isAdmin, loading } = useAdminStatus();
  const { users, loadUsers } = useAdminData(isAdmin);
  const { stats, loading: statsLoading } = useAdminDashboard(isAdmin);

  if (loading || statsLoading) {
    return (
      <>
        <Header />
        <LoadingSpinner />
        <Footer />
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Header />
        <AccessDenied 
          message="Access Denied"
          description="You don't have permission to access the admin dashboard."
        />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Manage your store, orders, and customers</p>
              </div>
              <div className="flex items-center gap-2">
                <AdminNotifications />
              </div>
            </div>
          </div>
          <AdminTabs 
            users={users} 
            onUserUpdate={loadUsers} 
            dashboardStats={stats}
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Admin;
