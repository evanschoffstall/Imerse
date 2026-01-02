'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationList from './NotificationList';

interface NotificationBellProps {
  refreshInterval?: number; // in milliseconds
}

export default function NotificationBell({ refreshInterval = 30000 }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?read=false&limit=1');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Set up polling for new notifications
    const interval = setInterval(fetchUnreadCount, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/notifications?action=mark-all-read', {
        method: 'PATCH',
      });

      if (response.ok) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <NotificationList
          onNotificationClick={() => setOpen(false)}
          onCountChange={setUnreadCount}
          maxHeight="400px"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
