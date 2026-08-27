import { Compass } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3 text-brand-600">
      <Compass className="animate-spin" size={36} />
      <p className="text-sm text-slate-500">Loading IntelliTrip...</p>
    </div>
  );
}
