import {
  Clock,
  ChefHat,
  Wine,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Star,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp, getStaffName } from '@/context/AppContext';
import { formatPrice, formatPrepTime } from '@/data';
import type { Order } from '@/types';
import ComplaintModal from './ComplaintModal';
import PaymentModal from './PaymentModal';

const statusConfig = {
  pending: {
    label: 'Order Placed',
    color: 'bg-warning-100 text-warning-600',
    icon: Clock,
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-indigo-100 text-indigo-600',
    icon: CheckCircle2,
  },
  preparing: {
    label: 'Being prepared',
    color: 'bg-blue-100 text-blue-600',
    icon: ChefHat,
  },
  ready: {
    label: 'Ready to serve',
    color: 'bg-purple-100 text-purple-600',
    icon: CheckCircle2,
  },
  served: {
    label: 'Served',
    color: 'bg-success-100 text-success-600',
    icon: CheckCircle2,
  },
  completed: {
    label: 'Completed',
    color: 'bg-success-100 text-success-700',
    icon: CheckCircle2,
  },
};

const progressSteps = [
  { key: 'placed', label: 'Placed' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'served', label: 'Served' },
  { key: 'payment', label: 'Payment' },
  { key: 'completed', label: 'Completed' },
];

function getProgressIndex(order: Order) {
  switch (order.status) {
    case 'pending':
      return 0;

    case 'accepted':
      return 1;

    case 'preparing':
      return 2;

    case 'ready':
      return 2;

    case 'served':
      return order.paymentSubmitted ? 4 : 3;

    case 'completed':
      return 5;

    default:
      return 0;
  }
}

function getPaymentMessage(order: Order) {
  if (order.status !== 'served') {
    return null;
  }

  if (order.paymentSubmitted) {
    return 'Payment submitted — waiting for waiter confirmation.';
  }

  return 'Your order has been served. You can now pay.';
}

