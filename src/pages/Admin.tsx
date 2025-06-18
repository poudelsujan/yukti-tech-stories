
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, UserCheck, Shield, ArrowLeft, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductManagement from '@/components/ProductManagement';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  roles: string[];
  created_at: string;
}

const Admin = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminRole();
      loadUsers();
    }
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!data && !error);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Get auth users (this might be limited, so we'll use what we have)
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      const authUsers: User[] = authData?.users || [];

      // Combine the data
      const combinedUsers: UserProfile[] = profiles?.map(profile => {
        const authUser = authUsers.find(u => u.id === profile.id);
        const roles = userRoles?.filter(ur => ur.user_id === profile.id).map(ur => ur.role) || [];
        
        return {
          id: profile.id,
          full_name: profile.full_name || 'Unknown',
          email: authUser?.email || 'Unknown',
          roles,
          created_at: authUser?.created_at || ''
        };
      }) || [];

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, role: 'admin' | 'moderator') => {
    try {
      const existingRole = users.find(u => u.id === userId)?.roles.includes(role);
      
      if (existingRole) {
        // Remove role
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
      } else {
        // Add role
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
      }

      await loadUsers(); // Reload users
      toast({
        title: "Role Updated",
        description: `User role ${existingRole ? 'removed' : 'added'} successfully`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access admin panel</h1>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/" className="text-emerald-600 hover:text-emerald-700 mr-4">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.roles.includes('admin')).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Moderators</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.roles.includes('moderator')).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{user.full_name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex gap-2 mt-2">
                            {user.roles.map((role) => (
                              <Badge key={role} variant={role === 'admin' ? 'destructive' : 'secondary'}>
                                {role}
                              </Badge>
                            ))}
                            {user.roles.length === 0 && (
                              <Badge variant="outline">user</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={user.roles.includes('admin') ? 'destructive' : 'outline'}
                            onClick={() => toggleUserRole(user.id, 'admin')}
                          >
                            {user.roles.includes('admin') ? 'Remove Admin' : 'Make Admin'}
                          </Button>
                          <Button
                            size="sm"
                            variant={user.roles.includes('moderator') ? 'secondary' : 'outline'}
                            onClick={() => toggleUserRole(user.id, 'moderator')}
                          >
                            {user.roles.includes('moderator') ? 'Remove Mod' : 'Make Mod'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
