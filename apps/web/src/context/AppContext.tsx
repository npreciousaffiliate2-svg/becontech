import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { RoleCode, UserSession } from '@campusone/contracts';
import {
  StudentLedgerEntry,
  OfficialReceipt,
  AuditEventRecord,
  formatNaira,
} from '@campusone/contracts';
import { PERSONA_PROFILES, PersonaProfile } from './personas.ts';
import { supabase } from '../lib/supabase.ts';
import { sha256Hex } from '../lib/sha256.ts';
import { loadRecords, persistRecords, SAVE_ERROR_EVENT } from '../lib/sharedRecords.ts';

export { PERSONA_PROFILES };
export type { PersonaProfile };

export type InstitutionType =
  | 'HEALTH_TECHNOLOGY'
  | 'CONVENTIONAL_UNIVERSITY'
  | 'POLYTECHNIC'
  | 'COLLEGE_OF_EDUCATION'
  | 'SPECIALIZED_INSTITUTE';

export interface SchoolProfile {
  institutionName: string;
  logoUrl?: string;
  institutionType?: InstitutionType;
  institutionalSector?: string;
  institutionAcronym: string;
  institutionCode: string;
  campusAddress: string;
  officialEmail: string;
  officialPhone: string;
  websiteUrl: string;
  accreditationRegNo: string;
  regulatoryCouncils: string[];
  academicLevels: string[];
  academicSemesters: string[];
  academicSessions: string[];
  activeSession: string;
  activeSemester: string;
  attendanceCutoffPct: number;
  caWeightPct: number;
  examWeightPct: number;
  twoFactorEnforced: boolean;
  sessionTimeoutMins: number;
  // Admissions Configuration
  admissionsOpen: boolean;
  admissionBatch: string;
  applicationFeeKobo: number;
  acceptanceFeeKobo: number;
  minimumCutoffScore: number;
  // Maintenance System Configuration
  maintenanceMode?: boolean;
  maintenanceTitle?: string;
  maintenanceMessage?: string;
  maintenanceEta?: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  hod: string;
  hodTitle: string;
  hodEmail: string;
  hodPhone: string;
  hodAvatarUrl?: string;
  office: string;
  approvedQuota: number;
  programmesCount: number;
  studentsCount: number;
  facultyCount: number;
  accreditationStatus: 'FULL' | 'PROVISIONAL' | 'RENEWAL_DUE';
  accreditationValidUntil: string;
  regulatoryBody: string;
  regulatoryBodyFull: string;
  isArchived?: boolean;
  programmes: { name: string; duration: string; students: number }[];
  courses?: any[];
}

export interface CurriculumCourseItem {
  code: string;
  title: string;
  departmentCode: string;
  departmentName: string;
  level: string;
  semester: string;
  creditUnits: number;
  theoryHours: number;
  practicalHours: number;
  lecturer: string;
}

export interface AdmissionCandidateItem {
  id: string;
  applicationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Female' | 'Male';
  stateOfOrigin: string;
  lga: string;
  programmeCode: string;
  programme: string;
  department: string;
  regulatoryBody: string;
  olevelExamBody: string;
  olevelExamYear: string;
  olevelStatus: 'VERIFIED' | 'PENDING' | 'DEFICIENT';
  olevelSubjects: { subject: string; grade: string }[];
  olevelDocumentUrl?: string;
  olevelDocumentName?: string;
  cbtScore: number;
  utmeScore?: number;
  cbtDate: string;
  status: 'APPLIED' | 'SCREENED' | 'ADMITTED' | 'ENROLLED';
  admissionListBatch?: string;
  matricNumber?: string;
  oneIdNumber?: string;
  oneIdVerified?: boolean;
  nin?: string;
  applicationFeePaid?: boolean;
  applicationFeeRef?: string;
  acceptanceFeePaid: boolean;
  acceptanceFeeRef?: string;
  admittedAt?: string;
  avatarUrl?: string;
}

export interface AppContextType {
  session: UserSession;
  persona: PersonaProfile;
  switchRole: (role: RoleCode) => void;
  updateProfile: (updates: {
    fullName?: string;
    phone?: string;
    address?: string;
    bio?: string;
    emergencyContact?: string;
    avatarUrl?: string;
  }) => Promise<void>;
  isDense: boolean;
  toggleDense: () => void;
  ledgerEntries: StudentLedgerEntry[];
  addLedgerPayment: (entry: {
    studentId: string;
    matricNumber: string;
    studentName: string;
    amountKobo: number;
    category: any;
    description: string;
    paymentMethod: any;
    referenceId?: string;
    gatewayReference?: string;
    programme?: string;
    level?: string;
  }) => OfficialReceipt;
  receipts: OfficialReceipt[];
  auditLogs: AuditEventRecord[];
  recordAudit: (
    action: string,
    entityType: string,
    entityId: string,
    details?: any,
    actor?: { userId: string; actorRole: string }
  ) => void;
  // Dynamic School Profile & Academic Framework
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (updates: Partial<SchoolProfile>) => Promise<void>;
  addAcademicLevel: (levelName: string) => void;
  removeAcademicLevel: (levelName: string) => void;
  addRegulatoryCouncil: (councilName: string) => void;
  removeRegulatoryCouncil: (councilName: string) => void;
  addAcademicSemester: (semesterName: string) => void;
  removeAcademicSemester: (semesterName: string) => void;
  addAcademicSession: (sessionName: string) => void;
  removeAcademicSession: (sessionName: string) => void;
  // Departments
  departments: DepartmentItem[];
  addDepartment: (dept: DepartmentItem) => void;
  updateDepartment: (id: string, updates: Partial<DepartmentItem>) => void;
  deleteDepartment: (id: string) => void;
  // Courses
  courses: CurriculumCourseItem[];
  addCourse: (course: CurriculumCourseItem) => void;
  updateCourse: (code: string, updates: Partial<CurriculumCourseItem>) => void;
  deleteCourse: (code: string) => void;
  // Admissions Candidates
  candidates: AdmissionCandidateItem[];
  addCandidate: (candidate: AdmissionCandidateItem) => AdmissionCandidateItem;
  updateCandidate: (id: string, updates: Partial<AdmissionCandidateItem>) => void;
  deleteCandidate: (id: string) => void;
  admitCandidate: (id: string, matricNumber?: string, batch?: string) => void;
  enrollCandidate: (id: string, matricNo?: string) => void;
  // Help Desk & Support System
  supportTickets: SupportTicketItem[];
  createSupportTicket: (ticket: {
    subject: string;
    category: SupportTicketItem['category'];
    priority: SupportTicketItem['priority'];
    message: string;
    department?: string;
  }) => Promise<void>;
  replyToSupportTicket: (ticketId: string, message: string) => Promise<void>;
  resolveSupportTicket: (ticketId: string, resolutionNotes: string) => Promise<void>;
  // Session, RBAC & Impersonation
  authenticatedRole: RoleCode | null;
  impersonatedRole: RoleCode | null;
  isSuperAdmin: boolean;
  isImpersonating: boolean;
  impersonatedUserMeta?: { id: string; name: string; email: string; matricNumber?: string } | null;
  impersonateUser: (
    role: RoleCode,
    targetUser?: { id: string; name: string; email: string; matricNumber?: string }
  ) => void;
  stopImpersonating: () => void;
  loginAs: (role: RoleCode, userEmail?: string, userName?: string) => void;
  signOut: () => Promise<void>;
  authReady: boolean;
  isAuthenticated: boolean;
  // Live Notifications System
  notifications: RealNotificationItem[];
  unreadNotificationsCount: number;
  addNotification: (item: Omit<RealNotificationItem, 'id' | 'createdAt' | 'isRead' | 'time'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  // Unified Avatar Resolution & Registration
  resolveAvatarUrl: (query: {
    avatarUrl?: string;
    email?: string;
    matricNumber?: string;
    staffId?: string;
    name?: string;
    role?: string;
  }) => string | undefined;
  registerPersonAvatar: (keys: (string | undefined)[], avatarUrl: string) => void;
}

export interface SupportTicketReply {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  message: string;
  createdAt: string;
}

export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  collegeId: string;
  userId: string;
  userName: string;
  userRole: string;
  userEmail: string;
  userPhone?: string;
  department?: string;
  category: 'TUITION_FEES' | 'COURSE_REG' | 'EXAM_RESULTS' | 'HOSTEL' | 'PORTAL_ACCESS' | 'GENERAL';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  subject: string;
  message: string;
  replies?: SupportTicketReply[];
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RealNotificationItem {
  id: string;
  collegeId: string;
  userId?: string;
  role?: string;
  title: string;
  desc: string;
  time: string;
  isRead: boolean;
  type: 'success' | 'warning' | 'info';
  link: string;
  createdAt: string;
}

const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  institutionName: 'Bethsaida College of Health Technology Ltd',
  logoUrl: '/BeonTech-Logo.png',
  institutionType: 'HEALTH_TECHNOLOGY',
  institutionalSector: 'College of Health Technology',
  institutionAcronym: 'BCHT',
  institutionCode: 'BCHT-OGB',
  campusAddress: 'Ikolaba Aladan layout, off Ayegun Yemetu Road, along CAC grammar school, Ogbomoso, Oyo State, Nigeria',
  officialEmail: 'info@becohtech.edu.ng',
  officialPhone: '+234 907 578 9045, +234 907 451 7476',
  websiteUrl: 'https://becohtech.edu.ng',
  accreditationRegNo: 'FMOH/NBTE/CHPRBN/2022/048',
  regulatoryCouncils: [
    'Community Health Practitioners Registration Board of Nigeria (CHPRBN)',
    'Environmental Health Officers Registration Council of Nigeria (EHORECON)',
    'Health Records Officers Registration Board of Nigeria (HRORBN)',
    'Dental Therapists Registration Board of Nigeria (DTRBN)',
    'Pharmacy Council of Nigeria (PCN)',
    'Federal Ministry of Health (FMOH)',
    'National Board for Technical Education (NBTE)',
  ],
  academicLevels: [
    '100 Level',
    '200 Level',
    '300 Level',
    '400 Level',
    '500 Level',
    'ND I',
    'ND II',
    'HND I',
    'HND II',
    'Certificate Year 1',
    'Certificate Year 2',
  ],
  academicSemesters: [
    'Harmattan Semester',
    'Rain Semester',
    'First Semester',
    'Second Semester',
  ],
  academicSessions: [
    '2024/2025',
    '2025/2026',
    '2026/2027',
    '2027/2028',
  ],
  activeSession: '2026/2027 Academic Session',
  activeSemester: 'Harmattan Semester',
  attendanceCutoffPct: 75,
  caWeightPct: 30,
  examWeightPct: 70,
  twoFactorEnforced: true,
  sessionTimeoutMins: 15,
  admissionsOpen: true,
  admissionBatch: 'Merit List (Batch 1)',
  applicationFeeKobo: 1000000, // N10,000
  acceptanceFeeKobo: 3500000, // N35,000
  minimumCutoffScore: 50,
  maintenanceMode: false,
  maintenanceTitle: 'Scheduled System Maintenance',
  maintenanceMessage:
    'The college portal is currently undergoing scheduled maintenance and system upgrades. Normal access will resume shortly.',
  maintenanceEta: 'Within 2 hours',
};

