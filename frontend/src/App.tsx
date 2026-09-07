import {
  useEffect,
  useState,
} from 'react';
import Header from '@/components/Header';
import LoginScreen from '@/components/LoginScreen';
import CustomerSignup from '@/components/CustomerSignup';
import CustomerMenu from '@/components/CustomerMenu';
import CustomerOrders from '@/components/CustomerOrders';
import CartBar from '@/components/CartBar';
import OrderConfirmation from '@/components/OrderConfirmation';
import WaiterView from '@/components/WaiterView';
import Footer from '@/components/Footer';
import { AppProvider, useApp } from '@/context/AppContext';
import type { Order } from '@/types';

const CUSTOMER_TAB_STORAGE_KEY =
  'chowly-customer-active-tab';

function ChowlyApp() {
  const {
    role,
    user,
    loading,
  } = useApp();

  const [customerTab, setCustomerTab] =
    useState<'menu' | 'orders'>(() => {
      try {
        const stored =
          window.sessionStorage.getItem(
            CUSTOMER_TAB_STORAGE_KEY,
          );

        if (
          stored === 'orders' ||
          stored === 'menu'
        ) {
          return stored;
        }
      } catch {
        // Ignore sessionStorage failures.
      }

      return 'menu';
    });

  const [placedOrder, setPlacedOrder] =
    useState<Order | null>(null);

  useEffect(() => {
    /*
     * Whenever the customer logs out, always reset
     * the active customer tab to Menu.
     */
    if (!user) {
      setCustomerTab('menu');

      try {
        window.sessionStorage.setItem(
          CUSTOMER_TAB_STORAGE_KEY,
          'menu',
        );
      } catch {
        // Ignore sessionStorage failures.
      }
    }
  }, [user]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        CUSTOMER_TAB_STORAGE_KEY,
        customerTab,
      );
    } catch {
      // Ignore sessionStorage failures.
    }
  }, [customerTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-ink-100 border-t-primary-500" />

          <p className="mt-4 text-sm font-medium text-ink-500">
            Loading Chowly...
          </p>
        </div>
      </div>
    );
  }

  const pathname =
    window.location.pathname;

  const isCustomerSignup =
    pathname === '/customer-signup';

  const isCustomerLogin =
    pathname === '/customer-login';

  const isWaiterLogin =
    pathname === '/waiter-login';

  const isCustomerApp =
    pathname === '/customer';

  const isWaiterApp =
    pathname === '/waiter';

  /*
   * Customer signup is always accessible.
   */
  if (isCustomerSignup) {
    return <CustomerSignup />;
  }

  /*
   * Customer login must always display the
   * customer login screen.
   */
  if (isCustomerLogin) {
    return <LoginScreen />;
  }

  /*
   * Waiter login must always display the
   * waiter login screen.
   */
  if (isWaiterLogin) {
    return <LoginScreen />;
  }

  /*
   * The root URL is intentionally reserved for
   * the future Chowly landing page.
   *
   * For now, show the customer login screen there
   * only when no landing page exists yet.
   */
  if (pathname === '/') {
    return <LoginScreen />;
  }

  /*
   * Customer application route.
   *
   * A customer must be authenticated to access it.
   */
  if (isCustomerApp) {
    if (!user || role !== 'customer') {
      window.location.replace(
        '/customer-login',
      );

      return null;
    }

    return (
      <div className="min-h-screen bg-cream-100 flex flex-col">
        <Header
          customerTab={customerTab}
          setCustomerTab={setCustomerTab}
        />

        <main className="flex-1">
          {customerTab === 'menu' ? (
            <CustomerMenu />
          ) : (
            <CustomerOrders />
          )}
        </main>

        <Footer />

        {customerTab === 'menu' && (
          <CartBar
            onOrderPlaced={(order) =>
              setPlacedOrder(order)
            }
          />
        )}

        {placedOrder && (
          <OrderConfirmation
            order={placedOrder}
            onClose={() =>
              setPlacedOrder(null)
            }
            onViewOrders={() => {
              setPlacedOrder(null);
              setCustomerTab('orders');
            }}
          />
        )}
      </div>
    );
  }

  /*
   * Waiter application route.
   *
   * A waiter must be authenticated to access it.
   */
  if (isWaiterApp) {
    if (!user || role !== 'waiter') {
      window.location.replace(
        '/waiter-login',
      );

      return null;
    }

    return (
      <div className="min-h-screen bg-cream-100 flex flex-col">
        <Header
          customerTab={customerTab}
          setCustomerTab={setCustomerTab}
        />

        <main className="flex-1">
          <WaiterView />
        </main>

        <Footer />
      </div>
    );
  }

  /*
   * Unknown routes return to the appropriate
   * login page instead of silently opening the
   * customer application.
   */
  if (user && role === 'customer') {
    window.location.replace('/customer');
    return null;
  }

  if (user && role === 'waiter') {
    window.location.replace('/waiter');
    return null;
  }

  return <LoginScreen />;
}

export default function App() {
  return (
    <AppProvider>
      <ChowlyApp />
    </AppProvider>
  );
}
