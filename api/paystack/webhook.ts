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

async function computeHmacSha512Hex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(503).json({ success: false, error: { code: 'SECRET_MISSING', message: 'Webhook secret not configured.' } });
  }

  const rawBody = await readRawBody(req);
  const signature = String(req.headers['x-paystack-signature'] || '').trim().toLowerCase();
  const expectedHash = await computeHmacSha512Hex(secretKey, rawBody);

  if (!signature || !timingSafeEqualHex(signature, expectedHash)) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Signature verification failed.' } });
  }

  let event: Record<string, any> = {};
  try {
    event = JSON.parse(rawBody || '{}');
  } catch {
    return res.status(400).json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed webhook payload.' } });
  }

  if (event?.event === 'charge.success') {
    const ref = event?.data?.reference;
    const amountKobo = Number(event?.data?.amount || 0);
    const email = event?.data?.customer?.email || '';
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey && ref) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/audit_logs`, {
          method: 'POST',
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            id: `aud-paystack-${Date.now()}`,
            college_id: 'bethsaida',
            actor_id: 'paystack-webhook',
            actor_role: 'SYSTEM',
            action: 'PAYSTACK_WEBHOOK_CHARGE_SUCCESS',
            entity_type: 'PAYMENT_TRANSACTION',
            entity_id: ref,
            after_snapshot: { reference: ref, amountKobo, email, channel: event?.data?.channel },
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {
        // Do not fail webhook acknowledgement on secondary audit logging error
      }
    }
  }

  return res.status(200).json({ success: true, received: true });
}
