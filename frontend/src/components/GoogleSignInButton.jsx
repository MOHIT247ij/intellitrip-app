import { useEffect, useRef } from 'react';

/**
 * GoogleSignInButton
 * -----------------------------------------------------------------
 * Renders Google's official "Continue with Google" button using
 * Google Identity Services (loaded lazily, once, from Google's CDN).
 * On click, Google itself handles the sign-in and hands back a signed
 * ID token ("credential") via `onCredential` — we never see or store
 * the user's Google password. That credential is then POSTed to our
 * own backend (/api/auth/google), which verifies it and logs the user
 * in/creates their IntelliTrip account.
 *
 * Renders nothing if VITE_GOOGLE_CLIENT_ID isn't configured, so the
 * rest of the login/register page keeps working normally without it.
 * -----------------------------------------------------------------
 */
const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let gsiLoadPromise = null;
function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gsiLoadPromise) return gsiLoadPromise;
  gsiLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
    document.head.appendChild(script);
  });
  return gsiLoadPromise;
}

export default function GoogleSignInButton({ onCredential, showDivider = true }) {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return undefined;
    let cancelled = false;

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onCredential(response.credential),
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 320,
        });
      })
      .catch(() => {
        // Fails silently — the email/password form still works fine.
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential]);

  if (!clientId) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      {showDivider && (
        <div className="flex w-full items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
          <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
        </div>
      )}
      <div ref={buttonRef} className="flex w-full justify-center" />
    </div>
  );
}
