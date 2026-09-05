import { Star, Clock, Plus, Check, Utensils, Wine } from 'lucide-react';
import { useState } from 'react';
import type { MenuItem } from '@/types';
import { formatPrice, formatPrepTime } from '@/data';
import { useApp } from '@/context/AppContext';

interface MenuCardProps {
  item: MenuItem;
}

export default function MenuCard({ item }: MenuCardProps) {
  const { cart, addToCart } = useApp();
  const inCart = cart.find((line) => line.item.id === item.id);
  const [imageFailed, setImageFailed] = useState(false);

  const handleAdd = () => {
    addToCart(item, 1);
  };

  return (
    <article className="card group flex h-[420px] flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      {/* Image */}
      <div className="relative h-[220px] shrink-0 overflow-hidden bg-ink-100">
        {!imageFailed && item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cream-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-card">
              {item.type === 'food' ? (
                <Utensils className="h-7 w-7 text-primary-400" />
              ) : (
                <Wine className="h-7 w-7 text-blue-400" />
              )}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        {/* Popular badge */}
        {item.popular && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-primary-500 px-3 py-1.5 text-[13px] font-bold text-white shadow-md">
            <Star className="h-3.5 w-3.5 fill-white" />
            Popular
          </span>
        )}

        {/* Prep time */}
        {item.prepTime != null && (
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[13px] font-semibold text-ink-700 shadow-md backdrop-blur-sm">
            <Clock className="h-3.5 w-3.5 text-ink-500" />
            {formatPrepTime(item.prepTime)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col p-5">
        {/* Title */}
        <div className="flex h-[58px] shrink-0 items-start justify-between gap-3">
          <h3 className="min-w-0 font-display text-xl font-bold leading-[29px] tracking-tight text-ink-900 line-clamp-2">
            {item.name}
          </h3>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              item.type === 'food'
                ? 'bg-orange-50 text-primary-700'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            {item.type === 'food' ? 'Food' : 'Drink'}
          </span>
        </div>

        {/* Description */}
        <div className="mt-2 h-[48px] shrink-0 overflow-hidden">
          {item.description && (
            <p className="text-sm leading-6 text-ink-500 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Bottom row */}
        <div className="mt-auto flex shrink-0 items-center justify-between border-t border-ink-100 pt-4">
          <span className="font-display text-xl font-bold text-primary-600">
            {formatPrice(item.price)}
          </span>

          <button
            type="button"
            onClick={handleAdd}
            className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all active:scale-95 ${
              inCart
                ? 'bg-success-500 text-white'
                : 'bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white'
            }`}
          >
            {inCart ? (
              <>
                <Check className="h-4 w-4" strokeWidth={2.5} />
                {inCart.quantity}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