export default function CustomerOrders() {
  const {
    orders,
    tableNumber,
    chefs,
    bartenders,
  } = useApp();

  const [complaintOrder, setComplaintOrder] =
    useState<Order | null>(null);

  const [payOrder, setPayOrder] =
    useState<Order | null>(null);

  const [activeSection, setActiveSection] =
    useState<'ongoing' | 'completed'>(
      'ongoing',
    );

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(
      () => setNow(Date.now()),
      1000,
    );

    return () => clearInterval(interval);
  }, []);

  const myOrders = orders.filter(
    (order) => order.tableNumber === tableNumber,
  );

  const ongoingOrders = myOrders.filter(
    (order) => order.status !== 'completed',
  );

  const completedOrders = myOrders.filter(
    (order) => order.status === 'completed',
  );

  if (myOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream-200">
          <Utensils className="h-10 w-10 text-ink-300" />
        </div>

        <h3 className="mt-5 font-display text-lg font-bold text-ink-800">
          No orders yet
        </h3>

        <p className="mt-1.5 text-sm text-ink-500">
          Browse the menu and place your first order.
        </p>
      </div>
    );
  }

  const renderOrderCard = (order: Order) => {
    const cfg =
      statusConfig[order.status];

    const StatusIcon = cfg.icon;

    const elapsedMin = Math.max(
      0,
      Math.floor(
        (now - order.createdAt) /
          60000,
      ),
    );

    const preparingStart =
      order.preparingStartedAt ??
      order.createdAt;

    const preparingElapsedMin =
      order.status === 'preparing' ||
      order.status === 'ready'
        ? Math.max(
            0,
            Math.floor(
              (now -
                preparingStart) /
                60000,
            ),
          )
        : 0;

    const isDelayed =
      (order.status ===
        'preparing' ||
        order.status === 'ready') &&
      Boolean(
        order.totalPrepTime,
      ) &&
      preparingElapsedMin >
        order.totalPrepTime;

    const complaintEligible =
      order.status ===
        'preparing' &&
      preparingElapsedMin >= 30;

    const canComplain =
      complaintEligible &&
      !order.complaint;

    const canPay =
      order.status === 'served' &&
      !order.paymentSubmitted;

    const progressIndex =
      getProgressIndex(order);

    const paymentMessage =
      getPaymentMessage(order);

    return (
      <div
        key={order.id}
        className="card overflow-hidden"
      >
        {/* Order header */}
        <div className="flex items-center justify-between border-b border-ink-100 bg-cream-50 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-ink-900">
              #{order.id}
            </span>

            <span
              className={`chip ${cfg.color}`}
            >
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </span>

            {isDelayed && (
              <span className="chip animate-pulse bg-error-100 text-error-600">
                <AlertCircle className="h-3 w-3" />
                Delayed
              </span>
            )}
          </div>

          <span className="text-xs text-ink-400">
            {elapsedMin} min ago
          </span>
        </div>

        <div className="p-5">
          {/* Order progress */}
          <div className="mb-6 rounded-2xl bg-cream-50 px-3 py-4 sm:px-5">
            <div className="flex items-start justify-between">
              {progressSteps.map(
                (step, index) => {
                  const completed =
                    index <=
                    progressIndex;

                  const current =
                    index ===
                    progressIndex;

                  return (
                    <div
                      key={step.key}
                      className="flex min-w-0 flex-1 flex-col items-center"
                    >
                      <div className="flex w-full items-center">
                        {index > 0 ? (
                          <div
                            className={`h-0.5 flex-1 ${
                              index <=
                              progressIndex
                                ? 'bg-primary-500'
                                : 'bg-ink-100'
                            }`}
                          />
                        ) : (
                          <div className="flex-1" />
                        )}

                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                            completed
                              ? 'border-primary-500 bg-primary-500 text-white'
                              : 'border-ink-200 bg-white text-ink-300'
                          } ${
                            current
                              ? 'ring-4 ring-primary-50'
                              : ''
                          }`}
                        >
                          {completed &&
                          index <
                            progressIndex ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <span className="text-[10px] font-bold">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        {index <
                        progressSteps.length -
                          1 ? (
                          <div
                            className={`h-0.5 flex-1 ${
                              index <
                              progressIndex
                                ? 'bg-primary-500'
                                : 'bg-ink-100'
                            }`}
                          />
                        ) : (
                          <div className="flex-1" />
                        )}
                      </div>

                      <span
                        className={`mt-2 text-center text-[10px] font-semibold sm:text-xs ${
                          current
                            ? 'text-primary-600'
                            : completed
                              ? 'text-ink-600'
                              : 'text-ink-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-1.5">
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

                  <span className="text-ink-500">
                    {formatPrice(
                      item.price *
                        item.quantity,
                    )}
                  </span>
                </div>
              ),
            )}
          </div>

          {/* Order information */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Est.{' '}
              {formatPrepTime(
                order.totalPrepTime,
              )}
            </span>

            {order.chefId && (
              <span className="flex items-center gap-1">
                <ChefHat className="h-3.5 w-3.5 text-primary-500" />
                {getStaffName(
                  order.chefId,
                  chefs,
                )}
              </span>
            )}

            {order.bartenderId && (
              <span className="flex items-center gap-1">
                <Wine className="h-3.5 w-3.5 text-blue-500" />
                {getStaffName(
                  order.bartenderId,
                  bartenders,
                )}
              </span>
            )}
          </div>

          {/* Payment status */}
          {paymentMessage && (
            <div
              className={`mt-3 rounded-xl px-3 py-3 text-xs ${
                order.paymentSubmitted
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-success-50 text-success-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5" />

                <span className="font-semibold">
                  {paymentMessage}
                </span>
              </div>
            </div>
          )}

          {/* Completed payment */}
          {order.status ===
            'completed' && (
            <div className="mt-3 rounded-xl bg-success-50 px-3 py-3 text-xs text-success-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" />

                <span className="font-semibold">
                  Payment confirmed. Your order is completed.
                </span>
              </div>
            </div>
          )}

          {/* Complaint submitted */}
          {order.complaint && (
            <div className="mt-3 rounded-xl bg-error-50 p-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-error-500" />

                <span className="text-xs font-semibold text-error-700">
                  Complaint submitted
                </span>

                <div className="ml-auto flex items-center gap-0.5">
                  {Array.from({
                    length: 5,
                  }).map(
                    (_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i <
                          order
                            .complaint!
                            .rating
                            ? 'fill-error-500 text-error-500'
                            : 'text-ink-200'
                        }`}
                      />
                    ),
                  )}
                </div>
              </div>

              <p className="mt-1.5 text-xs italic text-ink-600">
                "{order.complaint.message}"
              </p>
            </div>
          )}

          {/* Complaint waiting message */}
          {order.status ===
            'preparing' &&
            !order.complaint &&
            !complaintEligible && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-cream-200 px-3 py-2 text-xs text-ink-500">
                <Clock className="h-3.5 w-3.5" />
                Complaint option becomes available after
                30 minutes of preparation.
              </div>
            )}

          {/* Footer */}
          <div className="mt-4 flex flex-col gap-3 border-t border-ink-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs text-ink-400">
                Order total
              </span>

              <div className="font-display text-lg font-bold text-ink-900">
                {formatPrice(
                  order.totalAmount,
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {canComplain && (
                <button
                  type="button"
                  onClick={() =>
                    setComplaintOrder(
                      order,
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 transition-all hover:border-error-400 hover:text-error-600 active:scale-95"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  Complain
                </button>
              )}

              {canPay && (
                <button
                  type="button"
                  onClick={() =>
                    setPayOrder(order)
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2.5 text-xs font-bold text-white shadow-warm transition-all hover:bg-primary-600 active:scale-95"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Pay Now
                </button>
              )}

              {order.status ===
                'served' &&
                order.paymentSubmitted && (
                  <span className="chip bg-primary-100 text-primary-700">
                    <Clock className="h-3.5 w-3.5" />
                    Awaiting confirmation
                  </span>
                )}

              {order.status ===
                'completed' && (
                <span className="chip bg-success-100 text-success-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Payment complete
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const displayedOrders =
    activeSection === 'ongoing'
      ? ongoingOrders
      : completedOrders;

  return (
    <div className="min-h-[60vh] bg-cream-100 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            My Orders
          </h2>

          <p className="mt-1 text-sm text-ink-500">
            Table {tableNumber} · {myOrders.length}{' '}
            {myOrders.length === 1
              ? 'order'
              : 'orders'}
          </p>
        </div>

        {/* Order section switcher */}
        <div className="mt-6 rounded-2xl bg-cream-200 p-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() =>
                setActiveSection(
                  'ongoing',
                )
              }
              className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                activeSection ===
                'ongoing'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-ink-500 hover:bg-white/60 hover:text-ink-700'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                Ongoing Orders
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    activeSection ===
                    'ongoing'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-ink-100 text-ink-500'
                  }`}
                >
                  {ongoingOrders.length}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection(
                  'completed',
                )
              }
              className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                activeSection ===
                'completed'
                  ? 'bg-white text-success-700 shadow-sm'
                  : 'text-ink-500 hover:bg-white/60 hover:text-ink-700'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Completed Orders
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    activeSection ===
                    'completed'
                      ? 'bg-success-100 text-success-700'
                      : 'bg-ink-100 text-ink-500'
                  }`}
                >
                  {completedOrders.length}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Selected orders */}
        <section className="mt-6">
          {displayedOrders.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-cream-50 px-5 py-10 text-center">
              {activeSection ===
              'ongoing' ? (
                <>
                  <Clock className="mx-auto h-8 w-8 text-ink-300" />

                  <p className="mt-2 text-sm font-semibold text-ink-600">
                    No ongoing orders
                  </p>

                  <p className="mt-1 text-xs text-ink-400">
                    New orders will appear here.
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="mx-auto h-8 w-8 text-ink-300" />

                  <p className="mt-2 text-sm font-semibold text-ink-600">
                    No completed orders
                  </p>

                  <p className="mt-1 text-xs text-ink-400">
                    Completed orders will appear here after payment is confirmed.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {displayedOrders.map(
                renderOrderCard,
              )}
            </div>
          )}
        </section>
      </div>

      <ComplaintModal
        order={complaintOrder}
        onClose={() =>
          setComplaintOrder(null)
        }
      />

      <PaymentModal
        order={payOrder}
        onClose={() =>
          setPayOrder(null)
        }
      />
    </div>
  );
}
