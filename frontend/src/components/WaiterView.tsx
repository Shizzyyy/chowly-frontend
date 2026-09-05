import { useState, useEffect } from 'react';
import {
  ClipboardList,
  Clock,
  ChefHat,
  Wine,
  UserCheck,
  CheckCircle2,
  Utensils,
  X,
  Star,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { useApp, getStaffName } from '@/context/AppContext';
import { formatPrice, formatPrepTime } from '@/data';
import type { Order, Staff } from '@/types';

const statusConfig = {
  pending: {
    label: 'Order Placed',
    color: 'bg-warning-100 text-warning-600',
    dot: 'bg-warning-500',
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-indigo-100 text-indigo-600',
    dot: 'bg-indigo-500',
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-blue-100 text-blue-600',
    dot: 'bg-blue-500',
  },
  ready: {
    label: 'Ready',
    color: 'bg-purple-100 text-purple-600',
    dot: 'bg-purple-500',
  },
  served: {
    label: 'Awaiting Payment',
    color: 'bg-success-100 text-success-600',
    dot: 'bg-success-500',
  },
  completed: {
    label: 'Completed',
    color: 'bg-ink-100 text-ink-600',
    dot: 'bg-ink-400',
  },
};

export default function WaiterView() {
  const {
    orders,
    acceptOrder,
    assignStaff,
    markReady,
    markServed,
    confirmPayment,
    chefs,
    bartenders,
    waiters,
  } = useApp();

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(
      () => setNow(Date.now()),
      1000,
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedOrder) return;

    const updated = orders.find(
      (order) => order.id === selectedOrder.id,
    );

    if (updated) {
      setSelectedOrder(updated);
    }
  }, [orders, selectedOrder]);

  const activeOrders = orders.filter(
    (order) =>
      order.status === 'pending' ||
      order.status === 'accepted' ||
      order.status === 'preparing' ||
      order.status === 'ready',
  );

  const servedOrders = orders.filter(
    (order) => order.status === 'served',
  );

  const completedOrders = orders.filter(
    (order) => order.status === 'completed',
  );

  return (
    <div className="bg-cream-100 min-h-[80vh] py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white">
            <ClipboardList className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900">
              Waiter Dashboard
            </h2>
            <p className="text-sm text-ink-500">
              Manage orders, assign staff, and complete service
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <div className="card p-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-warning-500" />
              <span className="text-xs font-semibold text-ink-500">
                New Orders
              </span>
            </div>

            <p className="mt-1.5 font-display text-2xl font-bold text-ink-900">
              {
                orders.filter(
                  (order) =>
                    order.status === 'pending',
                ).length
              }
            </p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-ink-500">
                Preparing
              </span>
            </div>

            <p className="mt-1.5 font-display text-2xl font-bold text-ink-900">
              {
                orders.filter(
                  (order) =>
                    order.status ===
                    'preparing',
                ).length
              }
            </p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-success-500" />
              <span className="text-xs font-semibold text-ink-500">
                Awaiting Payment
              </span>
            </div>

            <p className="mt-1.5 font-display text-2xl font-bold text-ink-900">
              {servedOrders.length}
            </p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-ink-400" />
              <span className="text-xs font-semibold text-ink-500">
                Completed
              </span>
            </div>

            <p className="mt-1.5 font-display text-2xl font-bold text-ink-900">
              {completedOrders.length}
            </p>
          </div>
        </div>

        <h3 className="mt-8 font-display text-lg font-bold text-ink-900">
          Active Orders
        </h3>

        {activeOrders.length === 0 ? (
          <div className="mt-3 card p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success-400" />

            <p className="mt-3 text-sm text-ink-500">
              All caught up! No active orders.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {activeOrders.map((order) => {
              const cfg =
                statusConfig[order.status];

              const timerStart =
                order.status === 'preparing' ||
                order.status === 'ready'
                  ? order.preparingStartedAt ??
                    order.createdAt
                  : order.createdAt;

              const elapsedMin = Math.max(
                0,
                Math.floor(
                  (now - timerStart) / 60000,
                ),
              );

              const isDelayed =
                (order.status ===
                  'preparing' ||
                  order.status === 'ready') &&
                order.totalPrepTime > 0 &&
                elapsedMin >
                  order.totalPrepTime;

              return (
                <button
                  key={order.id}
                  onClick={() =>
                    setSelectedOrder(order)
                  }
                  className="card w-full p-4 text-left hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-ink-900">
                        #{order.id}
                      </span>

                      <span
                        className={`chip ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>

                      {isDelayed && (
                        <span className="chip bg-error-100 text-error-600 animate-pulse">
                          <AlertCircle className="h-3 w-3" />
                          Delayed
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-ink-400">
                      Table {order.tableNumber}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs text-ink-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {elapsedMin}m /{' '}
                      {formatPrepTime(
                        order.totalPrepTime,
                      )}
                    </span>

                    <span>
                      {order.items.length} items ·{' '}
                      {formatPrice(
                        order.totalAmount,
                      )}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-xs">
                    {order.chefId ? (
                      <span className="flex items-center gap-1 text-success-600">
                        <ChefHat className="h-3.5 w-3.5" />
                        {getStaffName(
                          order.chefId,
                          chefs,
                        )}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-ink-400">
                        <ChefHat className="h-3.5 w-3.5" />
                        Chef unassigned
                      </span>
                    )}

                    {order.bartenderId ? (
                      <span className="flex items-center gap-1 text-success-600">
                        <Wine className="h-3.5 w-3.5" />
                        {getStaffName(
                          order.bartenderId,
                          bartenders,
                        )}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-ink-400">
                        <Wine className="h-3.5 w-3.5" />
                        Bartender unassigned
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {servedOrders.length > 0 && (
          <>
            <h3 className="mt-8 font-display text-lg font-bold text-ink-900">
              Awaiting Payment
            </h3>

            <div className="mt-3 space-y-3">
              {servedOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() =>
                    setSelectedOrder(order)
                  }
                  className="card w-full p-4 text-left hover:shadow-card-hover transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-ink-900">
                        #{order.id}
                      </span>

                      <span
                        className={`chip ${
                          order.paymentSubmitted
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'bg-success-100 text-success-600'
                        }`}
                      >
                        {order.paymentSubmitted
                          ? 'Payment Submitted'
                          : 'Awaiting Payment'}
                      </span>
                    </div>

                    <span className="text-xs text-ink-400">
                      Table {order.tableNumber}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs text-ink-500">
                    <span>
                      {order.items.length} items ·{' '}
                      {formatPrice(
                        order.totalAmount,
                      )}
                    </span>

                    {order.complaint && (
                      <span className="flex items-center gap-1 text-error-500">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Complaint (
                        {order.complaint.rating}★)
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-2 text-xs font-semibold ${
                      order.paymentSubmitted
                        ? 'text-indigo-600'
                        : 'text-success-600'
                    }`}
                  >
                    {order.paymentSubmitted
                      ? 'Payment submitted — waiting for waiter confirmation'
                      : 'Served — waiting for customer payment'}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}

        {completedOrders.length > 0 && (
          <>
            <h3 className="mt-8 font-display text-lg font-bold text-ink-900">
              Completed Orders
            </h3>

            <div className="mt-3 space-y-3">
              {completedOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() =>
                    setSelectedOrder(order)
                  }
                  className="card w-full p-4 text-left hover:shadow-card-hover transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-ink-900">
                        #{order.id}
                      </span>

                      <span className="chip bg-ink-100 text-ink-600">
                        Completed
                      </span>
                    </div>

                    <span className="text-xs text-ink-400">
                      Table {order.tableNumber}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs text-ink-500">
                    <span>
                      {order.items.length} items ·{' '}
                      {formatPrice(
                        order.totalAmount,
                      )}
                    </span>

                    {order.complaint && (
                      <span className="flex items-center gap-1 text-error-500">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Complaint (
                        {order.complaint.rating}★)
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs font-semibold text-ink-600">
                    Payment confirmed — order completed
                  </p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedOrder && (
        <WaiterOrderDetail
          order={selectedOrder}
          onClose={() =>
            setSelectedOrder(null)
          }
          onAccept={acceptOrder}
          onAssign={assignStaff}
          onMarkReady={markReady}
          onMarkServed={markServed}
          onConfirmPayment={confirmPayment}
          chefs={chefs}
          bartenders={bartenders}
          waiters={waiters}
        />
      )}
    </div>
  );
}

interface WaiterOrderDetailProps {
  order: Order;
  onClose: () => void;

  onAccept: (
    orderId: string,
  ) => Promise<void>;

  onAssign: (
    orderId: string,
    chefId?: string,
    bartenderId?: string,
  ) => Promise<void>;

  onMarkReady: (
    orderId: string,
  ) => Promise<void>;

  onMarkServed: (
    orderId: string,
  ) => Promise<void>;

  onConfirmPayment: (
    orderId: string,
  ) => Promise<void>;

  chefs: Staff[];
  bartenders: Staff[];
  waiters: Staff[];
}

function WaiterOrderDetail({
  order,
  onClose,
  onAccept,
  onAssign,
  onMarkReady,
  onMarkServed,
  onConfirmPayment,
  chefs,
  bartenders,
  waiters,
}: WaiterOrderDetailProps) {
  const [selectedChef, setSelectedChef] =
    useState(order.chefId || '');

  const [selectedBartender, setSelectedBartender] =
    useState(order.bartenderId || '');

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const hasFood = order.items.some(
    (item) => item.type === 'food',
  );

  const hasDrinks = order.items.some(
    (item) => item.type === 'drinks',
  );

  const hasRequiredStaff =
    (!hasFood ||
      Boolean(
        selectedChef ||
          order.chefId,
      )) &&
    (!hasDrinks ||
      Boolean(
        selectedBartender ||
          order.bartenderId,
      ));

  const handleAccept = async () => {
    setError('');
    setSaving(true);

    try {
      await onAccept(order.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to accept the order.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    setError('');
    setSaving(true);

    try {
      await onAssign(
        order.id,
        selectedChef || undefined,
        selectedBartender || undefined,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to assign staff.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReady = async () => {
    setError('');
    setSaving(true);

    try {
      await onMarkReady(order.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to mark the order as ready.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleServed = async () => {
    setError('');
    setSaving(true);

    try {
      await onMarkServed(order.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to mark the order as served.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPayment =
    async () => {
      setError('');
      setSaving(true);

      try {
        await onConfirmPayment(
          order.id,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to confirm payment.',
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-cream-50 shadow-2xl animate-slide-up sm:animate-scale-in scrollbar-hide">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-cream-50/95 backdrop-blur px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-ink-900">
              #{order.id}
            </span>

            <span className="chip bg-ink-100 text-ink-700">
              Table {order.tableNumber}
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-ink-700 hover:bg-ink-900 hover:text-white transition-all active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink-800 mb-2">
              <Utensils className="h-4 w-4 text-primary-500" />
              Order Items
            </h3>

            <div className="space-y-1.5">
              {order.items.map((item) => (
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
              ))}
            </div>

            <div className="mt-3 border-t border-ink-100 pt-2 flex items-center justify-between">
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

          {order.complaint && (
            <div className="rounded-2xl bg-error-50 p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-error-500" />

                <span className="text-sm font-semibold text-error-700">
                  Customer Complaint
                </span>

                <div className="ml-auto flex items-center gap-0.5">
                  {Array.from({
                    length: 5,
                  }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i <
                        order.complaint!.rating
                          ? 'fill-error-500 text-error-500'
                          : 'text-ink-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-2 text-sm text-ink-600 italic">
                "{order.complaint.message}"
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error-600">
              {error}
            </div>
          )}

          {order.status === 'pending' && (
            <button
              onClick={handleAccept}
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-600 active:scale-95 disabled:opacity-60"
            >
              <UserCheck className="h-5 w-5" />

              {saving
                ? 'Accepting...'
                : 'Accept Order'}
            </button>
          )}

          {order.status === 'accepted' && (
            <>
              {hasFood && (
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-ink-800 mb-2">
                    <ChefHat className="h-4 w-4 text-primary-500" />
                    Assign Chef
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {chefs.map((chef) => (
                      <button
                        key={chef.id}
                        onClick={() =>
                          setSelectedChef(
                            chef.id,
                          )
                        }
                        className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${
                          selectedChef ===
                          chef.id
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-ink-200 bg-white text-ink-600 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cream-200 text-xs font-bold">
                          {chef.name
                            .split(' ')[1]
                            ?.[0] ||
                            chef.name[0]}
                        </div>

                        {chef.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hasDrinks && (
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-ink-800 mb-2">
                    <Wine className="h-4 w-4 text-blue-500" />
                    Assign Bartender
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {bartenders.map(
                      (bartender) => (
                        <button
                          key={
                            bartender.id
                          }
                          onClick={() =>
                            setSelectedBartender(
                              bartender.id,
                            )
                          }
                          className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${
                            selectedBartender ===
                            bartender.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-ink-200 bg-white text-ink-600 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cream-200 text-xs font-bold">
                            {bartender.name
                              .split(' ')[1]
                              ?.[0] ||
                              bartender.name[0]}
                          </div>

                          {bartender.name}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleAssign}
                disabled={
                  saving ||
                  !hasRequiredStaff
                }
                className="btn-outline w-full"
              >
                {saving
                  ? 'Saving...'
                  : 'Confirm Assignment'}
              </button>
            </>
          )}

          {order.status === 'preparing' && (
            <>
              <div className="rounded-2xl bg-blue-50 p-4 text-center">
                <Clock className="mx-auto h-8 w-8 text-blue-500" />

                <p className="mt-2 text-sm font-semibold text-blue-700">
                  Order is being prepared
                </p>

                <p className="mt-1 text-xs text-ink-500">
                  Staff have been assigned and preparation is in progress.
                </p>
              </div>

              <button
                onClick={handleReady}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-purple-500 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-purple-600 active:scale-95 disabled:opacity-60"
              >
                <CheckCircle2 className="h-5 w-5" />

                {saving
                  ? 'Saving...'
                  : 'Mark as Ready'}
              </button>
            </>
          )}

          {order.status === 'ready' && (
            <>
              <div className="rounded-2xl bg-purple-50 p-4 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-purple-500" />

                <p className="mt-2 text-sm font-semibold text-purple-700">
                  Order is ready to serve
                </p>

                <p className="mt-1 text-xs text-ink-500">
                  Confirm service after delivering the order to the customer.
                </p>
              </div>

              <button
                onClick={handleServed}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-success-500 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-success-600 active:scale-95 disabled:opacity-60"
              >
                <UserCheck className="h-5 w-5" />

                {saving
                  ? 'Saving...'
                  : 'Confirm Served'}
              </button>
            </>
          )}

          {order.status === 'served' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-success-50 p-4 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-success-500" />

                <p className="mt-2 text-sm font-semibold text-success-700">
                  Order served
                </p>

                <p className="mt-1 text-xs text-ink-500">
                  {order.paymentSubmitted
                    ? 'Payment has been submitted. Confirm it below to complete the order.'
                    : 'Customer can now pay from their device.'}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-card">
                <p className="text-sm font-semibold text-ink-800">
                  Payment status
                </p>

                <p className="mt-1 text-sm text-ink-500">
                  {order.paymentSubmitted
                    ? 'Payment submitted'
                    : 'Awaiting customer payment'}
                </p>
              </div>

              {order.paymentSubmitted && (
                <button
                  onClick={
                    handleConfirmPayment
                  }
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-ink-800 active:scale-95 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-5 w-5" />

                  {saving
                    ? 'Confirming...'
                    : 'Confirm Payment & Complete'}
                </button>
              )}
            </div>
          )}

          {order.status === 'completed' && (
            <div className="rounded-2xl bg-ink-100 p-4 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-ink-500" />

              <p className="mt-2 text-sm font-semibold text-ink-700">
                Order completed
              </p>

              <p className="mt-1 text-xs text-ink-500">
                Payment has been confirmed and the order is complete.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
