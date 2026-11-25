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

/**
 * Server-side UseOneID Wallet Lookup Proxy
 * Concurrently checks email & phone against UseOneID vault (/api/v1/verify/lookup-user)
 * using server-side USEONEID_SECRET_KEY with zero browser CORS issues.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } });
  }

  let body: Record<string, any> = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch {
    return res.status(400).json({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON body.' } });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim().replace(/[\s-]/g, '');
  const identifier = String(body.identifier || '').trim();

  if (!email && !phone && !identifier) {
    return res.status(200).json({ found: false });
  }

  const secretKey = process.env.USEONEID_SECRET_KEY || '';
  const clientId = process.env.VITE_USEONEID_CLIENT_ID || process.env.NEXT_PUBLIC_USEONEID_CLIENT_ID || '';
  const authBase = (process.env.VITE_USEONEID_AUTH_URL || 'https://useoneid.com').replace(/\/$/, '');

  const checkIdentifier = async (payload: Record<string, string>) => {
    try {
      const response = await fetch(`${authBase}/api/v1/verify/lookup-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(secretKey ? { Authorization: `Bearer ${secretKey}`, 'X-Client-Secret': secretKey } : {}),
          ...(clientId ? { 'X-Client-Id': clientId } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) return null;
      const data = await response.json();
      if (data?.found || data?.exists || data?.verified) {
        return {
          found: true,
          matchedIdentifier: data.matchedIdentifier || payload.email || payload.phone || payload.identifier,
          user: data.user || undefined,
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  // Concurrent lookup for both email and phone (matching official UseOneID partner SDK spec)
  const checks: Promise<any>[] = [];
  if (email && email.includes('@')) checks.push(checkIdentifier({ email, identifier: email }));
  if (phone && phone.length >= 10) checks.push(checkIdentifier({ phone, identifier: phone }));
  if (!checks.length && identifier) checks.push(checkIdentifier({ identifier }));

  const results = await Promise.all(checks);
  const matched = results.find((r) => r && r.found);

  if (matched) {
    return res.status(200).json(matched);
  }

  return res.status(200).json({ found: false, matchedIdentifier: email || phone || identifier });
}
