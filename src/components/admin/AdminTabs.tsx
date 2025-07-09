
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Users, Package, Percent, ShoppingCart, FileText, BarChart3 } from 'lucide-react';
import ProductManagement from '@/components/ProductManagement';
import UserManagement from '@/components/UserManagement';
import DiscountManager from '@/components/DiscountManager';
import EnhancedOrderManagement from '@/components/admin/EnhancedOrderManagement';
import PreOrderManagement from '@/components/admin/PreOrderManagement';
import DashboardOverview from '@/components/admin/DashboardOverview';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  roles: string[];
  created_at: string;
  last_sign_in_at: string | null;
}

interface AdminTabsProps {
  users: UserProfile[];
  onUserUpdate: () => void;
  dashboardStats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    activeDiscounts: number;
    pendingOrders: number;
    pendingPayments: number;
  };
}

const AdminTabs = ({ users, onUserUpdate, dashboardStats }: AdminTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 h-auto p-1 bg-gray-100">
        <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
          <span className="sm:hidden">Stats</span>
        </TabsTrigger>
        <TabsTrigger value="orders" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <ShoppingCart className="h-4 w-4" />
          <span>Orders</span>
        </TabsTrigger>
        <TabsTrigger value="preorders" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Pre-Orders</span>
          <span className="sm:hidden">Pre-O</span>
        </TabsTrigger>
        <TabsTrigger value="products" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Products</span>
          <span className="sm:hidden">Items</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <Users className="h-4 w-4" />
          <span>Users</span>
        </TabsTrigger>
        <TabsTrigger value="discounts" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <Percent className="h-4 w-4" />
          <span className="hidden sm:inline">Discounts</span>
          <span className="sm:hidden">Disc</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
          <span className="sm:hidden">Set</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <DashboardOverview stats={dashboardStats} />
      </TabsContent>

      <TabsContent value="orders">
        <EnhancedOrderManagement />
      </TabsContent>

      <TabsContent value="preorders">
        <PreOrderManagement />
      </TabsContent>

      <TabsContent value="products">
        <ProductManagement />
      </TabsContent>

      <TabsContent value="users">
        <UserManagement users={users} onUserUpdate={onUserUpdate} />
      </TabsContent>

      <TabsContent value="discounts">
        <DiscountManager />
      </TabsContent>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure your e-commerce platform settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
