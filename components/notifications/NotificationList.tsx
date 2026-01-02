'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { NotificationWithRelations } from '@/types/notification';
import { NOTIFICATION_COLORS } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NotificationListProps {
  limit?: number;
  onNotificationClick?: () => void;
  onCountChange?: (count: number) => void;
  maxHeight?: string;
}

export default function NotificationList({
  limit = 20,
  onNotificationClick,
  onCountChange,
  maxHeight = '600px',
}: NotificationListProps) {
  const [notifications, setNotifications] = useState<NotificationWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        onCountChange?.(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [limit]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date() } : n))
        );
        // Update unread count
        const unreadCount = notifications.filter((n) => !n.read).length - 1;
        onCountChange?.(Math.max(0, unreadCount));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        const unreadCount = notifications.filter((n) => !n.read && n.id !== id).length;
        onCountChange?.(unreadCount);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification: NotificationWithRelations) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    if (notification.link && onNotificationClick) {
      onNotificationClick();
      window.location.href = notification.link;
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }}>
      <div className="divide-y">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 hover:bg-muted/50 cursor-pointer relative group ${!notification.read ? 'bg-muted/20' : ''
              }`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-transparent'
                  }`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Badge className={NOTIFICATION_COLORS[notification.type as keyof typeof NOTIFICATION_COLORS] || ''}>
                      {notification.type}
                    </Badge>
                    {notification.creator && (
                      <span className="text-xs text-muted-foreground">
                        {notification.creator.name}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDelete(notification.id, e)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {notification.message}
                </p>

                <div className="flex items-center justify-between">
                  <time className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </time>
                  {notification.link && (
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>

                {notification.campaign && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {notification.campaign.name}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
