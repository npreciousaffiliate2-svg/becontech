import { DEFAULT_GRADING_SCALE } from '../types/academic.js';
import type {
  GradeLetter,
  CourseScoreInput,
  ComputedCourseResult,
  SemesterGpaResult,
} from '../types/academic.js';

export function determineGrade(totalScore: number): { grade: GradeLetter; gradePoint: number } {
  const rounded = Math.round(totalScore * 100) / 100;
  for (const band of DEFAULT_GRADING_SCALE) {
    if (rounded >= band.minScore && rounded <= band.maxScore) {
      return { grade: band.letter, gradePoint: band.gradePoint };
    }
  }
  return { grade: 'F', gradePoint: 0.0 };
}

export function computeCourseResult(input: CourseScoreInput): ComputedCourseResult {
  const totalScore = Math.min(100, Math.max(0, input.caScore + input.examScore));
  const { grade, gradePoint } = determineGrade(totalScore);
  const qualityPoints = Math.round(input.creditUnits * gradePoint * 100) / 100;
  const isPass = grade !== 'F';

  return {
    courseCode: input.courseCode,
    creditUnits: input.creditUnits,
    caScore: input.caScore,
    examScore: input.examScore,
    totalScore,
    grade,
    gradePoint,
    qualityPoints,
    isPass,
    isCarryover: !isPass,
  };
}

export function computeSemesterGpa(courses: CourseScoreInput[]): SemesterGpaResult {
  if (!courses.length) {
    return {
      totalCreditUnits: 0,
      totalQualityPoints: 0,
      gpa: 0,
      passedUnits: 0,
      failedUnits: 0,
      courses: [],
      onProbation: false,
    };
  }

  const computedCourses = courses.map(computeCourseResult);
  let totalUnits = 0;
  let totalQP = 0;
  let passedUnits = 0;
  let failedUnits = 0;

  for (const c of computedCourses) {
    totalUnits += c.creditUnits;
    totalQP += c.qualityPoints;
    if (c.isPass) {
      passedUnits += c.creditUnits;
    } else {
      failedUnits += c.creditUnits;
    }
  }

  const rawGpa = totalUnits > 0 ? totalQP / totalUnits : 0;
  const gpa = Math.round(rawGpa * 100) / 100;

  return {
    totalCreditUnits: totalUnits,
    totalQualityPoints: Math.round(totalQP * 100) / 100,
    gpa,
    passedUnits,
    failedUnits,
    courses: computedCourses,
    onProbation: gpa < 1.50,
  };
}

export function computeCgpa(semesters: { totalCreditUnits: number; totalQualityPoints: number }[]): {
  cgpa: number;
  totalCreditUnits: number;
  totalQualityPoints: number;
  onProbation: boolean;
} {
  let totalUnits = 0;
  let totalQP = 0;

  for (const s of semesters) {
    totalUnits += s.totalCreditUnits;
    totalQP += s.totalQualityPoints;
  }

  const rawCgpa = totalUnits > 0 ? totalQP / totalUnits : 0;
  const cgpa = Math.round(rawCgpa * 100) / 100;

  return {
    cgpa,
    totalCreditUnits: totalUnits,
    totalQualityPoints: Math.round(totalQP * 100) / 100,
    onProbation: cgpa < 1.50,
  };
}
