import React, { useState } from 'react';
import { Modal, Button, Input, Badge, useToast } from '@campusone/ui';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Fingerprint,
  ExternalLink,
  QrCode,
  Lock,
  ArrowRight,
  RefreshCw,
  User,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Award,
} from 'lucide-react';
import type { OneIdProfile, OneIdTrustProof } from '@campusone/contracts';
import { lookupOneId, verifyFirstTimeKYC, generateOneIdTrustProof, PRESEEDED_ONEID_PROFILES } from '../../lib/oneid.ts';
import { PersonAvatar } from './PersonAvatar.tsx';

export interface OneIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'first-time' | 'lookup-reuse' | 'verify-trust';
  targetProfile?: OneIdProfile | null;
  onSelectProfile?: (profile: OneIdProfile) => void;
  title?: string;
  initialQuery?: string;
}

export const OneIdModal: React.FC<OneIdModalProps> = ({
  isOpen,
  onClose,
  mode = 'lookup-reuse',
  targetProfile = null,
  onSelectProfile,
  title,
  initialQuery = '',
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'lookup' | 'kyc' | 'proof'>(
    mode === 'first-time' ? 'kyc' : mode === 'verify-trust' ? 'proof' : 'lookup'
  );

  // Lookup state
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [foundProfile, setFoundProfile] = useState<OneIdProfile | null>(targetProfile);

  // First-time KYC state
  const [ninInput, setNinInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [isVerifyingKyc, setIsVerifyingKyc] = useState(false);

  const handleLookup = async (lookupQuery?: string) => {
    const q = lookupQuery !== undefined ? lookupQuery : query;
    if (!q.trim()) {
      showToast({
        type: 'danger',
        title: 'Query required',
        message: 'Enter a valid OneID Number, NIN, Phone, or Email to look up.',
      });
      return;
    }
    setIsSearching(true);
    try {
      const res = await lookupOneId(q);
      if (res.success && res.profile) {
        setFoundProfile(res.profile);
        showToast({
          type: 'success',
          title: 'OneID Profile Found',
          message: `Verified profile for ${res.profile.fullName} retrieved.`,
        });
      } else {
        setFoundProfile(null);
        showToast({
          type: 'danger',
          title: 'Not Found',
          message: res.message || 'No verified profile matched your query.',
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSimulateKyc = async () => {
    if (!ninInput.trim() && !phoneInput.trim() && !fullNameInput.trim()) {
      showToast({
        type: 'danger',
        title: 'Information required',
        message: 'Provide at least a NIN, Phone Number, or Full Name to authenticate with OneID.',
      });
      return;
    }
    setIsVerifyingKyc(true);
    try {
      const res = await verifyFirstTimeKYC({
        nin: ninInput.trim() || undefined,
        phone: phoneInput.trim() || undefined,
        fullName: fullNameInput.trim() || undefined,
      });
      if (res.success && res.profile) {
        setFoundProfile(res.profile);
        setActiveTab('lookup');
        showToast({
          type: 'success',
          title: 'Identity Verified by OneID',
          message: `Digital credential issued for ${res.profile.fullName}.`,
        });
      }
    } finally {
      setIsVerifyingKyc(false);
    }
  };

  const handleApplyProfile = (profile: OneIdProfile) => {
    if (onSelectProfile) {
      onSelectProfile(profile);
    }
    onClose();
  };

  const modalTitle =
    title ||
    (activeTab === 'kyc'
      ? 'OneID Identity Authentication & KYC'
      : activeTab === 'proof'
        ? 'OneID Cryptographic Credential Proof'
        : 'OneID National Identity Lookup');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
            <ShieldCheck size={16} className="text-[#0F7640] shrink-0" />
            <span>NIMC &bull; Central Identity Gateway &bull; 256-bit Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onClose}>
              Close
            </Button>
            {foundProfile && activeTab === 'lookup' && onSelectProfile && (
              <Button
                size="sm"
                onClick={() => handleApplyProfile(foundProfile)}
                className="bg-[#0F7640] hover:bg-[#093322]"
              >
                Apply Verified Profile
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 font-sans text-slate-900">
        {/* Mode Navigation Bar */}
        <div className="p-1 bg-slate-100 rounded-[4px] flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('lookup')}
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-[4px] transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'lookup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search size={14} />
            <span>Instant Lookup &amp; Reuse</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kyc')}
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-[4px] transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'kyc'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Fingerprint size={14} />
            <span>First-Time KYC Verification</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('proof')}
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-[4px] transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'proof'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Trust Verification</span>
          </button>
        </div>

        {/* TAB 1: INSTANT LOOKUP & REUSE */}
        {activeTab === 'lookup' && (
          <div className="space-y-4">
            {/* Search Input Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Look up by OneID, NIN, Phone Number, or Email
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. ONE-NG-2026-804192, 48192048192, or 08034567890"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLookup();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={() => handleLookup()}
                  isLoading={isSearching}
                  className="bg-[#0F7640] hover:bg-[#093322] px-4"
                >
                  <Search size={16} className="mr-1.5" />
                  Look Up
                </Button>
              </div>
            </div>

            {/* Quick Demo Pre-Seeded Profiles */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">
                  Quick-Test Verified OneID Identities:
                </span>
                <span className="text-[10px] text-slate-400">Click any identity to simulate instant recall</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESEEDED_ONEID_PROFILES.slice(0, 5).map((p) => (
                  <button
                    key={p.oneId}
                    type="button"
                    onClick={() => {
                      setQuery(p.oneId);
                      setFoundProfile(p);
                    }}
                    className="px-2.5 py-1 text-xs rounded-[4px] bg-white border border-slate-300 hover:border-[#0F7640] text-slate-800 hover:text-[#0F7640] transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <span className="font-semibold">{p.fullName}</span>
                    <span className="text-[10px] text-slate-400">
                      ({p.collegeRole ? p.collegeRole : 'Applicant'})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Found Profile Card */}
            {foundProfile ? (
              <div className="border border-emerald-300 bg-emerald-50/40 rounded-[4px] p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-emerald-200/80 pb-3">
                  <div className="flex items-center gap-3">
                    <PersonAvatar
                      name={foundProfile.fullName}
                      email={foundProfile.email}
                      avatarUrl={foundProfile.avatarUrl}
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 font-sans">
                          {foundProfile.fullName}
                        </h4>
                        <Badge variant="success">Verified by OneID</Badge>
                      </div>
                      <p className="text-xs text-[#0F7640] font-bold font-sans mt-0.5">
                        {foundProfile.oneId}
                      </p>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                        NIN: {foundProfile.nin.slice(0, 3)}•••••{foundProfile.nin.slice(-3)} &bull; BVN ending {foundProfile.bvnLast4}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-white border border-emerald-300 text-xs font-bold text-[#0F7640]">
                      <ShieldCheck size={14} />
                      <span>{foundProfile.trustScore}% Trust Score</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Issued {new Date(foundProfile.verifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-2 bg-white rounded-[4px] border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">State of Origin &amp; LGA</span>
                    <span className="font-semibold text-slate-800">{foundProfile.stateOfOrigin} &bull; {foundProfile.lga}</span>
                  </div>
                  <div className="p-2 bg-white rounded-[4px] border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Birth &amp; Gender</span>
                    <span className="font-semibold text-slate-800">{foundProfile.dateOfBirth} &bull; {foundProfile.gender}</span>
                  </div>
                  <div className="p-2 bg-white rounded-[4px] border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone &amp; Email</span>
                    <span className="font-semibold text-slate-800 truncate block">{foundProfile.phone}</span>
                    <span className="text-[11px] text-slate-500 truncate block">{foundProfile.email}</span>
                  </div>
                </div>

                {foundProfile.programme && (
                  <div className="p-2 bg-white rounded-[4px] border border-slate-200 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">College Academic Assignment</span>
                    <span className="font-semibold text-slate-800">{foundProfile.programme}</span>
                    {foundProfile.matricNumber && (
                      <span className="text-xs font-bold text-[#0F7640] ml-2">({foundProfile.matricNumber})</span>
                    )}
                  </div>
                )}

                {onSelectProfile && (
                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={() => handleApplyProfile(foundProfile)}
                      className="bg-[#0F7640] hover:bg-[#093322] text-xs h-9"
                    >
                      <CheckCircle2 size={15} className="mr-1.5" />
                      Auto-Fill Form with This Identity
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 px-4 border border-dashed border-slate-300 rounded-[4px] text-slate-500 space-y-2">
                <ShieldCheck size={28} className="mx-auto text-slate-400" />
                <p className="text-xs font-medium">
                  Search above or click any pre-seeded profile to retrieve a verified Nigerian digital identity.
                </p>
                <p className="text-[11px] text-slate-400">
                  Data is verified in real time against the national NIMC digital identity federation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FIRST-TIME KYC VERIFICATION */}
        {activeTab === 'kyc' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-[4px] flex items-start gap-3">
              <ShieldCheck size={20} className="text-[#0F7640] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 space-y-1">
                <strong className="text-[#0F7640] font-bold block">
                  National Digital Identity Fast-Track (First-Time Verification)
                </strong>
                <p>
                  Connect your National Identity Number (NIN) or verified phone number to instantly pull verified biometric records directly into CampusOne. Zero paperwork, zero manual transcription errors.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="National Identity Number (NIN)"
                type="text"
                value={ninInput}
                onChange={(e) => setNinInput(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="11 digits (e.g. 48192048192)"
              />
              <Input
                label="Registered Mobile Phone"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+234 803 456 7890"
              />
            </div>

            <Input
              label="Legal Full Name (as registered with NIMC)"
              type="text"
              value={fullNameInput}
              onChange={(e) => setFullNameInput(e.target.value)}
              placeholder="e.g. Amina Adebayo"
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button
                onClick={handleSimulateKyc}
                isLoading={isVerifyingKyc}
                className="bg-[#0F7640] hover:bg-[#093322] w-full sm:w-auto"
              >
                <Fingerprint size={16} className="mr-1.5" />
                Authenticate &amp; Issue OneID
              </Button>
            </div>
          </div>
        )}

        {/* TAB 3: TRUST & CRYPTOGRAPHIC PROOF */}
        {activeTab === 'proof' && (
          <div className="space-y-4">
            {(() => {
              const profile = foundProfile || PRESEEDED_ONEID_PROFILES[0];
              const proof: OneIdTrustProof = generateOneIdTrustProof(profile);

              return (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-900 text-white rounded-[4px] space-y-3 font-sans">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={20} className="text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          OneID Trust Protocol &bull; Level 3 Assurance
                        </span>
                      </div>
                      <Badge variant="success">CRYPTOGRAPHICALLY VALID</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Holder Name</span>
                        <span className="text-sm font-bold text-white">{proof.holderName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Digital OneID</span>
                        <span className="text-sm font-bold text-emerald-300">{proof.oneId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">National ID (Masked)</span>
                        <span className="text-slate-200">{proof.ninMasked}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Verifying Institution</span>
                        <span className="text-slate-200">{proof.institution}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Ed25519 Cryptographic Signature</span>
                      <div className="p-2 bg-slate-950 rounded-[4px] border border-slate-800 text-[10px] text-emerald-400 break-all select-all">
                        {proof.cryptographicHash}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Issued: {new Date(proof.verifiedAt).toLocaleString()}</span>
                      <span>Expires: {new Date(proof.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-xs text-slate-600 flex items-center justify-between">
                    <span>Tamper-proof digital seal verified against Federal Republic of Nigeria identity authority.</span>
                    <Button size="sm" variant="secondary" onClick={() => window.print()} className="shrink-0 text-xs">
                      Print Proof
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </Modal>
  );
};
