export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface GradeScaleBand {
  letter: GradeLetter;
  minScore: number;
  maxScore: number;
  gradePoint: number;
  description: string;
}

export const DEFAULT_GRADING_SCALE: GradeScaleBand[] = [
  { letter: 'A', minScore: 70, maxScore: 100, gradePoint: 5.0, description: 'Distinction' },
  { letter: 'B', minScore: 60, maxScore: 69.99, gradePoint: 4.0, description: 'Upper Credit' },
  { letter: 'C', minScore: 50, maxScore: 59.99, gradePoint: 3.0, description: 'Lower Credit' },
  { letter: 'D', minScore: 45, maxScore: 49.99, gradePoint: 2.0, description: 'Pass' },
  { letter: 'E', minScore: 40, maxScore: 44.99, gradePoint: 1.0, description: 'Marginal Pass' },
  { letter: 'F', minScore: 0,  maxScore: 39.99, gradePoint: 0.0, description: 'Fail / Carryover' },
];

export interface CourseScoreInput {
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  caScore: number;     // e.g. 0-30 or 0-40
  examScore: number;   // e.g. 0-70 or 0-60
  maxCa?: number;      // default 30
  maxExam?: number;    // default 70
}

export interface ComputedCourseResult {
  courseCode: string;
  creditUnits: number;
  caScore: number;
  examScore: number;
  totalScore: number;
  grade: GradeLetter;
  gradePoint: number;
  qualityPoints: number; // creditUnits * gradePoint
  isPass: boolean;
  isCarryover: boolean;
}

export interface SemesterGpaResult {
  totalCreditUnits: number;
  totalQualityPoints: number;
  gpa: number;
  passedUnits: number;
  failedUnits: number;
  courses: ComputedCourseResult[];
  onProbation: boolean; // CGPA < 1.50 threshold
}

export interface HealthProgrammeItem {
  code: string;
  name: string;
  departmentCode: string;
  departmentName: string;
  regulatoryBody: string;
  duration: string;
  credentialAwarded: string;
}

export const ACCREDITED_HEALTH_PROGRAMMES: HealthProgrammeItem[] = [
  {
    code: 'CHEW',
    name: 'Community Health Extension Worker (CHEW)',
    departmentCode: 'CHD',
    departmentName: 'Department of Community Health',
    regulatoryBody: 'CHPRBN',
    duration: '3-Year National Diploma',
    credentialAwarded: 'Diploma in Community Health',
  },
  {
    code: 'JCHEW',
    name: 'Junior Community Health Extension Worker (JCHEW)',
    departmentCode: 'CHD',
    departmentName: 'Department of Community Health',
    regulatoryBody: 'CHPRBN',
    duration: '2-Year Certificate',
    credentialAwarded: 'Certificate in Community Health',
  },
  {
    code: 'DHT',
    name: 'Dental Health Technician (DHT)',
    departmentCode: 'DHD',
    departmentName: 'Dental Health Department',
    regulatoryBody: 'DTRBN',
    duration: '3-Year Diploma',
    credentialAwarded: 'Diploma in Dental Health Technology',
  },
  {
    code: 'DST',
    name: 'Dental Surgery Technician (DST)',
    departmentCode: 'DHD',
    departmentName: 'Dental Health Department',
    regulatoryBody: 'DTRBN',
    duration: '3-Year Diploma',
    credentialAwarded: 'Diploma in Dental Surgery Technology',
  },
  {
    code: 'EHT',
    name: 'Environmental Health Technician (EHT)',
    departmentCode: 'EHD',
    departmentName: 'Environmental Health Department',
    regulatoryBody: 'EHORECON',
    duration: '3-Year Diploma',
    credentialAwarded: 'Diploma in Environmental Health Technology',
  },
  {
    code: 'EHA',
    name: 'Environmental Health Assistant (EHA)',
    departmentCode: 'EHD',
    departmentName: 'Environmental Health Department',
    regulatoryBody: 'EHORECON',
    duration: '2-Year Certificate',
    credentialAwarded: 'Certificate in Environmental Health Assistance',
  },
  {
    code: 'HIM-ND',
    name: 'Health Information Management (ND)',
    departmentCode: 'HIM',
    departmentName: 'Health Information Management Department',
    regulatoryBody: 'HRORBN',
    duration: '2-Year National Diploma',
    credentialAwarded: 'National Diploma in HIM',
  },
  {
    code: 'HIM-HND',
    name: 'Health Information Management (HND)',
    departmentCode: 'HIM',
    departmentName: 'Health Information Management Department',
    regulatoryBody: 'HRORBN',
    duration: '2-Year Higher National Diploma',
    credentialAwarded: 'Higher National Diploma in HIM',
  },
  {
    code: 'PHT',
    name: 'Pharmacy Technician (PHT)',
    departmentCode: 'PHT',
    departmentName: 'Pharmacy Technician Department',
    regulatoryBody: 'PCN',
    duration: '3-Year Diploma',
    credentialAwarded: 'Diploma for Pharmacy Technicians',
  },
  {
    code: 'HTD',
    name: 'Health Technician (HT)',
    departmentCode: 'HTD',
    departmentName: 'Health Technician Department',
    regulatoryBody: 'FMOH',
    duration: '3-Year Diploma',
    credentialAwarded: 'Diploma in Health Technology',
  },
  {
    code: 'HAD',
    name: 'Health Assistant (HA)',
    departmentCode: 'HAD',
    departmentName: 'Health Assistant Department',
    regulatoryBody: 'FMOH',
    duration: '2-Year Certificate',
    credentialAwarded: 'Certificate in Health Care Assistance',
  },
  {
    code: 'MLT',
    name: 'Medical Laboratory Technician (MLT)',
    departmentCode: 'MLT',
    departmentName: 'Department of Medical Laboratory Science',
    regulatoryBody: 'MLSCN',
    duration: '3-Year Diploma',
    credentialAwarded: 'Diploma in Medical Laboratory Technology',
  },
];
