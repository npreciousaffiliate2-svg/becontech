interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
  query?: Record<string, string | string[] | undefined>;
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

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'PAYSTACK_SECRET_MISSING',
        message: 'Server payment verification is not configured. Add PAYSTACK_SECRET_KEY in Vercel environment variables.',
      },
    });
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

  const reference = String(body.reference || '').trim();
  const expectedAmountKobo = Number(body.expectedAmountKobo || 0);

  if (!reference || !/^[A-Za-z0-9_\-.]{6,100}$/.test(reference)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_REFERENCE', message: 'A valid Paystack transaction reference is required.' },
    });
  }

  try {
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const payload = await verifyRes.json();

    if (!verifyRes.ok || !payload?.status || payload?.data?.status !== 'success') {
      return res.status(402).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_VERIFIED',
          message: payload?.message || 'Paystack could not confirm a successful charge for this reference.',
        },
      });
    }

    const paidAmountKobo = Number(payload.data.amount || 0);
    if (expectedAmountKobo > 0 && paidAmountKobo < expectedAmountKobo) {
      return res.status(402).json({
        success: false,
        error: {
          code: 'AMOUNT_MISMATCH',
          message: 'Paid amount is less than the required fee amount.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        verified: true,
        reference: payload.data.reference,
        amountKobo: paidAmountKobo,
        currency: payload.data.currency || 'NGN',
        channel: payload.data.channel || 'card',
        paidAt: payload.data.paid_at || new Date().toISOString(),
        customerEmail: payload.data.customer?.email || '',
      },
      message: 'Payment verified with Paystack.',
    });
  } catch {
    return res.status(502).json({
      success: false,
      error: {
        code: 'GATEWAY_ERROR',
        message: 'Could not reach Paystack verification server.',
      },
    });
  }
}
