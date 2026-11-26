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

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * UseOneID Digital Signatures Endpoint (/api/useoneid/sign)
 * Generates a SHA-256 non-repudiation document seal (Evidence Act 2023 §84)
 * via POST https://useoneid.com/api/v1/partner/signatures when USEONEID_SECRET_KEY is configured.
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

  const documentTitle = String(body.documentTitle || '').trim();
  const referenceNo = String(body.referenceNo || '').trim();
  const recipientName = String(body.recipientName || '').trim();
  const recipientEmail = String(body.recipientEmail || '').trim();
  const documentContent = String(body.documentContent || '').trim();

  if (!documentTitle || !referenceNo) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'documentTitle and referenceNo are required.' },
    });
  }

  const signedAt = new Date().toISOString();
  const canonicalPayload = JSON.stringify({
    college: 'bethsaida',
    documentTitle,
    referenceNo,
    recipientName,
    recipientEmail,
    documentContent,
    signedAt,
  });
  const sha256Hash = await sha256Hex(canonicalPayload);

  const secretKey = process.env.USEONEID_SECRET_KEY || '';
  const clientId = process.env.VITE_USEONEID_CLIENT_ID || process.env.NEXT_PUBLIC_USEONEID_CLIENT_ID || '';
  const authBase = (process.env.VITE_USEONEID_AUTH_URL || 'https://useoneid.com').replace(/\/$/, '');

  if (secretKey) {
    try {
      const signRes = await fetch(`${authBase}/api/v1/partner/signatures`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(clientId ? { 'X-Client-Id': clientId } : {}),
        },
        body: JSON.stringify({
          document_title: documentTitle,
          document_hash: sha256Hash,
          reference_no: referenceNo,
          signer_name: recipientName || 'Office of the Registrar',
          signer_email: recipientEmail || undefined,
          metadata: {
            institution: 'Bethsaida College of Health Tech Ltd',
            standard: 'Evidence Act 2023 s.84',
          },
        }),
      });

      if (signRes.ok) {
        const sealed = await signRes.json();
        const sealId = sealed?.signature_id || sealed?.id || `U1D-${sha256Hash.slice(0, 12).toUpperCase()}`;
        return res.status(200).json({
          success: true,
          data: {
            sealId,
            sha256Hash: sealed?.document_hash || sha256Hash,
            signedAt: sealed?.signed_at || signedAt,
            provider: 'UseOneID Digital Signature',
            verifyUrl: sealed?.verify_url || `${authBase}/verify/signature/${encodeURIComponent(sealId)}`,
          },
        });
      }
    } catch {
      // Fall through to local institutional SHA-256 seal
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      sealId: `BCHT-${sha256Hash.slice(0, 12).toUpperCase()}`,
      sha256Hash,
      signedAt,
      provider: 'CampusOne SHA-256 Institutional Seal',
      verifyUrl: `${authBase}/verify/seal/${encodeURIComponent(clientId || 'cid_bf27f8dd65c77b0eec105349')}`,
    },
  });
}
