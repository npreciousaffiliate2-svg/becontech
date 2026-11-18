import type { OneIdProfile, OneIdVerificationResponse, OneIdTrustProof } from '@campusone/contracts';

const ONEID_REGISTRY_STORAGE_KEY = 'campusone_oneid_registry_v1';

export const PRESEEDED_ONEID_PROFILES: OneIdProfile[] = [
  // Prospective Applicants
  {
    oneId: 'ONE-NG-2026-804192',
    nin: '48192048192',
    fullName: 'Amina Adebayo',
    firstName: 'Amina',
    lastName: 'Adebayo',
    dateOfBirth: '2005-04-12',
    gender: 'Female',
    phone: '+234 803 456 7890',
    email: 'amina.adebayo@gmail.com',
    stateOfOrigin: 'Oyo',
    lga: 'Ibadan North',
    residentialAddress: '14 Bodija Extension, Ibadan, Oyo State',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    verifiedAt: '2026-01-14T09:30:00Z',
    trustScore: 99,
    bvnLast4: '4819',
    credentialSignature: 'ed25519:e9a8f4c2810a91fbc84102938471bade01948',
    status: 'ACTIVE',
    applicationNumber: 'APP/2026/0152',
    programme: 'Community Health Extension Worker (CHEW)',
  },
  {
    oneId: 'ONE-NG-2026-773120',
    nin: '55219481920',
    fullName: 'Victoria Olusola',
    firstName: 'Victoria',
    lastName: 'Olusola',
    dateOfBirth: '2004-11-23',
    gender: 'Female',
    phone: '+234 812 345 6789',
    email: 'victoria.olusola@yahoo.com',
    stateOfOrigin: 'Osun',
    lga: 'Osogbo',
    residentialAddress: '22 Alekuwodo Street, Osogbo, Osun State',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256',
    verifiedAt: '2026-01-18T14:15:00Z',
    trustScore: 98,
    bvnLast4: '1920',
    credentialSignature: 'ed25519:7bc891f0941829e8471bade01948c2810a91fb',
    status: 'ACTIVE',
    applicationNumber: 'APP/2026/0153',
    programme: 'Medical Laboratory Technician (MLT)',
  },
  {
    oneId: 'ONE-NG-2026-661904',
    nin: '61048192039',
    fullName: 'Faruk Danladi',
    firstName: 'Faruk',
    lastName: 'Danladi',
    dateOfBirth: '2003-08-19',
    gender: 'Male',
    phone: '+234 802 888 1234',
    email: 'faruk.danladi@outlook.com',
    stateOfOrigin: 'Kano',
    lga: 'Nassarawa',
    residentialAddress: '88 Bompai Road, Nassarawa, Kano State',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    verifiedAt: '2026-01-20T11:05:00Z',
    trustScore: 97,
    bvnLast4: '2039',
    credentialSignature: 'ed25519:10a91fbc84102938471bade01948e9a8f4c28',
    status: 'ACTIVE',
    applicationNumber: 'APP/2026/0154',
    programme: 'Pharmacy Technician (PHT)',
  },
  {
    oneId: 'ONE-NG-2026-519284',
    nin: '72948192011',
    fullName: 'Chidinma Okonkwo',
    firstName: 'Chidinma',
    lastName: 'Okonkwo',
    dateOfBirth: '2004-02-15',
    gender: 'Female',
    phone: '+234 809 112 3344',
    email: 'chidinma.okonkwo@gmail.com',
    stateOfOrigin: 'Enugu',
    lga: 'Enugu North',
    residentialAddress: '5 Ogui Road, Enugu, Enugu State',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    verifiedAt: '2026-01-22T16:40:00Z',
    trustScore: 99,
    bvnLast4: '2011',
    credentialSignature: 'ed25519:8471bade01948e9a8f4c2810a91fbc8410293',
    status: 'ACTIVE',
    applicationNumber: 'APP/2026/0155',
    programme: 'Health Information Management (HIM)',
  },

  // Active Enrolled Students
  {
    oneId: 'ONE-NG-2026-102948',
    nin: '31920481920',
    fullName: 'Blessing Adeyemi',
    firstName: 'Blessing',
    lastName: 'Adeyemi',
    dateOfBirth: '2004-06-18',
    gender: 'Female',
    phone: '+234 813 490 1284',
    email: 'blessing.adeyemi@becohtech.edu.ng',
    stateOfOrigin: 'Oyo',
    lga: 'Ogbomoso North',
    residentialAddress: '44 Caretaker Area, Ogbomoso, Oyo State',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    verifiedAt: '2025-10-12T08:00:00Z',
    trustScore: 100,
    bvnLast4: '1920',
    credentialSignature: 'ed25519:38471bade01948e9a8f4c2810a91fbc841029',
    status: 'ACTIVE',
    collegeRole: 'STU',
    matricNumber: 'CHE/2026/0014',
    programme: 'Community Health Extension Worker (CHEW)',
  },
  {
    oneId: 'ONE-NG-2026-103855',
    nin: '21094819204',
    fullName: 'Ibrahim Tanko',
    firstName: 'Ibrahim',
    lastName: 'Tanko',
    dateOfBirth: '2003-09-02',
    gender: 'Male',
    phone: '+234 803 219 4019',
    email: 'ibrahim.tanko@becohtech.edu.ng',
    stateOfOrigin: 'Kaduna',
    lga: 'Zaria',
    residentialAddress: '12 Tudun Wada, Zaria, Kaduna State',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    verifiedAt: '2025-10-14T10:20:00Z',
    trustScore: 100,
    bvnLast4: '9204',
    credentialSignature: 'ed25519:de01948e9a8f4c2810a91fbc84102938471ba',
    status: 'ACTIVE',
    collegeRole: 'STU',
    matricNumber: 'MLT/2026/0009',
    programme: 'Medical Laboratory Technician (MLT)',
  },

  // College Staff & Officers
  {
    oneId: 'ONE-NG-2026-003819',
    nin: '10928401928',
    fullName: 'Dr. Kehinde Bello',
    firstName: 'Kehinde',
    lastName: 'Bello',
    dateOfBirth: '1982-03-14',
    gender: 'Male',
    phone: '+234 803 918 2736',
    email: 'hod.chew@becohtech.edu.ng',
    stateOfOrigin: 'Oyo',
    lga: 'Ibarapa Central',
    residentialAddress: '7 Faculty Quarters, Bethsaida Campus, Ogbomoso',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=256',
    verifiedAt: '2024-04-01T08:00:00Z',
    trustScore: 100,
    bvnLast4: '1928',
    credentialSignature: 'ed25519:8e9a8f4c2810a91fbc84102938471bade0194',
    status: 'ACTIVE',
    collegeRole: 'HOD',
    programme: 'Department of Community Health',
  },
  {
    oneId: 'ONE-NG-2026-000001',
    nin: '10000000001',
    fullName: 'Engr. Dapo Williams',
    firstName: 'Dapo',
    lastName: 'Williams',
    dateOfBirth: '1979-11-05',
    gender: 'Male',
    phone: '+234 802 000 0001',
    email: 'admin@becohtech.edu.ng',
    stateOfOrigin: 'Lagos',
    lga: 'Ikeja',
    residentialAddress: '1 Admin Ridge, Bethsaida Estate, Ogbomoso',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    verifiedAt: '2024-01-01T00:00:00Z',
    trustScore: 100,
    bvnLast4: '0001',
    credentialSignature: 'ed25519:a8f4c2810a91fbc84102938471bade01948e9',
    status: 'ACTIVE',
    collegeRole: 'SADMIN',
  },
];

