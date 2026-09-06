import {
  FormEvent,
  useState,
} from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function CustomerSignup() {
  const { signup } = useApp();

  const [name, setName] =
    useState('');

  const [username, setUsername] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await signup(
        name.trim(),
        username.trim(),
        password,
      );

      setSuccess(
        'Signup successful! Redirecting you to customer login...',
      );

      window.setTimeout(() => {
        window.location.href =
          '/customer-login';
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Signup failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

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
            Welcome to Chowly
          </h1>

          <p className="mt-2 text-sm text-ink-500">
            Create your customer account
          </p>
        </div>

        <div className="rounded-3xl bg-cream-50 p-6 shadow-card border border-ink-100">
          <div className="mb-6 rounded-2xl bg-cream-200 px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Create your account
            </p>

            <p className="mt-1 text-lg font-bold text-primary-600">
              Customer
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">
                Full name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                autoComplete="name"
                required
                disabled={submitting}
                className="w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Enter your full name"
              />
            </div>

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
                disabled={submitting}
                className="w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Choose a username"
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
                autoComplete="new-password"
                required
                minLength={8}
                disabled={submitting}
                className="w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Create a password"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={
                submitting ||
                Boolean(success)
              }
              className="w-full rounded-xl bg-primary-500 px-4 py-3 text-sm font-bold text-white shadow-warm transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? 'Creating account...'
                : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ink-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  window.location.href =
                    '/customer-login';
                }}
                className="font-semibold text-primary-600 transition-colors hover:text-primary-700"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
