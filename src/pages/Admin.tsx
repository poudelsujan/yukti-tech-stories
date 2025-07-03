
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import AccessDenied from '@/components/admin/AccessDenied';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

const Admin = () => {
  const { isAdmin, loading } = useAdminStatus();

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
        <AccessDenied />
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
          <AdminLayout />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Admin;