export function getOneIdProfiles(): OneIdProfile[] {
  try {
    const raw = localStorage.getItem(ONEID_REGISTRY_STORAGE_KEY);
    if (!raw) return PRESEEDED_ONEID_PROFILES;
    const dynamic: OneIdProfile[] = JSON.parse(raw);
    const map = new Map<string, OneIdProfile>();
    PRESEEDED_ONEID_PROFILES.forEach((p) => map.set(p.oneId, p));
    dynamic.forEach((p) => map.set(p.oneId, p));
    return Array.from(map.values());
  } catch {
    return PRESEEDED_ONEID_PROFILES;
  }
}

export function saveOneIdProfile(profile: OneIdProfile): void {
  try {
    const profiles = getOneIdProfiles();
    const existingIdx = profiles.findIndex((p) => p.oneId === profile.oneId || p.nin === profile.nin);
    if (existingIdx >= 0) {
      profiles[existingIdx] = profile;
    } else {
      profiles.push(profile);
    }
    localStorage.setItem(ONEID_REGISTRY_STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.warn('[OneID] Failed to persist profile to storage:', err);
  }
}

export async function lookupOneId(rawQuery: string): Promise<OneIdVerificationResponse> {
  const query = rawQuery.trim().toLowerCase().replace(/[\s-]/g, '');
  if (!query) {
    return {
      success: false,
      message: 'Please provide a valid OneID Number, NIN, Phone, or Email.',
      verifiedAt: new Date().toISOString(),
      verificationSource: 'LOCAL_CACHE',
    };
  }

  // Artificial low-latency network simulation (180ms) for realistic experience
  await new Promise((resolve) => setTimeout(resolve, 180));

  const allProfiles = getOneIdProfiles();
  const matched = allProfiles.find((p) => {
    const oneIdClean = p.oneId.toLowerCase().replace(/[\s-]/g, '');
    const ninClean = p.nin.toLowerCase().replace(/[\s-]/g, '');
    const phoneClean = p.phone.toLowerCase().replace(/[\s-]/g, '');
    const emailClean = p.email.toLowerCase().trim();
    const nameClean = p.fullName.toLowerCase().replace(/[\s-]/g, '');
    const matricClean = (p.matricNumber || '').toLowerCase().replace(/[\s-]/g, '');
    const appClean = (p.applicationNumber || '').toLowerCase().replace(/[\s-]/g, '');

    return (
      oneIdClean === query ||
      oneIdClean.includes(query) ||
      ninClean === query ||
      phoneClean.endsWith(query) ||
      phoneClean === query ||
      emailClean === query ||
      nameClean.includes(query) ||
      (matricClean && (matricClean === query || matricClean.includes(query))) ||
      (appClean && (appClean === query || appClean.includes(query)))
    );
  });

  if (matched) {
    return {
      success: true,
      profile: matched,
      verifiedAt: new Date().toISOString(),
      verificationSource: 'ONEID_NIMC_GATEWAY',
    };
  }

  return {
    success: false,
    message: 'No verified OneID profile found matching this identifier.',
    verifiedAt: new Date().toISOString(),
    verificationSource: 'ONEID_NIMC_GATEWAY',
  };
}

export async function verifyFirstTimeKYC(input: {
  nin?: string;
  phone?: string;
  fullName?: string;
  email?: string;
  gender?: 'Female' | 'Male';
  stateOfOrigin?: string;
  lga?: string;
  avatarUrl?: string;
}): Promise<OneIdVerificationResponse> {
  // Artificial verification round-trip (260ms)
  await new Promise((resolve) => setTimeout(resolve, 260));

  const cleanNin = (input.nin || '').replace(/\D/g, '') || `2948${Math.floor(1000000 + Math.random() * 9000000)}`;
  const cleanPhone = input.phone || '+234 803 000 0000';
  const cleanName = input.fullName?.trim() || 'Verified Applicant';
  const parts = cleanName.split(' ');
  const firstName = parts[0] || 'Applicant';
  const lastName = parts.slice(1).join(' ') || 'Candidate';
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const oneId = `ONE-NG-2026-${randomSuffix}`;

  const profile: OneIdProfile = {
    oneId,
    nin: cleanNin,
    fullName: cleanName,
    firstName,
    lastName,
    dateOfBirth: '2005-06-15',
    gender: input.gender || 'Female',
    phone: cleanPhone,
    email: input.email?.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    stateOfOrigin: input.stateOfOrigin || 'Oyo',
    lga: input.lga || 'Ibadan North',
    residentialAddress: 'Verified Residential Address on NIMC Database',
    avatarUrl:
      input.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    verifiedAt: new Date().toISOString(),
    trustScore: 98,
    bvnLast4: cleanNin.slice(-4),
    credentialSignature: `ed25519:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
    status: 'ACTIVE',
  };

  saveOneIdProfile(profile);

  return {
    success: true,
    profile,
    verifiedAt: new Date().toISOString(),
    verificationSource: 'ONEID_NIMC_GATEWAY',
  };
}

export function generateOneIdTrustProof(profile: OneIdProfile, institutionName: string = 'Bethsaida College of Health Technology'): OneIdTrustProof {
  const maskedNin = profile.nin ? `${profile.nin.slice(0, 3)}•••••${profile.nin.slice(-3)}` : 'NIN-VERIFIED';
  return {
    valid: profile.status === 'ACTIVE',
    oneId: profile.oneId,
    holderName: profile.fullName,
    ninMasked: maskedNin,
    issuer: 'Federal Government of Nigeria — National Identity Management Commission (NIMC) via OneID Trust Network',
    institution: institutionName,
    verifiedAt: profile.verifiedAt || new Date().toISOString(),
    expiresAt: '2028-12-31T23:59:59Z',
    cryptographicHash: profile.credentialSignature || 'ed25519:verified-institutional-credential-v1',
    status: 'VALID',
  };
}
