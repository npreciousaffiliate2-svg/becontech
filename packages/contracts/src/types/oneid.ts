import type { RoleCode } from './roles.js';

export type OneIdVerificationStatus = 'VERIFIED' | 'PENDING' | 'REJECTED' | 'UNLINKED';

export interface OneIdProfile {
  oneId: string; // e.g. "ONE-NG-2026-904128"
  nin: string; // 11-digit national identity number
  fullName: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string; // ISO date YYYY-MM-DD
  gender: 'Female' | 'Male';
  phone: string;
  email: string;
  stateOfOrigin: string;
  lga: string;
  residentialAddress: string;
  avatarUrl: string;
  verifiedAt: string;
  trustScore: number; // 0 - 100
  bvnLast4?: string;
  credentialSignature: string;
  status: 'ACTIVE' | 'FLAGGED' | 'SUSPENDED';
  collegeRole?: RoleCode;
  matricNumber?: string;
  applicationNumber?: string;
  programme?: string;
}

export interface OneIdLookupRequest {
  query: string; // OneID, NIN, Phone, or Email
}

export interface OneIdVerificationResponse {
  success: boolean;
  profile?: OneIdProfile;
  message?: string;
  verifiedAt: string;
  verificationSource: 'ONEID_NIMC_GATEWAY' | 'LOCAL_CACHE';
}

export interface OneIdTrustProof {
  valid: boolean;
  oneId: string;
  holderName: string;
  ninMasked: string;
  issuer: string;
  institution: string;
  verifiedAt: string;
  expiresAt: string;
  cryptographicHash: string;
  status: 'VALID' | 'REVOKED' | 'EXPIRED';
}
