import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, MapPin, Sparkles, Hotel, Plane, Car, PartyPopper, UtensilsCrossed, Info, ShieldCheck, FileText, RotateCcw, Mail } from 'lucide-react';

const PRODUCT_LINKS = [
  { to: '/explore', label: 'Explore', icon: MapPin },
  { to: '/planner', label: 'AI Planner', icon: Sparkles },
  { to: '/trips', label: 'My Trips', icon: Compass },
];

const TRAVEL_LINKS = [
  { to: '/hotels', label: 'Hotels', icon: Hotel },
  { to: '/restaurants', label: 'Restaurants', icon: UtensilsCrossed },
  { to: '/flights', label: 'Flights', icon: Plane },
  { to: '/cabs', label: 'Cabs', icon: Car },
  { to: '/experiences', label: 'Experiences', icon: PartyPopper },
];

const COMPANY_LINKS = [
  { to: '/about', label: 'About', icon: Info },
  { to: '/safety', label: 'Safety', icon: ShieldCheck },
  { to: '/contact', label: 'Contact Us', icon: Mail },
];

const LEGAL_LINKS = [
  { to: '/terms', label: 'Terms & Conditions', icon: FileText },
  { to: '/privacy', label: 'Privacy Policy', icon: ShieldCheck },
  { to: '/refund-policy', label: 'Refund Policy', icon: RotateCcw },
];

function LinkList({ items }) {
  return (
    <ul className="space-y-2.5 text-sm text-slate-500">
      {items.map((item) => (
        <li key={item.to}>
          <Link to={item.to} className="group flex items-center gap-2 transition hover:text-brand-600">
            <item.icon size={14} className="text-slate-400 transition group-hover:text-brand-500" />
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-slate-100 bg-gradient-to-b from-white to-sand-50">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold text-brand-700">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-card">
              <Compass size={20} />
            </span>
            IntelliTrip
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">{t('footer.tagline')}</p>
        </div>
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Product
          </h4>
          <LinkList items={PRODUCT_LINKS} />
        </div>
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Travel
          </h4>
          <LinkList items={TRAVEL_LINKS} />
        </div>
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Company
          </h4>
          <LinkList items={COMPANY_LINKS} />
        </div>
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Legal
          </h4>
          <LinkList items={LEGAL_LINKS} />
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} IntelliTrip. {t('footer.rights')}
      </div>
    </footer>
  );
}