const DEFAULT_DEPARTMENTS: DepartmentItem[] = [
  {
    id: 'dept-dhd',
    name: 'Dental Health Department',
    code: 'DHD',
    hod: 'Dr. A. O. Adeleke',
    hodTitle: 'Consultant Dental Surgeon & Head of Department',
    hodEmail: 'hod.dhd@becohtech.edu.ng',
    hodPhone: '+234 907 578 9045',
    office: 'Dental Sciences Complex, Block A, Room 102',
    approvedQuota: 150,
    programmesCount: 2,
    studentsCount: 185,
    facultyCount: 7,
    accreditationStatus: 'FULL',
    accreditationValidUntil: 'October 2028',
    regulatoryBody: 'DTRBN',
    regulatoryBodyFull: 'Dental Therapists Registration Board of Nigeria',
    programmes: [
      { name: 'Dental Health Technician (DHT)', duration: '3-Year Diploma', students: 105 },
      { name: 'Dental Surgery Technician (DST)', duration: '3-Year Diploma', students: 80 },
    ],
    courses: [
      { code: 'DHT 101', title: 'Dental Anatomy & Tooth Morphology', units: 3, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Dr. A. O. Adeleke' },
      { code: 'DHT 102', title: 'Dental Materials Science & Technology', units: 3, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Dr. M. S. Bello' },
      { code: 'DHT 201', title: 'Oral Pathology & Microbiology', units: 4, semester: 'Harmattan Semester', level: '200 Level', lecturer: 'Dr. A. O. Adeleke' },
      { code: 'DHT 301', title: 'Prosthetics & Dental Radiography', units: 4, semester: 'Harmattan Semester', level: '300 Level', lecturer: 'Mr. T. Ogunyemi' },
    ],
  },
  {
    id: 'dept-ehd',
    name: 'Environmental Health Department',
    code: 'EHD',
    hod: 'Sanitarian B. Ibrahim',
    hodTitle: 'Chief Environmental Health Officer & Head of Department',
    hodEmail: 'hod.ehd@becohtech.edu.ng',
    hodPhone: '+234 907 451 7476',
    office: 'Public Health Pavilion, Suite E1',
    approvedQuota: 200,
    programmesCount: 2,
    studentsCount: 198,
    facultyCount: 9,
    accreditationStatus: 'FULL',
    accreditationValidUntil: 'September 2028',
    regulatoryBody: 'EHORECON',
    regulatoryBodyFull: 'Environmental Health Officers Registration Council of Nigeria',
    programmes: [
      { name: 'Environmental Health Technician (EHT)', duration: '3-Year Diploma', students: 130 },
      { name: 'Environmental Health Assistant (EHA)', duration: '2-Year Certificate', students: 68 },
    ],
    courses: [
      { code: 'EHT 101', title: 'Principles of Environmental Health & Sanitation', units: 3, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Sanitarian B. Ibrahim' },
      { code: 'EHT 102', title: 'Waste & Sewage Management', units: 4, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Mr. A. Salawu' },
      { code: 'EHT 201', title: 'Water Supply, Sanitation & Water Quality Analysis', units: 4, semester: 'Harmattan Semester', level: '200 Level', lecturer: 'Mrs. F. Oseni' },
      { code: 'EHT 301', title: 'Epidemiology, Vector Control & Environmental Legislation', units: 3, semester: 'Harmattan Semester', level: '300 Level', lecturer: 'Sanitarian B. Ibrahim' },
    ],
  },
  {
    id: 'dept-him',
    name: 'Health Information Management Department',
    code: 'HIM',
    hod: 'Mrs. T. Adeleke',
    hodTitle: 'Principal Lecturer & Head of Department',
    hodEmail: 'hod.him@becohtech.edu.ng',
    hodPhone: '+234 907 578 9045',
    office: 'Administration Annex, Room 108',
    approvedQuota: 180,
    programmesCount: 2,
    studentsCount: 172,
    facultyCount: 8,
    accreditationStatus: 'FULL',
    accreditationValidUntil: 'January 2029',
    regulatoryBody: 'HRORBN',
    regulatoryBodyFull: 'Health Records Officers Registration Board of Nigeria',
    programmes: [
      { name: 'National Diploma (ND) in Health Information Management', duration: '2-Year National Diploma', students: 102 },
      { name: 'Higher National Diploma (HND) in Health Information Management', duration: '2-Year Higher National Diploma', students: 70 },
    ],
    courses: [
      { code: 'HIM 101', title: 'Medical Terminology & Disease Classification (ICD-10/11)', units: 3, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Mrs. T. Adeleke' },
      { code: 'HIM 102', title: 'Health Data Processing & Biostatistics', units: 4, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Mr. J. Ogunlesi' },
      { code: 'HIM 201', title: 'Electronic Health Records & Medico-Legal Practice', units: 3, semester: 'Harmattan Semester', level: '200 Level', lecturer: 'Mrs. T. Adeleke' },
      { code: 'HIM 301', title: 'Health Ethics, Law, Confidentiality & Informatics', units: 3, semester: 'Harmattan Semester', level: '300 Level', lecturer: 'Mr. S. Danjuma' },
    ],
  },
  {
    id: 'dept-htd',
    name: 'Health Technician Department',
    code: 'HTD',
    hod: 'Mr. S. O. Alabi',
    hodTitle: 'Senior Lecturer & Head of Department',
    hodEmail: 'hod.htd@becohtech.edu.ng',
    hodPhone: '+234 907 451 7476',
    office: 'Primary Care Education Center, Wing C',
    approvedQuota: 160,
    programmesCount: 1,
    studentsCount: 145,
    facultyCount: 7,
    accreditationStatus: 'FULL',
    accreditationValidUntil: 'November 2027',
    regulatoryBody: 'FMOH',
    regulatoryBodyFull: 'Federal Ministry of Health & Primary Health Care Development Agency',
    programmes: [
      { name: 'Health Technician (HT)', duration: '3-Year Diploma', students: 145 },
    ],
    courses: [
      { code: 'HTD 101', title: 'Anatomy, Physiology & Basic Clinical Care', units: 3, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Mr. S. O. Alabi' },
      { code: 'HTD 102', title: 'Primary Health Care & Community Health Education', units: 3, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Mrs. K. Adeola' },
      { code: 'HTD 201', title: 'Maternal & Child Health Care & Immunization', units: 4, semester: 'Harmattan Semester', level: '200 Level', lecturer: 'Mr. S. O. Alabi' },
      { code: 'HTD 301', title: 'First Aid, Emergency Care & Disease Surveillance', units: 3, semester: 'Harmattan Semester', level: '300 Level', lecturer: 'Nurse D. Bakare' },
    ],
  },
  {
    id: 'dept-pht',
    name: 'Pharmacy Technician Department',
    code: 'PHT',
    hod: 'Pharm. F. Oladipo',
    hodTitle: 'Chief Pharmacist & Head of Department',
    hodEmail: 'hod.pht@becohtech.edu.ng',
    hodPhone: '+234 907 578 9045',
    office: 'Pharmaceutical Sciences Wing, Lab P1',
    approvedQuota: 250,
    programmesCount: 1,
    studentsCount: 230,
    facultyCount: 9,
    accreditationStatus: 'FULL',
    accreditationValidUntil: 'June 2028',
    regulatoryBody: 'PCN',
    regulatoryBodyFull: 'Pharmacy Council of Nigeria',
    programmes: [
      { name: 'Pharmacy Technician (PHT)', duration: '3-Year Diploma', students: 230 },
    ],
    courses: [
      { code: 'PHT 101', title: 'Dispensing Principles & Pharmaceutical Calculations', units: 3, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Pharm. F. Oladipo' },
      { code: 'PHT 102', title: 'Pharmacology for Pharmacy Technicians', units: 4, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Pharm. T. Adele' },
      { code: 'PHT 201', title: 'Pharmaceutics & Hospital Drug Storage', units: 3, semester: 'Harmattan Semester', level: '200 Level', lecturer: 'Mr. K. Lawal' },
      { code: 'PHT 301', title: 'Clinical Pharmacy Practice & Drug Quality Control', units: 4, semester: 'Harmattan Semester', level: '300 Level', lecturer: 'Pharm. F. Oladipo' },
    ],
  },
  {
    id: 'dept-had',
    name: 'Health Assistant Department',
    code: 'HAD',
    hod: 'Nurse E. O. Okon',
    hodTitle: 'Chief Nursing Officer & Head of Department',
    hodEmail: 'hod.had@becohtech.edu.ng',
    hodPhone: '+234 907 451 7476',
    office: 'Clinical Practice Annex, Ground Floor',
    approvedQuota: 150,
    programmesCount: 1,
    studentsCount: 135,
    facultyCount: 6,
    accreditationStatus: 'FULL',
    accreditationValidUntil: 'August 2027',
    regulatoryBody: 'FMOH',
    regulatoryBodyFull: 'Federal Ministry of Health & State Health Management Board',
    programmes: [
      { name: 'Health Assistant (HA)', duration: '2-Year Certificate', students: 135 },
    ],
    courses: [
      { code: 'HAD 101', title: 'Basic Human Anatomy, Physiology & Patient Hygiene', units: 3, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Nurse E. O. Okon' },
      { code: 'HAD 102', title: 'First Aid, Emergency Care & Ward Assistance', units: 3, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Mr. P. Ajayi' },
      { code: 'HAD 201', title: 'Maternal & Child Health & Nutrition Support', units: 3, semester: 'Harmattan Semester', level: '200 Level', lecturer: 'Nurse E. O. Okon' },
    ],
  },
  {
    id: 'dept-chd',
    name: 'Community Health Department',
    code: 'CHD',
    hod: 'Dr. K. Bello',
    hodTitle: 'Chief Lecturer & Head of Department',
    hodEmail: 'hod.chd@becohtech.edu.ng',
    hodPhone: '+234 907 578 9045',
    office: 'Health Sciences Complex, Suite B101',
    approvedQuota: 400,
    programmesCount: 2,
    studentsCount: 380,
    facultyCount: 14,
    accreditationStatus: 'FULL',
    accreditationValidUntil: 'November 2028',
    regulatoryBody: 'CHPRBN',
    regulatoryBodyFull: 'Community Health Practitioners Registration Board of Nigeria',
    programmes: [
      { name: 'Community Health Extension Worker (CHEW)', duration: '3-Year Diploma', students: 260 },
      { name: 'Junior Community Health Extension Worker (JCHEW)', duration: '2-Year Certificate', students: 120 },
    ],
    courses: [
      { code: 'CHE 101', title: 'Introduction to Primary Healthcare', units: 3, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Dr. K. Bello' },
      { code: 'CHE 102', title: 'Community Diagnosis & Field Survey', units: 3, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Mrs. R. Ajayi' },
      { code: 'CHE 201', title: 'Maternal & Child Health Clinicals', units: 4, semester: 'Harmattan Semester', level: '200 Level', lecturer: 'Mr. D. Alabi' },
      { code: 'CHE 301', title: 'Rural Healthcare Administration', units: 3, semester: 'Harmattan Semester', level: '300 Level', lecturer: 'Dr. K. Bello' },
    ],
  },
  {
    id: 'dept-mlt',
    name: 'Medical Laboratory Science Department',
    code: 'MLT',
    hod: 'Dr. (Mrs) N. Okonkwo',
    hodTitle: 'Chief Medical Laboratory Scientist & Head of Department',
    hodEmail: 'hod.mlt@becohtech.edu.ng',
    hodPhone: '+234 907 578 9045',
    office: 'Diagnostics Wing, Pathology Lab 2',
    approvedQuota: 180,
    programmesCount: 1,
    studentsCount: 165,
    facultyCount: 8,
    accreditationStatus: 'FULL',
    accreditationValidUntil: 'December 2028',
    regulatoryBody: 'MLSCN',
    regulatoryBodyFull: 'Medical Laboratory Science Council of Nigeria',
    programmes: [
      { name: 'Medical Laboratory Technician (MLT)', duration: '3-Year Diploma', students: 165 },
    ],
    courses: [
      { code: 'MLT 101', title: 'Clinical Chemistry & Chemical Pathology', units: 4, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Dr. (Mrs) N. Okonkwo' },
      { code: 'MLT 102', title: 'Medical Microbiology & Parasitology', units: 4, semester: 'Harmattan Semester', level: '100 Level', lecturer: 'Mr. P. Nwachukwu' },
      { code: 'MLT 201', title: 'Haematology & Blood Transfusion Science', units: 4, semester: 'Harmattan Semester', level: '200 Level', lecturer: 'Dr. (Mrs) N. Okonkwo' },
      { code: 'MLT 301', title: 'Histopathology & Diagnostic Techniques', units: 4, semester: 'Harmattan Semester', level: '300 Level', lecturer: 'Mr. P. Nwachukwu' },
    ],
  },
];

const DEFAULT_COURSES: CurriculumCourseItem[] = [
  { code: 'DHT 101', title: 'Dental Anatomy & Tooth Morphology', departmentCode: 'DHD', departmentName: 'Dental Health Department', level: '100 Level', semester: 'Harmattan Semester', creditUnits: 3, theoryHours: 2, practicalHours: 3, lecturer: 'Dr. A. O. Adeleke' },
  { code: 'DHT 102', title: 'Dental Materials Science & Technology', departmentCode: 'DHD', departmentName: 'Dental Health Department', level: '100 Level', semester: 'Harmattan Semester', creditUnits: 3, theoryHours: 2, practicalHours: 3, lecturer: 'Dr. M. S. Bello' },
  { code: 'EHT 101', title: 'Principles of Environmental Health & Sanitation', departmentCode: 'EHD', departmentName: 'Environmental Health Department', level: '100 Level', semester: 'Harmattan Semester', creditUnits: 3, theoryHours: 2, practicalHours: 3, lecturer: 'Sanitarian B. Ibrahim' },
  { code: 'EHT 102', title: 'Waste & Sewage Management', departmentCode: 'EHD', departmentName: 'Environmental Health Department', level: '100 Level', semester: 'Harmattan Semester', creditUnits: 4, theoryHours: 2, practicalHours: 6, lecturer: 'Mr. A. Salawu' },
  { code: 'HIM 101', title: 'Medical Terminology & Disease Classification (ICD-10/11)', departmentCode: 'HIM', departmentName: 'Health Information Management Department', level: '100 Level', semester: 'Harmattan Semester', creditUnits: 3, theoryHours: 3, practicalHours: 0, lecturer: 'Mrs. T. Adeleke' },
  { code: 'HIM 102', title: 'Health Data Processing & Biostatistics', departmentCode: 'HIM', departmentName: 'Health Information Management Department', level: '100 Level', semester: 'Harmattan Semester', creditUnits: 4, theoryHours: 2, practicalHours: 6, lecturer: 'Mr. J. Ogunlesi' },
  { code: 'HTD 101', title: 'Anatomy, Physiology & Basic Clinical Care', departmentCode: 'HTD', departmentName: 'Health Technician Department', level: '100 Level', semester: 'Harmattan Semester', creditUnits: 3, theoryHours: 2, practicalHours: 3, lecturer: 'Mr. S. O. Alabi' },
  { code: 'PHT 101', title: 'Dispensing Principles & Pharmaceutical Calculations', departmentCode: 'PHT', departmentName: 'Pharmacy Technician Department', level: '100 Level', semester: 'Harmattan Semester', creditUnits: 3, theoryHours: 2, practicalHours: 3, lecturer: 'Pharm. F. Oladipo' },
  { code: 'PHT 102', title: 'Pharmacology for Pharmacy Technicians', departmentCode: 'PHT', departmentName: 'Pharmacy Technician Department', level: '100 Level', semester: 'Harmattan Semester', creditUnits: 4, theoryHours: 3, practicalHours: 3, lecturer: 'Pharm. T. Adele' },
  { code: 'HAD 101', title: 'Basic Human Anatomy, Physiology & Patient Hygiene', departmentCode: 'HAD', departmentName: 'Health Assistant Department', level: '100 Level', semester: 'Harmattan Semester', creditUnits: 3, theoryHours: 2, practicalHours: 3, lecturer: 'Nurse E. O. Okon' },
  { code: 'CHE 101', title: 'Introduction to Primary Healthcare', departmentCode: 'CHD', departmentName: 'Community Health Department', level: '100 Level', semester: 'Harmattan Semester', creditUnits: 3, theoryHours: 2, practicalHours: 3, lecturer: 'Dr. K. Bello' },
  { code: 'CHE 102', title: 'Community Diagnosis & Field Survey', departmentCode: 'CHD', departmentName: 'Community Health Department', level: '100 Level', semester: 'Harmattan Semester', creditUnits: 3, theoryHours: 2, practicalHours: 3, lecturer: 'Mrs. R. Ajayi' },
];

const DEFAULT_CANDIDATES: AdmissionCandidateItem[] = [
  {
    id: 'app-01',
    applicationNumber: 'APP/2026/0142',
    fullName: 'Amina Yusuf',
    email: 'amina.yusuf@gmail.com',
    phone: '+234 803 445 1190',
    gender: 'Female',
    stateOfOrigin: 'Oyo',
    lga: 'Ibadan North',
    programmeCode: 'CHEW',
    programme: 'Community Health Extension Worker (CHEW)',
    department: 'Department of Community Health',
    regulatoryBody: 'CHPRBN',
    olevelExamBody: 'WAEC',
    olevelExamYear: '2025',
    olevelStatus: 'VERIFIED',
    olevelSubjects: [
      { subject: 'English Language', grade: 'B3' },
      { subject: 'Mathematics', grade: 'C4' },
      { subject: 'Biology', grade: 'B2' },
      { subject: 'Chemistry', grade: 'B3' },
      { subject: 'Physics', grade: 'C5' },
    ],
    cbtScore: 78,
    cbtDate: '2026-10-18',
    status: 'SCREENED',
    acceptanceFeePaid: false,
  },
  {
    id: 'app-02',
    applicationNumber: 'APP/2026/0143',
    fullName: 'David Adeleke',
    email: 'david.adeleke@yahoo.com',
    phone: '+234 802 771 8820',
    gender: 'Male',
    stateOfOrigin: 'Osun',
    lga: 'Ede South',
    programmeCode: 'DHT',
    programme: 'Dental Health Technician (DHT)',
    department: 'Dental Health Department',
    regulatoryBody: 'DTRBN',
    olevelExamBody: 'WAEC',
    olevelExamYear: '2025',
    olevelStatus: 'VERIFIED',
    olevelSubjects: [
      { subject: 'English Language', grade: 'B2' },
      { subject: 'Mathematics', grade: 'B3' },
      { subject: 'Biology', grade: 'A1' },
      { subject: 'Chemistry', grade: 'B2' },
      { subject: 'Physics', grade: 'B3' },
    ],
    cbtScore: 82,
    cbtDate: '2026-10-18',
    status: 'SCREENED',
    acceptanceFeePaid: false,
  },
  {
    id: 'app-03',
    applicationNumber: 'APP/2026/0144',
    fullName: 'Zainab Bello',
    email: 'zainab.bello@outlook.com',
    phone: '+234 805 119 4432',
    gender: 'Female',
    stateOfOrigin: 'Oyo',
    lga: 'Oyo West',
    programmeCode: 'PHT',
    programme: 'Pharmacy Technician',
    department: 'Department of Pharmacy Technician Studies',
    regulatoryBody: 'PCN',
    olevelExamBody: 'NECO',
    olevelExamYear: '2024',
    olevelStatus: 'VERIFIED',
    olevelSubjects: [
      { subject: 'English Language', grade: 'C4' },
      { subject: 'Mathematics', grade: 'C5' },
      { subject: 'Biology', grade: 'B3' },
      { subject: 'Chemistry', grade: 'B3' },
      { subject: 'Physics', grade: 'C4' },
    ],
    cbtScore: 71,
    cbtDate: '2026-10-19',
    status: 'ADMITTED',
    admissionListBatch: 'Merit List (Batch 1)',
    matricNumber: 'PHT/2026/0018',
    acceptanceFeePaid: true,
    acceptanceFeeRef: 'REC-ACC-2026-0041',
    admittedAt: '2026-11-04',
  },
];

const INITIAL_AUDIT_LOGS: AuditEventRecord[] = [
  {
    id: 'aud-001',
    collegeId: 'bethsaida',
    actorId: 'user-provost',
    actorRole: 'PROVOST',
    action: 'SESSION_CONFIGURATION_APPROVED',
    entityType: 'TENANT_SETTINGS',
    entityId: 'bethsaida:2026/2027',
    beforeSnapshot: null,
    afterSnapshot: { session: '2026/2027', status: 'ACTIVE' },
    ipAddress: 'client-unresolved',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    timestamp: '2026-11-01T08:00:00Z',
    chainHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
  },
];

const INITIAL_LEDGER_ENTRIES: StudentLedgerEntry[] = [
  {
    id: 'led-001',
    collegeId: 'bethsaida',
    studentId: 'stu-001',
    matricNumber: 'CHE/2026/0014',
    entryType: 'debit',
    category: 'tuition',
    description: 'First Semester Tuition Fee (CHEW 200L)',
    amountKobo: 12000000,
    balanceAfterKobo: 12000000,
    referenceId: 'chg-chew-200-t1',
    createdAt: '2026-11-03T08:00:00Z',
  },
  {
    id: 'led-002',
    collegeId: 'bethsaida',
    studentId: 'stu-001',
    matricNumber: 'CHE/2026/0014',
    entryType: 'credit',
    category: 'tuition',
    description: 'Paystack Card Settlement — Part Payment Ref: PSTK_91823719',
    amountKobo: 10000000,
    balanceAfterKobo: 2000000,
    referenceId: 'pay-pstk-001',
    createdAt: '2026-11-05T11:20:00Z',
  },
];

const INITIAL_RECEIPTS: OfficialReceipt[] = [
  {
    receiptNumber: 'RCP-2026-00104',
    collegeId: 'bethsaida',
    studentId: 'stu-001',
    studentName: 'Blessing Adeyemi',
    matricNumber: 'CHE/2026/0014',
    programme: 'Community Health Extension Worker (CHEW)',
    level: '200 Level',
    category: 'tuition',
    amountKobo: 10000000,
    formattedAmount: formatNaira(10000000),
    paymentMethod: 'paystack',
    transactionReference: 'BTH-TX-2026-9021',
    gatewayReference: 'PSTK_91823719',
    paidAt: '2026-11-05T11:20:00Z',
    qrVerificationHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    issuer: 'Bursary Department, Bethsaida College',
  },
];

function formatRelativeTime(isoDate: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    return new Date(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch (e) {
    return 'Recently';
  }
}

const INITIAL_SUPPORT_TICKETS: SupportTicketItem[] = [
  {
    id: 'tic-001',
    ticketNumber: 'TIC-2026-0041',
    collegeId: 'bethsaida',
    userId: 'usr-stu-01',
    userName: 'Ibrahim Musa',
    userRole: 'Student (CHEW 200L)',
    userEmail: 'ibrahim.musa@student.bethsaida.edu.ng',
    userPhone: '+234 803 441 9823',
    department: 'Community Health (CHEW)',
    category: 'TUITION_FEES',
    priority: 'HIGH',
    status: 'RESOLVED',
    subject: 'Fee Payment Reconciliation for CHEW 200L Part Payment',
    message: 'I paid fifty thousand Naira (NGN 50,000) via Paystack Card transfer on Monday but my balance still reflects eighty thousand arrears. Kindly reconcile with bursary ledger.',
    replies: [
      {
        id: 'rep-001',
        authorId: 'usr-bursar-01',
        authorName: 'Mr. Babatunde Lawal',
        authorRole: 'College Bursar',
        message: 'Payment verified with switch reference PSTK_91823719. Your student ledger balance has been credited and official receipt generated.',
        createdAt: '2026-11-13T10:15:00Z',
      },
    ],
    resolutionNotes: 'Bursary ledger credited with 50,000 NGN. Official receipt RCP-2026-BCHT-0891 issued.',
    resolvedAt: '2026-11-13T10:20:00Z',
    resolvedBy: 'Mr. Babatunde Lawal (Bursar)',
    createdAt: '2026-11-12T16:30:00Z',
    updatedAt: '2026-11-13T10:20:00Z',
  },
  {
    id: 'tic-002',
    ticketNumber: 'TIC-2026-0082',
    collegeId: 'bethsaida',
    userId: 'usr-stu-02',
    userName: 'Amina Bello',
    userRole: 'Student (MLT 300L)',
    userEmail: 'amina.bello@student.bethsaida.edu.ng',
    userPhone: '+234 814 552 1190',
    department: 'Medical Laboratory Technician (MLT)',
    category: 'COURSE_REG',
    priority: 'NORMAL',
    status: 'OPEN',
    subject: 'Course Registration Credit Unit Limit Override for MLT 305',
    message: 'I need to register for MLT 305 (Clinical Chemistry Practicum) which takes my total semester credits to 26 units. The portal is capping at 24 units. Requesting HOD and Academic Board waiver.',
    replies: [],
    createdAt: '2026-11-14T08:10:00Z',
    updatedAt: '2026-11-14T08:10:00Z',
  },
  {
    id: 'tic-003',
    ticketNumber: 'TIC-2026-0095',
    collegeId: 'bethsaida',
    userId: 'usr-stu-03',
    userName: 'Chidinma Eze',
    userRole: 'Student (Pharmacy Tech 100L)',
    userEmail: 'chidinma.eze@student.bethsaida.edu.ng',
    userPhone: '+234 705 918 2304',
    department: 'Pharmacy Technician',
    category: 'HOSTEL',
    priority: 'NORMAL',
    status: 'IN_PROGRESS',
    subject: 'Hostel Room 12B Electrical Ceiling Fan Repair',
    message: 'The ceiling fan in Female Hostel Block B, Room 12B has stopped rotating since yesterday. Kindly dispatch campus maintenance technicians.',
    replies: [
      {
        id: 'rep-002',
        authorId: 'usr-warden-01',
        authorName: 'Mrs. Folake Adeyemi',
        authorRole: 'Hall Warden',
        message: 'Maintenance work order #MNT-041 dispatched to college works department.',
        createdAt: '2026-11-14T11:00:00Z',
      },
    ],
    createdAt: '2026-11-14T09:45:00Z',
    updatedAt: '2026-11-14T11:00:00Z',
  },
];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ─── AUTHENTICATION & SESSION MANAGEMENT (RBAC Controlled) ───
  const [authenticatedRole, setAuthenticatedRole] = useState<RoleCode | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [impersonatedRole, setImpersonatedRole] = useState<RoleCode | null>(() => {
    try {
      const saved = sessionStorage.getItem('campusone_impersonated_role');
      if (saved) return saved as RoleCode;
    } catch (e) {}
    return null;
  });

  const [impersonatedUserMeta, setImpersonatedUserMeta] = useState<{
    id: string;
    name: string;
    email: string;
    matricNumber?: string;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('campusone_impersonated_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const activeRole: RoleCode = impersonatedRole || authenticatedRole || 'STU';
  const isAuthenticated = authenticatedRole !== null;
  const isSuperAdmin = authenticatedRole === 'SADMIN';
  const isImpersonating = isSuperAdmin && impersonatedRole !== null;

  const [isDense, setIsDense] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<StudentLedgerEntry[]>([]);
  const [receipts, setReceipts] = useState<OfficialReceipt[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEventRecord[]>([]);
  const auditLogsRef = useRef<AuditEventRecord[]>([]);
  const [customProfiles, setCustomProfiles] = useState<Record<string, Partial<PersonaProfile>>>({});
  const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>([]);
  const [notifications, setNotifications] = useState<RealNotificationItem[]>([]);
  const [schoolProfile, setSchoolProfileState] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);
  const [departments, setDepartmentsState] = useState<DepartmentItem[]>(() => {
    try {
      const saved = localStorage.getItem('campusone_registry_departments');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_DEPARTMENTS;
  });
  const [courses, setCoursesState] = useState<CurriculumCourseItem[]>(() => {
    try {
      const saved = localStorage.getItem('campusone_registry_courses');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_COURSES;
  });
  const [candidates, setCandidatesState] = useState<AdmissionCandidateItem[]>(() => {
    try {
      const saved = localStorage.getItem('campusone_admissions_candidates');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_CANDIDATES;
  });
  const [avatarDirectory, setAvatarDirectory] = useState<Record<string, string>>({});
  const [authUserEmail, setAuthUserEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem('campusone_current_user_email');
    } catch (e) {
      return null;
    }
  });

  const normalizeAvatarKey = (raw?: string): string => {
    if (!raw) return '';
    return raw
      .replace(/^(Dr\.|Pharm\.|Prof\.|Mrs\.|Mr\.|Ms\.|Miss|Nurse|Sanitarian|Chief)\s+/i, '')
      .trim()
      .toLowerCase();
  };

  const registerPersonAvatar = (keys: (string | undefined)[], avatarUrl: string) => {
    const validKeys = keys.map((k) => normalizeAvatarKey(k)).filter(Boolean);
    if (validKeys.length === 0) return;
    setAvatarDirectory((prev) => {
      const next = { ...prev };
      validKeys.forEach((k) => {
        if (avatarUrl) {
          next[k] = avatarUrl;
        } else {
          delete next[k];
        }
      });
      const rows = Object.entries(next).map(([id, url]) => ({ id, url }));
      void persistRecords('registry.avatars', rows);
      return next;
    });
  };

  const resolveAvatarUrl = (query: {
    avatarUrl?: string;
    email?: string;
    matricNumber?: string;
    staffId?: string;
    name?: string;
    role?: string;
  }): string | undefined => {
    if (query.avatarUrl) return query.avatarUrl;
    const candidatesKeys = [
      normalizeAvatarKey(query.email),
      normalizeAvatarKey(query.matricNumber),
      normalizeAvatarKey(query.staffId),
      normalizeAvatarKey(query.name),
      query.name ? query.name.trim().toLowerCase() : '',
    ].filter(Boolean);
    for (const key of candidatesKeys) {
      if (avatarDirectory[key]) return avatarDirectory[key];
    }
    if (query.name) {
      const matchedDept = departments.find(
        (d) => normalizeAvatarKey(d.hod) === normalizeAvatarKey(query.name) && d.hodAvatarUrl
      );
      if (matchedDept?.hodAvatarUrl) return matchedDept.hodAvatarUrl;
    }
    if (query.role && customProfiles[query.role]?.avatarUrl) {
      return customProfiles[query.role]?.avatarUrl;
    }
    return undefined;
  };

  const setSchoolProfile = (updater: (prev: SchoolProfile) => SchoolProfile) => {
    setSchoolProfileState((prev) => updater(prev));
  };

  const setDepartments = (updater: (prev: DepartmentItem[]) => DepartmentItem[]) => {
    setDepartmentsState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('campusone_registry_departments', JSON.stringify(next));
      } catch (e) {}
      void persistRecords('registry.departments', next);
      return next;
    });
  };

  const setCourses = (updater: (prev: CurriculumCourseItem[]) => CurriculumCourseItem[]) => {
    setCoursesState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('campusone_registry_courses', JSON.stringify(next));
      } catch (e) {}
      void persistRecords('registry.courses', next);
      return next;
    });
  };

  const setCandidates = (updater: (prev: AdmissionCandidateItem[]) => AdmissionCandidateItem[]) => {
    setCandidatesState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('campusone_admissions_candidates', JSON.stringify(next));
      } catch (e) {}
      void persistRecords('admissions.candidates', next);
      return next;
    });
  };

  const basePersona = PERSONA_PROFILES[activeRole] || PERSONA_PROFILES.PROVOST;
  const personaOverrides = customProfiles[activeRole] || {};

  const currentEmailToMatch =
    authUserEmail ||
    (activeRole === 'STU' || activeRole === 'SPON'
      ? (() => {
          try {
            return (
              localStorage.getItem('campusone_current_user_email') ||
              localStorage.getItem('campusone_last_applicant_email')
            );
          } catch (e) {
            return null;
          }
        })()
      : null);

  // Look up in active candidates state or fallback to local registry
  const matchedCandidate = currentEmailToMatch
    ? (candidates.find(
        (c) => c.email && c.email.toLowerCase() === currentEmailToMatch.toLowerCase()
      ) || (() => {
        try {
          const raw = localStorage.getItem('campusone_admissions_candidates');
          if (raw) {
            const list = JSON.parse(raw);
            return list.find((c: any) => c.email && c.email.toLowerCase() === currentEmailToMatch.toLowerCase());
          }
        } catch (e) {}
        return null;
      })())
    : null;

  const isApplicantRole =
    (activeRole === 'STU' || activeRole === 'SPON') &&
    (Boolean(matchedCandidate && matchedCandidate.status !== 'ENROLLED') ||
     Boolean(currentEmailToMatch && !['che.2026.0014@becohtech.edu.ng', 'blessing.adeyemi@becohtech.edu.ng'].includes(currentEmailToMatch.toLowerCase())));

  const persona: PersonaProfile = {
    ...basePersona,
    ...personaOverrides,
    permissions: personaOverrides.permissions || basePersona.permissions,
    ...(isApplicantRole
      ? {
          fullName:
            personaOverrides.fullName ||
            matchedCandidate?.fullName ||
            (currentEmailToMatch ? currentEmailToMatch.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : basePersona.fullName),
          email: matchedCandidate?.email || currentEmailToMatch || basePersona.email,
          phone: personaOverrides.phone || matchedCandidate?.phone || '',
          address: personaOverrides.address || (matchedCandidate ? `${matchedCandidate.lga || ''}${matchedCandidate.lga && matchedCandidate.stateOfOrigin ? ', ' : ''}${matchedCandidate.stateOfOrigin || ''}` : ''),
          emergencyContact: personaOverrides.emergencyContact || '',
          department: matchedCandidate?.department || matchedCandidate?.programme || '',
          // Applicants NEVER receive a Matriculation Number until admitted & acceptance fees are cleared
          matricNumber: undefined,
          applicationNumber: matchedCandidate?.applicationNumber,
          scopeBadge:
            matchedCandidate?.status === 'ADMITTED'
              ? 'Admitted Candidate'
              : 'Admission Applicant',
          bio:
            personaOverrides.bio ||
            (matchedCandidate
              ? `${matchedCandidate.programme} • Application: ${matchedCandidate.applicationNumber}`
              : 'Candidate Admission & Entrance Screening Profile'),
          avatarUrl: personaOverrides.avatarUrl !== undefined ? personaOverrides.avatarUrl : (matchedCandidate?.avatarUrl || ''),
          // Strict module confinement: applicants can ONLY see Admission Overview, Profile, and Help Support
          allowedModules: ['/', '/profile', '/support'],
        }
      : matchedCandidate && (activeRole === 'STU' || activeRole === 'SPON')
      ? {
          fullName: personaOverrides.fullName || matchedCandidate.fullName,
          email: matchedCandidate.email,
          phone: personaOverrides.phone || matchedCandidate.phone,
          department: matchedCandidate.department || matchedCandidate.programme,
          matricNumber: matchedCandidate.matricNumber,
          applicationNumber: matchedCandidate.applicationNumber,
          scopeBadge: 'Enrolled Student',
          bio: personaOverrides.bio || `${matchedCandidate.programme} • Matric: ${matchedCandidate.matricNumber}`,
          avatarUrl: personaOverrides.avatarUrl !== undefined ? personaOverrides.avatarUrl : (matchedCandidate.avatarUrl || basePersona.avatarUrl),
        }
      : {}),
    ...(impersonatedUserMeta
      ? {
          fullName: impersonatedUserMeta.name,
          email: impersonatedUserMeta.email,
          ...(impersonatedUserMeta.matricNumber
            ? { matricNumber: impersonatedUserMeta.matricNumber }
            : {}),
        }
      : {}),
  };

  const session: UserSession = {
    userId: `usr-${activeRole.toLowerCase()}-01`,
    collegeId: 'bethsaida',
    email: persona.email,
    fullName: persona.fullName,
    avatarUrl: persona.avatarUrl,
    activeRole,
    roles: [
      { role: 'PROVOST', scope: 'college' },
      { role: 'REG', scope: 'college' },
      { role: 'BURSAR', scope: 'college' },
      { role: 'HOD', scope: 'department', scopeId: 'dept-chew' },
      { role: 'INSTR', scope: 'department', scopeId: 'dept-chew' },
      { role: 'EXAM', scope: 'college' },
      { role: 'CLINSUP', scope: 'site', scopeId: 'site-uch' },
      { role: 'SADMIN', scope: 'college' },
      { role: 'STU', scope: 'self', scopeId: 'stu-001' },
      { role: 'SPON', scope: 'self', scopeId: 'stu-001' },
    ],
    permissions: persona.permissions,
  };

  const applyTenantRow = (t: any) => {
      setSchoolProfile((prev) => ({
        ...prev,
        institutionName: t.institution_name || prev.institutionName,
        institutionAcronym: t.institution_acronym || prev.institutionAcronym,
        institutionCode: t.institution_code || prev.institutionCode,
        campusAddress: t.campus_address || prev.campusAddress,
        officialEmail: t.official_email || prev.officialEmail,
        officialPhone: t.official_phone || prev.officialPhone,
        websiteUrl: t.website_url || prev.websiteUrl,
        accreditationRegNo: t.accreditation_reg_no || prev.accreditationRegNo,
        regulatoryCouncils: t.regulatory_councils && t.regulatory_councils.length > 0 ? t.regulatory_councils : prev.regulatoryCouncils,
        academicLevels: t.academic_levels && t.academic_levels.length > 0 ? t.academic_levels : prev.academicLevels,
        academicSemesters: t.academic_semesters && t.academic_semesters.length > 0 ? t.academic_semesters : prev.academicSemesters,
        academicSessions: t.academic_sessions && t.academic_sessions.length > 0 ? t.academic_sessions : prev.academicSessions,
        activeSession: t.active_session || prev.activeSession,
        activeSemester: t.active_semester || prev.activeSemester,
        attendanceCutoffPct: t.attendance_cutoff_pct ?? prev.attendanceCutoffPct,
        caWeightPct: t.ca_weight_pct ?? prev.caWeightPct,
        examWeightPct: t.exam_weight_pct ?? prev.examWeightPct,
        twoFactorEnforced: t.two_factor_enforced ?? prev.twoFactorEnforced,
        sessionTimeoutMins: t.session_timeout_mins ?? prev.sessionTimeoutMins,
        admissionsOpen: t.admissions_open ?? prev.admissionsOpen,
        admissionBatch: t.admission_batch || prev.admissionBatch,
        applicationFeeKobo: Number(t.application_fee_kobo || prev.applicationFeeKobo),
        acceptanceFeeKobo: Number(t.acceptance_fee_kobo || prev.acceptanceFeeKobo),
        minimumCutoffScore: t.minimum_cutoff_score ?? prev.minimumCutoffScore,
        logoUrl: t.logo_url || prev.logoUrl,
        maintenanceMode: t.maintenance_mode ?? prev.maintenanceMode ?? false,
        maintenanceTitle: t.maintenance_title || prev.maintenanceTitle || 'Scheduled System Maintenance',
        maintenanceMessage:
          t.maintenance_message ||
          prev.maintenanceMessage ||
          'The college portal is currently undergoing scheduled maintenance and system upgrades. Normal access will resume shortly.',
        maintenanceEta: t.maintenance_eta || prev.maintenanceEta || 'Within 2 hours',
      }));
  };

  const loadTenantSettings = async () => {
    const { data } = await supabase.from('tenant_settings').select('*').limit(1).maybeSingle();
    if (data) applyTenantRow(data);
  };

  // ─── Live Hydration from Supabase Remote Database (Single Source of Truth) ───
  useEffect(() => {
    async function loadSupabaseData() {
      // Public branding (school name and logo) is readable before sign-in.
      try {
        const { data: branding } = await supabase.rpc('get_public_branding');
        const b = Array.isArray(branding) ? branding[0] : branding;
        if (b) {
          setSchoolProfile((prev) => ({
            ...prev,
            institutionName: b.institution_name || prev.institutionName,
            institutionAcronym: b.institution_acronym || prev.institutionAcronym,
            logoUrl: b.logo_url || prev.logoUrl,
            campusAddress: b.campus_address || prev.campusAddress,
            officialEmail: b.official_email || prev.officialEmail,
            officialPhone: b.official_phone || prev.officialPhone,
            maintenanceMode: b.maintenance_mode ?? prev.maintenanceMode ?? false,
            maintenanceTitle: b.maintenance_title || prev.maintenanceTitle,
            maintenanceMessage: b.maintenance_message || prev.maintenanceMessage,
            maintenanceEta: b.maintenance_eta || prev.maintenanceEta,
          }));
        }
      } catch (err) {
        console.warn('[CampusOne] Public branding unavailable:', err);
      }
      try {
        const [ledgersRes, receiptsRes, auditsRes, profilesRes, tenantRes, notifsRes, ticketsRes] = await Promise.all([
          supabase.from('student_ledgers').select('*').order('created_at', { ascending: false }),
          supabase.from('official_receipts').select('*').order('paid_at', { ascending: false }),
          supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }),
          supabase.from('profiles').select('*'),
          supabase.from('tenant_settings').select('*').limit(1).maybeSingle(),
          supabase.from('notifications').select('*').order('created_at', { ascending: false }),
          supabase.from('support_tickets').select('*').order('created_at', { ascending: false }),
        ]);

        if (tenantRes.data) applyTenantRow(tenantRes.data);

        await hydrateProfiles();

        if (notifsRes.data && notifsRes.data.length > 0) {
          const loadedNotifs: RealNotificationItem[] = notifsRes.data
            .filter((row: any) => !['notif-01', 'notif-02', 'notif-03', 'notif-04'].includes(row.id))
            .map((row: any) => ({
            id: row.id,
            collegeId: row.college_id || 'bethsaida',
            userId: row.user_id,
            role: row.role,
            title: row.title,
            desc: row.message,
            time: formatRelativeTime(row.created_at),
            isRead: Boolean(row.is_read),
            type: (row.type as any) || 'info',
            link: row.link || '/',
            createdAt: row.created_at,
          }));
          setNotifications(loadedNotifs);
        } else {
          setNotifications([]);
        }

        if (ledgersRes.data && ledgersRes.data.length > 0) {
          setLedgerEntries(
            ledgersRes.data.map((row: any) => ({
              id: row.id,
              collegeId: row.college_id,
              studentId: row.student_id,
              matricNumber: row.matric_number,
              entryType: row.entry_type,
              category: row.category,
              description: row.description,
              amountKobo: Number(row.amount_kobo),
              balanceAfterKobo: Number(row.balance_after_kobo),
              referenceId: row.reference_id,
              createdAt: row.created_at,
            }))
          );
        }

        if (receiptsRes.data && receiptsRes.data.length > 0) {
          setReceipts(
            receiptsRes.data.map((row: any) => ({
              receiptNumber: row.receipt_number,
              collegeId: row.college_id,
              studentId: row.student_id,
              studentName: row.student_name,
              matricNumber: row.matric_number,
              programme: row.programme,
              level: row.level,
              category: row.category,
              amountKobo: Number(row.amount_kobo),
              formattedAmount: formatNaira(Number(row.amount_kobo)),
              paymentMethod: row.payment_method,
              transactionReference: row.transaction_reference,
              gatewayReference: row.gateway_reference,
              paidAt: row.paid_at,
              qrVerificationHash: row.qr_verification_hash,
              issuer: row.issuer,
            }))
          );
        }

        if (auditsRes.data && auditsRes.data.length > 0) {
          const loadedAudits = auditsRes.data.map((row: any) => ({
              id: row.id,
              collegeId: row.college_id,
              actorId: row.actor_id,
              actorRole: row.actor_role,
              action: row.action,
              entityType: row.entity_type,
              entityId: row.entity_id,
              beforeSnapshot: row.before_snapshot,
              afterSnapshot: row.after_snapshot,
              ipAddress: row.ip_address,
              userAgent: row.user_agent,
              timestamp: row.timestamp,
              chainHash: row.chain_hash,
              prevHash: row.prev_hash,
            }));
          auditLogsRef.current = loadedAudits;
          setAuditLogs(loadedAudits);
        }

        if (ticketsRes.data && ticketsRes.data.length > 0) {
          const loadedTickets: SupportTicketItem[] = ticketsRes.data.map((row: any) => ({
            id: row.id,
            ticketNumber: row.ticket_number,
            collegeId: row.college_id || 'bethsaida',
            userId: row.user_id || `usr-${row.user_role?.toLowerCase() || 'stu'}-01`,
            userName: row.user_name,
            userRole: row.user_role,
            userEmail: row.user_email,
            userPhone: row.user_phone,
            department: row.department,
            category: row.category,
            priority: row.priority || 'NORMAL',
            status: row.status || 'OPEN',
            subject: row.subject,
            message: row.message,
            replies: Array.isArray(row.replies) ? row.replies : [],
            resolutionNotes: row.resolution_notes,
            resolvedAt: row.resolved_at,
            resolvedBy: row.resolved_by,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
          setSupportTickets(loadedTickets);
        }
      } catch (err) {
        console.warn('[CampusOne] Supabase live hydration fallback active:', err);
      }

      const [remoteDepartments, remoteCourses, remoteCandidates, remoteAvatars] = await Promise.all([
        loadRecords<DepartmentItem>('registry.departments'),
        loadRecords<CurriculumCourseItem>('registry.courses'),
        loadRecords<AdmissionCandidateItem>('admissions.candidates'),
        loadRecords<{ id: string; url: string }>('registry.avatars'),
      ]);
      if (remoteDepartments && remoteDepartments.length > 0) setDepartmentsState(remoteDepartments);
      if (remoteCourses && remoteCourses.length > 0) setCoursesState(remoteCourses);
      if (remoteCandidates && remoteCandidates.length > 0) {
        setCandidatesState((prev) => {
          const map = new Map<string, AdmissionCandidateItem>();
          remoteCandidates.forEach((c) => map.set(c.id || c.applicationNumber, c));
          prev.forEach((c) => map.set(c.id || c.applicationNumber, c));
          return Array.from(map.values());
        });
      }
      if (remoteAvatars && remoteAvatars.length > 0) {
        setAvatarDirectory((prev) => {
          const next = { ...prev };
          remoteAvatars.forEach((row) => {
            if (row?.id && row?.url) next[row.id] = row.url;
          });
          return next;
        });
      }
    }

    loadSupabaseData();
  }, [authenticatedRole]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (active) setAuthReady(true);
    }, 6000);
    supabase.auth.getSession().then(async ({ data }) => {
      const email = data.session?.user?.email;
      setAuthUserEmail(email || null);
      if (!email) {
        if (active) {
          setAuthenticatedRole(null);
          setAuthReady(true);
        }
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('role').eq('email', email).maybeSingle();
      if (!active) return;
      if (profile?.role) {
        setAuthenticatedRole(profile.role as RoleCode);
      } else {
        await supabase.auth.signOut();
        setAuthenticatedRole(null);
      }
      setAuthReady(true);
    }).catch(() => {
      if (active) {
        setAuthenticatedRole(null);
        setAuthReady(true);
      }
    });
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const recordAudit = (
    action: string,
    entityType: string,
    entityId: string,
    details?: any,
    actor?: { userId: string; actorRole: string }
  ) => {
    const prevList = auditLogsRef.current;
    const prevHash = prevList[0]
      ? prevList[0].chainHash
      : '0000000000000000000000000000000000000000000000000000000000000000';
    const timestamp = new Date().toISOString();
    const afterSnapshot = details || null;
    const actorId = actor?.userId || session.userId;
    const actorRole = actor?.actorRole || session.activeRole;
    const chainHash = sha256Hex(
      JSON.stringify({
        prevHash,
        actorId,
        actorRole,
        action,
        entityType,
        entityId,
        afterSnapshot,
        timestamp,
      })
    );

    const newLog: AuditEventRecord = {
      id: `aud-${Date.now()}-${chainHash.slice(0, 8)}`,
      collegeId: 'bethsaida',
      actorId,
      actorRole,
      action,
      entityType,
      entityId,
      beforeSnapshot: null,
      afterSnapshot,
      ipAddress: 'client-unresolved',
      userAgent: navigator.userAgent,
      timestamp,
      chainHash,
      prevHash,
    };

    const nextLogs = [newLog, ...prevList];
    auditLogsRef.current = nextLogs;
    setAuditLogs(nextLogs);
    try {
      localStorage.setItem('campusone_audit_logs', JSON.stringify(nextLogs.slice(0, 50)));
    } catch (e) {}

    // Only sync audit_logs to Supabase when an authenticated JWT session exists (prevents 401 console errors)
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session?.access_token) return;
      Promise.resolve(
        supabase.from('audit_logs').insert({
          id: newLog.id,
          college_id: newLog.collegeId,
          actor_id: newLog.actorId,
          actor_role: newLog.actorRole,
          action: newLog.action,
          entity_type: newLog.entityType,
          entity_id: newLog.entityId,
          before_snapshot: newLog.beforeSnapshot,
          after_snapshot: newLog.afterSnapshot,
          ip_address: newLog.ipAddress,
          user_agent: newLog.userAgent,
          chain_hash: newLog.chainHash,
          prev_hash: newLog.prevHash,
          timestamp: newLog.timestamp,
        })
      ).catch(() => {});
    }).catch(() => {});
  };

  const updateSchoolProfile = async (updates: Partial<SchoolProfile>) => {
    setSchoolProfile((prev) => ({ ...prev, ...updates }));

    recordAudit('SCHOOL_SETTINGS_UPDATED', 'TENANT_SETTINGS', 'bethsaida', updates);

    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.institutionName !== undefined) payload.institution_name = updates.institutionName;
      if (updates.institutionAcronym !== undefined) payload.institution_acronym = updates.institutionAcronym;
      if (updates.institutionCode !== undefined) payload.institution_code = updates.institutionCode;
      if (updates.campusAddress !== undefined) payload.campus_address = updates.campusAddress;
      if (updates.officialEmail !== undefined) payload.official_email = updates.officialEmail;
      if (updates.officialPhone !== undefined) payload.official_phone = updates.officialPhone;
      if (updates.websiteUrl !== undefined) payload.website_url = updates.websiteUrl;
      if (updates.accreditationRegNo !== undefined) payload.accreditation_reg_no = updates.accreditationRegNo;
      if (updates.regulatoryCouncils !== undefined) payload.regulatory_councils = updates.regulatoryCouncils;
      if (updates.academicLevels !== undefined) payload.academic_levels = updates.academicLevels;
      if (updates.academicSemesters !== undefined) payload.academic_semesters = updates.academicSemesters;
      if (updates.academicSessions !== undefined) payload.academic_sessions = updates.academicSessions;
      if (updates.activeSession !== undefined) payload.active_session = updates.activeSession;
      if (updates.activeSemester !== undefined) payload.active_semester = updates.activeSemester;
      if (updates.attendanceCutoffPct !== undefined) payload.attendance_cutoff_pct = updates.attendanceCutoffPct;
      if (updates.caWeightPct !== undefined) payload.ca_weight_pct = updates.caWeightPct;
      if (updates.examWeightPct !== undefined) payload.exam_weight_pct = updates.examWeightPct;
      if (updates.twoFactorEnforced !== undefined) payload.two_factor_enforced = updates.twoFactorEnforced;
      if (updates.sessionTimeoutMins !== undefined) payload.session_timeout_mins = updates.sessionTimeoutMins;
      if (updates.admissionsOpen !== undefined) payload.admissions_open = updates.admissionsOpen;
      if (updates.admissionBatch !== undefined) payload.admission_batch = updates.admissionBatch;
      if (updates.applicationFeeKobo !== undefined) payload.application_fee_kobo = updates.applicationFeeKobo;
      if (updates.acceptanceFeeKobo !== undefined) payload.acceptance_fee_kobo = updates.acceptanceFeeKobo;
      if (updates.minimumCutoffScore !== undefined) payload.minimum_cutoff_score = updates.minimumCutoffScore;
      if (updates.logoUrl !== undefined) payload.logo_url = updates.logoUrl;
      if (updates.maintenanceMode !== undefined) payload.maintenance_mode = updates.maintenanceMode;
      if (updates.maintenanceTitle !== undefined) payload.maintenance_title = updates.maintenanceTitle;
      if (updates.maintenanceMessage !== undefined) payload.maintenance_message = updates.maintenanceMessage;
      if (updates.maintenanceEta !== undefined) payload.maintenance_eta = updates.maintenanceEta;

      const { data: savedRows, error } = await supabase
        .from('tenant_settings')
        .update(payload)
        .eq('college_id', 'bethsaida')
        .select('college_id');
      if (error) throw new Error(error.message);
      if (!savedRows || savedRows.length === 0) {
        throw new Error(
          'The database did not accept this change. Sign in as a Super Administrator or Provost and try again.'
        );
      }
    } catch (e) {
      console.error('[CampusOne] School settings were not saved:', e);
      // Revert the optimistic update so the screen never shows data that is not stored.
      await loadTenantSettings();
      window.dispatchEvent(
        new CustomEvent(SAVE_ERROR_EVENT, {
          detail: { kind: 'school settings', message: e instanceof Error ? e.message : String(e) },
        })
      );
      throw e;
    }
  };

  const addAcademicLevel = (levelName: string) => {
    if (!levelName || schoolProfile.academicLevels.includes(levelName)) return;
    const nextLevels = [...schoolProfile.academicLevels, levelName];
    updateSchoolProfile({ academicLevels: nextLevels }).catch(() => undefined);
  };

  const removeAcademicLevel = (levelName: string) => {
    const nextLevels = schoolProfile.academicLevels.filter((l) => l !== levelName);
    updateSchoolProfile({ academicLevels: nextLevels }).catch(() => undefined);
  };

  const addRegulatoryCouncil = (councilName: string) => {
    if (!councilName || schoolProfile.regulatoryCouncils.includes(councilName)) return;
    const nextCouncils = [...schoolProfile.regulatoryCouncils, councilName];
    updateSchoolProfile({ regulatoryCouncils: nextCouncils }).catch(() => undefined);
  };

  const removeRegulatoryCouncil = (councilName: string) => {
    const nextCouncils = schoolProfile.regulatoryCouncils.filter((c) => c !== councilName);
    updateSchoolProfile({ regulatoryCouncils: nextCouncils }).catch(() => undefined);
  };

  const addAcademicSemester = (semesterName: string) => {
    if (!semesterName || schoolProfile.academicSemesters.includes(semesterName)) return;
    const next = [...schoolProfile.academicSemesters, semesterName];
    updateSchoolProfile({ academicSemesters: next }).catch(() => undefined);
  };

  const removeAcademicSemester = (semesterName: string) => {
    if (!semesterName) return;
    const next = schoolProfile.academicSemesters.filter((s) => s !== semesterName);
    updateSchoolProfile({ academicSemesters: next }).catch(() => undefined);
    recordAudit('SEMESTER_DELETED', 'ACADEMIC_FRAMEWORK', semesterName, { semesterName });
  };

  const addAcademicSession = (sessionName: string) => {
    if (!sessionName || schoolProfile.academicSessions.includes(sessionName)) return;
    const next = [...schoolProfile.academicSessions, sessionName];
    updateSchoolProfile({ academicSessions: next }).catch(() => undefined);
  };

  const removeAcademicSession = (sessionName: string) => {
    if (!sessionName) return;
    const next = schoolProfile.academicSessions.filter((s) => s !== sessionName);
    updateSchoolProfile({ academicSessions: next }).catch(() => undefined);
    recordAudit('SESSION_DELETED', 'ACADEMIC_FRAMEWORK', sessionName, { sessionName });
  };

  // ─── DEPARTMENTS CRUD ───
  const addDepartment = (dept: DepartmentItem) => {
    setDepartments((prev) => [dept, ...prev]);
    recordAudit('DEPARTMENT_CREATED', 'COLLEGE_DEPARTMENT', dept.code, dept);
  };

  const updateDepartment = (id: string, updates: Partial<DepartmentItem>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    recordAudit('DEPARTMENT_UPDATED', 'COLLEGE_DEPARTMENT', id, updates);
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    recordAudit('DEPARTMENT_DELETED', 'COLLEGE_DEPARTMENT', id);
  };

  // ─── COURSES CRUD ───
  const addCourse = (course: CurriculumCourseItem) => {
    setCourses((prev) => [course, ...prev]);
    recordAudit('COURSE_CREATED', 'CURRICULUM_COURSE', course.code, course);
  };

  const updateCourse = (code: string, updates: Partial<CurriculumCourseItem>) => {
    setCourses((prev) => prev.map((c) => (c.code === code ? { ...c, ...updates } : c)));
    recordAudit('COURSE_UPDATED', 'CURRICULUM_COURSE', code, updates);
  };

  const deleteCourse = (code: string) => {
    setCourses((prev) => prev.filter((c) => c.code !== code));
    recordAudit('COURSE_DELETED', 'CURRICULUM_COURSE', code);
  };

  // ─── ADMISSION CANDIDATES CRUD ───
  const addCandidate = (candidate: AdmissionCandidateItem): AdmissionCandidateItem => {
    setCandidates((prev) => [candidate, ...prev]);
    recordAudit('ADMISSION_APPLICATION_SUBMITTED', 'ADMISSION_CANDIDATE', candidate.applicationNumber, candidate);
    return candidate;
  };

  const updateCandidate = (id: string, updates: Partial<AdmissionCandidateItem>) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    recordAudit('ADMISSION_CANDIDATE_UPDATED', 'ADMISSION_CANDIDATE', id, updates);
  };

  const deleteCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    recordAudit('ADMISSION_CANDIDATE_DELETED', 'ADMISSION_CANDIDATE', id);
  };

  const admitCandidate = (id: string, matricNumber?: string, batch?: string) => {
    const chosenBatch = batch || schoolProfile.admissionBatch;
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'ADMITTED',
              matricNumber: matricNumber || c.matricNumber,
              admissionListBatch: chosenBatch,
              admittedAt: new Date().toISOString().split('T')[0],
            }
          : c
      )
    );
    recordAudit('CANDIDATE_OFFERED_ADMISSION', 'ADMISSION_CANDIDATE', id, { matricNumber, batch: chosenBatch });
  };

  const enrollCandidate = (id: string, matricNo?: string) => {
    const current = candidates.find((c) => c.id === id);
    const generatedMatric =
      matricNo ||
      (current
        ? `${current.programmeCode}/${schoolProfile.activeSession.substring(0, 4)}/${String(
            Math.floor(1000 + Math.random() * 9000)
          )}`
        : undefined);
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          status: 'ENROLLED',
          acceptanceFeePaid: true,
          matricNumber: generatedMatric,
        };
      })
    );
    if (current && generatedMatric) {
      void supabase.from('students').upsert({
        id: current.id,
        college_id: 'bethsaida',
        matric_number: generatedMatric,
        full_name: current.fullName,
        email: current.email,
        phone: current.phone,
        department_code: current.programmeCode,
        programme: current.programme,
        level: '100 Level',
        cgpa: 0,
        fees_status: current.acceptanceFeePaid ? 'CLEARED' : 'OWING',
        clinical_clearance: 'PENDING',
        status: 'ACTIVE',
        details: { ...current, matricNumber: generatedMatric, status: 'ACTIVE', level: '100 Level' },
      });
    }
    recordAudit('CANDIDATE_MATRICULATED', 'ADMISSION_CANDIDATE', id, { matricNo: generatedMatric });
  };

  const addLedgerPayment = (entry: {
    studentId: string;
    matricNumber: string;
    studentName: string;
    amountKobo: number;
    category: any;
    description: string;
    paymentMethod: any;
    referenceId?: string;
    gatewayReference?: string;
    programme?: string;
    level?: string;
  }): OfficialReceipt => {
    // 1. Strict Validation: Reject zero or negative payments
    if (!entry.amountKobo || entry.amountKobo <= 0) {
      throw new Error('Invalid payment amount. Amount must be greater than zero.');
    }

    // 2. Anti-Double Counting & Replay Protection: Check if reference was already posted
    if (entry.gatewayReference || entry.referenceId) {
      const existing = receipts.find(
        (r) =>
          (entry.gatewayReference && r.gatewayReference === entry.gatewayReference) ||
          (entry.referenceId && r.transactionReference === entry.referenceId)
      );
      if (existing) {
        console.warn(
          '[CampusOne Finance] Idempotent duplicate blocked for reference:',
          entry.gatewayReference || entry.referenceId
        );
        return existing;
      }
    }

    const studentEntries = ledgerEntries.filter((l) => l.studentId === entry.studentId);
    let currentBalanceKobo = 0;
    for (const e of studentEntries) {
      if (e.entryType === 'debit') currentBalanceKobo += e.amountKobo;
      else currentBalanceKobo -= e.amountKobo;
    }
    const balanceAfterKobo = currentBalanceKobo - entry.amountKobo;
    const receiptNum = `RCP-2026-${String(receipts.length + 101).padStart(5, '0')}`;
    const txRef = entry.referenceId || `BTH-TX-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const gatewayRef = entry.gatewayReference || txRef;
    const paidAt = new Date().toISOString();

    const newLedgerEntry: StudentLedgerEntry = {
      id: `led-${Date.now()}`,
      collegeId: 'bethsaida',
      studentId: entry.studentId,
      matricNumber: entry.matricNumber,
      entryType: 'credit',
      category: entry.category,
      description: entry.description,
      amountKobo: entry.amountKobo,
      balanceAfterKobo,
      referenceId: txRef,
      createdAt: new Date().toISOString(),
    };

    const newReceipt: OfficialReceipt = {
      receiptNumber: receiptNum,
      collegeId: 'bethsaida',
      studentId: entry.studentId,
      studentName: entry.studentName,
      matricNumber: entry.matricNumber,
      programme: entry.programme || 'Institutional programme',
      level: entry.level || 'Unspecified level',
      category: entry.category,
      amountKobo: entry.amountKobo,
      formattedAmount: formatNaira(entry.amountKobo),
      paymentMethod: entry.paymentMethod,
      transactionReference: txRef,
      gatewayReference: gatewayRef,
      paidAt,
      qrVerificationHash: sha256Hex(
        JSON.stringify({
          receiptNumber: receiptNum,
          studentId: entry.studentId,
          matricNumber: entry.matricNumber,
          amountKobo: entry.amountKobo,
          transactionReference: txRef,
          paidAt,
        })
      ),
      issuer: `Bursary Department, ${schoolProfile.institutionName}`,
    };

    setLedgerEntries((prev) => [newLedgerEntry, ...prev]);
    setReceipts((prev) => [newReceipt, ...prev]);

    supabase.from('student_ledgers').insert({
      id: newLedgerEntry.id,
      college_id: newLedgerEntry.collegeId,
      student_id: newLedgerEntry.studentId,
      matric_number: newLedgerEntry.matricNumber,
      entry_type: newLedgerEntry.entryType,
      category: newLedgerEntry.category,
      description: newLedgerEntry.description,
      amount_kobo: newLedgerEntry.amountKobo,
      balance_after_kobo: newLedgerEntry.balanceAfterKobo,
      reference_id: newLedgerEntry.referenceId,
      created_at: newLedgerEntry.createdAt,
    }).then(({ error }) => {
      if (error) console.warn('[CampusOne] Supabase ledger sync:', error.message);
    });

    supabase.from('official_receipts').insert({
      receipt_number: newReceipt.receiptNumber,
      college_id: newReceipt.collegeId,
      student_id: newReceipt.studentId,
      student_name: newReceipt.studentName,
      matric_number: newReceipt.matricNumber,
      programme: newReceipt.programme,
      level: newReceipt.level,
      category: newReceipt.category,
      amount_kobo: newReceipt.amountKobo,
      payment_method: newReceipt.paymentMethod,
      transaction_reference: newReceipt.transactionReference,
      gateway_reference: newReceipt.gatewayReference,
      qr_verification_hash: newReceipt.qrVerificationHash,
      issuer: newReceipt.issuer,
      paid_at: newReceipt.paidAt,
    }).then(({ error }) => {
      if (error) console.warn('[CampusOne] Supabase receipt sync:', error.message);
    });

    recordAudit('PAYMENT_POSTED', 'FIN_LEDGER', newLedgerEntry.id, {
      matricNumber: entry.matricNumber,
      amountKobo: entry.amountKobo,
      receiptNumber: receiptNum,
    });

    addNotification({
      collegeId: 'bethsaida',
      title: 'Official Tuition Receipt Generated',
      desc: `${entry.studentName} (${entry.matricNumber}) verified payment of ₦${(entry.amountKobo / 100).toLocaleString()} for ${entry.description}.`,
      type: 'success',
      link: '/bursary?tab=receipts',
    });

    return newReceipt;
  };

  const updateProfile = async (updates: {
    fullName?: string;
    phone?: string;
    address?: string;
    bio?: string;
    emergencyContact?: string;
    avatarUrl?: string;
  }) => {
    setCustomProfiles((prev) => {
      const next = {
        ...prev,
        [activeRole]: {
          ...prev[activeRole],
          ...updates,
        },
      };
      return next;
    });

    if (updates.avatarUrl !== undefined) {
      registerPersonAvatar(
        [persona.email, persona.matricNumber, persona.applicationNumber, updates.fullName || persona.fullName],
        updates.avatarUrl
      );
    }

    // One-Brain sync: keep matching candidate record in sync when an applicant updates their profile
    if (matchedCandidate) {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === matchedCandidate.id
            ? {
                ...c,
                ...(updates.fullName !== undefined ? { fullName: updates.fullName } : {}),
                ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
                ...(updates.avatarUrl !== undefined ? { avatarUrl: updates.avatarUrl || undefined } : {}),
              }
            : c
        )
      );
    }

    const profilePayload: any = {
      id: session.userId,
      college_id: 'bethsaida',
      role: activeRole,
      email: persona.email,
      full_name: updates.fullName !== undefined ? updates.fullName : (persona.fullName || 'User Profile'),
      phone: updates.phone !== undefined ? updates.phone : (persona.phone || null),
      address: updates.address !== undefined ? updates.address : (persona.address || null),
      bio: updates.bio !== undefined ? updates.bio : (persona.bio || null),
      emergency_contact: updates.emergencyContact !== undefined ? updates.emergencyContact : (persona.emergencyContact || null),
      avatar_url: updates.avatarUrl !== undefined ? updates.avatarUrl : (persona.avatarUrl || null),
      updated_at: new Date().toISOString(),
    };

    // Write to the signed-in user's own profile row only if an authenticated Supabase session exists
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.access_token) {
      return;
    }
    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData?.user;
    const { id: _ignoredId, college_id: _c, role: _r, email: _e, ...editable } = profilePayload;
    let query = supabase.from('profiles').update(editable);
    if (impersonatedRole || !authUser) {
      query = query.eq('id', session.userId);
    } else {
      query = query.or(`auth_user_id.eq.${authUser.id},email.eq.${authUser.email}`);
    }
    const { data: savedRows, error } = await query.select('id');
    if (error || !savedRows || savedRows.length === 0) {
      const reason = error?.message || 'No profile row in the database matches this account.';
      console.error('[CampusOne] Profile was not saved:', reason);
      await hydrateProfiles();
      throw new Error(reason);
    }
  };

  const hydrateProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (!data || data.length === 0) return;
    const { data: authData } = await supabase.auth.getUser();
    const myEmail = authData?.user?.email;
    const loaded: Record<string, Partial<PersonaProfile>> = {};
    const profileAvatars: Record<string, string> = {};
    // Own row wins over other people who share the same role.
    [...data].sort((a: any, b: any) => Number(a.email === myEmail) - Number(b.email === myEmail)).forEach((p: any) => {
      if (p.avatar_url) {
        if (p.email) profileAvatars[normalizeAvatarKey(p.email)] = p.avatar_url;
        if (p.matric_number) profileAvatars[normalizeAvatarKey(p.matric_number)] = p.avatar_url;
        if (p.full_name) {
          profileAvatars[normalizeAvatarKey(p.full_name)] = p.avatar_url;
          profileAvatars[String(p.full_name).trim().toLowerCase()] = p.avatar_url;
        }
      }
      if (!p.role) return;
      loaded[p.role] = {
        fullName: p.full_name || undefined,
        phone: p.phone || undefined,
        address: p.address || undefined,
        bio: p.bio || undefined,
        emergencyContact: p.emergency_contact || undefined,
        avatarUrl: p.avatar_url || undefined,
        permissions: p.permissions && p.permissions.length > 0 ? p.permissions : undefined,
      };
    });
    setCustomProfiles((prev) => ({ ...prev, ...loaded }));
    if (Object.keys(profileAvatars).length > 0) {
      setAvatarDirectory((prev) => ({ ...profileAvatars, ...prev }));
    }
  };

  const addNotification = async (item: Omit<RealNotificationItem, 'id' | 'createdAt' | 'isRead' | 'time'>) => {
    const newNotif: RealNotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      collegeId: 'bethsaida',
      title: item.title,
      desc: item.desc,
      time: 'Just now',
      isRead: false,
      type: item.type || 'info',
      link: item.link || '/',
      role: item.role,
      userId: item.userId,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      return updated;
    });

    try {
      await supabase.from('notifications').insert({
        id: newNotif.id,
        college_id: 'bethsaida',
        user_id: newNotif.userId,
        role: newNotif.role,
        title: newNotif.title,
        message: newNotif.desc,
        type: newNotif.type,
        link: newNotif.link,
        is_read: false,
        created_at: newNotif.createdAt,
      });
    } catch (err) {
      console.warn('[CampusOne] Notification insert note:', err);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      return updated;
    });

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    } catch (err) {
      console.warn('[CampusOne] Notification mark read sync note:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      return updated;
    });

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('college_id', 'bethsaida');
    } catch (err) {
      console.warn('[CampusOne] Notification mark all read sync note:', err);
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  /* ─── RBAC & SESSION IMPERSONATION LOGIC ─── */
  const impersonateUser = (
    role: RoleCode,
    targetUser?: { id: string; name: string; email: string; matricNumber?: string }
  ) => {
    if (!isSuperAdmin) {
      console.warn('[CampusOne RBAC] Impersonation forbidden: only Super Admin has privilege to impersonate.');
      return;
    }
    if (role === 'SADMIN') {
      stopImpersonating();
      return;
    }
    setImpersonatedRole(role);
    if (targetUser) {
      setImpersonatedUserMeta(targetUser);
      try {
        sessionStorage.setItem('campusone_impersonated_user', JSON.stringify(targetUser));
      } catch (e) {}
    } else {
      setImpersonatedUserMeta(null);
      try {
        sessionStorage.removeItem('campusone_impersonated_user');
      } catch (e) {}
    }
    try {
      sessionStorage.setItem('campusone_impersonated_role', role);
    } catch (e) {}
    recordAudit('IMPERSONATION_STARTED', 'USER_SESSION', role, {
      realUser: 'Super Administrator',
      targetRole: role,
      targetUser: targetUser?.name || role,
    });
  };

  const stopImpersonating = () => {
    setImpersonatedRole(null);
    setImpersonatedUserMeta(null);
    try {
      sessionStorage.removeItem('campusone_impersonated_role');
      sessionStorage.removeItem('campusone_impersonated_user');
    } catch (e) {}
    recordAudit('IMPERSONATION_ENDED', 'USER_SESSION', 'SADMIN', {
      restoredRole: 'SADMIN',
    });
  };

  const switchRole = (role: RoleCode) => {
    if (!isSuperAdmin) {
      console.warn('[CampusOne RBAC] Role switch rejected: only Super Admin can switch roles.');
      return;
    }
    if (role === 'SADMIN') {
      stopImpersonating();
    } else {
      impersonateUser(role);
    }
  };

  const loginAs = (role: RoleCode, userEmail?: string, userName?: string) => {
    setAuthenticatedRole(role);
    setImpersonatedRole(null);
    if (userEmail) {
      setAuthUserEmail(userEmail);
      try {
        localStorage.setItem('campusone_current_user_email', userEmail);
      } catch (e) {}
    }
    if (userName && (role === 'STU' || role === 'SPON')) {
      setImpersonatedUserMeta({
        id: `usr-${userEmail ? userEmail.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : 'applicant'}`,
        name: userName,
        email: userEmail || '',
      });
    }
    try {
      sessionStorage.removeItem('campusone_impersonated_role');
      localStorage.removeItem('campusone_auth_role');
    } catch (e) {}
    recordAudit('USER_LOGIN', 'USER_SESSION', role, { role }, {
      userId: `usr-${role.toLowerCase()}-01`,
      actorRole: role,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAuthenticatedRole(null);
    setImpersonatedRole(null);
    setImpersonatedUserMeta(null);
    try {
      localStorage.removeItem('campusone_auth_role');
      sessionStorage.removeItem('campusone_impersonated_role');
      sessionStorage.removeItem('campusone_impersonated_user');
    } catch (e) {}
  };

  /* ─── HELP DESK & SUPPORT TICKETS LOGIC ─── */
  const createSupportTicket = async (ticket: {
    subject: string;
    category: SupportTicketItem['category'];
    priority: SupportTicketItem['priority'];
    message: string;
    department?: string;
  }) => {
    const ticketId = `tic-${Date.now()}`;
    const ticketNumber = `TIC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newTicket: SupportTicketItem = {
      id: ticketId,
      ticketNumber,
      collegeId: 'bethsaida',
      userId: session.userId,
      userName: persona.fullName,
      userRole: persona.scopeBadge || session.activeRole,
      userEmail: persona.email,
      userPhone: persona.phone,
      department: ticket.department || persona.department,
      category: ticket.category,
      priority: ticket.priority,
      status: 'OPEN',
      subject: ticket.subject,
      message: ticket.message,
      replies: [],
      createdAt: now,
      updatedAt: now,
    };

    setSupportTickets((prev) => {
      const updated = [newTicket, ...prev];
      return updated;
    });

    recordAudit('SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET', ticketNumber, {
      subject: ticket.subject,
      category: ticket.category,
    });

    try {
      await supabase.from('support_tickets').insert({
        id: newTicket.id,
        ticket_number: newTicket.ticketNumber,
        college_id: newTicket.collegeId,
        user_id: newTicket.userId,
        user_name: newTicket.userName,
        user_role: newTicket.userRole,
        user_email: newTicket.userEmail,
        department: newTicket.department,
        category: newTicket.category,
        subject: newTicket.subject,
        message: newTicket.message,
        priority: newTicket.priority,
        status: newTicket.status,
        replies: [],
        created_at: now,
        updated_at: now,
      });
    } catch (err) {
      console.warn('[CampusOne] Support ticket Supabase insert note:', err);
    }
  };

  const replyToSupportTicket = async (ticketId: string, message: string) => {
    const newReply: SupportTicketReply = {
      id: `rep-${Date.now()}`,
      authorId: session.userId,
      authorName: persona.fullName,
      authorRole: persona.scopeBadge || session.activeRole,
      message,
      createdAt: new Date().toISOString(),
    };

    let targetTicket: SupportTicketItem | undefined;

    setSupportTickets((prev) => {
      const updated = prev.map((t) => {
        if (t.id === ticketId) {
          const updatedTicket = {
            ...t,
            replies: [...(t.replies || []), newReply],
            status: t.status === 'RESOLVED' ? t.status : ('IN_PROGRESS' as const),
            updatedAt: new Date().toISOString(),
          };
          targetTicket = updatedTicket;
          return updatedTicket;
        }
        return t;
      });
      return updated;
    });

    if (targetTicket) {
      recordAudit('SUPPORT_TICKET_REPLIED', 'SUPPORT_TICKET', (targetTicket as SupportTicketItem).ticketNumber, {
        authorRole: session.activeRole,
      });

      try {
        await supabase
          .from('support_tickets')
          .update({
            replies: (targetTicket as SupportTicketItem).replies,
            status: (targetTicket as SupportTicketItem).status,
            updated_at: (targetTicket as SupportTicketItem).updatedAt,
          })
          .eq('id', ticketId);
      } catch (err) {
        console.warn('[CampusOne] Support ticket reply Supabase sync note:', err);
      }
    }
  };

  const resolveSupportTicket = async (ticketId: string, resolutionNotes: string) => {
    const now = new Date().toISOString();
    let targetTicket: SupportTicketItem | undefined;

    setSupportTickets((prev) => {
      const updated = prev.map((t) => {
        if (t.id === ticketId) {
          const updatedTicket = {
            ...t,
            status: 'RESOLVED' as const,
            resolutionNotes,
            resolvedAt: now,
            resolvedBy: `${persona.fullName} (${persona.scopeBadge || session.activeRole})`,
            updatedAt: now,
          };
          targetTicket = updatedTicket;
          return updatedTicket;
        }
        return t;
      });
      return updated;
    });

    if (targetTicket) {
      recordAudit('SUPPORT_TICKET_RESOLVED', 'SUPPORT_TICKET', (targetTicket as SupportTicketItem).ticketNumber, {
        resolvedBy: persona.fullName,
        resolutionNotes,
      });

      try {
        await supabase
          .from('support_tickets')
          .update({
            status: 'RESOLVED',
            resolution_notes: resolutionNotes,
            resolved_at: now,
            resolved_by: `${persona.fullName} (${persona.scopeBadge || session.activeRole})`,
            updated_at: now,
          })
          .eq('id', ticketId);
      } catch (err) {
        console.warn('[CampusOne] Support ticket resolve Supabase sync note:', err);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        session,
        persona,
        switchRole,
        authenticatedRole,
        impersonatedRole,
        isSuperAdmin,
        isImpersonating,
        impersonatedUserMeta,
        impersonateUser,
        stopImpersonating,
        loginAs,
        signOut,
        authReady,
        isAuthenticated,
        supportTickets,
        createSupportTicket,
        replyToSupportTicket,
        resolveSupportTicket,
        updateProfile,
        isDense,
        toggleDense: () => setIsDense(!isDense),
        ledgerEntries,
        addLedgerPayment,
        receipts,
        auditLogs,
        recordAudit,
        schoolProfile,
        updateSchoolProfile,
        addAcademicLevel,
        removeAcademicLevel,
        addRegulatoryCouncil,
        removeRegulatoryCouncil,
        addAcademicSemester,
        removeAcademicSemester,
        addAcademicSession,
        removeAcademicSession,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        candidates,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        admitCandidate,
        enrollCandidate,
        notifications,
        unreadNotificationsCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resolveAvatarUrl,
        registerPersonAvatar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}