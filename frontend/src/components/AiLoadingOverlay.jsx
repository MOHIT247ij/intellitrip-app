import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { LOADING_MESSAGES } from '../utils/constants';

/**
 * AiLoadingOverlay — the "attractive loading experience" required by
 * the spec. These messages are purely a UI status ticker (they do
 * NOT represent separate backend calls — the actual work is one
 * request to POST /api/ai/plan that runs retrieval + Gemini + Zod
 * validation server-side).
 */
export default function AiLoadingOverlay() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setIndex((i) => (i + 1) % LOADING_MESSAGES.length), 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
        <Sparkles className="animate-pulse text-brand-600" size={36} />
        <span className="absolute inset-0 animate-ping rounded-full border-2 border-brand-300 opacity-40" />
      </div>
      <p className="text-lg font-semibold text-slate-800">{LOADING_MESSAGES[index]}</p>
      <p className="mt-2 text-sm text-slate-400">This usually takes a few seconds...</p>
      <div className="mt-6 flex gap-1.5">
        {LOADING_MESSAGES.map((_, i) => (
          <span key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i === index ? 'bg-brand-600' : 'bg-slate-200'}`} />
        ))}
      </div>
    </div>
  );
}
