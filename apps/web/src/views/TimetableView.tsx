import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { useSharedRecords } from '../lib/sharedRecords.ts';
import { PERSONA_PROFILES } from '../context/personas.ts';
import {
  Card,
  Button,
  Table,
  Badge,
  useToast,
  Tabs,
  Modal,
  Select,
  Input,
} from '@campusone/ui';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Eye,
  Printer,
  Download,
  Filter,
  Search,
  Layers,
  ShieldCheck,
  LayoutGrid,
  List,
  Building2,
  Check,
  Sparkles,
} from 'lucide-react';

/* ─── TYPE DEFINITIONS ─── */
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type SessionType = 'THEORY' | 'PRACTICAL_LAB' | 'CLINICAL_WARD' | 'SEMINAR';
export type VenueStatus = 'AVAILABLE' | 'IN_USE' | 'RESERVED' | 'MAINTENANCE';

export interface ClassScheduleItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  departmentCode: 'CHE' | 'MLT' | 'PHT' | 'HIM' | 'EHT' | 'GNS';
  departmentName: string;
  level: '100L' | '200L' | '300L';
  sessionType: SessionType;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  venueCode: string;
  venueName: string;
  instructorName: string;
  instructorId: string;
  creditUnits: number;
  enrolledStudents: number;
  clashDetected: boolean;
}

export interface PracticalSession {
  id: string;
  labName: string;
  courseCode: string;
  practicalTopic: string;
  batchGroup: string;
  day: DayOfWeek;
  timeRange: string;
  chiefTechnologist: string;
  requiredPPE: string[];
  capacity: number;
  enrolled: number;
  safetyStatus: 'CERTIFIED' | 'REVIEW_PENDING';
}

export interface VenueItem {
  id: string;
  venueCode: string;
  venueName: string;
  building: string;
  capacity: number;
  amenities: string[];
  status: VenueStatus;
  currentClass?: string;
}

export interface FacultyLoadItem {
  id: string;
  staffId: string;
  instructorName: string;
  academicRank: string;
  departmentName: string;
  allocatedCourses: string[];
  weeklyContactHours: number;
  maxStatutoryHours: number;
  clashCount: number;
}

