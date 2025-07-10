
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { formatDistanceToNow } from 'date-fns';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevUnreadCountRef = useRef(unreadCount);

  // Play notification sound when new notification arrives
  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current && unreadCount > 0) {
      if (audioRef.current) {
        audioRef.current.play().catch(error => {
          console.log('Could not play notification sound:', error);
        });
      }
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'preorder':
        return '📋';
      case 'user':
        return '👤';
      case 'product':
        return '🛍️';
      case 'payment':
        return '💳';
      case 'discount':
        return '🏷️';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'order':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'payment':
        return 'bg-purple-100 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to related page with proper tab highlighting
    if (notification.related_type && notification.related_id) {
      switch (notification.related_type) {
        case 'order':
          navigate('/admin?tab=orders', { 
            state: { highlightId: notification.related_id }
          });
          break;
        case 'preorder':
          navigate('/admin?tab=preorders', { 
            state: { highlightId: notification.related_id }
          });
          break;
        case 'product':
          navigate('/admin?tab=products', { 
            state: { highlightId: notification.related_id }
          });
          break;
        case 'user':
          navigate('/admin?tab=users', { 
            state: { highlightId: notification.related_id }
          });
          break;
        case 'discount':
          navigate('/admin?tab=discounts', { 
            state: { highlightId: notification.related_id }
          });
          break;
        default:
          navigate('/admin');
          break;
      }
    } else {
      navigate('/admin');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeCSCN0fPNeSsBJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeCSCN0fPNeSsBJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeCSCN0fPNeSsBJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeCSCN0fPNeSsBIoXG8t+PPwsVXLPo7KpWFAlFnt7xwGQfByCM0fPNeSsBJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeCSCN0fPNeSsBHoLG8t+PPwsVXLPo7KpWFAlFnt7xwGQfByCM0fPNeSsBJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeCSCN0fPNeSsBJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeCSCN0fPNeSsB" type="audio/wav" />
      </audio>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="flex items-center gap-1"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : getNotificationColor(notification.type)
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-lg flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium text-sm ${
                              notification.read ? 'text-gray-600' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className={`text-sm ${
                            notification.read ? 'text-gray-500' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notification);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AdminNotifications;
