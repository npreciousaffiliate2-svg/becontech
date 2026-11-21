import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

interface VercelRequest extends IncomingMessage {
  body?: any;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(503).json({ success: false, error: { code: 'SECRET_MISSING', message: 'Webhook secret not configured.' } });
  }

  const signature = String(req.headers['x-paystack-signature'] || '');
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  const expectedHash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedHash);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Signature verification failed.' } });
  }

  const event = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

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
