import {
  ShoppingBag,
  Clock,
  X,
  Plus,
  Minus,
  Trash2,
  MapPin,
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatPrice, formatPrepTime } from '@/data';
import type { Order } from '@/types';

interface CartBarProps {
  onOrderPlaced: (order: Order) => void;
}

const TABLE_NUMBERS = Array.from(
  { length: 30 },
  (_, index) => index + 1,
);

export default function CartBar({
  onOrderPlaced,
}: CartBarProps) {
  const {
    cart,
    cartCount,
    cartTotal,
    cartPrepTime,
    tableNumber,
    setTableNumber,
    updateCartQty,
    removeFromCart,
    clearCart,
    placeOrder,
  } = useApp();

  const [expanded, setExpanded] =
    useState(false);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] =
    useState('');

  if (cartCount === 0) return null;

  const handlePlaceOrder = async () => {
    if (placingOrder) return;

    if (tableNumber === null) {
      setError(
        'Please select your table before placing the order.',
      );

      setExpanded(true);

      return;
    }

    setError('');
    setPlacingOrder(true);

    try {
      const order =
        await placeOrder();

      setExpanded(false);
      onOrderPlaced(order);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to place your order. Please try again.',
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleTableChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = event.target.value;

    setError('');

    if (!value) {
      setTableNumber(null);
      return;
    }

    setTableNumber(Number(value));
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-sm transition-opacity duration-300 ${
          expanded
            ? 'opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={() =>
          setExpanded(false)
        }
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-2xl rounded-t-3xl bg-cream-50 shadow-2xl transition-transform duration-300 ${
          expanded
            ? 'translate-y-0'
            : 'translate-y-full'
        }`}
      >
        <div className="max-h-[70vh] overflow-y-auto p-5 scrollbar-hide">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-ink-900">
              Your Order
            </h3>

            <button
              onClick={() =>
                setExpanded(false)
              }
              className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-200 text-ink-600 transition-all hover:bg-ink-900 hover:text-white"
              aria-label="Close cart"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-5 rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <MapPin className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-ink-500">
                  Where are you seated?
                </p>

                <p className="text-sm font-bold text-ink-900">
                  {tableNumber === null
                    ? 'Select your table'
                    : `Table ${tableNumber} selected`}
                </p>
              </div>

              <select
                value={
                  tableNumber === null
                    ? ''
                    : String(tableNumber)
                }
                onChange={handleTableChange}
                className="rounded-xl border border-ink-200 bg-cream-50 px-3 py-2 text-sm font-bold text-ink-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                aria-label="Select your table"
              >
                <option value="">
                  Select table
                </option>

                {TABLE_NUMBERS.map(
                  (number) => (
                    <option
                      key={number}
                      value={number}
                    >
                      Table {number}
                    </option>
                  ),
                )}
              </select>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-ink-500">
              {tableNumber === null
                ? 'Choose the table you are seated at so the waiter knows where to bring your order.'
                : `Your order will be sent to the waiter for Table ${tableNumber}.`}
            </p>
          </div>

          <div className="space-y-3">
            {cart.map((line) => (
              <div
                key={line.item.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card"
              >
                <img
                  src={line.item.image}
                  alt={line.item.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-1 text-sm font-bold text-ink-900">
                    {line.item.name}
                  </h4>

                  <p className="text-sm font-semibold text-primary-600">
                    {formatPrice(
                      line.item.price,
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-ink-200 bg-cream-100 px-1.5 py-1">
                  <button
                    onClick={() =>
                      updateCartQty(
                        line.item.id,
                        line.quantity - 1,
                      )
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink-700 transition-all hover:bg-primary-50 hover:text-primary-600 active:scale-90"
                    aria-label={`Decrease ${line.item.name}`}
                  >
                    <Minus
                      className="h-3.5 w-3.5"
                      strokeWidth={2.5}
                    />
                  </button>

                  <span className="min-w-5 text-center text-sm font-bold">
                    {line.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateCartQty(
                        line.item.id,
                        line.quantity + 1,
                      )
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink-700 transition-all hover:bg-primary-50 hover:text-primary-600 active:scale-90"
                    aria-label={`Increase ${line.item.name}`}
                  >
                    <Plus
                      className="h-3.5 w-3.5"
                      strokeWidth={2.5}
                    />
                  </button>
                </div>

                <button
                  onClick={() =>
                    removeFromCart(
                      line.item.id,
                    )
                  }
                  className="text-ink-300 transition-colors hover:text-error-500"
                  aria-label={`Remove ${line.item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-ink-500">
            <span>Estimated wait time</span>

            <span className="flex items-center gap-1 font-semibold text-ink-800">
              <Clock className="h-4 w-4 text-primary-500" />
              {formatPrepTime(
                cartPrepTime,
              )}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between text-sm text-ink-500">
            <span>Clear cart</span>

            <button
              onClick={clearCart}
              className="font-semibold text-error-500 hover:underline"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-2xl px-4 pb-4">
        <div className="rounded-2xl bg-ink-900 p-3 shadow-warm-lg">
          {error && (
            <div className="mb-2 rounded-xl bg-error-50 px-3 py-2 text-xs font-medium text-error-600">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setExpanded((expanded) =>
                  !expanded,
                )
              }
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white"
              aria-label="Open your order"
            >
              <ShoppingBag className="h-5 w-5" />

              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-400 px-1 text-xs font-bold text-ink-900 ring-2 ring-ink-900">
                {cartCount}
              </span>
            </button>

            <button
              onClick={() =>
                setExpanded(true)
              }
              className="flex-1 text-left"
            >
              <p className="text-xs text-ink-300">
                {cartCount}{' '}
                {cartCount === 1
                  ? 'item'
                  : 'items'}{' '}
                ·{' '}
                {formatPrepTime(
                  cartPrepTime,
                )}{' '}
                wait
              </p>

              <p className="font-display text-lg font-bold text-white">
                {formatPrice(
                  cartTotal,
                )}
              </p>
            </button>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-primary-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placingOrder
                ? 'Placing...'
                : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
