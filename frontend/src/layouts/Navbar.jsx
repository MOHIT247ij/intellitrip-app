import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, Menu, X, Globe, User, LogOut, ChevronDown, Wallet, ShieldCheck, Shield, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';

const NAV_LINKS = [
  { to: '/', key: 'home' },
  { to: '/explore', key: 'explore' },
  { to: '/planner', key: 'planner' },
  { to: '/trips', key: 'trips' },
  { to: '/bookings', key: 'bookings' },
  { to: '/about', key: 'about' },
];

export default function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 shadow-soft backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-brand-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-card">
            <Compass size={20} />
          </span>
          IntelliTrip
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-card'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-brand-700'
                }`
              }
            >
              {t(`nav.${link.key}`)}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-brand-700"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
            >
              <Globe size={16} /> {language.toUpperCase()} <ChevronDown size={14} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            {langOpen && (
              <ul
                role="listbox"
                className="absolute right-0 z-10 mt-2 w-36 origin-top-right animate-fadeInUp rounded-xl border border-slate-100 bg-white py-1 shadow-cardHover"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <li key={l.code}>
                    <button
                      onClick={() => {
                        setLanguage(l.code);
                        setLangOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-brand-50 ${l.code === language ? 'font-medium text-brand-700' : 'text-slate-600'}`}
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full bg-slate-50 py-1.5 pl-1.5 pr-3 text-sm font-medium text-slate-700 ring-1 ring-slate-100 transition hover:bg-slate-100"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white shadow-soft">
                  {user?.fullName?.[0]?.toUpperCase() || <User size={14} />}
                </span>
                {user?.fullName?.split(' ')[0]}
                {user?.isPremium && <Crown size={14} className="text-amber-500" aria-label="Premium member" />}
                <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <ul className="absolute right-0 z-10 mt-2 w-52 origin-top-right animate-fadeInUp overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-cardHover">
                  <li>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">
                      <User size={15} /> {t('nav.profile')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/premium" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">
                      <Crown size={15} /> {user?.isPremium ? 'Premium' : 'Go Premium'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/expenses" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">
                      <Wallet size={15} /> {t('nav.expenses')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/safety" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">
                      <ShieldCheck size={15} /> {t('nav.safety')}
                    </Link>
                  </li>
                  {user?.role === 'ADMIN' && (
                    <li>
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">
                        <Shield size={15} /> {t('nav.admin')}
                      </Link>
                    </li>
                  )}
                  <li className="my-1 border-t border-slate-100" />
                  <li>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50">
                      <LogOut size={15} /> {t('nav.logout')}
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn-primary !px-5 !py-2">
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="animate-fadeInUp border-t border-slate-100 bg-white lg:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`
                }
              >
                {t(`nav.${link.key}`)}
              </NavLink>
            ))}
            <div className="my-2 flex flex-wrap gap-2">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${l.code === language ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
                  <User size={15} /> {t('nav.profile')}
                </NavLink>
                <NavLink to="/premium" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
                  <Crown size={15} /> {user?.isPremium ? 'Premium' : 'Go Premium'}
                </NavLink>
                <NavLink to="/expenses" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
                  <Wallet size={15} /> {t('nav.expenses')}
                </NavLink>
                <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50">
                  <LogOut size={15} /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1">
                  {t('nav.login')}
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
