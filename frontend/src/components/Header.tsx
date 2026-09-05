import { useEffect, useRef, useState } from 'react';
import {
  UtensilsCrossed,
  Utensils,
  ClipboardList,
  MapPin,
  LogOut,
  Bell,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface HeaderProps {
  customerTab: 'menu' | 'orders';
  setCustomerTab: (t: 'menu' | 'orders') => void;
}

export default function Header({
  customerTab,
  setCustomerTab,
}: HeaderProps) {
  const {
    role,
    user,
    logout,
    tableNumber,
    notifications,
    markNotificationRead,
    clearNotification,
    clearAllNotifications,
  } = useApp();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  useEffect(() => {
    if (!notificationOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationOpen]);

  const handleLogout = async () => {
    await logout();
  };

  const handleNotificationClick = (notificationId: string) => {
    markNotificationRead(notificationId);
  };

  const handleClearNotification = (
    event: React.MouseEvent,
    notificationId: string,
  ) => {
    event.stopPropagation();
    clearNotification(notificationId);
  };

  const handleClearAllNotifications = () => {
    clearAllNotifications();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-cream-50/85 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 shadow-warm">
              <UtensilsCrossed
                className="h-5 w-5 text-white"
                strokeWidth={2.5}
              />
            </div>

            <span className="font-display text-xl font-bold tracking-tight text-ink-900">
              Chowly
            </span>
          </div>

          {role === 'customer' && (
            <nav className="hidden items-center gap-1 rounded-full bg-cream-200 p-1 sm:flex">
              <button
                onClick={() => setCustomerTab('menu')}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  customerTab === 'menu'
                    ? 'bg-white text-primary-600 shadow-card'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                <Utensils className="h-4 w-4" />
                Menu
              </button>

              <button
                onClick={() => setCustomerTab('orders')}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  customerTab === 'orders'
                    ? 'bg-white text-primary-600 shadow-card'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                My Orders
              </button>
            </nav>
          )}

          {role === 'customer' && (
            <div className="hidden items-center gap-1.5 text-sm text-ink-500 md:flex">
              <MapPin className="h-4 w-4 text-primary-500" />
              <span className="font-medium">Table</span>
              <span className="font-bold text-ink-800">
                {tableNumber}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div
              ref={notificationRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setNotificationOpen((open) => !open)
                }
                className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-all ${
                  notificationOpen
                    ? 'bg-cream-200 text-ink-800'
                    : 'hover:bg-cream-200 hover:text-ink-800'
                }`}
                aria-label="Notifications"
                aria-expanded={notificationOpen}
                title="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />

                {unreadNotifications > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[9px] font-bold text-white">
                    {unreadNotifications > 9
                      ? '9+'
                      : unreadNotifications}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-warm-lg animate-fade-in">
                  <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-ink-900">
                        Notifications
                      </p>

                      <p className="text-[11px] text-ink-400">
                        {notifications.length === 0
                          ? 'No notifications'
                          : unreadNotifications > 0
                            ? `${unreadNotifications} unread`
                            : 'All caught up'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllNotifications}
                          className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-primary-600 transition-colors hover:bg-primary-50"
                        >
                          Clear all
                        </button>
                      )}

                      <Bell className="h-4 w-4 text-primary-500" />
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-cream-100">
                        <Bell className="h-5 w-5 text-ink-300" />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-ink-600">
                        You're all caught up
                      </p>

                      <p className="mt-1 text-xs text-ink-400">
                        Order updates will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.slice(0, 8).map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start border-b border-ink-50 last:border-b-0 ${
                            notification.isRead
                              ? 'bg-white'
                              : 'bg-primary-50/40'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleNotificationClick(notification.id)
                            }
                            className="min-w-0 flex-1 px-4 py-3 text-left transition-colors hover:bg-cream-50"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                  notification.isRead
                                    ? 'bg-cream-100'
                                    : 'bg-primary-100'
                                }`}
                              >
                                <Bell
                                  className={`h-3.5 w-3.5 ${
                                    notification.isRead
                                      ? 'text-ink-300'
                                      : 'text-primary-500'
                                  }`}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`text-xs leading-5 ${
                                    notification.isRead
                                      ? 'font-medium text-ink-500'
                                      : 'font-semibold text-ink-800'
                                  }`}
                                >
                                  {notification.message}
                                </p>

                                <p className="mt-1 text-[10px] text-ink-400">
                                  Order #{notification.orderId}
                                </p>
                              </div>

                              {!notification.isRead && (
                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                              )}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={(event) =>
                              handleClearNotification(
                                event,
                                notification.id,
                              )
                            }
                            className="mr-2 mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-cream-200 hover:text-ink-700"
                            aria-label={`Clear notification: ${notification.message}`}
                            title="Clear notification"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-ink-800">
                {user.name || user.username}
              </p>

              <p className="text-[11px] capitalize text-ink-500">
                {role}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-ink-800"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {role === 'customer' && (
          <div className="pb-3 sm:hidden">
            <nav className="flex items-center gap-1 rounded-full bg-cream-200 p-1">
              <button
                onClick={() => setCustomerTab('menu')}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  customerTab === 'menu'
                    ? 'bg-white text-primary-600 shadow-card'
                    : 'text-ink-500'
                }`}
              >
                <Utensils className="h-4 w-4" />
                Menu
              </button>

              <button
                onClick={() => setCustomerTab('orders')}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  customerTab === 'orders'
                    ? 'bg-white text-primary-600 shadow-card'
                    : 'text-ink-500'
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                Orders
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
