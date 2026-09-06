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
     *
     * This means that after logging back in, the
     * customer starts from the Menu page instead of
     * being returned to the Orders page they logged
     * out from.
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

  /*
   * Customer signup is always accessible.
   */
  if (isCustomerSignup) {
    return <CustomerSignup />;
  }

  /*
   * Customer login must always display the
   * customer login screen. This prevents an
   * existing session from bypassing login when
   * the user has just signed up or explicitly
   * visits the customer login URL.
   */
  if (isCustomerLogin) {
    return <LoginScreen />;
  }

  /*
   * Waiter login must always display the
   * login screen when the user is not
   * authenticated.
   */
  if (!user) {
    return <LoginScreen />;
  }

  /*
   * Prevent an authenticated customer from
   * accidentally opening the waiter login URL.
   */
  if (
    isWaiterLogin &&
    role === 'customer'
  ) {
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
        {role === 'customer' ? (
          customerTab === 'menu' ? (
            <CustomerMenu />
          ) : (
            <CustomerOrders />
          )
        ) : (
          <WaiterView />
        )}
      </main>

      <Footer />

      {role === 'customer' &&
        customerTab === 'menu' && (
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

export default function App() {
  return (
    <AppProvider>
      <ChowlyApp />
    </AppProvider>
  );
}
