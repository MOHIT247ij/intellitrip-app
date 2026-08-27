import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles, MapPinned, CalendarCheck, ShieldCheck, Wallet, Languages, ArrowRight, CloudSun, Compass, Crown, CheckCircle2 } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { catalogService } from '../services/catalogService';
import DestinationCard from '../components/DestinationCard';
import SkeletonCard from '../components/SkeletonCard';

const FEATURES = [
  { icon: Sparkles, title: 'AI-Generated Itineraries', desc: 'Structured, day-by-day plans built from real destination data — not generic templates.' },
  { icon: MapPinned, title: 'Hidden Gems + Interactive Maps', desc: 'Discover verified off-the-beaten-path places, synced live with your itinerary map.' },
  { icon: CalendarCheck, title: 'One-Tap Re-planning', desc: 'Ask the AI to make it cheaper, add adventure, or adjust for rain — instantly.' },
  { icon: Wallet, title: 'Group Expense Splitting', desc: 'Track shared costs across travellers and settle up without spreadsheets.' },
  { icon: ShieldCheck, title: 'Travel Safety', desc: 'Verified emergency numbers and nearby help, always within reach.' },
  { icon: Languages, title: 'Multilingual', desc: 'Plan and read your itinerary in English, Hindi or Marathi.' },
];

const HERO_BADGES = [
  { icon: Sparkles, label: 'AI-Powered' },
  { icon: CloudSun, label: 'Live Weather' },
  { icon: Languages, label: 'Multilingual' },
];

export default function Landing() {
  const { t } = useTranslation();
  const { data: destinations, loading } = useFetch(() => catalogService.listDestinations(), []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="blob -left-24 -top-24 h-72 w-72 bg-brand-300/40" />
        <div className="blob -right-16 top-32 h-64 w-64 bg-sand-200/60" />
        <div className="container-page relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="section-eyebrow">
              <Sparkles size={13} /> Powered by Gemini AI + RAG
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
              {t('hero.headline')}
            </h1>
            <p className="mt-4 max-w-lg text-lg text-slate-600">{t('hero.subtitle')}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {HERO_BADGES.map((b) => (
                <span key={b.label} className="chip">
                  <b.icon size={13} className="text-brand-600" /> {b.label}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/planner" className="btn-primary !px-7 !py-3.5 text-base">
                {t('hero.ctaPrimary')} <ArrowRight size={18} />
              </Link>
              <Link to="/explore" className="btn-secondary !px-7 !py-3.5 text-base">
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2" alt="Goa beach" className="col-span-2 h-52 w-full rounded-xl2 object-cover shadow-cardHover ring-1 ring-white/50" />
              <img src="https://images.unsplash.com/photo-1564329494258-3f72215ba175" alt="Kashmir lake" className="h-36 w-full rounded-xl2 object-cover shadow-card ring-1 ring-white/50" />
              <img src="https://images.unsplash.com/photo-1599661046289-e31897846e41" alt="Jaipur fort" className="h-36 w-full rounded-xl2 object-cover shadow-card ring-1 ring-white/50" />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden animate-float items-center gap-2 rounded-xl2 bg-white px-4 py-3 shadow-cardHover sm:flex">
              <span className="icon-badge h-9 w-9 !rounded-lg">
                <Compass size={16} />
              </span>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-slate-800">Trip planned</p>
                <p className="text-[11px] text-slate-500">in under a minute</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">Why IntelliTrip</span>
          <h2 className="section-heading mt-3">Everything you need to travel smarter</h2>
          <p className="section-subheading">A genuine AI travel companion — grounded in real data, not guesswork.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="card p-6"
            >
              <div className="icon-badge mb-4">
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-slate-800">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Destinations */}
      <section className="bg-sand-50 py-16">
        <div className="container-page">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="section-eyebrow">
                <MapPinned size={13} /> Explore India
              </span>
              <h2 className="section-heading mt-3">Popular destinations</h2>
              <p className="section-subheading">Seeded, demo destination data for this student build.</p>
            </div>
            <Link to="/explore" className="btn-secondary !px-5 !py-2.5 text-sm">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading && <SkeletonCard count={6} />}
            {destinations?.map((d) => <DestinationCard key={d.id} destination={d} />)}
          </div>
        </div>
      </section>

      {/* Premium */}
      <section className="container-page py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-xl2 border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white p-8 shadow-card sm:p-12"
        >
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="section-eyebrow !bg-amber-100 !text-amber-700">
                <Crown size={13} /> IntelliTrip Premium
              </span>
              <h2 className="section-heading mt-3 !text-left">Plan smarter, faster</h2>
              <p className="mt-2 max-w-lg text-slate-600">
                Unlimited AI itinerary planning, priority re-planning, and early access to new features — for just{' '}
                <span className="font-semibold text-slate-800">₹199/month</span>.
              </p>
              <ul className="mt-5 space-y-2">
                {['Unlimited AI itinerary planning', 'Priority AI re-planning', 'Early access to new features'].map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="shrink-0 text-amber-500" /> {perk}
                  </li>
                ))}
              </ul>
              <Link to="/premium" className="btn-primary !bg-gradient-to-r !from-amber-500 !to-amber-600 mt-7 inline-flex hover:!brightness-105">
                <Crown size={16} /> Go Premium <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-cardHover lg:h-48 lg:w-48">
              <Crown size={64} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="container-page py-16">
        <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-8 py-12 text-center text-white shadow-cardHover sm:px-16">
          <div className="blob -right-10 -top-10 h-56 w-56 bg-white/10" />
          <div className="blob -bottom-10 -left-10 h-56 w-56 bg-white/10" />
          <div className="relative">
            <h2 className="mt-3 font-display text-3xl font-bold">Ready to plan your next trip?</h2>
            <p className="mx-auto mt-2 max-w-lg text-brand-100">Tell our AI planner your budget, interests and dates — get a full itinerary in seconds.</p>
            <Link to="/planner" className="btn-light mt-6 inline-flex">
              {t('hero.ctaPrimary')} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
