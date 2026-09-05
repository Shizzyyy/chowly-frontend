import { X, Star, MessageSquare, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import type { Order } from '@/types';

interface ComplaintModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function ComplaintModal({
  order,
  onClose,
}: ComplaintModalProps) {
  const { submitComplaint } = useApp();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      setRating(0);
      setHoverRating(0);
      setMessage('');
      setError('');
      setSubmitting(false);
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

  const handleSubmit = async () => {
    if (
      rating === 0 ||
      !message.trim() ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await submitComplaint(order.id, {
        rating,
        message: message.trim(),
        createdAt: Date.now(),
      });

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit your complaint. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-cream-50 shadow-2xl animate-slide-up sm:animate-scale-in">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-error-100">
              <AlertCircle className="h-4.5 w-4.5 text-error-500" />
            </div>

            <h2 className="font-display text-lg font-bold text-ink-900">
              Complaint & Rating
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-ink-700 hover:bg-ink-900 hover:text-white transition-all active:scale-90 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="rounded-xl bg-cream-200 p-3 text-center">
            <p className="text-xs text-ink-500">
              Order
            </p>

            <p className="font-mono font-bold text-ink-900">
              #{order.id}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-ink-800">
              <Star className="h-4 w-4 text-accent-500" />
              How would you rate this order?
            </label>

            <div className="mt-3 flex items-center justify-center gap-2">
              {Array.from({ length: 5 }).map(
                (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      setRating(i + 1)
                    }
                    onMouseEnter={() =>
                      setHoverRating(i + 1)
                    }
                    onMouseLeave={() =>
                      setHoverRating(0)
                    }
                    disabled={submitting}
                    className="transition-all active:scale-90 disabled:opacity-50"
                    aria-label={`Rate ${
                      i + 1
                    } stars`}
                  >
                    <Star
                      className={`h-9 w-9 transition-all ${
                        i <
                        (hoverRating || rating)
                          ? 'fill-accent-400 text-accent-400 scale-110'
                          : 'text-ink-200'
                      }`}
                    />
                  </button>
                ),
              )}
            </div>

            {rating > 0 && (
              <p className="mt-2 text-center text-sm text-ink-500">
                {
                  [
                    '',
                    'Poor',
                    'Fair',
                    'Okay',
                    'Good',
                    'Excellent',
                  ][rating]
                }
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-ink-800">
              <MessageSquare className="h-4 w-4 text-primary-500" />
              What went wrong?
            </label>

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              disabled={submitting}
              placeholder="Tell us about the delay or issue with your order..."
              rows={4}
              className="mt-2 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all resize-none disabled:opacity-60"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-error-50 p-3 text-sm text-error-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-500" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              rating === 0 ||
              !message.trim() ||
              submitting
            }
            className="btn-primary w-full text-base py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? 'Submitting...'
              : 'Submit Complaint'}
          </button>
        </div>
      </div>
    </div>
  );
}
