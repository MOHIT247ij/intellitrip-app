/**
 * BackToTop.jsx — a small floating button that fades in once the user has
 * scrolled down a bit, and smooth-scrolls back to the top of the page on
 * click. Pure UI polish, no backend/API involvement.
 */
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-6 left-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-cardHover transition-all duration-300 hover:-translate-y-1 active:scale-90 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <ArrowUp size={18} />
    </button>
  );
}
