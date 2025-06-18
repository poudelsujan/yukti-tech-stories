
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Clock, Calendar } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  roles: string[];
  created_at: string;
  last_sign_in_at: string | null;
}

interface UserManagementProps {
  users: UserProfile[];
  onUserUpdate: () => void;
}

const UserManagement = ({ users, onUserUpdate }: UserManagementProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const toggleUserRole = async (userId: string, role: 'admin' | 'moderator') => {
    setLoading(`${userId}-${role}`);
    
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

      await onUserUpdate(); // Reload users
      toast({
        title: "Role Updated",
        description: `User role ${existingRole ? 'removed' : 'added'} successfully`
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role"
      });
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLoginStatus = (lastSignIn: string | null) => {
    if (!lastSignIn) return { status: 'Never logged in', color: 'text-gray-500' };
    
    const lastLoginDate = new Date(lastSignIn);
    const now = new Date();
    const diffHours = (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return { status: 'Active now', color: 'text-green-600' };
    } else if (diffHours < 24) {
      return { status: `Active ${Math.floor(diffHours)}h ago`, color: 'text-blue-600' };
    } else if (diffHours < 168) { // 7 days
      return { status: `Active ${Math.floor(diffHours / 24)}d ago`, color: 'text-yellow-600' };
    } else {
      return { status: 'Inactive', color: 'text-red-600' };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>Manage user roles and monitor user activity</CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Users will appear here once they register.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Login Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const loginStatus = getLoginStatus(user.last_sign_in_at);
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{user.full_name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          {user.roles.map((role) => (
                            <Badge 
                              key={role} 
                              variant={role === 'admin' ? 'destructive' : 'secondary'}
                            >
                              {role}
                            </Badge>
                          ))}
                          {user.roles.length === 0 && (
                            <Badge variant="outline">user</Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className={`text-sm ${loginStatus.color}`}>
                            {loginStatus.status}
                          </span>
                        </div>
                        {user.last_sign_in_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            Last: {formatDate(user.last_sign_in_at)}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(user.created_at)}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={user.roles.includes('admin') ? 'destructive' : 'outline'}
                            onClick={() => toggleUserRole(user.id, 'admin')}
                            disabled={loading === `${user.id}-admin`}
                          >
                            {loading === `${user.id}-admin` ? 'Loading...' : 
                             user.roles.includes('admin') ? 'Remove Admin' : 'Make Admin'}
                          </Button>
                          <Button
                            size="sm"
                            variant={user.roles.includes('moderator') ? 'secondary' : 'outline'}
                            onClick={() => toggleUserRole(user.id, 'moderator')}
                            disabled={loading === `${user.id}-moderator`}
                          >
                            {loading === `${user.id}-moderator` ? 'Loading...' : 
                             user.roles.includes('moderator') ? 'Remove Mod' : 'Make Mod'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
