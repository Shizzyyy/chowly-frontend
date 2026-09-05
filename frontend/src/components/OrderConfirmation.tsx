import {
  Check,
  Clock,
  Receipt,
  X,
} from 'lucide-react';
import type { Order } from '@/types';
import {
  formatPrice,
  formatPrepTime,
} from '@/data';

interface OrderConfirmationProps {
  order: Order;
  onClose: () => void;
  onViewOrders: () => void;
}

export default function OrderConfirmation({
  order,
  onClose,
  onViewOrders,
}: OrderConfirmationProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-cream-50 shadow-2xl animate-slide-up sm:animate-scale-in overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-md hover:bg-white transition-all active:scale-90"
          aria-label="Close order confirmation"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-gradient-to-br from-primary-500 to-primary-600 px-6 py-8 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <Check
              className="h-8 w-8"
              strokeWidth={3}
            />
          </div>

          <h2 className="mt-4 font-display text-2xl font-bold">
            Order Placed!
          </h2>

          <p className="mt-1 text-sm text-primary-100">
            Order{' '}
            <span className="font-mono font-bold">
              #{order.id}
            </span>{' '}
            · Table {order.tableNumber}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-primary-50 py-4">
            <Clock className="h-5 w-5 text-primary-600" />

            <span className="text-sm text-ink-600">
              Estimated wait time
            </span>

            <span className="font-display text-xl font-bold text-primary-600">
              {formatPrepTime(
                order.totalPrepTime,
              )}
            </span>
          </div>

          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink-800 mb-2">
              <Receipt className="h-4 w-4 text-primary-500" />
              Order Details
            </h3>

            <div className="space-y-2 rounded-2xl bg-white p-4 shadow-card">
              {order.items.map(
                (item) => (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-ink-700">
                      <span className="font-bold text-primary-600">
                        {item.quantity}×
                      </span>{' '}
                      {item.name}
                    </span>

                    <span className="font-semibold text-ink-800">
                      {formatPrice(
                        item.price *
                          item.quantity,
                      )}
                    </span>
                  </div>
                ),
              )}

              <div className="border-t border-ink-100 pt-2 flex items-center justify-between">
                <span className="font-bold text-ink-900">
                  Total
                </span>

                <span className="font-display text-lg font-bold text-primary-600">
                  {formatPrice(
                    order.totalAmount,
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-cream-100 p-4 text-center">
            <p className="text-sm font-semibold text-ink-800">
              Your order is waiting for acceptance.
            </p>

            <p className="mt-1 text-xs leading-5 text-ink-500">
              A waiter will accept your order first.
              Once accepted, a chef or bartender will
              be assigned and preparation will begin.
            </p>
          </div>

          <p className="text-center text-xs text-ink-500">
            You can track every stage of your order
            under "My Orders".
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn-outline flex-1"
            >
              Continue Browsing
            </button>

            <button
              onClick={onViewOrders}
              className="btn-primary flex-1"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
