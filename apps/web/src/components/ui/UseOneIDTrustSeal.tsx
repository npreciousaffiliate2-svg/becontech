import React, { useEffect, useState } from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { useOneIdService } from '../../lib/useOneIdService.ts';

interface TrustSealData {
  clientId: string;
  verified: boolean;
  businessName: string;
  tier: string;
  verifyUrl: string;
}

export const UseOneIDTrustSeal: React.FC<{ className?: string }> = ({ className = '' }) => {
  const clientId = useOneIdService.getClientId();
  const [seal, setSeal] = useState<TrustSealData>({
    clientId,
    verified: true,
    businessName: 'Bethsaida College of Health Tech Ltd',
    tier: 'Verified UseOneID Partner',
    verifyUrl: `https://useoneid.com/verify/seal/${encodeURIComponent(clientId)}`,
  });

  useEffect(() => {
    let active = true;
    fetch(`/api/useoneid/trust-seal?clientId=${encodeURIComponent(clientId)}`, {
      headers: { Accept: 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json?.data) return;
        setSeal((prev) => ({
          ...prev,
          ...json.data,
        }));
      })
      .catch(() => {
        // Keep default verified partner seal link
      });

    return () => {
      active = false;
    };
  }, [clientId]);

  if (!seal.verified) return null;

  return (
    <a
      href={seal.verifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={`Verify ${seal.businessName} on UseOneID`}
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 bg-white border border-emerald-200 hover:border-[#0F7640] rounded-[4px] text-[11px] font-sans text-slate-700 hover:text-[#0F7640] transition-colors shadow-xs ${className}`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-[#0F7640] shrink-0" />
      <span className="font-semibold">Verified by UseOneID</span>
      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
    </a>
  );
};
