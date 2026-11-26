export const config = {
  api: {
    bodyParser: false,
  },
};

interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
  on?: (event: string, cb: (chunk?: any) => void) => void;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: any) => void;
}

declare const process: { env: Record<string, string | undefined> };

async function readRawBody(req: ApiRequest): Promise<string> {
  if (typeof req.body === 'string') return req.body;
  if (req.body && typeof req.body === 'object' && !req.on) return JSON.stringify(req.body);
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on?.('data', (chunk: Uint8Array | string) => {
      chunks.push(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : chunk);
    });
    req.on?.('end', () => {
      const total = chunks.reduce((acc, c) => acc + c.byteLength, 0);
      const merged = new Uint8Array(total);
      let offset = 0;
      for (const c of chunks) {
        merged.set(c, offset);
        offset += c.byteLength;
      }
      resolve(new TextDecoder().decode(merged));
    });
    req.on?.('error', reject);
  });
}

async function computeHmacSha256Hex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function updateCandidateIdentityFlag(
  supabaseUrl: string,
  serviceRoleKey: string,
  email: string,
  oneIdSub: string,
  patch: Record<string, unknown>
): Promise<void> {
  if (!email && !oneIdSub) return;

  const listRes = await fetch(
    `${supabaseUrl}/rest/v1/operational_records?record_kind=eq.admissions.candidates&select=id,payload`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: 'application/json',
      },
    }
  );
  if (!listRes.ok) return;
  const rows: { id: string; payload: Record<string, any> }[] = await listRes.json();

  const targetEmail = email.trim().toLowerCase();
  const targetSub = oneIdSub.trim();

  const matches = rows.filter((r) => {
    const p = r.payload || {};
    const pEmail = String(p.email || '').trim().toLowerCase();
    const pOneId = String(p.oneIdNumber || '').trim();
    return (targetEmail && pEmail === targetEmail) || (targetSub && pOneId === targetSub);
  });

  for (const row of matches) {
    await fetch(`${supabaseUrl}/rest/v1/operational_records?id=eq.${encodeURIComponent(row.id)}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        payload: { ...row.payload, ...patch },
        updated_at: new Date().toISOString(),
      }),
    });
  }
}

/**
 * UseOneID Real-Time Security & Lifecycle Webhook Receiver (/api/webhooks/useoneid)
 * Verifies x-useoneid-signature (HMAC-SHA256) using USEONEID_WEBHOOK_SECRET.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } });
  }

  const webhookSecret = process.env.USEONEID_WEBHOOK_SECRET || '';
  if (!webhookSecret) {
    return res.status(503).json({
      success: false,
      error: { code: 'WEBHOOK_SECRET_MISSING', message: 'USEONEID_WEBHOOK_SECRET is not configured.' },
    });
  }

  const rawBody = await readRawBody(req);
  const rawSig = String(req.headers['x-useoneid-signature'] || '').trim();
  const expectedHex = await computeHmacSha256Hex(webhookSecret, rawBody);
  const expectedWithPrefix = `sha256=${expectedHex}`;

  const signatureValid =
    (rawSig.length === expectedWithPrefix.length && timingSafeEqual(rawSig, expectedWithPrefix)) ||
    (rawSig.length === expectedHex.length && timingSafeEqual(rawSig, expectedHex));

  if (!rawSig || !signatureValid) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_WEBHOOK_SIGNATURE', message: 'Invalid x-useoneid-signature header.' },
    });
  }

  let body: { event?: string; data?: Record<string, any> } = {};
  try {
    body = JSON.parse(rawBody || '{}');
  } catch {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'Malformed webhook JSON payload.' },
    });
  }

  const eventName = String(body.event || '').trim();
  const data = body.data || {};
  const userEmail = String(data.email || data.user?.email || '').trim().toLowerCase();
  const userSub = String(data.user_id || data.user_sub || data.sub || data.user?.id || '').trim();

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (supabaseUrl && serviceRoleKey && eventName) {
    try {
      let auditAction = `USEONEID_WEBHOOK_${eventName.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`;

      switch (eventName) {
        case 'identity.verified':
          auditAction = 'USEONEID_IDENTITY_VERIFIED';
          await updateCandidateIdentityFlag(supabaseUrl, serviceRoleKey, userEmail, userSub, {
            oneIdVerified: true,
            ...(userSub ? { oneIdNumber: userSub } : {}),
            identityFrozen: false,
          });
          break;
        case 'identity.frozen':
          auditAction = 'USEONEID_IDENTITY_FROZEN';
          await updateCandidateIdentityFlag(supabaseUrl, serviceRoleKey, userEmail, userSub, {
            identityFrozen: true,
            identityFrozenAt: new Date().toISOString(),
          });
          break;
        case 'identity.unfrozen':
          auditAction = 'USEONEID_IDENTITY_UNFROZEN';
          await updateCandidateIdentityFlag(supabaseUrl, serviceRoleKey, userEmail, userSub, {
            identityFrozen: false,
          });
          break;
        case 'identity.risk_escalated':
          auditAction = 'USEONEID_RISK_ESCALATED';
          await updateCandidateIdentityFlag(supabaseUrl, serviceRoleKey, userEmail, userSub, {
            identityRiskFlagged: true,
          });
          break;
        case 'transaction.flagged':
          auditAction = 'USEONEID_TRANSACTION_FLAGGED';
          break;
        case 'identity.consent_revoked':
          auditAction = 'USEONEID_CONSENT_REVOKED';
          await updateCandidateIdentityFlag(supabaseUrl, serviceRoleKey, userEmail, userSub, {
            oneIdConsentRevoked: true,
          });
          break;
        case 'kyb.approved':
          auditAction = 'USEONEID_KYB_APPROVED';
          break;
        default:
          break;
      }

      await fetch(`${supabaseUrl}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          id: `aud-useoneid-${Date.now()}`,
          college_id: 'bethsaida',
          actor_id: 'useoneid-webhook',
          actor_role: 'SYSTEM',
          action: auditAction,
          entity_type: 'USEONEID_IDENTITY',
          entity_id: userSub || userEmail || eventName,
          after_snapshot: {
            event: eventName,
            email: userEmail || undefined,
            userId: userSub || undefined,
            riskScore: data.risk_score,
            reason: data.reason,
          },
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Acknowledge receipt cleanly even if secondary audit logging encounters a transient error
    }
  }

  return res.status(200).json({ success: true, received: true, event: eventName });
}
