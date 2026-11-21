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
      error: { code: 'TOKEN_REQUIRED', message: 'A UseOneID access token is required.' },
    });
  }

  const secretKey = process.env.USEONEID_SECRET_KEY || '';
  const authBase = (process.env.VITE_USEONEID_AUTH_URL || 'https://useoneid.com').replace(/\/$/, '');

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
        user: {
          id: profile.sub || profile.id || profile.email,
          name: profile.name || profile.full_name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim(),
          email: profile.email || '',
          phone: profile.phone_number || profile.phone || '',
          stateOfOrigin: profile.state_of_origin || profile.state || '',
          lga: profile.lga || '',
          avatarUrl: profile.picture || profile.avatar_url || '',
          tier: profile.kyc_tier || 'Tier 3 (NIMC Verified)',
        },
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
