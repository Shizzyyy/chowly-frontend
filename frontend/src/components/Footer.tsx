import { UtensilsCrossed, Instagram, Twitter, Facebook, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
                <UtensilsCrossed className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl font-bold text-white">Chowly</span>
            </div>
            <p className="mt-4 text-sm text-ink-400 leading-relaxed max-w-xs">
              Bold Nigerian flavours, served fresh at your table. Dine in, order from your phone, pay when you leave.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-ink-300 transition-all hover:bg-primary-500 hover:text-white active:scale-90"
                  aria-label="Social link"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Menu
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {['Mains', 'Soups & Swallows', 'Grills & Suya', 'Sides & Snacks', 'Drinks', 'Desserts'].map(
                (link) => (
                  <li key={link}>
                    <a href="#menu" className="text-ink-400 transition-colors hover:text-primary-400">
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {['About Us', 'Our Staff', 'Reservations', 'Careers', 'Privacy Policy', 'Terms of Service'].map(
                (link) => (
                  <li key={link}>
                    <a href="#" className="text-ink-400 transition-colors hover:text-primary-400">
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Contact
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-ink-400">
                <MapPin className="h-4.5 w-4.5 text-primary-400 shrink-0 mt-0.5" />
                <span>12 Admiralty Way, Lekki Phase 1, Lagos</span>
              </li>
              <li className="flex items-center gap-2.5 text-ink-400">
                <Phone className="h-4.5 w-4.5 text-primary-400 shrink-0" />
                <span>+234 803 123 4567</span>
              </li>
              <li className="flex items-center gap-2.5 text-ink-400">
                <Mail className="h-4.5 w-4.5 text-primary-400 shrink-0" />
                <span>hello@chowly.ng</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink-500">
            © 2026 Chowly Nigeria. All rights reserved.
          </p>
          <p className="text-xs text-ink-500">
            Made with love in Lagos
          </p>
        </div>
      </div>
    </footer>
  );
}
