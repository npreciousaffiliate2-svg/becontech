export type ModuleCode =
  | 'CORE'
  | 'ADM'
  | 'SIS'
  | 'FIN'
  | 'EXM'
  | 'ATT'
  | 'CLN'
  | 'LMS'
  | 'HRM'
  | 'HST'
  | 'TTS'
  | 'COM'
  | 'LIB'
  | 'ALM'
  | 'RPT';

export interface ModuleManifest {
  code: ModuleCode;
  name: string;
  description: string;
  isOptional: boolean;
  baseRoute: string;
  requiredPermissions: string[];
}

export const MODULE_REGISTRY: Record<ModuleCode, ModuleManifest> = {
  CORE: {
    code: 'CORE',
    name: 'Platform Core',
    description: 'Identity, RBAC, tenant configuration, audit logging and integration hub',
    isOptional: false,
    baseRoute: '/app/admin',
    requiredPermissions: ['core:admin']
  },
  ADM: {
    code: 'ADM',
    name: 'Admissions & Enrollment',
    description: 'Applications, screening, admission lists, and matriculation',
    isOptional: false,
    baseRoute: '/app/admissions',
    requiredPermissions: ['adm:read']
  },
  SIS: {
    code: 'SIS',
    name: 'Student Information System',
    description: 'Student master records, semester registration, status lifecycle, ID cards',
    isOptional: false,
    baseRoute: '/app/students',
    requiredPermissions: ['sis:read']
  },
  FIN: {
    code: 'FIN',
    name: 'Fees & Bursary',
    description: 'Fee structures, payments, immutable receipts, double-entry ledger, debtor management',
    isOptional: false,
    baseRoute: '/app/bursary',
    requiredPermissions: ['fin:read']
  },
  EXM: {
    code: 'EXM',
    name: 'Academics & Examination',
    description: 'Curriculum, score entry, chain approval, broadsheets, transcripts, board exams',
    isOptional: false,
    baseRoute: '/app/academics',
    requiredPermissions: ['exm:read']
  },
  ATT: {
    code: 'ATT',
    name: 'Attendance',
    description: 'Class & clinical registers, mobile-first one-tap marking, exam eligibility',
    isOptional: false,
    baseRoute: '/app/attendance',
    requiredPermissions: ['att:read']
  },
  CLN: {
    code: 'CLN',
    name: 'Clinical Postings & SIWES',
    description: 'Sites, rotation templates, allocations, e-logbooks, supervisor assessment, clearance',
    isOptional: false,
    baseRoute: '/app/postings',
    requiredPermissions: ['cln:read']
  },
  LMS: {
    code: 'LMS',
    name: 'E-Learning',
    description: 'Course materials, assignments, quizzes, board exam CBT practice mode',
    isOptional: false,
    baseRoute: '/app/learning',
    requiredPermissions: ['lms:read']
  },
  HRM: {
    code: 'HRM',
    name: 'Staff & HR',
    description: 'Staff directory, credentials/licensing, leave workflows, locked payroll runs',
    isOptional: false,
    baseRoute: '/app/staff',
    requiredPermissions: ['hrm:read']
  },
  HST: {
    code: 'HST',
    name: 'Hostel & Accommodation',
    description: 'Hostel inventory, bed allocations, room transfers, fee clearance checks',
    isOptional: false,
    baseRoute: '/app/hostels',
    requiredPermissions: ['hst:read']
  },
  TTS: {
    code: 'TTS',
    name: 'Timetable & Scheduling',
    description: 'Class & exam timetables, clinical rotations, automatic clash detection',
    isOptional: false,
    baseRoute: '/app/timetable',
    requiredPermissions: ['tts:read']
  },
  COM: {
    code: 'COM',
    name: 'Communication & Notices',
    description: 'Audience builder, bulk SMS/email, in-app announcements, sponsor feeds',
    isOptional: false,
    baseRoute: '/app/messages',
    requiredPermissions: ['com:read']
  },
  LIB: {
    code: 'LIB',
    name: 'Library',
    description: 'Accessioning, catalog, book lending, and electronic resources',
    isOptional: true,
    baseRoute: '/app/library',
    requiredPermissions: []
  },
  ALM: {
    code: 'ALM',
    name: 'Alumni',
    description: 'Graduate records, post-graduation internship tracking, and employer feedback',
    isOptional: true,
    baseRoute: '/app/alumni',
    requiredPermissions: []
  },
  RPT: {
    code: 'RPT',
    name: 'Reports & Analytics',
    description: 'Executive KPI dashboards, operational broadsheets, NBTE accreditation export',
    isOptional: false,
    baseRoute: '/app/reports',
    requiredPermissions: ['rpt:read']
  }
};
