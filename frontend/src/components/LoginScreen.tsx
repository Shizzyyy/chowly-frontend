import { FormEvent, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Role } from '@/context/AppContext';

export default function LoginScreen() {
  const { login } = useApp();

  const isWaiterLogin =
    window.location.pathname ===
    '/waiter-login';

  const selectedRole: Role =
    isWaiterLogin
      ? 'waiter'
      : 'customer';

  const [username, setUsername] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      await login(
        username.trim(),
        password,
        selectedRole,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    selectedRole === 'customer'
      ? 'Customer Login'
      : 'Waiter Login';

  const subtitle =
    selectedRole === 'customer'
      ? 'Sign in to order from Chowly'
      : 'Sign in to manage Chowly orders';

  const demoUsername =
    selectedRole === 'customer'
      ? 'customer_demo'
      : 'waiter_chidi';

  const demoPassword =
    selectedRole === 'customer'
      ? 'customer123'
      : 'waiter123';

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 shadow-warm">
            <UtensilsCrossed
              className="h-7 w-7 text-white"
              strokeWidth={2.5}
            />
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-900">
            {title}
          </h1>

          <p className="mt-2 text-sm text-ink-500">
            {subtitle}
          </p>
        </div>

        <div className="rounded-3xl bg-cream-50 p-6 shadow-card border border-ink-100">
          <div className="mb-6 rounded-2xl bg-cream-200 px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Signing in as
            </p>

            <p className="mt-1 text-lg font-bold text-primary-600">
              {selectedRole === 'customer'
                ? 'Customer'
                : 'Waiter'}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value,
                  )
                }
                autoComplete="username"
                required
                className="w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder={
                  demoUsername
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary-500 px-4 py-3 text-sm font-bold text-white shadow-warm transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? 'Signing in...'
                : `Sign in as ${
                    selectedRole ===
                    'customer'
                      ? 'Customer'
                      : 'Waiter'
                  }`}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-cream-100 p-4 text-xs text-ink-500">
            <p className="font-semibold text-ink-700">
              Demo credentials
            </p>

            <p className="mt-1">
              {demoUsername} /{' '}
              {demoPassword}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
