import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-red-100 bg-red-50 px-6 py-12 text-center">
      <AlertTriangle size={32} className="mb-3 text-red-400" />
      <p className="text-sm font-medium text-red-700">{message || 'Something went wrong. Please try again.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          Try again
        </button>
      )}
    </div>
  );
}
