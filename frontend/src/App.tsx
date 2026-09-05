import {
  useEffect,
  useState,
} from 'react';
import Header from '@/components/Header';
import LoginScreen from '@/components/LoginScreen';
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

  /*
   * Chowly has two separate login URLs:
   *
   * /customer-login
   * /waiter-login
   *
   * LoginScreen reads the current pathname and
   * automatically uses the correct login role.
   */
  if (!user) {
    const pathname =
      window.location.pathname;

    const isCustomerLogin =
      pathname === '/customer-login';

    const isWaiterLogin =
      pathname === '/waiter-login';

    /*
     * Keep the root URL usable as the customer
     * login without adding a role switch.
     */
    if (
      isCustomerLogin ||
      isWaiterLogin ||
      pathname === '/'
    ) {
      return <LoginScreen />;
    }

    return <LoginScreen />;
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
