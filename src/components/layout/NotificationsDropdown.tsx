'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { notificationsAPI } from '@/lib/api/notifications';
import { formatDateRelative } from '@/lib/utils';
import type { Notification } from '@/types';

export function NotificationsDropdown() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getNotifications({ limit: 10 }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: notificationsAPI.getUnreadCount,
    refetchInterval: 30000,
  });

  const notifications = notificationsData?.data || [];
  const unreadCount = unreadData?.count || 0;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsAPI.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsAPI.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const getNotificationIcon = (type: string) => {
    // You can customize icons based on notification type
    return '📬';
  };

  const getNotificationMessage = (notification: Notification) => {
    return notification.data?.message || 'New notification';
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-96 max-h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsReadMutation.mutate()}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-96">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`
                        p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                        ${!notification.read_at ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {getNotificationMessage(notification)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDateRelative(notification.created_at)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read_at && (
                            <button
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteMutation.mutate(notification.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <Link
                  href="/dashboard/notifications"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  View All Notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}