interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: any) => void;
}

declare const process: { env: Record<string, string | undefined> };

interface JwkKey {
  kty: string;
  kid?: string;
  alg?: string;
  use?: string;
  n?: string;
  e?: string;
}

let cachedJwks: { keys: JwkKey[]; fetchedAt: number } | null = null;
const JWKS_TTL_MS = 10 * 60 * 1000;

function base64UrlToUint8Array(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function decodeBase64UrlJson<T = Record<string, any>>(segment: string): T | null {
  try {
    const bytes = base64UrlToUint8Array(segment);
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
}

async function getJwksKeys(authBase: string, forceRefresh = false): Promise<JwkKey[]> {
  if (!forceRefresh && cachedJwks && Date.now() - cachedJwks.fetchedAt < JWKS_TTL_MS) {
    return cachedJwks.keys;
  }
  const jwksRes = await fetch(`${authBase}/.well-known/jwks.json`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!jwksRes.ok) {
    throw new Error(`JWKS fetch failed (${jwksRes.status})`);
  }
  const json = await jwksRes.json();
  const keys: JwkKey[] = Array.isArray(json?.keys) ? json.keys : [];
  cachedJwks = { keys, fetchedAt: Date.now() };
  return keys;
}

async function verifyRs256Jwt(
  token: string,
  authBase: string
): Promise<{ valid: boolean; payload?: Record<string, any>; reason?: string }> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, reason: 'NOT_JWT' };
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = decodeBase64UrlJson<{ alg?: string; kid?: string }>(headerB64);
  const payload = decodeBase64UrlJson<Record<string, any>>(payloadB64);

  if (!header || !payload) {
    return { valid: false, reason: 'MALFORMED_JWT' };
  }
  if (header.alg !== 'RS256') {
    return { valid: false, reason: `UNSUPPORTED_ALG_${String(header.alg || 'NONE')}` };
  }

  // Enforce expiration claim if present
  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp < nowSec - 30) {
    return { valid: false, reason: 'TOKEN_EXPIRED' };
  }

  // Enforce issuer domain if present
  if (typeof payload.iss === 'string' && payload.iss.length > 0) {
    const normalizedIss = payload.iss.replace(/\/$/, '').toLowerCase();
    const expectedBase = authBase.replace(/\/$/, '').toLowerCase();
    if (!normalizedIss.startsWith(expectedBase)) {
      return { valid: false, reason: 'INVALID_ISSUER' };
    }
  }

  let keys = await getJwksKeys(authBase, false);
  let jwk = header.kid
    ? keys.find((k) => k.kid === header.kid && k.kty === 'RSA')
    : keys.find((k) => k.kty === 'RSA');

  // Refresh JWKS once on kid miss in case of key rotation
  if (!jwk && header.kid) {
    keys = await getJwksKeys(authBase, true);
    jwk = keys.find((k) => k.kid === header.kid && k.kty === 'RSA');
  }

  if (!jwk) {
    return { valid: false, reason: 'SIGNING_KEY_NOT_FOUND' };
  }

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk as any,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signatureBytes = base64UrlToUint8Array(signatureB64);
  const signatureBuffer = signatureBytes.buffer.slice(
    signatureBytes.byteOffset,
    signatureBytes.byteOffset + signatureBytes.byteLength
  ) as ArrayBuffer;
  const verified = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    signatureBuffer,
    signingInput
  );

  if (!verified) {
    return { valid: false, reason: 'INVALID_SIGNATURE' };
  }

  return { valid: true, payload };
}

function normalizeUserProfile(profile: Record<string, any>) {
  return {
    id: profile.sub || profile.id || profile.email || '',
    name:
      profile.name ||
      profile.full_name ||
      `${profile.given_name || ''} ${profile.family_name || ''}`.trim(),
    email: profile.email || '',
    phone: profile.phone_number || profile.phone || '',
    stateOfOrigin: profile.state_of_origin || profile.state || '',
    lga: profile.lga || '',
    avatarUrl: profile.picture || profile.avatar_url || '',
    tier: profile.kyc_tier || profile.tier || 'Tier 3 (NIMC Verified)',
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } });
  }

  let body: Record<string, any> = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' },
    });
  }

  const token = String(body.token || '').trim();
  if (!token) {
    return res.status(400).json({
      success: false,
      error: { code: 'TOKEN_REQUIRED', message: 'A UseOneID token is required.' },
    });
  }

  const secretKey = process.env.USEONEID_SECRET_KEY || '';
  const authBase = (process.env.VITE_USEONEID_AUTH_URL || 'https://useoneid.com').replace(/\/$/, '');

  // 1. Primary: Cryptographic RS256 JWKS verification against https://useoneid.com/.well-known/jwks.json
  if (token.split('.').length === 3) {
    try {
      const jwtResult = await verifyRs256Jwt(token, authBase);
      if (jwtResult.valid && jwtResult.payload) {
        return res.status(200).json({
          success: true,
          data: {
            verified: true,
            verificationMethod: 'RS256_JWKS',
            user: normalizeUserProfile(jwtResult.payload),
          },
        });
      }
      if (jwtResult.reason === 'TOKEN_EXPIRED' || jwtResult.reason === 'INVALID_SIGNATURE' || jwtResult.reason === 'INVALID_ISSUER') {
        return res.status(401).json({
          success: false,
          error: {
            code: `USEONEID_${jwtResult.reason}`,
            message: `UseOneID token failed cryptographic RS256 verification (${jwtResult.reason}).`,
          },
        });
      }
    } catch {
      // Fall through to OAuth userinfo introspection if JWKS endpoint is temporarily unreachable
    }
  }

  // 2. Secondary: OAuth2 userinfo introspection for opaque access tokens
  try {
    const verifyRes = await fetch(`${authBase}/api/v1/oauth/userinfo`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(secretKey ? { 'X-Client-Secret': secretKey } : {}),
        Accept: 'application/json',
      },
    });

    if (!verifyRes.ok) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USEONEID_INVALID_TOKEN',
          message: 'UseOneID rejected the verification token.',
        },
      });
    }

    const profile = await verifyRes.json();
    return res.status(200).json({
      success: true,
      data: {
        verified: true,
        verificationMethod: 'OAUTH_USERINFO',
        user: normalizeUserProfile(profile),
      },
    });
  } catch {
    return res.status(502).json({
      success: false,
      error: {
        code: 'USEONEID_UNREACHABLE',
        message: 'Could not reach UseOneID verification server.',
      },
    });
  }
}
