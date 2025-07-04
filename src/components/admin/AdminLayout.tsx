
import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {children}
    </div>
  );
};

export default AdminLayout;
