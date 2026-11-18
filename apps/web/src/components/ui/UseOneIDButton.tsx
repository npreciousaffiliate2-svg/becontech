import React, { useState, useEffect } from 'react';
import { useOneIdService, UseOneIDPayload, LookupResult } from '../../lib/useOneIdService.ts';

export interface UseOneIDButtonProps {
  clientId?: string;
  redirectUri?: string;
  lookupEmail?: string;
  lookupPhone?: string;
  user?: any;
  onLookupComplete?: (result: LookupResult) => void;
  onSuccess: (payload: UseOneIDPayload) => void;
  onError?: (error: string) => void;
  theme?: 'light' | 'dark' | 'black' | 'brand' | 'reuse';
  text?: string;
  reuseText?: string;
  firstTimeText?: string;
  showBadge?: boolean;
  mode?: 'popup' | 'redirect';
  scope?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * UseOneIDButton — Official UseOneID Identity & KYC Integration Component
 * Matching the exact XIROLY Partner SDK specification:
 * - 4px border radius strictly
 * - Inter font (font-sans)
 * - Concurrent email & phone lookup against UseOneID vault
 * - Automatically routes to 1-Click Reuse Authorization if account exists, or First-Time Flow if not
 */
export const UseOneIDButton: React.FC<UseOneIDButtonProps> = ({
  clientId = useOneIdService.getClientId(),
  redirectUri: customRedirectUri,
  lookupEmail,
  lookupPhone,
  user,
  onLookupComplete,
  onSuccess,
  onError,
  theme = 'brand',
  text,
  reuseText = 'Authorize with 1-Click ID (Reuse)',
  firstTimeText = 'Verify with UseOneID',
  showBadge = true,
  mode = 'popup',
  scope = 'openid+profile+email+kyc',
  className = '',
  style = {},
}) => {
  const [loading, setLoading] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [accountFound, setAccountFound] = useState(false);
  const [matchedInfo, setMatchedInfo] = useState<LookupResult | null>(null);

  const effectiveEmail = (
    lookupEmail ||
    user?.email ||
    user?.user_metadata?.email ||
    user?.profile?.email ||
    ''
  )
    .trim()
    .toLowerCase();

  const effectivePhone = (
    lookupPhone ||
    user?.phone ||
    user?.profile?.phone ||
    user?.user_metadata?.phone ||
    ''
  )
    .trim()
    .replace(/[\s\-()]/g, '');

  // Concurrent lookup of email and phone with debouncing
  useEffect(() => {
    let isCancelled = false;

    if (!effectiveEmail && !effectivePhone) {
      setAccountFound(false);
      setMatchedInfo(null);
      return;
    }

    const isAlreadyVerified =
      Boolean(user?.user_metadata?.useoneid_verified) || Boolean(user?.useoneid_verified);

    if (isAlreadyVerified) {
      setAccountFound(true);
      const res: LookupResult = { found: true, matchedIdentifier: effectivePhone || effectiveEmail };
      setMatchedInfo(res);
      onLookupComplete?.(res);
      return;
    }

    const isEmailValid =
      effectiveEmail.includes('@') && effectiveEmail.includes('.') && effectiveEmail.length >= 6;
    const isPhoneValid = effectivePhone.length >= 10;

    if (!isEmailValid && !isPhoneValid) {
      setAccountFound(false);
      setMatchedInfo(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingAccount(true);
      try {
        const result = await useOneIdService.lookupUser({
          email: isEmailValid ? effectiveEmail : '',
          phone: isPhoneValid ? effectivePhone : '',
        });
        if (!isCancelled) {
          if (result && result.found) {
            setAccountFound(true);
            setMatchedInfo(result);
            onLookupComplete?.(result);
          } else {
            setAccountFound(false);
            setMatchedInfo(null);
            onLookupComplete?.(result);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setAccountFound(false);
          setMatchedInfo(null);
        }
      } finally {
        if (!isCancelled) setCheckingAccount(false);
      }
    }, 450);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [effectiveEmail, effectivePhone, user]);

  const handleClick = async () => {
    if (!clientId) {
      onError?.('UseOneID client_id is required. Please set VITE_USEONEID_CLIENT_ID.');
      return;
    }
    setLoading(true);

    let isReuse = accountFound;
    let matchedId = matchedInfo?.matchedIdentifier || effectiveEmail || effectivePhone || '';

    if (!accountFound && (effectiveEmail || effectivePhone)) {
      try {
        const liveCheck = await useOneIdService.lookupUser({
          email: effectiveEmail,
          phone: effectivePhone,
        });
        if (liveCheck && liveCheck.found) {
          isReuse = true;
          matchedId = liveCheck.matchedIdentifier || matchedId;
          setAccountFound(true);
          setMatchedInfo(liveCheck);
        }
      } catch (err) {
        console.warn('[UseOneIDButton] Live lookup notice:', err);
      }
    }

    const authBase = useOneIdService.getAuthBaseUrl();
    const normalizedScope = scope.trim().replace(/\s+/g, '+');

    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const canonicalOrigin = typeof window !== 'undefined' ? window.location.origin : '';

    const finalRedirect = customRedirectUri || `${canonicalOrigin}/api/auth/useoneid`;

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'token',
      scope: normalizedScope,
      redirect_uri: finalRedirect,
    });

    if (isReuse) {
      params.set('mode', 'reuse');
      params.set('flow', 'reuse');
      if (matchedId) {
        params.set('identifier', matchedId);
        params.set('login_hint', matchedId);
      }
    } else {
      params.set('mode', 'join');
      params.set('flow', 'standard');
      if (effectiveEmail) params.set('login_hint', effectiveEmail);
      if (effectivePhone) params.set('phone', effectivePhone);
    }

    const authUrl = `${authBase}/oauth/authorize?${params.toString()}`;

    if (mode === 'redirect') {
      window.location.href = authUrl;
      return;
    }

    // Popup handshake flow
    const popup = window.open(
      authUrl,
      'useoneid_auth',
      'width=480,height=680,menubar=no,toolbar=no'
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.location.href = authUrl;
      return;
    }

    let handshakeResolved = false;

    const listener = async (event: MessageEvent) => {
      const allowedOrigins = [
        authBase,
        canonicalOrigin,
        'https://useoneid.com',
        'https://auth.useoneid.com',
      ];
      if (typeof window !== 'undefined' && !allowedOrigins.includes(event.origin) && event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === 'USEONEID_AUTH_SUCCESS' || event.data?.type === 'USEONEID_VERIFY_SUCCESS') {
        handshakeResolved = true;
        window.removeEventListener('message', listener);
        if (popup && !popup.closed) popup.close();

        const payload = event.data.payload || {};
        const token =
          payload.access_token ||
          payload.id_token ||
          payload.token ||
          event.data.access_token ||
          event.data.token ||
          'useoneid_verified_token';

        let verified;
        try {
          verified = await useOneIdService.verifyToken(token);
        } catch (syncErr: any) {
          setLoading(false);
          onError?.(syncErr?.message || 'UseOneID could not confirm this identity.');
          return;
        }

        setLoading(false);
        onSuccess?.({ ...verified, token });
      } else if (event.data?.type === 'USEONEID_AUTH_ERROR' || event.data?.type === 'USEONEID_VERIFY_ERROR') {
        handshakeResolved = true;
        window.removeEventListener('message', listener);
        if (popup && !popup.closed) popup.close();
        setLoading(false);
        onError?.(event.data.error || 'Authentication cancelled');
      }
    };

    window.addEventListener('message', listener);

    const checkClosedInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosedInterval);
        window.removeEventListener('message', listener);
        setLoading(false);
        if (!handshakeResolved) onError?.('Authentication cancelled');
      }
    }, 500);
  };

  const themeStyles = {
    light: {
      background: '#ffffff',
      color: '#0f172a',
      border: '1px solid #cbd5e1',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    },
    dark: {
      background: '#0f172a',
      color: '#ffffff',
      border: '1px solid #1e293b',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    },
    black: {
      background: '#093322',
      color: '#ffffff',
      border: '1px solid #093322',
      boxShadow: '0 1px 3px rgba(9, 51, 34, 0.25)',
    },
    brand: {
      background: '#0F7640',
      color: '#ffffff',
      border: '1px solid #0b5930',
      boxShadow: '0 1px 3px rgba(15, 118, 64, 0.25)',
    },
    reuse: {
      background: '#047857',
      color: '#ffffff',
      border: '1px solid #065f46',
      boxShadow: '0 1px 3px rgba(4, 120, 87, 0.3)',
    },
  };

  const activeThemeKey = accountFound ? 'reuse' : theme || 'brand';
  const currentThemeStyle = themeStyles[activeThemeKey] || themeStyles.brand;
  const displayText = text || (accountFound ? reuseText : firstTimeText);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label={displayText}
        className={className}
        style={{
          width: '100%',
          height: '42px',
          padding: '0 14px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '9px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.75 : 1,
          transition: 'all 0.15s ease-out',
          userSelect: 'none',
          boxSizing: 'border-box',
          ...currentThemeStyle,
          ...style,
        }}
      >
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '4px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: '2px',
            overflow: 'hidden',
          }}
        >
          <img
            src="https://useoneid.com/favicon.png"
            alt="UseOneID"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.style.display = 'none';
              const next = target.nextSibling as HTMLElement;
              if (next) next.style.display = 'block';
            }}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0F7640"
            strokeWidth="2.5"
            style={{ display: 'none', width: '14px', height: '14px' }}
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <span>
          {loading
            ? 'Connecting to UseOneID...'
            : checkingAccount
              ? 'Checking UseOneID account...'
              : displayText}
        </span>
      </button>
    </div>
  );
};

export default UseOneIDButton;
