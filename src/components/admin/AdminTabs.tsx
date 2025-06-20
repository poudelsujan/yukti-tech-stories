
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Users, Package, Percent } from 'lucide-react';
import ProductManagement from '@/components/ProductManagement';
import UserManagement from '@/components/UserManagement';
import DiscountManager from '@/components/DiscountManager';

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
}

const AdminTabs = ({ users, onUserUpdate }: AdminTabsProps) => {
  return (
    <Tabs defaultValue="products" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="products" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Products
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Users
        </TabsTrigger>
        <TabsTrigger value="discounts" className="flex items-center gap-2">
          <Percent className="h-4 w-4" />
          Discounts
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
      </TabsList>

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
