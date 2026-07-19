'use client';

import { useState, useEffect } from 'react';
import { notificationApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  CheckCircle2,
  Clock,
  DollarSign,
  Star,
  AlertCircle,
  Package,
  Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationApi.list();
      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
        setUnreadCount(response.data.data.unread_count || 0);
      }
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev => 
        prev.map((n: any) => 
          n.id === id ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => 
        prev.map((n: any) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationApi.delete(id);
      setNotifications(prev => prev.filter((n: any) => n.id !== id));
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      job: <Package className="h-5 w-5 text-blue-500" />,
      payment: <DollarSign className="h-5 w-5 text-green-500" />,
      rating: <Star className="h-5 w-5 text-yellow-500" />,
      violation: <AlertCircle className="h-5 w-5 text-red-500" />,
      system: <Bell className="h-5 w-5 text-purple-500" />,
      user: <Users className="h-5 w-5 text-orange-500" />,
    };
    return icons[type] || <Bell className="h-5 w-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full mb-3" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          </div>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! Check back later for updates."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: any) => (
            <Card 
              key={notification.id} 
              className={`transition hover:shadow-md ${!notification.is_read ? 'border-l-4 border-l-orange-500' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <Badge className="bg-orange-500 text-white text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                      <div className="flex gap-1">
                        {!notification.is_read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark read
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs text-red-500 hover:text-red-700"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}