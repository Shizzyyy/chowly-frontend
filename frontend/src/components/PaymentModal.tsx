import {
  X,
  CreditCard,
  Check,
  ChevronLeft,
  Loader2,
  Banknote,
  Building2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { formatPrice } from '@/data';
import type { Order, PaymentMethod } from '@/types';

interface PaymentModalProps {
  order: Order | null;
  onClose: () => void;
}

const paymentMethods: {
  value: PaymentMethod;
  label: string;
  description: string;
}[] = [
  {
    value: 'cash',
    label: 'Cash',
    description:
      'Pay cash to your waiter. Your waiter will confirm receipt.',
  },
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    description:
      'Transfer the amount and wait for your waiter to verify it.',
  },
  {
    value: 'pretend',
    label: 'Pretend Payment',
    description:
      'Demo payment for testing. No real money is charged.',
  },
];

export default function PaymentModal({
  order,
  onClose,
}: PaymentModalProps) {
  const { submitPayment } = useApp();

  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>('cash');

  const [step, setStep] = useState<
    'pay' | 'processing' | 'success'
  >('pay');

  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      setStep('pay');
      setSelectedMethod('cash');
      setError('');
    }
  }, [order]);

  useEffect(() => {
    if (order) {
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [order]);

  if (!order) return null;

  const handlePay = async () => {
    if (step !== 'pay') return;

    setError('');
    setStep('processing');

    try {
      await submitPayment(
        order.id,
        selectedMethod,
      );

      setStep('success');
    } catch (err) {
      setStep('pay');

      setError(
        err instanceof Error
          ? err.message
          : 'Payment could not be submitted. Please try again.',
      );
    }
  };

  const handleClose = () => {
    if (step === 'processing') return;
    onClose();
  };

  const selectedMethodDetails =
    paymentMethods.find(
      (method) =>
        method.value === selectedMethod,
    );

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink-950/60 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4">
      <div
        className="absolute inset-0"
        onClick={handleClose}
      />

      <div className="relative flex max-h-[calc(100vh-1rem)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-cream-50 shadow-2xl animate-slide-up sm:max-h-[calc(100vh-2rem)] sm:rounded-3xl sm:animate-scale-in">
        {step !== 'success' && (
          <div className="flex shrink-0 items-center justify-between border-b border-ink-100 bg-cream-50 px-5 py-4">
            <button
              onClick={handleClose}
              disabled={step === 'processing'}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-ink-700 transition-all hover:bg-ink-900 hover:text-white active:scale-90 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h2 className="font-display text-lg font-bold text-ink-900">
              Payment
            </h2>

            <div className="w-9" />
          </div>
        )}

        {step === 'pay' && (
          <div className="min-h-0 overflow-y-auto p-5 scrollbar-hide">
            <div className="space-y-5">
              <div className="rounded-2xl bg-cream-200 p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-500">
                      Order
                    </span>

                    <span className="font-mono font-bold text-ink-900">
                      #{order.id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-500">
                      Table
                    </span>

                    <span className="font-bold text-ink-900">
                      Table {order.tableNumber}
                    </span>
                  </div>

                  <div className="space-y-1 border-t border-ink-200/50 pt-2">
                    {order.items.map((item) => (
                      <div
                        key={item.itemId}
                        className="flex items-center justify-between gap-3 text-xs text-ink-500"
                      >
                        <span className="min-w-0 truncate">
                          {item.quantity}× {item.name}
                        </span>

                        <span className="shrink-0">
                          {formatPrice(
                            item.price *
                              item.quantity,
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-ink-200/50 pt-2">
                    <span className="font-bold text-ink-900">
                      Total
                    </span>

                    <span className="font-display text-xl font-bold text-primary-600">
                      {formatPrice(
                        order.totalAmount,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-ink-800">
                  Payment Method
                </label>

                <div className="mt-2 space-y-2">
                  {paymentMethods.map(
                    (method) => {
                      const selected =
                        selectedMethod ===
                        method.value;

                      const Icon =
                        method.value ===
                        'cash'
                          ? Banknote
                          : method.value ===
                              'bank_transfer'
                            ? Building2
                            : CreditCard;

                      return (
                        <button
                          key={
                            method.value
                          }
                          type="button"
                          onClick={() =>
                            setSelectedMethod(
                              method.value,
                            )
                          }
                          className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                            selected
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-ink-200 bg-white hover:border-primary-300'
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              selected
                                ? 'bg-primary-500 text-white'
                                : 'bg-cream-200 text-ink-600'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`text-sm font-bold ${
                                selected
                                  ? 'text-primary-700'
                                  : 'text-ink-800'
                              }`}
                            >
                              {method.label}
                            </p>

                            <p className="mt-0.5 text-xs leading-5 text-ink-500">
                              {
                                method.description
                              }
                            </p>
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-ink-900 p-5 text-white shadow-warm-lg">
                <div className="flex items-center justify-between">
                  {selectedMethod ===
                  'cash' ? (
                    <Banknote className="h-8 w-8 text-primary-400" />
                  ) : selectedMethod ===
                    'bank_transfer' ? (
                    <Building2 className="h-8 w-8 text-primary-400" />
                  ) : (
                    <CreditCard className="h-8 w-8 text-primary-400" />
                  )}

                  <span className="text-xs font-medium text-ink-200">
                    Chowly Pay
                  </span>
                </div>

                <p className="mt-5 text-sm font-semibold text-white">
                  {selectedMethodDetails?.label}
                </p>

                <p className="mt-1 text-xs leading-5 text-ink-300">
                  {
                    selectedMethodDetails?.description
                  }
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm text-ink-300">
                    Amount
                  </span>

                  <span className="font-display text-xl font-bold text-white">
                    {formatPrice(
                      order.totalAmount,
                    )}
                  </span>
                </div>
              </div>

              <p className="rounded-xl bg-cream-200 p-3 text-center text-xs text-ink-500">
                Payment submission does not complete
                your order. Your waiter must confirm
                the payment before the order becomes
                completed.
              </p>

              {error && (
                <div className="rounded-xl bg-error-50 p-3 text-sm text-error-700">
                  {error}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={step !== 'pay'}
                className="btn-primary w-full shrink-0 py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-60"
              >
                Submit Payment ·{' '}
                {formatPrice(
                  order.totalAmount,
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex min-h-[280px] flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500" />

            <p className="mt-4 text-sm text-ink-500">
              Submitting payment...
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="min-h-0 overflow-y-auto p-8 text-center scrollbar-hide animate-scale-in">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-500 shadow-lg">
              <Check
                className="h-10 w-10 text-white"
                strokeWidth={3}
              />
            </div>

            <h2 className="mt-6 font-display text-2xl font-bold text-ink-900">
              Payment Submitted
            </h2>

            <p className="mt-2 text-sm text-ink-500">
              Your{' '}
              {selectedMethodDetails?.label.toLowerCase()}{' '}
              payment has been submitted.
              Your waiter will confirm it before
              the order is completed.
            </p>

            <div className="mt-6 space-y-2 rounded-2xl bg-cream-200 p-4 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500">
                  Order
                </span>

                <span className="font-mono font-bold text-ink-800">
                  #{order.id}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500">
                  Payment method
                </span>

                <span className="font-semibold text-ink-800">
                  {selectedMethodDetails?.label}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500">
                  Amount
                </span>

                <span className="font-display font-bold text-primary-600">
                  {formatPrice(
                    order.totalAmount,
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 border-t border-ink-200/50 pt-3 text-xs font-semibold text-primary-700">
                <ClockIcon />
                Waiting for waiter confirmation
              </div>
            </div>

            <button
              onClick={handleClose}
              className="btn-primary mt-6 w-full py-3.5 text-base"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100">
      <span className="h-2 w-2 rounded-full bg-primary-500" />
    </span>
  );
}
