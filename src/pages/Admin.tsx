
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminTabs from '@/components/admin/AdminTabs';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useAdminData } from '@/hooks/useAdminData';
import AccessDenied from '@/components/admin/AccessDenied';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

const Admin = () => {
  const { isAdmin, loading } = useAdminStatus();
  const { users, loadUsers } = useAdminData(isAdmin);

  if (loading) {
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your store, orders, and customers</p>
          </div>
          <AdminTabs users={users} onUserUpdate={loadUsers} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Admin;