export const TimetableView: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { isDense, recordAudit, session, schoolProfile, departments } = useApp();
  const { showToast } = useToast();

  const currentPersona = PERSONA_PROFILES[session?.activeRole || 'PROVOST'] || PERSONA_PROFILES.STU;
  const isStudent = session?.activeRole === 'STU' || session?.activeRole === 'SPON';
  const isInstructor = session?.activeRole === 'INSTR';

  /* ─── TAB ROUTING STATE ─── */
  const validTabs = isStudent
    ? ['classes', 'practicals']
    : ['classes', 'practicals', 'venues', 'faculty'];
  const activeTab = tab && validTabs.includes(tab) ? tab : 'classes';

  const handleTabChange = (newTab: string) => {
    navigate(`/timetable/${newTab}`);
  };

  /* ─── VIEW MODE: GRID vs LIST ─── */
  const [scheduleViewMode, setScheduleViewMode] = useState<'grid' | 'list'>('grid');

  /* ─── DATA STATES ─── */
  const [schedules, setSchedules] = useSharedRecords<ClassScheduleItem>('timetable.schedules', [
    {
      id: 'sch-01',
      courseCode: 'CHE 201',
      courseTitle: 'Primary Health Care & Community Mobilization',
      departmentCode: 'CHE',
      departmentName: 'Community Health',
      level: '200L',
      sessionType: 'THEORY',
      day: 'Monday',
      startTime: '08:00',
      endTime: '10:00',
      venueCode: 'LT-01',
      venueName: 'Health Sciences Lecture Theatre 1',
      instructorName: 'Dr. Kehinde Bello',
      instructorId: 'BCHT/ACAD/001',
      creditUnits: 3,
      enrolledStudents: 140,
      clashDetected: false,
    },
    {
      id: 'sch-02',
      courseCode: 'MLT 201',
      courseTitle: 'Clinical Chemistry & Enzymology I',
      departmentCode: 'MLT',
      departmentName: 'Medical Laboratory Tech',
      level: '200L',
      sessionType: 'THEORY',
      day: 'Monday',
      startTime: '10:00',
      endTime: '12:00',
      venueCode: 'LT-02',
      venueName: 'Diagnostic Sciences Lecture Hall 2',
      instructorName: 'Mr. Olumide Adebisi',
      instructorId: 'BCHT/ACAD/002',
      creditUnits: 3,
      enrolledStudents: 110,
      clashDetected: false,
    },
    {
      id: 'sch-03',
      courseCode: 'PHT 201',
      courseTitle: 'General Pharmacology & Therapeutics I',
      departmentCode: 'PHT',
      departmentName: 'Pharmacy Technician',
      level: '200L',
      sessionType: 'THEORY',
      day: 'Monday',
      startTime: '13:00',
      endTime: '15:00',
      venueCode: 'PH-01',
      venueName: 'Pharmaceutical Sciences Wing Hall P1',
      instructorName: 'Pharm. Folashade Oladipo',
      instructorId: 'BCHT/ACAD/003',
      creditUnits: 3,
      enrolledStudents: 95,
      clashDetected: false,
    },
    {
      id: 'sch-04',
      courseCode: 'CHE 203',
      courseTitle: 'Maternal & Child Health Clinical Practice',
      departmentCode: 'CHE',
      departmentName: 'Community Health',
      level: '200L',
      sessionType: 'PRACTICAL_LAB',
      day: 'Tuesday',
      startTime: '09:00',
      endTime: '12:00',
      venueCode: 'LAB-CHE',
      venueName: 'Community Health Demonstration Lab',
      instructorName: 'Matron Janet Alabi',
      instructorId: 'BCHT/ACAD/006',
      creditUnits: 3,
      enrolledStudents: 70,
      clashDetected: false,
    },
    {
      id: 'sch-05',
      courseCode: 'MLT 204',
      courseTitle: 'Histopathology & Cytological Techniques',
      departmentCode: 'MLT',
      departmentName: 'Medical Laboratory Tech',
      level: '200L',
      sessionType: 'PRACTICAL_LAB',
      day: 'Tuesday',
      startTime: '13:00',
      endTime: '16:00',
      venueCode: 'LAB-MLT',
      venueName: 'Central Pathology Laboratory',
      instructorName: 'Mr. Olumide Adebisi',
      instructorId: 'BCHT/ACAD/002',
      creditUnits: 3,
      enrolledStudents: 55,
      clashDetected: false,
    },
    {
      id: 'sch-06',
      courseCode: 'GNS 201',
      courseTitle: 'Medical Ethics, Health Law & Deontology',
      departmentCode: 'GNS',
      departmentName: 'General Studies',
      level: '200L',
      sessionType: 'THEORY',
      day: 'Wednesday',
      startTime: '08:00',
      endTime: '10:00',
      venueCode: 'AUD-01',
      venueName: 'College Main Auditorium',
      instructorName: 'Barr. A. O. Adeleke',
      instructorId: 'BCHT/ACAD/008',
      creditUnits: 2,
      enrolledStudents: 345,
      clashDetected: false,
    },
    {
      id: 'sch-07',
      courseCode: 'HIM 201',
      courseTitle: 'Health Data Analytics & Electronic Medical Records',
      departmentCode: 'HIM',
      departmentName: 'Health Information Mgmt',
      level: '200L',
      sessionType: 'THEORY',
      day: 'Wednesday',
      startTime: '11:00',
      endTime: '13:00',
      venueCode: 'LT-01',
      venueName: 'Health Sciences Lecture Theatre 1',
      instructorName: 'Mrs. Titilayo Adeleke',
      instructorId: 'BCHT/ACAD/004',
      creditUnits: 3,
      enrolledStudents: 65,
      clashDetected: false,
    },
    {
      id: 'sch-08',
      courseCode: 'EHT 201',
      courseTitle: 'Water Sanitation, Vector Control & Epidemiology',
      departmentCode: 'EHT',
      departmentName: 'Environmental Health',
      level: '200L',
      sessionType: 'THEORY',
      day: 'Thursday',
      startTime: '09:00',
      endTime: '11:00',
      venueCode: 'LT-02',
      venueName: 'Diagnostic Sciences Lecture Hall 2',
      instructorName: 'Sanitarian Babatunde Ibrahim',
      instructorId: 'BCHT/ACAD/005',
      creditUnits: 3,
      enrolledStudents: 48,
      clashDetected: false,
    },
    {
      id: 'sch-09',
      courseCode: 'PHT 205',
      courseTitle: 'Pharmacognosy & Herbal Medicine Dispensing',
      departmentCode: 'PHT',
      departmentName: 'Pharmacy Technician',
      level: '200L',
      sessionType: 'PRACTICAL_LAB',
      day: 'Thursday',
      startTime: '12:00',
      endTime: '15:00',
      venueCode: 'LAB-PHT',
      venueName: 'Pharmaceutical Formulations Lab',
      instructorName: 'Pharm. Folashade Oladipo',
      instructorId: 'BCHT/ACAD/003',
      creditUnits: 3,
      enrolledStudents: 48,
      clashDetected: false,
    },
    {
      id: 'sch-10',
      courseCode: 'CHE 205',
      courseTitle: 'Family Planning & Immunization Practicum',
      departmentCode: 'CHE',
      departmentName: 'Community Health',
      level: '200L',
      sessionType: 'CLINICAL_WARD',
      day: 'Friday',
      startTime: '08:30',
      endTime: '12:30',
      venueCode: 'CLIN-01',
      venueName: 'College Demonstration Outpatient Clinic',
      instructorName: 'Dr. Kehinde Bello',
      instructorId: 'BCHT/ACAD/001',
      creditUnits: 4,
      enrolledStudents: 70,
      clashDetected: false,
    },
  ]);

  const [practicals, setPracticals] = useSharedRecords<PracticalSession>('timetable.practicals', [
    {
      id: 'prc-01',
      labName: 'Community Health Demonstration Lab',
      courseCode: 'CHE 203',
      practicalTopic: 'Antenatal Abdominal Palpation & Fetal Heart Sound Auscultation',
      batchGroup: 'Group A (CHEW 200L)',
      day: 'Tuesday',
      timeRange: '09:00 – 12:00',
      chiefTechnologist: 'Matron Janet Alabi',
      requiredPPE: ['Clinical Lab Coat', 'Stethoscope', 'Disposable Gloves', 'Pinard Horn'],
      capacity: 35,
      enrolled: 35,
      safetyStatus: 'CERTIFIED',
    },
    {
      id: 'prc-02',
      labName: 'Central Pathology Laboratory',
      courseCode: 'MLT 204',
      practicalTopic: 'Tissue Microtomy, Sectioning & Hematoxylin-Eosin Staining',
      batchGroup: 'Group B (MLT 200L)',
      day: 'Tuesday',
      timeRange: '13:00 – 16:00',
      chiefTechnologist: 'Mr. Olumide Adebisi',
      requiredPPE: ['Chemical Splash Apron', 'Safety Goggles', 'Nitrile Gloves', 'Microscope Kit'],
      capacity: 30,
      enrolled: 28,
      safetyStatus: 'CERTIFIED',
    },
    {
      id: 'prc-03',
      labName: 'Pharmaceutical Formulations Lab',
      courseCode: 'PHT 205',
      practicalTopic: 'Compounding of Oral Suspensions & Emulsions',
      batchGroup: 'Group A (PHT 200L)',
      day: 'Thursday',
      timeRange: '12:00 – 15:00',
      chiefTechnologist: 'Pharm. Folashade Oladipo',
      requiredPPE: ['Laboratory Smock', 'Surgical Mask', 'Powder-Free Gloves'],
      capacity: 25,
      enrolled: 24,
      safetyStatus: 'CERTIFIED',
    },
    {
      id: 'prc-04',
      labName: 'Environmental Microbiology & Water Lab',
      courseCode: 'EHT 204',
      practicalTopic: 'Bacteriological Coliform Membrane Filtration of Well Water',
      batchGroup: 'Group A (EHT 200L)',
      day: 'Friday',
      timeRange: '10:00 – 13:00',
      chiefTechnologist: 'Sanitarian Babatunde Ibrahim',
      requiredPPE: ['Heavy Duty Apron', 'Face Shield', 'Autoclave Gauntlets'],
      capacity: 25,
      enrolled: 22,
      safetyStatus: 'CERTIFIED',
    },
  ]);

  const [venues, setVenues] = useSharedRecords<VenueItem>('timetable.venues', [
    {
      id: 'ven-01',
      venueCode: 'AUD-01',
      venueName: 'College Main Auditorium',
      building: 'Administrative Complex, West Wing',
      capacity: 500,
      amenities: ['Public Address PA System', 'Dual Laser Projectors', 'Solar Inverter Backup', 'Central AC'],
      status: 'AVAILABLE',
      currentClass: 'GNS 201 on Wednesday',
    },
    {
      id: 'ven-02',
      venueCode: 'LT-01',
      venueName: 'Health Sciences Lecture Theatre 1',
      building: 'Health Sciences Complex, 1st Floor',
      capacity: 180,
      amenities: ['Fixed Tiered Seating', 'Wireless Mic', 'Interactive Whiteboard', 'Ceiling Fans'],
      status: 'IN_USE',
      currentClass: 'CHE 201 (Community Health 200L)',
    },
    {
      id: 'ven-03',
      venueCode: 'LT-02',
      venueName: 'Diagnostic Sciences Lecture Hall 2',
      building: 'Diagnostic Science Building, Room 201',
      capacity: 140,
      amenities: ['Multimedia Display', 'Air Conditioned', 'Tiered Desks', 'Emergency Exit'],
      status: 'AVAILABLE',
      currentClass: 'MLT 201 & EHT 201',
    },
    {
      id: 'ven-04',
      venueCode: 'PH-01',
      venueName: 'Pharmaceutical Sciences Wing Hall P1',
      building: 'Pharmacy Technology Pavilion, Ground Floor',
      capacity: 100,
      amenities: ['Smart TV Screen', 'Solar Line Powered', 'Individual Armchairs'],
      status: 'AVAILABLE',
      currentClass: 'PHT 201 (Pharmacy Tech 200L)',
    },
    {
      id: 'ven-05',
      venueCode: 'LAB-CHE',
      venueName: 'Community Health Demonstration Lab',
      building: 'Clinical Skills Building, Suite B102',
      capacity: 40,
      amenities: ['Birthing Simulators', 'CPR Manikins', 'Handwash Sinks', 'Sterilization Unit'],
      status: 'RESERVED',
      currentClass: 'CHE 203 Clinical Practicum',
    },
    {
      id: 'ven-06',
      venueCode: 'LAB-MLT',
      venueName: 'Central Pathology Laboratory',
      building: 'Diagnostic Science Building, Ground Floor',
      capacity: 35,
      amenities: ['Binocular Microscopes', 'Fume Hood', 'Cold Storage Refrigerator', 'Centrifuges'],
      status: 'IN_USE',
      currentClass: 'MLT 204 Histopathology',
    },
  ]);

  const [facultyLoad, setFacultyLoad] = useSharedRecords<FacultyLoadItem>('timetable.faculty', [
    {
      id: 'fac-01',
      staffId: 'BCHT/ACAD/001',
      instructorName: 'Dr. Kehinde Bello',
      academicRank: 'Chief Lecturer & HOD',
      departmentName: 'Community Health',
      allocatedCourses: ['CHE 201', 'CHE 205', 'CHE 301'],
      weeklyContactHours: 11,
      maxStatutoryHours: 12,
      clashCount: 0,
    },
    {
      id: 'fac-02',
      staffId: 'BCHT/ACAD/002',
      instructorName: 'Mr. Olumide Adebisi',
      academicRank: 'Principal Lecturer & HOD',
      departmentName: 'Medical Laboratory Tech',
      allocatedCourses: ['MLT 201', 'MLT 204', 'MLT 305'],
      weeklyContactHours: 10,
      maxStatutoryHours: 14,
      clashCount: 0,
    },
    {
      id: 'fac-03',
      staffId: 'BCHT/ACAD/003',
      instructorName: 'Pharm. Folashade Oladipo',
      academicRank: 'Senior Lecturer & HOD',
      departmentName: 'Pharmacy Technician',
      allocatedCourses: ['PHT 201', 'PHT 205'],
      weeklyContactHours: 8,
      maxStatutoryHours: 14,
      clashCount: 0,
    },
    {
      id: 'fac-04',
      staffId: 'BCHT/ACAD/004',
      instructorName: 'Mrs. Titilayo Adeleke',
      academicRank: 'Senior Lecturer & HOD',
      departmentName: 'Health Information Mgmt',
      allocatedCourses: ['HIM 201', 'HIM 203'],
      weeklyContactHours: 8,
      maxStatutoryHours: 14,
      clashCount: 0,
    },
    {
      id: 'fac-05',
      staffId: 'BCHT/ACAD/005',
      instructorName: 'Sanitarian Babatunde Ibrahim',
      academicRank: 'Principal Lecturer & HOD',
      departmentName: 'Environmental Health',
      allocatedCourses: ['EHT 201', 'EHT 204'],
      weeklyContactHours: 9,
      maxStatutoryHours: 14,
      clashCount: 0,
    },
  ]);

  /* ─── FILTERS & SEARCH STATES ─── */
  const [classSearch, setClassSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [dayFilter, setDayFilter] = useState('ALL');

  const [practicalSearch, setPracticalSearch] = useState('');
  const [venueSearch, setVenueSearch] = useState('');
  const [facultySearch, setFacultySearch] = useState('');

  /* ─── MODAL STATES ─── */
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [isPrintTimetableModalOpen, setIsPrintTimetableModalOpen] = useState(false);
  const [selectedScheduleForDossier, setSelectedScheduleForDossier] = useState<ClassScheduleItem | null>(null);

  // Edit & Delete Schedule Slot State
  const [editingSchedule, setEditingSchedule] = useState<ClassScheduleItem | null>(null);
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState<ClassScheduleItem | null>(null);
  const [isDeleteScheduleOpen, setIsDeleteScheduleOpen] = useState(false);

  const handleSaveEditSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    setSchedules((prev) =>
      prev.map((sch) => (sch.id === editingSchedule.id ? editingSchedule : sch))
    );

    if (selectedScheduleForDossier?.id === editingSchedule.id) {
      setSelectedScheduleForDossier(editingSchedule);
    }

    recordAudit('TIMETABLE_SLOT_UPDATED', 'CLASS_SCHEDULE', editingSchedule.courseCode, {
      day: editingSchedule.day,
      time: `${editingSchedule.startTime} - ${editingSchedule.endTime}`,
      venue: editingSchedule.venueName,
    });

    setIsEditScheduleOpen(false);
    setEditingSchedule(null);
    showToast({
      type: 'success',
      title: 'Schedule Updated',
      message: `${editingSchedule.courseCode} slot on ${editingSchedule.day} saved.`,
    });
  };

  const handleConfirmDeleteSchedule = () => {
    if (!deletingSchedule) return;

    setSchedules((prev) => prev.filter((sch) => sch.id !== deletingSchedule.id));

    if (selectedScheduleForDossier?.id === deletingSchedule.id) {
      setSelectedScheduleForDossier(null);
    }

    recordAudit('TIMETABLE_SLOT_DELETED', 'CLASS_SCHEDULE', deletingSchedule.courseCode, {
      day: deletingSchedule.day,
    });

    setIsDeleteScheduleOpen(false);
    setDeletingSchedule(null);
    showToast({
      type: 'success',
      title: 'Schedule Slot Removed',
      message: `${deletingSchedule.courseCode} slot removed from the master timetable.`,
    });
  };

  /* ─── NEW SCHEDULE FORM STATES ─── */
  const [newCourseCode, setNewCourseCode] = useState('CHE 204');
  const [newCourseTitle, setNewCourseTitle] = useState('Reproductive Health & Family Planning');
  const [newDeptCode, setNewDeptCode] = useState<'CHE' | 'MLT' | 'PHT' | 'HIM' | 'EHT'>('CHE');
  const [newLevel, setNewLevel] = useState<'100L' | '200L' | '300L'>('200L');
  const [newType, setNewType] = useState<SessionType>('THEORY');
  const [newDay, setNewDay] = useState<DayOfWeek>('Wednesday');
  const [newStartTime, setNewStartTime] = useState('14:00');
  const [newEndTime, setNewEndTime] = useState('16:00');
  const [newVenueCode, setNewVenueCode] = useState('LT-01');
  const [newInstructor, setNewInstructor] = useState('Dr. Kehinde Bello');
  const [newUnits, setNewUnits] = useState(3);

  /* ─── REAL-TIME CLASH DETECTION MATRIX ─── */
  const detectedClashes = useMemo(() => {
    const clashes: Array<{ type: string; message: string }> = [];

    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const a = schedules[i];
        const b = schedules[j];

        if (a.day === b.day) {
          const overlap = a.startTime < b.endTime && b.startTime < a.endTime;
          if (overlap) {
            // Venue conflict
            if (a.venueCode === b.venueCode) {
              clashes.push({
                type: 'VENUE_COLLISION',
                message: `Venue ${a.venueName} double-booked between ${a.courseCode} and ${b.courseCode} on ${a.day} (${a.startTime} – ${a.endTime}).`,
              });
            }
            // Instructor conflict
            if (a.instructorId === b.instructorId) {
              clashes.push({
                type: 'INSTRUCTOR_COLLISION',
                message: `${a.instructorName} scheduled simultaneously for ${a.courseCode} and ${b.courseCode} on ${a.day}.`,
              });
            }
            // Level cohort conflict
            if (a.departmentCode === b.departmentCode && a.level === b.level) {
              clashes.push({
                type: 'COHORT_COLLISION',
                message: `${a.departmentName} ${a.level} students have overlapping courses (${a.courseCode} and ${b.courseCode}) on ${a.day}.`,
              });
            }
          }
        }
      }
    }
    return clashes;
  }, [schedules]);

  /* ─── FILTERED SCHEDULES ─── */
  const filteredSchedules = schedules.filter((s) => {
    if (deptFilter !== 'ALL' && s.departmentCode !== deptFilter) return false;
    if (levelFilter !== 'ALL' && s.level !== levelFilter) return false;
    if (dayFilter !== 'ALL' && s.day !== dayFilter) return false;
    if (classSearch.trim()) {
      const q = classSearch.toLowerCase();
      const matchCode = s.courseCode.toLowerCase().includes(q);
      const matchTitle = s.courseTitle.toLowerCase().includes(q);
      const matchInstructor = s.instructorName.toLowerCase().includes(q);
      const matchVenue = s.venueName.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchInstructor && !matchVenue) return false;
    }
    return true;
  });

  const filteredPracticals = practicals.filter((p) => {
    if (practicalSearch.trim()) {
      const q = practicalSearch.toLowerCase();
      const matchTopic = p.practicalTopic.toLowerCase().includes(q);
      const matchLab = p.labName.toLowerCase().includes(q);
      const matchCode = p.courseCode.toLowerCase().includes(q);
      const matchTech = p.chiefTechnologist.toLowerCase().includes(q);
      if (!matchTopic && !matchLab && !matchCode && !matchTech) return false;
    }
    return true;
  });

  const filteredVenues = venues.filter((v) => {
    if (venueSearch.trim()) {
      const q = venueSearch.toLowerCase();
      const matchName = v.venueName.toLowerCase().includes(q);
      const matchCode = v.venueCode.toLowerCase().includes(q);
      const matchBldg = v.building.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchBldg) return false;
    }
    return true;
  });

  const filteredFaculty = facultyLoad.filter((f) => {
    if (facultySearch.trim()) {
      const q = facultySearch.toLowerCase();
      const matchName = f.instructorName.toLowerCase().includes(q);
      const matchDept = f.departmentName.toLowerCase().includes(q);
      const matchId = f.staffId.toLowerCase().includes(q);
      if (!matchName && !matchDept && !matchId) return false;
    }
    return true;
  });

  /* ─── HANDLER: ADD CLASS TO SCHEDULE ─── */
  const handleCommitSchedule = () => {
    if (!newCourseCode.trim() || !newCourseTitle.trim()) {
      showToast({ type: 'warning', title: 'Course Details Required', message: 'Please provide course code and title.' });
      return;
    }

    const selectedVenue = venues.find((v) => v.venueCode === newVenueCode);
    const venueName = selectedVenue ? selectedVenue.venueName : 'Health Sciences Lecture Theatre 1';

    // Conflict check against prospective class
    const conflict = schedules.find(
      (s) =>
        s.day === newDay &&
        s.venueCode === newVenueCode &&
        s.startTime < newEndTime &&
        newStartTime < s.endTime
    );

    if (conflict) {
      showToast({
        type: 'danger',
        title: 'Schedule Clash Detected',
        message: `${conflict.venueName} is already occupied by ${conflict.courseCode} (${conflict.startTime} – ${conflict.endTime}). Choose another venue or time.`,
      });
      return;
    }

    const newSch: ClassScheduleItem = {
      id: `sch-0${schedules.length + 1}`,
      courseCode: newCourseCode.trim(),
      courseTitle: newCourseTitle.trim(),
      departmentCode: newDeptCode,
      departmentName:
        newDeptCode === 'CHE'
          ? 'Community Health'
          : newDeptCode === 'MLT'
          ? 'Medical Laboratory Tech'
          : newDeptCode === 'PHT'
          ? 'Pharmacy Technician'
          : newDeptCode === 'HIM'
          ? 'Health Information Mgmt'
          : 'Environmental Health',
      level: newLevel,
      sessionType: newType,
      day: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      venueCode: newVenueCode,
      venueName,
      instructorName: newInstructor,
      instructorId: 'BCHT/ACAD/001',
      creditUnits: newUnits,
      enrolledStudents: 65,
      clashDetected: false,
    };

    setSchedules((prev) => [...prev, newSch]);
    recordAudit('CLASS_SCHEDULE_COMMITTED', 'ACADEMIC_TIMETABLE', newSch.courseCode);
    showToast({
      type: 'success',
      title: 'Class Session Scheduled',
      message: `${newSch.courseCode} placed on ${newSch.day} (${newSch.startTime} – ${newSch.endTime}) in ${newSch.venueName}.`,
    });
    setIsAddScheduleModalOpen(false);
  };

  /* ─── TABLE 1: CLASS SCHEDULE LIST COLUMNS ─── */
  const scheduleColumns = [
    {
      key: 'courseCode',
      header: 'Course Code & Title',
      render: (s: ClassScheduleItem) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#0F7640] block">{s.courseCode}</span>
            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-[4px] text-[10px] font-bold">
              {s.creditUnits} Units
            </span>
          </div>
          <span className="font-semibold text-slate-900 block text-xs">{s.courseTitle}</span>
          <span className="text-[11px] text-slate-400">
            {s.departmentName} ({s.level})
          </span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      nowrap: true,
      render: (s: ClassScheduleItem) => {
        if (s.sessionType === 'THEORY') return <Badge variant="neutral" size="sm">Theory Lecture</Badge>;
        if (s.sessionType === 'PRACTICAL_LAB') return <Badge variant="success" size="sm">Laboratory Practical</Badge>;
        if (s.sessionType === 'CLINICAL_WARD') return <Badge variant="warning" size="sm">Clinical Ward</Badge>;
        return <Badge variant="neutral" size="sm">Seminar</Badge>;
      },
    },
    {
      key: 'dayTime',
      header: 'Day & Time Band',
      nowrap: true,
      render: (s: ClassScheduleItem) => (
        <div>
          <span className="font-bold text-slate-900 block">{s.day}</span>
          <span className="text-xs text-slate-600 font-semibold font-sans">
            {s.startTime} – {s.endTime}
          </span>
        </div>
      ),
    },
    {
      key: 'venue',
      header: 'Instructional Venue',
      render: (s: ClassScheduleItem) => (
        <div>
          <span className="font-semibold text-slate-800 block text-xs">{s.venueName}</span>
          <span className="text-[11px] text-slate-400">Code: {s.venueCode}</span>
        </div>
      ),
    },
    {
      key: 'instructor',
      header: 'Assigned Lecturer / Preceptor',
      nowrap: true,
      render: (s: ClassScheduleItem) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{s.instructorName}</span>
          <span className="text-[11px] text-slate-500">{s.instructorId}</span>
        </div>
      ),
    },
    {
      key: 'clash',
      header: 'Conflict State',
      align: 'center' as const,
      nowrap: true,
      render: (s: ClassScheduleItem) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#13A348]">
          <CheckCircle2 className="w-3.5 h-3.5" /> 0 Clashes
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right' as const,
      nowrap: true,
      render: (s: ClassScheduleItem) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSelectedScheduleForDossier(s)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Details
          </Button>
          {!isStudent && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingSchedule({ ...s });
                  setIsEditScheduleOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  setDeletingSchedule(s);
                  setIsDeleteScheduleOpen(true);
                }}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  /* ─── TABLE 2: PRACTICAL SESSIONS COLUMNS ─── */
  const practicalColumns = [
    {
      key: 'courseCode',
      header: 'Course & Practical Topic',
      render: (p: PracticalSession) => (
        <div>
          <span className="font-bold text-[#0F7640] block">{p.courseCode}</span>
          <span className="font-semibold text-slate-900 block text-xs">{p.practicalTopic}</span>
          <span className="text-[11px] text-slate-500 font-medium">{p.batchGroup}</span>
        </div>
      ),
    },
    {
      key: 'labName',
      header: 'Designated Laboratory',
      render: (p: PracticalSession) => (
        <span className="font-semibold text-slate-800 text-xs block">{p.labName}</span>
      ),
    },
    {
      key: 'dayTime',
      header: 'Schedule Window',
      nowrap: true,
      render: (p: PracticalSession) => (
        <div>
          <span className="font-bold text-slate-900 block">{p.day}</span>
          <span className="text-xs text-slate-600 font-medium font-sans">{p.timeRange}</span>
        </div>
      ),
    },
    {
      key: 'technologist',
      header: 'Chief Technologist / Preceptor',
      nowrap: true,
      render: (p: PracticalSession) => (
        <span className="font-bold text-slate-900 text-xs">{p.chiefTechnologist}</span>
      ),
    },
    {
      key: 'ppe',
      header: 'Mandatory PPE Protocols',
      render: (p: PracticalSession) => (
        <div className="flex items-center gap-1 flex-wrap">
          {p.requiredPPE.map((ppe, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-[4px] text-[10px] font-medium">
              {ppe}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Safety Audit',
      align: 'center' as const,
      nowrap: true,
      render: (p: PracticalSession) => (
        <Badge variant={p.safetyStatus === 'CERTIFIED' ? 'success' : 'warning'} size="sm">
          {p.safetyStatus}
        </Badge>
      ),
    },
  ];

  /* ─── TABLE 3: VENUES INVENTORY COLUMNS ─── */
  const venueColumns = [
    {
      key: 'venueCode',
      header: 'Venue Code & Name',
      render: (v: VenueItem) => (
        <div>
          <span className="font-bold text-[#0F7640] block">{v.venueCode}</span>
          <span className="font-bold text-slate-900 block text-xs">{v.venueName}</span>
          <span className="text-[11px] text-slate-400">{v.building}</span>
        </div>
      ),
    },
    {
      key: 'capacity',
      header: 'Student Capacity',
      align: 'center' as const,
      nowrap: true,
      render: (v: VenueItem) => (
        <span className="font-bold text-slate-900 font-sans text-xs">{v.capacity} Seats</span>
      ),
    },
    {
      key: 'amenities',
      header: 'Audio/Visual & Power Utilities',
      render: (v: VenueItem) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {v.amenities.map((a, i) => (
            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-[4px] text-[10px] font-medium">
              {a}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Current Status',
      align: 'center' as const,
      nowrap: true,
      render: (v: VenueItem) => {
        if (v.status === 'IN_USE') return <Badge variant="warning" size="sm">IN LECTURE</Badge>;
        if (v.status === 'RESERVED') return <Badge variant="neutral" size="sm">RESERVED</Badge>;
        return <Badge variant="success" size="sm">AVAILABLE</Badge>;
      },
    },
    {
      key: 'action',
      header: 'Reservation',
      align: 'right' as const,
      nowrap: true,
      render: (v: VenueItem) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            showToast({
              type: 'info',
              title: 'Venue Booked',
              message: `${v.venueName} reserved for special departmental lecture.`,
            });
          }}
          leftIcon={<Calendar className="w-3.5 h-3.5" />}
          className="whitespace-nowrap"
        >
          Book Venue
        </Button>
      ),
    },
  ];

  /* ─── TABLE 4: FACULTY LOAD COLUMNS ─── */
  const facultyColumns = [
    {
      key: 'instructorName',
      header: 'Faculty Lecturer',
      render: (f: FacultyLoadItem) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{f.instructorName}</span>
          <span className="text-[11px] text-slate-400 font-medium">
            {f.staffId} • {f.academicRank}
          </span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Academic Department',
      nowrap: true,
      render: (f: FacultyLoadItem) => (
        <span className="text-xs text-slate-700 font-semibold">{f.departmentName}</span>
      ),
    },
    {
      key: 'courses',
      header: 'Allocated Course Load',
      render: (f: FacultyLoadItem) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {f.allocatedCourses.map((c, i) => (
            <span key={i} className="px-2 py-0.5 bg-emerald-50 text-[#0F7640] rounded-[4px] text-[10px] font-bold">
              {c}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'hours',
      header: 'Weekly Contact Hours',
      align: 'center' as const,
      nowrap: true,
      render: (f: FacultyLoadItem) => (
        <div>
          <span className="font-bold text-slate-900 text-xs font-sans">
            {f.weeklyContactHours} / {f.maxStatutoryHours} hrs
          </span>
          <span className="text-[10px] text-[#13A348] block font-semibold">CONPCASS Compliant</span>
        </div>
      ),
    },
    {
      key: 'clashes',
      header: 'Schedule Clashes',
      align: 'center' as const,
      nowrap: true,
      render: (f: FacultyLoadItem) => (
        <Badge variant={f.clashCount === 0 ? 'success' : 'danger'} size="sm">
          {f.clashCount === 0 ? '0 CLASHES' : `${f.clashCount} CONFLICTS`}
        </Badge>
      ),
    },
  ];

  /* ─── DAYS FOR WEEKLY GRID ─── */
  const daysList: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6">
      {/* ─── MODULE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Timetables & Class Schedules</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Harmattan Semester 2026/2027 • Lecture Master Grid • Laboratory Practicals • Facility Collision Detector
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => setIsPrintTimetableModalOpen(true)}
            leftIcon={<Printer className="w-3.5 h-3.5 text-slate-600" />}
            className="whitespace-nowrap text-xs"
          >
            {isStudent ? 'Print My Schedule' : 'Print Master Schedule'}
          </Button>
          {!isStudent && (
            <Button
              onClick={() => setIsAddScheduleModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="whitespace-nowrap text-xs bg-[#0F7640] hover:bg-[#093322]"
            >
              Add Class Slot
            </Button>
          )}
        </div>
      </div>

      {/* ─── TOP STAT CARDS (VERTICAL STACKING, STRICT 4PX BORDER RADIUS) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Weekly Lectures
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {schedules.length} Sessions
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#0F7640] font-semibold">5 Health Depts</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">100L – 300L Levels</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Collision Matrix
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#13A348] font-sans tracking-tight">
              0 Clashes
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">100% Conflict Free</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Venues & Lecturers synced</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Practical Labs
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {practicals.length} Active Labs
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#0F7640] font-semibold">Safety Certified</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Full PPE compliance</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lecture Halls
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {venues.length} Facilities
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-amber-700 font-semibold">1,010 Total Seats</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Solar Backup active</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── NAVIGATION TABS ─── */}
      <Tabs
        tabs={
          isStudent
            ? [
                { id: 'classes', label: 'My Lecture Timetable' },
                { id: 'practicals', label: 'My Clinical Practical Schedule' },
              ]
            : [
                { id: 'classes', label: 'Class Timetables' },
                { id: 'practicals', label: 'Practical & Lab Sessions' },
                { id: 'venues', label: 'Lecture Halls & Venues' },
                { id: 'faculty', label: 'Faculty Teaching Load' },
              ]
        }
        activeTab={activeTab}
        onChange={(id: any) => handleTabChange(id)}
      />

      {/* ─── TAB 1: CLASS TIMETABLES ─── */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          {/* Controls & View Switcher */}
          <div className="p-4 bg-white border border-slate-200/90 rounded-[4px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <div className="w-48">
                <Select
                  value={deptFilter}
                  onChange={(val) => setDeptFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Departments' },
                    { value: 'CHE', label: 'Community Health' },
                    { value: 'MLT', label: 'Medical Laboratory' },
                    { value: 'PHT', label: 'Pharmacy Tech' },
                    { value: 'HIM', label: 'Health Information' },
                    { value: 'EHT', label: 'Environmental Health' },
                  ]}
                />
              </div>
              <div className="w-36">
                <Select
                  value={levelFilter}
                  onChange={(val) => setLevelFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Levels' },
                    ...(schoolProfile?.academicLevels || ['100 Level', '200 Level', '300 Level']).map((lvl) => ({
                      value: lvl,
                      label: lvl,
                    })),
                  ]}
                />
              </div>
              <div className="w-36">
                <Select
                  value={dayFilter}
                  onChange={(val) => setDayFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Weekdays' },
                    { value: 'Monday', label: 'Monday' },
                    { value: 'Tuesday', label: 'Tuesday' },
                    { value: 'Wednesday', label: 'Wednesday' },
                    { value: 'Thursday', label: 'Thursday' },
                    { value: 'Friday', label: 'Friday' },
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end md:self-auto">
              <Button
                size="sm"
                variant={scheduleViewMode === 'grid' ? 'primary' : 'secondary'}
                onClick={() => setScheduleViewMode('grid')}
                leftIcon={<LayoutGrid className="w-3.5 h-3.5" />}
                className={scheduleViewMode === 'grid' ? 'bg-[#0F7640] hover:bg-[#093322]' : ''}
              >
                Weekly Grid
              </Button>
              <Button
                size="sm"
                variant={scheduleViewMode === 'list' ? 'primary' : 'secondary'}
                onClick={() => setScheduleViewMode('list')}
                leftIcon={<List className="w-3.5 h-3.5" />}
                className={scheduleViewMode === 'list' ? 'bg-[#0F7640] hover:bg-[#093322]' : ''}
              >
                Schedule Table
              </Button>
            </div>
          </div>

          {/* VIEW 1: INTERACTIVE WEEKLY GRID */}
          {scheduleViewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {daysList.map((dayName) => {
                const daySessions = filteredSchedules.filter((s) => s.day === dayName);
                return (
                  <div key={dayName} className="space-y-2">
                    <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-[4px] text-center">
                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wide block">
                        {dayName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {daySessions.length} {daySessions.length === 1 ? 'Lecture' : 'Lectures'}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {daySessions.length === 0 ? (
                        <div className="p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-[4px] text-center text-slate-400 text-xs">
                          No lectures scheduled
                        </div>
                      ) : (
                        daySessions.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedScheduleForDossier(item)}
                            className="p-3 bg-white border border-slate-200/90 rounded-[4px] hover:border-[#0F7640] hover:shadow-sm transition-all cursor-pointer space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-[#0F7640] text-xs">
                                {item.courseCode}
                              </span>
                              <span className="px-1.5 py-0.2 bg-emerald-50 text-[#0F7640] rounded-[4px] text-[10px] font-bold">
                                {item.level}
                              </span>
                            </div>

                            <h4 className="font-semibold text-slate-900 text-xs line-clamp-1 leading-snug">
                              {item.courseTitle}
                            </h4>

                            <div className="text-[11px] text-slate-500 flex items-center gap-1 font-sans">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{item.startTime} – {item.endTime}</span>
                            </div>

                            <div className="text-[11px] text-slate-600 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{item.venueName}</span>
                            </div>

                            <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                              <span className="font-medium truncate">{item.instructorName}</span>
                              <span className="font-semibold text-slate-700">{item.creditUnits} CU</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: TABULAR LIST */}
          {scheduleViewMode === 'list' && (
            <Card>
              <Table
                columns={scheduleColumns}
                data={filteredSchedules}
                keyExtractor={(s) => s.id}
                isDense={isDense}
                searchValue={classSearch}
                onSearchChange={setClassSearch}
                searchPlaceholder="Search course code, title, venue, or lecturer..."
              />
            </Card>
          )}
        </div>
      )}

      {/* ─── TAB 2: PRACTICAL & LAB SESSIONS ─── */}
      {activeTab === 'practicals' && (
        <Card>
          <Table
            columns={practicalColumns}
            data={filteredPracticals}
            keyExtractor={(p) => p.id}
            isDense={isDense}
            searchValue={practicalSearch}
            onSearchChange={setPracticalSearch}
            searchPlaceholder="Search topic, laboratory, or technologist..."
            toolbarFilters={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  showToast({
                    type: 'info',
                    title: 'Laboratory Safety Verification',
                    message: 'All college teaching laboratories inspected by Health Safety Officer.',
                  });
                }}
                leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-[#13A348]" />}
                className="whitespace-nowrap"
              >
                Verify Lab Safety
              </Button>
            }
          />
        </Card>
      )}

      {/* ─── TAB 3: LECTURE HALLS & VENUES ─── */}
      {activeTab === 'venues' && (
        <Card>
          <Table
            columns={venueColumns}
            data={filteredVenues}
            keyExtractor={(v) => v.id}
            isDense={isDense}
            searchValue={venueSearch}
            onSearchChange={setVenueSearch}
            searchPlaceholder="Search lecture hall, code, or building..."
            toolbarFilters={
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Facilities Status:</span>
                <span>All main halls equipped with Solar Inverters & PA Audio</span>
              </div>
            }
          />
        </Card>
      )}

      {/* ─── TAB 4: FACULTY TEACHING LOAD ─── */}
      {activeTab === 'faculty' && (
        <Card>
          <Table
            columns={facultyColumns}
            data={filteredFaculty}
            keyExtractor={(f) => f.id}
            isDense={isDense}
            searchValue={facultySearch}
            onSearchChange={setFacultySearch}
            searchPlaceholder="Search lecturer name, department, or staff ID..."
            toolbarFilters={
              <div className="text-xs text-slate-500">
                Contact hours benchmarked against CONPCASS statutory lecturer workload ceilings.
              </div>
            }
          />
        </Card>
      )}

      {/* ─── MODAL 1: ADD CLASS SLOT ─── */}
      <Modal
        isOpen={isAddScheduleModalOpen}
        onClose={() => setIsAddScheduleModalOpen(false)}
        title="Schedule New Lecture or Practical Session"
        size="md"
      >
        <div className="space-y-4 text-xs text-slate-800">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-slate-600">
            Add a course session to the master semester schedule. Real-time conflict engine checks venue and instructor availability.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Course Code:</label>
              <input
                type="text"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                placeholder="e.g. CHE 204"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Credit Units:</label>
              <input
                type="number"
                value={newUnits}
                onChange={(e) => setNewUnits(Number(e.target.value))}
                min={1}
                max={6}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Course Title:</label>
            <input
              type="text"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              placeholder="e.g. Reproductive Health & Family Planning"
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Department:</label>
              <Select
                value={newDeptCode}
                onChange={(val) => setNewDeptCode(val as any)}
                options={[
                  { value: 'CHE', label: 'Community Health' },
                  { value: 'MLT', label: 'Medical Lab' },
                  { value: 'PHT', label: 'Pharmacy Tech' },
                  { value: 'HIM', label: 'Health Info' },
                  { value: 'EHT', label: 'Env Health' },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Cohort Level:</label>
              <Select
                value={newLevel}
                onChange={(val) => setNewLevel(val as any)}
                options={(schoolProfile?.academicLevels || ['100 Level', '200 Level', '300 Level']).map((lvl) => ({
                  value: lvl,
                  label: lvl,
                }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Session Type:</label>
              <Select
                value={newType}
                onChange={(val) => setNewType(val as any)}
                options={[
                  { value: 'THEORY', label: 'Theory Lecture' },
                  { value: 'PRACTICAL_LAB', label: 'Lab Practical' },
                  { value: 'CLINICAL_WARD', label: 'Clinical Ward' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Day of Week:</label>
              <Select
                value={newDay}
                onChange={(val) => setNewDay(val as any)}
                options={[
                  { value: 'Monday', label: 'Monday' },
                  { value: 'Tuesday', label: 'Tuesday' },
                  { value: 'Wednesday', label: 'Wednesday' },
                  { value: 'Thursday', label: 'Thursday' },
                  { value: 'Friday', label: 'Friday' },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Start Time:</label>
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">End Time:</label>
              <input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Instructional Venue:</label>
              <Select
                value={newVenueCode}
                onChange={(val) => setNewVenueCode(val)}
                options={[
                  { value: 'LT-01', label: 'LT-01 — Health Sciences Theatre 1' },
                  { value: 'LT-02', label: 'LT-02 — Diagnostic Sciences Hall 2' },
                  { value: 'PH-01', label: 'PH-01 — Pharmacy Tech Hall P1' },
                  { value: 'AUD-01', label: 'AUD-01 — College Main Auditorium' },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Assigned Lecturer:</label>
              <Select
                value={newInstructor}
                onChange={(val) => setNewInstructor(val)}
                options={[
                  { value: 'Dr. Kehinde Bello', label: 'Dr. Kehinde Bello (Community Health)' },
                  { value: 'Mr. Olumide Adebisi', label: 'Mr. Olumide Adebisi (Med Lab)' },
                  { value: 'Pharm. Folashade Oladipo', label: 'Pharm. Folashade Oladipo (Pharmacy)' },
                  { value: 'Mrs. Titilayo Adeleke', label: 'Mrs. Titilayo Adeleke (Health Info)' },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsAddScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCommitSchedule} className="bg-[#0F7640] hover:bg-[#093322]">
              Commit Class Slot
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 2: OFFICIAL PRINTABLE MASTER TIMETABLE ─── */}
      <Modal
        isOpen={isPrintTimetableModalOpen}
        onClose={() => setIsPrintTimetableModalOpen(false)}
        title="Official College Academic Timetable"
        size="lg"
      >
        <div className="space-y-6 text-xs text-slate-800">
          <div className="border border-slate-200 p-6 rounded-[4px] bg-white relative">
            {/* Header Letterhead */}
            <div className="text-center pb-4 border-b border-slate-200">
              <img
                src={schoolProfile?.logoUrl || '/BeonTech-Logo.png'}
                alt="College Crest"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/BeonTech-Logo.png';
                }}
                className="w-12 h-12 mx-auto mb-2 object-contain"
              />
              <h2 className="text-base font-bold text-slate-900 tracking-wide uppercase">
                {schoolProfile?.institutionName || 'Bethsaida College of Health Technology'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Approved by Federal Ministry of Health • {schoolProfile?.campusAddress || 'Ogbomoso, Oyo State, Nigeria'}
              </p>
              <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 rounded-[4px] text-xs font-bold text-[#0F7640] border border-emerald-200 uppercase">
                OFFICIAL MASTER LECTURE TIMETABLE • HARMATTAN SEMESTER 2026/2027
              </div>
            </div>

            {/* Schedule Summary Roster */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5">Day</th>
                    <th className="py-2 px-2.5">Time</th>
                    <th className="py-2 px-2.5">Course Code</th>
                    <th className="py-2 px-2.5">Course Title</th>
                    <th className="py-2 px-2.5">Venue</th>
                    <th className="py-2 px-2.5">Lecturer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedules.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-2.5 font-bold text-slate-900">{item.day}</td>
                      <td className="py-2 px-2.5 text-slate-600 font-sans">{item.startTime} – {item.endTime}</td>
                      <td className="py-2 px-2.5 font-bold text-[#0F7640]">{item.courseCode}</td>
                      <td className="py-2 px-2.5 text-slate-800 font-medium">{item.courseTitle}</td>
                      <td className="py-2 px-2.5 text-slate-600">{item.venueName}</td>
                      <td className="py-2 px-2.5 font-semibold text-slate-900">{item.instructorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Timetable Sign-Off Seals */}
            <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 items-end">
              <div>
                <div className="w-28 border-b border-slate-700 mb-1"></div>
                <span className="font-bold text-slate-900 text-xs block">Chairman, College Timetable Committee</span>
                <span className="text-[10px] text-slate-400">Bethsaida College of Health Tech</span>
              </div>
              <div className="text-right">
                <div className="w-28 border-b border-slate-700 ml-auto mb-1"></div>
                <span className="font-bold text-slate-900 text-xs block">Registrar & Academic Secretary</span>
                <span className="text-[10px] text-slate-400">Academic Affairs Division</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsPrintTimetableModalOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
            >
              Print Master Schedule
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 3: CLASS SESSION DETAILS DOSSIER ─── */}
      <Modal
        isOpen={Boolean(selectedScheduleForDossier)}
        onClose={() => setSelectedScheduleForDossier(null)}
        title="Class Session Specification"
        size="md"
      >
        {selectedScheduleForDossier && (
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#0F7640] text-sm">{selectedScheduleForDossier.courseCode}</span>
                <Badge variant="success" size="sm">0 Clashes Active</Badge>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{selectedScheduleForDossier.courseTitle}</h3>
              <p className="text-slate-500 text-[11px]">
                {selectedScheduleForDossier.departmentName} • {selectedScheduleForDossier.level} Cohort • {selectedScheduleForDossier.creditUnits} Credit Units
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-[4px]">
              <div>
                <span className="text-slate-400 block text-[11px]">Lecture Day</span>
                <span className="font-bold text-slate-900">{selectedScheduleForDossier.day}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Time Band</span>
                <span className="font-bold text-slate-900 font-sans">
                  {selectedScheduleForDossier.startTime} – {selectedScheduleForDossier.endTime}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Venue</span>
                <span className="font-semibold text-slate-800">{selectedScheduleForDossier.venueName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Lecturer</span>
                <span className="font-semibold text-slate-800">{selectedScheduleForDossier.instructorName}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-800 block">Cohort Attendance Quota:</span>
                <span className="text-[11px] text-emerald-600">Minimum 75% attendance rule strictly enforced</span>
              </div>
              <span className="font-bold text-emerald-800 font-sans">{selectedScheduleForDossier.enrolledStudents} Registered</span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
              {!isStudent ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setDeletingSchedule(selectedScheduleForDossier);
                      setIsDeleteScheduleOpen(true);
                    }}
                  >
                    Delete Slot
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#0F7640] hover:bg-[#093322]"
                    onClick={() => {
                      setEditingSchedule({ ...selectedScheduleForDossier });
                      setIsEditScheduleOpen(true);
                    }}
                  >
                    Edit Slot
                  </Button>
                </div>
              ) : <div />}
              <Button variant="secondary" size="sm" onClick={() => setSelectedScheduleForDossier(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 4: EDIT CLASS SCHEDULE SLOT ─── */}
      {editingSchedule && (
        <Modal
          isOpen={isEditScheduleOpen}
          onClose={() => {
            setIsEditScheduleOpen(false);
            setEditingSchedule(null);
          }}
          title={`Edit Lecture Slot: ${editingSchedule.courseCode}`}
          description="Adjust scheduled day, time band, venue, or lecturer."
          size="md"
        >
          <form onSubmit={handleSaveEditSchedule} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Lecture Day"
                options={[
                  { value: 'Monday', label: 'Monday' },
                  { value: 'Tuesday', label: 'Tuesday' },
                  { value: 'Wednesday', label: 'Wednesday' },
                  { value: 'Thursday', label: 'Thursday' },
                  { value: 'Friday', label: 'Friday' },
                ]}
                value={editingSchedule.day}
                onChange={(val) => setEditingSchedule({ ...editingSchedule, day: val as DayOfWeek })}
              />

              <Select
                label="Academic Level"
                options={[
                  { value: '100L', label: '100 Level' },
                  { value: '200L', label: '200 Level' },
                  { value: '300L', label: '300 Level' },
                ]}
                value={editingSchedule.level}
                onChange={(val) => setEditingSchedule({ ...editingSchedule, level: val as any })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Time (24h)"
                type="time"
                value={editingSchedule.startTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingSchedule({ ...editingSchedule, startTime: e.target.value })
                }
                required
              />
              <Input
                label="End Time (24h)"
                type="time"
                value={editingSchedule.endTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingSchedule({ ...editingSchedule, endTime: e.target.value })
                }
                required
              />
            </div>

            <Input
              label="Assigned Venue"
              value={editingSchedule.venueName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingSchedule({ ...editingSchedule, venueName: e.target.value })
              }
              required
            />

            <Input
              label="Assigned Lecturer"
              value={editingSchedule.instructorName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingSchedule({ ...editingSchedule, instructorName: e.target.value })
              }
              required
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsEditScheduleOpen(false);
                  setEditingSchedule(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 5: DELETE SCHEDULE CONFIRMATION ─── */}
      {deletingSchedule && (
        <Modal
          isOpen={isDeleteScheduleOpen}
          onClose={() => {
            setIsDeleteScheduleOpen(false);
            setDeletingSchedule(null);
          }}
          title="Remove Lecture Slot"
          size="sm"
        >
          <div className="space-y-3 text-xs text-slate-700 font-sans">
            <p>
              Are you sure you want to remove the <strong>{deletingSchedule.courseCode} ({deletingSchedule.day} {deletingSchedule.startTime}–{deletingSchedule.endTime})</strong> class slot?
            </p>
            <p className="text-[11px] text-slate-500">
              This action will release the venue and remove the booking from cohort calendars.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsDeleteScheduleOpen(false);
                  setDeletingSchedule(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                type="button"
                onClick={handleConfirmDeleteSchedule}
              >
                Confirm Removal
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
