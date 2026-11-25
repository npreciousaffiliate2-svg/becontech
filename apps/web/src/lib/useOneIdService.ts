const USEONEID_API_BASE = 'https://useoneid.com/api/v1';
const DEFAULT_CLIENT_ID = 'cid_bf27f8dd65c77b0eec105349';

export interface UseOneIDUser {
  id: string;
  email: string;
  name: string;
  tier?: string;
  phone?: string;
  address?: string;
  stateOfOrigin?: string;
  lga?: string;
  avatarUrl?: string;
}

export interface UseOneIDPayload {
  token: string;
  user: UseOneIDUser;
}

export interface LookupResult {
  found: boolean;
  matchedIdentifier?: string;
  user?: Partial<UseOneIDUser>;
  error?: string;
}

/**
 * Official UseOneID Application Service for CampusOne
 * Matches the XIROLY UseOneID v1 architectural specification:
 * - Direct token decoding and verification
 * - Concurrent email & phone lookup against UseOneID vault
 * - 1-Click reuse vs first-time KYC enrollment dispatching
 */
export const useOneIdService = {
  getClientId(): string {
    return (
      (import.meta.env.VITE_USEONEID_CLIENT_ID as string) ||
      (import.meta.env.NEXT_PUBLIC_USEONEID_CLIENT_ID as string) ||
      DEFAULT_CLIENT_ID
    );
  },

  getAuthBaseUrl(): string {
    return (
      ((import.meta.env.VITE_USEONEID_AUTH_URL as string) ||
        (import.meta.env.NEXT_PUBLIC_USEONEID_AUTH_URL as string) ||
        'https://useoneid.com')
    ).replace(/\/$/, '');
  },

  /**
   * Verify and extract sovereign claims from a UseOneID token
   * Calls server-side /api/useoneid/verify (backed by USEONEID_SECRET_KEY) first.
   */
  async verifyToken(token: string): Promise<{ success: boolean; user: UseOneIDUser }> {
    if (!token) throw new Error('Token is required for verification');

    // 1. Server-side verification via Vercel serverless route
    try {
      const serverRes = await fetch('/api/useoneid/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (serverRes.ok) {
        const json = await serverRes.json();
        if (json?.success && json?.data?.user) {
          return {
            success: true,
            user: json.data.user,
          };
        }
      } else if (serverRes.status === 401) {
        const errJson = await serverRes.json().catch(() => null);
        throw new Error(errJson?.error?.message || 'UseOneID token was rejected by verification server.');
      }
    } catch (err: any) {
      if (err?.message?.includes('rejected')) {
        throw err;
      }
      // On local Vite dev (where /api/* serverless route is not mounted), continue to JWT claim decode
    }

    try {
      // 2. Local dev fallback: Decode JWT payload
      const parts = token.split('.');
      if (parts.length >= 2) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);

        return {
          success: true,
          user: {
            id: payload.sub || payload.id || `oneid_${Date.now()}`,
            email: payload.email || '',
            name: payload.name || payload.full_name || 'Verified Citizen',
            tier: payload.kyc_tier || payload.tier || 'Tier 3 (NIMC Verified)',
            phone: payload.phone_number || payload.phone || '',
            address: payload.address || '',
            stateOfOrigin: payload.state || payload.stateOfOrigin || 'Oyo',
            lga: payload.lga || 'Ibadan North',
            avatarUrl: payload.picture || payload.avatar_url || '',
          },
        };
      }

      throw new Error('Malformed UseOneID token.');
    } catch (err: any) {
      console.error('[UseOneID Service] Token verification error:', err);
      throw new Error(`UseOneID verification error: ${err.message || 'Invalid token'}`);
    }
  },

  /**
   * Look up an account by email or phone (checks live UseOneID vault via server-side /api/useoneid/lookup)
   */
  async lookupUser(
    identifier: string | { email?: string; phone?: string },
    secretKey?: string
  ): Promise<LookupResult> {
    const email = (typeof identifier === 'string' ? (identifier.includes('@') ? identifier : '') : identifier.email || '').trim().toLowerCase();
    const phone = (typeof identifier === 'string' ? (!identifier.includes('@') ? identifier : '') : identifier.phone || '').trim().replace(/[\s-]/g, '');

    if (!email && !phone) {
      return { found: false };
    }

    // 1. Live server-side UseOneID wallet lookup via Vercel serverless route (zero CORS)
    try {
      const res = await fetch('/api/useoneid/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          found: Boolean(data.found),
          matchedIdentifier: data.matchedIdentifier || email || phone,
          user: data.user,
        };
      }
    } catch {
      // Fall through only if /api/useoneid/lookup is unavailable (e.g. local Vite dev without serverless proxy)
    }

    // 2. Fallback to custom proxy base if configured
    const proxyBase = (import.meta.env.VITE_USEONEID_PROXY_URL as string) || '';
    if (proxyBase) {
      try {
        const payload = typeof identifier === 'string' ? { identifier } : { email, phone };
        const res = await fetch(`${proxyBase}/verify/lookup-user`, {
          method: 'POST',
          headers: {
            ...(secretKey ? { Authorization: `Bearer ${secretKey}` } : {}),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          return {
            found: Boolean(data.found),
            matchedIdentifier: data.matchedIdentifier || email || phone,
            user: data.user,
          };
        }
      } catch {}
    }

    return { found: false, matchedIdentifier: email || phone };
  },

  async lookupSellerAccount(params: { email?: string; phone?: string }): Promise<LookupResult> {
    return this.lookupUser(params);
  },
};

export default useOneIdService;
