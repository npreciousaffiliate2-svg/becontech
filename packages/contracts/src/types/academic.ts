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
