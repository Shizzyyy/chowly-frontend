import { Utensils, Wine, Search, Sparkles, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import type { MenuType } from '@/types';
import MenuCard from './MenuCard';

export default function CustomerMenu() {
  const { menuItems, tableNumber, user } = useApp();

  const [activeType, setActiveType] = useState<MenuType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let items = menuItems;

    if (activeType !== 'all') {
      items = items.filter((item) => item.type === activeType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query),
      );
    }

    return items;
  }, [menuItems, activeType, searchQuery]);

  const popular = filtered.filter((item) => item.popular).slice(0, 4);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-full">
      <section className="bg-cream-100">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary-700 shadow-card">
                <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                Welcome to Chowly
              </div>

              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
                What are you in the mood for?
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-ink-500 sm:text-base">
                Browse the menu, choose your favourites, and place your order
                straight from your table.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-card">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
                <Utensils className="h-4 w-4 text-primary-600" />
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                  Dining at
                </p>

                <p className="text-sm font-bold text-ink-800">
                  Table {tableNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 rounded-3xl bg-white p-3 shadow-card sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search dishes, drinks, or categories..."
                  className="w-full rounded-2xl border border-ink-100 bg-cream-50 py-3.5 pl-11 pr-10 text-sm text-ink-800 placeholder:text-ink-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                  aria-label="Search menu"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-cream-200 hover:text-ink-700"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 rounded-2xl bg-cream-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveType('all')}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    activeType === 'all'
                      ? 'bg-primary-500 text-white shadow-warm'
                      : 'text-ink-600 hover:bg-white hover:text-primary-600'
                  }`}
                >
                  All
                </button>

                <button
                  type="button"
                  onClick={() => setActiveType('food')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    activeType === 'food'
                      ? 'bg-primary-500 text-white shadow-warm'
                      : 'text-ink-600 hover:bg-white hover:text-primary-600'
                  }`}
                >
                  <Utensils className="h-4 w-4" />
                  Food
                </button>

                <button
                  type="button"
                  onClick={() => setActiveType('drinks')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    activeType === 'drinks'
                      ? 'bg-primary-500 text-white shadow-warm'
                      : 'text-ink-600 hover:bg-white hover:text-primary-600'
                  }`}
                >
                  <Wine className="h-4 w-4" />
                  Drinks
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {popular.length > 0 && !searchQuery.trim() && (
        <section className="bg-cream-100 pb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <span className="chip bg-accent-100 text-accent-800">
                  Popular choices
                </span>

                <h2 className="mt-2 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                  Most ordered
                </h2>

                <p className="mt-1 text-sm text-ink-500">
                  Favourites from other Chowly guests.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((item, index) => (
                <div
                  key={item.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <MenuCard item={item} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        id="full-menu"
        className="scroll-mt-16 bg-cream-50 py-10 sm:py-12"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 border-b border-ink-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-600">
                Chowly Menu
              </p>

              <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                {activeType === 'all'
                  ? 'Explore the menu'
                  : activeType === 'food'
                    ? 'Food'
                    : 'Drinks'}
              </h2>

              <p className="mt-1 text-sm text-ink-500">
                {searchQuery.trim()
                  ? `${filtered.length} ${
                      filtered.length === 1 ? 'item' : 'items'
                    } found`
                  : `${filtered.length} ${
                      filtered.length === 1 ? 'item' : 'items'
                    } available`}
              </p>
            </div>

            {(searchQuery || activeType !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveType('all');
                }}
                className="self-start text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline sm:self-auto"
              >
                Clear filters
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cream-200">
                <Search className="h-9 w-9 text-ink-300" />
              </div>

              <h3 className="mt-5 font-display text-lg font-bold text-ink-800">
                No menu items found
              </h3>

              <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
                Try another search term or switch between food and drinks.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveType('all');
                }}
                className="mt-5 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-warm transition-all hover:bg-primary-600 active:scale-95"
              >
                View full menu
              </button>
            </div>
          ) : (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item, index) => (
                <div
                  key={item.id}
                  className="animate-slide-up"
                  style={{
                    animationDelay: `${Math.min(index * 40, 400)}ms`,
                  }}
                >
                  <MenuCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
