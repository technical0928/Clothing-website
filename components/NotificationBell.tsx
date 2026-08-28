'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaBell } from 'react-icons/fa6';
import { useUnreadCount } from '@/hooks/useNotifications';
import { useSession } from 'next-auth/react';
import { notificationApi } from '@/lib/notification-api';
import toast from 'react-hot-toast';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = "" }) => {
  const { data: session } = useSession();
  const { unreadCount, refreshUnreadCount } = useUnreadCount();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't show notification bell if user is not logged in
  if (!session?.user) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 dark:text-stone-300 dark:hover:text-stone-100 dark:hover:bg-stone-700"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <FaBell className="w-6 h-6" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 dark:bg-stone-800 dark:border-stone-600">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-stone-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-stone-100">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-sm text-gray-500">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-200 dark:border-stone-600">
            <div className="flex space-x-2">
              <Link
                href="/notifications"
                onClick={() => setIsDropdownOpen(false)}
                className="flex-1 px-3 py-2 text-sm font-medium text-center text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 transition-colors"
              >
                View All
              </Link>
              
              {unreadCount > 0 && (
                <button
                  className="flex-1 px-3 py-2 text-sm font-medium text-center text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors dark:text-stone-300 dark:bg-stone-700 dark:border-stone-500 dark:hover:bg-stone-600"
                  onClick={async () => {
                    if (!session?.user?.email || isMarkingAll) return;
                    setIsMarkingAll(true);
                    try {
                      // Resolve user id from session email
                      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/email/${session.user.email}`);
                      const userData = await userResponse.json();
                      if (!userData?.id) {
                        toast.error('Could not identify user account');
                        return;
                      }
                      const userId = userData.id;
                      // Fetch all unread notifications for this user
                      const { notifications } = await notificationApi.getUserNotifications(userId, { isRead: false, limit: 100 });
                      const unreadIds = notifications.map((n) => n.id);
                      if (unreadIds.length > 0) {
                        await notificationApi.bulkMarkAsRead({ notificationIds: unreadIds, userId });
                      }
                      await refreshUnreadCount();
                      setIsDropdownOpen(false);
                      toast.success(unreadIds.length > 0 ? 'All notifications marked as read' : 'No unread notifications');
                    } catch (error) {
                      console.error('Error marking all as read:', error);
                      toast.error('Failed to mark notifications as read');
                    } finally {
                      setIsMarkingAll(false);
                    }
                  }}
                >
                  {isMarkingAll ? 'Marking…' : 'Mark All Read'}
                </button>
              )}
            </div>
          </div>

          {/* Notification Preview */}
          <div className="max-h-64 overflow-y-auto">
            {unreadCount === 0 ? (
              <div className="p-6 text-center">
                <FaBell className="w-12 h-12 mx-auto text-gray-300 dark:text-stone-500 mb-3" />
                <p className="text-gray-500 text-sm">No new notifications</p>
                <p className="text-gray-400 text-xs mt-1">You&apos;re all caught up!</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-stone-300 mb-2">
                    You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                  <Link
                    href="/notifications"
                    onClick={() => setIsDropdownOpen(false)}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 transition-colors"
                  >
                    View in Notification Center →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 dark:bg-stone-800 dark:border-stone-600">
            <Link
              href="/notifications"
              onClick={() => setIsDropdownOpen(false)}
              className="block w-full text-center text-sm text-gray-600 hover:text-amber-700 transition-colors dark:text-stone-300 dark:hover:text-amber-400"
            >
              Go to Notification Center
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;