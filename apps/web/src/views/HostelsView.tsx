import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
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
  Building2,
  Bed,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  Printer,
  Download,
  Key,
  Wrench,
  UserCheck,
  ShieldCheck,
  XCircle,
  Sparkles,
  Phone,
  Mail,
  Home,
  Check,
  Edit2,
  Trash2,
} from 'lucide-react';
import { formatNaira } from '@campusone/contracts';

/* ─── TYPE DEFINITIONS ─── */
export type HostelGender = 'FEMALE' | 'MALE';
export type RoomType = 'QUAD_4BED' | 'DOUBLE_2BED' | 'SINGLE_EXEC';
export type RoomStatus = 'AVAILABLE' | 'FULL' | 'UNDER_MAINTENANCE';
export type AllocationStatus = 'ACTIVE' | 'PENDING_CHECKIN' | 'CHECKED_OUT' | 'REVOKED';
export type BursaryStatus = 'CLEARED' | 'PENDING_PAYMENT' | 'PARTIAL';
export type MaintenanceSeverity = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export interface RoomOccupant {
  bedSlot: string;
  studentName: string;
  matricNo: string;
  programme: string;
  level: string;
  phone: string;
}

export interface HostelRoom {
  id: string;
  roomCode: string;
  blockCode: 'FNH' | 'MSH' | 'SAF' | 'AKH';
  blockName: string;
  gender: HostelGender;
  floor: string;
  roomType: RoomType;
  capacity: number;
  occupied: number;
  status: RoomStatus;
  amenities: string[];
  occupants: RoomOccupant[];
}

export interface BedAllocation {
  id: string;
  allocationRef: string;
  studentName: string;
  matricNo: string;
  gender: HostelGender;
  department: string;
  level: string;
  blockCode: 'FNH' | 'MSH' | 'SAF' | 'AKH';
  blockName: string;
  roomCode: string;
  bedSlot: string;
  keyTag: string;
  session: string;
  bursaryClearance: BursaryStatus;
  feeAmountKobo: number;
  allocationDate: string;
  status: AllocationStatus;
  wardenNotes: string;
}

export interface CheckInRecord {
  id: string;
  studentName: string;
  matricNo: string;
  roomCode: string;
  bedSlot: string;
  keyTag: string;
  checkInDate: string;
  mattressIssued: boolean;
  wardrobeKeyIssued: boolean;
  inventorySigned: boolean;
  checkInStatus: 'CHECKED_IN' | 'CHECKED_OUT' | 'PENDING';
  wardenRemarks: string;
}

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  blockName: string;
  roomCode: string;
  category: 'Plumbing' | 'Electrical' | 'Solar Power / Inverter' | 'Structural / Joinery' | 'Water Supply';
  description: string;
  severity: MaintenanceSeverity;
  reportedDate: string;
  reportedBy: string;
  assignedArtisan: string;
  status: MaintenanceStatus;
  resolutionNotes?: string;
}

export const HostelsView: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { isDense, recordAudit, session, schoolProfile } = useApp();
  const { showToast } = useToast();

  const currentPersona = PERSONA_PROFILES[session?.activeRole || 'PROVOST'] || PERSONA_PROFILES.STU;
  const isStudent = session?.activeRole === 'STU' || session?.activeRole === 'SPON';
  const studentMatric = currentPersona.matricNumber || 'CHE/2026/0014';

  /* ─── TAB ROUTING STATE ─── */
  const validTabs = isStudent
    ? ['allocations', 'inventory', 'maintenance']
    : ['inventory', 'allocations', 'checkin', 'maintenance'];
  const activeTab = tab && validTabs.includes(tab) ? tab : (isStudent ? 'allocations' : 'inventory');

  const handleTabChange = (newTab: string) => {
    navigate(`/hostels/${newTab}`);
  };

  /* ─── INITIAL STATE DATA ─── */
  const [rooms, setRooms] = useState<HostelRoom[]>([
    {
      id: 'rm-01',
      roomCode: 'FNH-101',
      blockCode: 'FNH',
      blockName: 'Florence Nightingale Hall',
      gender: 'FEMALE',
      floor: 'Ground Floor',
      roomType: 'QUAD_4BED',
      capacity: 4,
      occupied: 4,
      status: 'FULL',
      amenities: ['24/7 Solar Inverter', 'Ensuite Bathroom', 'Individual Wardrobes', 'Study Carrel'],
      occupants: [
        { bedSlot: 'Bed A', studentName: 'Blessing Adeyemi', matricNo: 'CHE/2026/0014', programme: 'Community Health (CHEW)', level: '200L', phone: '+234 803 124 5510' },
        { bedSlot: 'Bed B', studentName: 'Fatima Ibrahim', matricNo: 'CHE/2026/0016', programme: 'Community Health (CHEW)', level: '200L', phone: '+234 802 998 1234' },
        { bedSlot: 'Bed C', studentName: 'Amina Danjuma', matricNo: 'CHE/2026/0018', programme: 'Community Health (CHEW)', level: '200L', phone: '+234 813 445 6677' },
        { bedSlot: 'Bed D', studentName: 'Halima Yusuf', matricNo: 'MLT/2026/0010', programme: 'Medical Laboratory Tech', level: '200L', phone: '+234 806 778 9900' },
      ],
    },
    {
      id: 'rm-02',
      roomCode: 'FNH-102',
      blockCode: 'FNH',
      blockName: 'Florence Nightingale Hall',
      gender: 'FEMALE',
      floor: 'Ground Floor',
      roomType: 'QUAD_4BED',
      capacity: 4,
      occupied: 3,
      status: 'AVAILABLE',
      amenities: ['24/7 Solar Inverter', 'Ensuite Bathroom', 'Individual Wardrobes', 'Fire Extinguisher Inspected'],
      occupants: [
        { bedSlot: 'Bed A', studentName: 'Rukayat Sanusi', matricNo: 'HIM/2026/0005', programme: 'Health Information Mgmt', level: '200L', phone: '+234 809 332 7611' },
        { bedSlot: 'Bed B', studentName: 'Zainab Bello', matricNo: 'PHT/2026/0018', programme: 'Pharmacy Technician', level: '100L', phone: '+234 814 556 7788' },
        { bedSlot: 'Bed C', studentName: 'Amina Yusuf', matricNo: 'CHE/2026/0142', programme: 'Community Health (CHEW)', level: '100L', phone: '+234 812 334 4556' },
      ],
    },
    {
      id: 'rm-03',
      roomCode: 'MSH-201',
      blockCode: 'MSH',
      blockName: 'Mary Seacole Hall',
      gender: 'FEMALE',
      floor: '1st Floor',
      roomType: 'QUAD_4BED',
      capacity: 4,
      occupied: 2,
      status: 'AVAILABLE',
      amenities: ['24/7 Solar Inverter', 'Balcony Access', 'Ceiling Fan', 'Study Desks'],
      occupants: [
        { bedSlot: 'Bed A', studentName: 'Omolara Ogunleye', matricNo: 'MLT/2026/0045', programme: 'Medical Laboratory Tech', level: '200L', phone: '+234 805 112 3344' },
        { bedSlot: 'Bed B', studentName: 'Deborah Taiwo', matricNo: 'EHT/2026/0021', programme: 'Environmental Health', level: '200L', phone: '+234 807 889 0011' },
      ],
    },
    {
      id: 'rm-04',
      roomCode: 'MSH-202',
      blockCode: 'MSH',
      blockName: 'Mary Seacole Hall',
      gender: 'FEMALE',
      floor: '1st Floor',
      roomType: 'DOUBLE_2BED',
      capacity: 2,
      occupied: 2,
      status: 'FULL',
      amenities: ['Executive Double', 'Ensuite Bathroom', 'Solar Backup', 'Wardrobe Locker'],
      occupants: [
        { bedSlot: 'Bed A', studentName: 'Khadijah Alimi', matricNo: 'PHT/2026/0034', programme: 'Pharmacy Technician', level: '300L', phone: '+234 816 223 3445' },
        { bedSlot: 'Bed B', studentName: 'Simiat Olayinka', matricNo: 'CHE/2026/0088', programme: 'Community Health (CHEW)', level: '300L', phone: '+234 815 667 8899' },
      ],
    },
    {
      id: 'rm-05',
      roomCode: 'SAF-101',
      blockCode: 'SAF',
      blockName: 'Sir Alexander Fleming Hall',
      gender: 'MALE',
      floor: 'Ground Floor',
      roomType: 'QUAD_4BED',
      capacity: 4,
      occupied: 4,
      status: 'FULL',
      amenities: ['24/7 Solar Inverter', 'Ensuite Bathroom', 'Wardrobes', 'Smoke Detector'],
      occupants: [
        { bedSlot: 'Bed A', studentName: 'Oluwaseun Bakare', matricNo: 'CHE/2026/0015', programme: 'Community Health (CHEW)', level: '200L', phone: '+234 802 113 4455' },
        { bedSlot: 'Bed B', studentName: 'Chinedu Eze', matricNo: 'CHE/2026/0017', programme: 'Community Health (CHEW)', level: '200L', phone: '+234 805 667 7889' },
        { bedSlot: 'Bed C', studentName: 'Tunde Olatunji', matricNo: 'MLT/2026/0009', programme: 'Medical Laboratory Tech', level: '200L', phone: '+234 808 990 1122' },
        { bedSlot: 'Bed D', studentName: 'Ifeanyi Okoro', matricNo: 'PHT/2026/0022', programme: 'Pharmacy Technician', level: '200L', phone: '+234 811 223 3445' },
      ],
    },
    {
      id: 'rm-06',
      roomCode: 'SAF-102',
      blockCode: 'SAF',
      blockName: 'Sir Alexander Fleming Hall',
      gender: 'MALE',
      floor: 'Ground Floor',
      roomType: 'QUAD_4BED',
      capacity: 4,
      occupied: 1,
      status: 'AVAILABLE',
      amenities: ['24/7 Solar Inverter', 'Ensuite Bathroom', 'Wardrobes', 'Study Desks'],
      occupants: [
        { bedSlot: 'Bed A', studentName: 'David Adeleke', matricNo: 'MLT/2026/0143', programme: 'Medical Laboratory Tech', level: '100L', phone: '+234 803 445 6677' },
      ],
    },
    {
      id: 'rm-07',
      roomCode: 'AKH-201',
      blockCode: 'AKH',
      blockName: 'Aminu Kano Hall',
      gender: 'MALE',
      floor: '1st Floor',
      roomType: 'QUAD_4BED',
      capacity: 4,
      occupied: 3,
      status: 'AVAILABLE',
      amenities: ['24/7 Solar Inverter', 'Individual Lockers', 'Ceiling Fan', 'Study Desks'],
      occupants: [
        { bedSlot: 'Bed A', studentName: 'Solomon Giwa', matricNo: 'EHT/2026/0012', programme: 'Environmental Health', level: '200L', phone: '+234 818 223 3445' },
        { bedSlot: 'Bed B', studentName: 'Emmanuel Chukwuma', matricNo: 'MLT/2026/0029', programme: 'Medical Laboratory Tech', level: '200L', phone: '+234 810 556 7788' },
        { bedSlot: 'Bed C', studentName: 'Sunday Okon', matricNo: 'HIM/2026/0145', programme: 'Health Information Mgmt', level: '100L', phone: '+234 809 112 3344' },
      ],
    },
    {
      id: 'rm-08',
      roomCode: 'AKH-202',
      blockCode: 'AKH',
      blockName: 'Aminu Kano Hall',
      gender: 'MALE',
      floor: '1st Floor',
      roomType: 'QUAD_4BED',
      capacity: 4,
      occupied: 0,
      status: 'UNDER_MAINTENANCE',
      amenities: ['Awaiting Plumbing Overhaul', 'Solar Inverter Tested'],
      occupants: [],
    },
  ]);

  const [allocations, setAllocations] = useState<BedAllocation[]>([
    {
      id: 'alc-01',
      allocationRef: 'HST-2026-0014',
      studentName: 'Blessing Adeyemi',
      matricNo: 'CHE/2026/0014',
      gender: 'FEMALE',
      department: 'Community Health',
      level: '200L',
      blockCode: 'FNH',
      blockName: 'Florence Nightingale Hall',
      roomCode: 'FNH-101',
      bedSlot: 'Bed A',
      keyTag: 'KEY-FNH-101-A',
      session: '2026/2027 Session',
      bursaryClearance: 'CLEARED',
      feeAmountKobo: 4500000,
      allocationDate: '2026-10-15',
      status: 'ACTIVE',
      wardenNotes: 'Fully cleared by Bursary. Official room key issued.',
    },
    {
      id: 'alc-02',
      allocationRef: 'HST-2026-0015',
      studentName: 'Oluwaseun Bakare',
      matricNo: 'CHE/2026/0015',
      gender: 'MALE',
      department: 'Community Health',
      level: '200L',
      blockCode: 'SAF',
      blockName: 'Sir Alexander Fleming Hall',
      roomCode: 'SAF-101',
      bedSlot: 'Bed A',
      keyTag: 'KEY-SAF-101-A',
      session: '2026/2027 Session',
      bursaryClearance: 'CLEARED',
      feeAmountKobo: 4500000,
      allocationDate: '2026-10-15',
      status: 'ACTIVE',
      wardenNotes: 'Clean medical clearance verified by Matron.',
    },
    {
      id: 'alc-03',
      allocationRef: 'HST-2026-0016',
      studentName: 'Fatima Ibrahim',
      matricNo: 'CHE/2026/0016',
      gender: 'FEMALE',
      department: 'Community Health',
      level: '200L',
      blockCode: 'FNH',
      blockName: 'Florence Nightingale Hall',
      roomCode: 'FNH-101',
      bedSlot: 'Bed B',
      keyTag: 'KEY-FNH-101-B',
      session: '2026/2027 Session',
      bursaryClearance: 'CLEARED',
      feeAmountKobo: 4500000,
      allocationDate: '2026-10-16',
      status: 'ACTIVE',
      wardenNotes: 'Bursary verified via Remita settlement.',
    },
    {
      id: 'alc-04',
      allocationRef: 'HST-2026-0017',
      studentName: 'Chinedu Eze',
      matricNo: 'CHE/2026/0017',
      gender: 'MALE',
      department: 'Community Health',
      level: '200L',
      blockCode: 'SAF',
      blockName: 'Sir Alexander Fleming Hall',
      roomCode: 'SAF-101',
      bedSlot: 'Bed B',
      keyTag: 'KEY-SAF-101-B',
      session: '2026/2027 Session',
      bursaryClearance: 'PENDING_PAYMENT',
      feeAmountKobo: 4500000,
      allocationDate: '2026-10-18',
      status: 'PENDING_CHECKIN',
      wardenNotes: 'Conditional reservation. Keys withheld pending bursary clearance.',
    },
    {
      id: 'alc-05',
      allocationRef: 'HST-2026-0018',
      studentName: 'Tunde Olatunji',
      matricNo: 'MLT/2026/0009',
      gender: 'MALE',
      department: 'Medical Laboratory Tech',
      level: '200L',
      blockCode: 'SAF',
      blockName: 'Sir Alexander Fleming Hall',
      roomCode: 'SAF-101',
      bedSlot: 'Bed C',
      keyTag: 'KEY-SAF-101-C',
      session: '2026/2027 Session',
      bursaryClearance: 'CLEARED',
      feeAmountKobo: 4500000,
      allocationDate: '2026-10-17',
      status: 'ACTIVE',
      wardenNotes: 'Assigned to Lab Science clinical wing.',
    },
    {
      id: 'alc-06',
      allocationRef: 'HST-2026-0019',
      studentName: 'Rukayat Sanusi',
      matricNo: 'HIM/2026/0005',
      gender: 'FEMALE',
      department: 'Health Information Mgmt',
      level: '200L',
      blockCode: 'FNH',
      blockName: 'Florence Nightingale Hall',
      roomCode: 'FNH-102',
      bedSlot: 'Bed A',
      keyTag: 'KEY-FNH-102-A',
      session: '2026/2027 Session',
      bursaryClearance: 'CLEARED',
      feeAmountKobo: 4500000,
      allocationDate: '2026-10-19',
      status: 'ACTIVE',
      wardenNotes: 'Fee clearance receipt RCP-2026-00104 confirmed.',
    },
  ]);

  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([
    {
      id: 'chk-01',
      studentName: 'Blessing Adeyemi',
      matricNo: 'CHE/2026/0014',
      roomCode: 'FNH-101',
      bedSlot: 'Bed A',
      keyTag: 'KEY-FNH-101-A',
      checkInDate: '2026-10-16 09:30',
      mattressIssued: true,
      wardrobeKeyIssued: true,
      inventorySigned: true,
      checkInStatus: 'CHECKED_IN',
      wardenRemarks: 'All assets verified intact. Signed rules handbook.',
    },
    {
      id: 'chk-02',
      studentName: 'Oluwaseun Bakare',
      matricNo: 'CHE/2026/0015',
      roomCode: 'SAF-101',
      bedSlot: 'Bed A',
      keyTag: 'KEY-SAF-101-A',
      checkInDate: '2026-10-16 11:15',
      mattressIssued: true,
      wardrobeKeyIssued: true,
      inventorySigned: true,
      checkInStatus: 'CHECKED_IN',
      wardenRemarks: 'Keys handed over by Hall Warden. Room briefing done.',
    },
    {
      id: 'chk-03',
      studentName: 'Fatima Ibrahim',
      matricNo: 'CHE/2026/0016',
      roomCode: 'FNH-101',
      bedSlot: 'Bed B',
      keyTag: 'KEY-FNH-101-B',
      checkInDate: '2026-10-17 14:00',
      mattressIssued: true,
      wardrobeKeyIssued: true,
      inventorySigned: true,
      checkInStatus: 'CHECKED_IN',
      wardenRemarks: 'Medical certificate on file in Porter lodge.',
    },
    {
      id: 'chk-04',
      studentName: 'Chinedu Eze',
      matricNo: 'CHE/2026/0017',
      roomCode: 'SAF-101',
      bedSlot: 'Bed B',
      keyTag: 'KEY-SAF-101-B',
      checkInDate: 'Pending',
      mattressIssued: false,
      wardrobeKeyIssued: false,
      inventorySigned: false,
      checkInStatus: 'PENDING',
      wardenRemarks: 'Awaiting fee clearance gate pass before key release.',
    },
  ]);

  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>([
    {
      id: 'mnt-01',
      ticketNumber: 'MNT-2026-041',
      blockName: 'Florence Nightingale Hall',
      roomCode: 'FNH-102',
      category: 'Plumbing',
      description: 'Bathroom washbasin faucet leaking under pressure.',
      severity: 'NORMAL',
      reportedDate: '2026-11-10',
      reportedBy: 'Matron Janet Alabi',
      assignedArtisan: 'Works Dept - Plumber Alao',
      status: 'IN_PROGRESS',
      resolutionNotes: 'Replacement gasket supplied, installation underway.',
    },
    {
      id: 'mnt-02',
      ticketNumber: 'MNT-2026-042',
      blockName: 'Aminu Kano Hall',
      roomCode: 'AKH-202',
      category: 'Plumbing',
      description: 'Overhead water supply pipe replacement required for room wing.',
      severity: 'CRITICAL',
      reportedDate: '2026-11-08',
      reportedBy: 'Warden S. Giwa',
      assignedArtisan: 'Main Contractor Works',
      status: 'IN_PROGRESS',
      resolutionNotes: 'Room isolated from student allocation until completion.',
    },
    {
      id: 'mnt-03',
      ticketNumber: 'MNT-2026-043',
      blockName: 'Sir Alexander Fleming Hall',
      roomCode: 'SAF-102',
      category: 'Electrical',
      description: 'Study area fluorescent light fixture flickering.',
      severity: 'LOW',
      reportedDate: '2026-11-12',
      reportedBy: 'David Adeleke',
      assignedArtisan: 'Works Dept - Electrician Bello',
      status: 'RESOLVED',
      resolutionNotes: 'LED tube replaced and tested on solar inverter line.',
    },
    {
      id: 'mnt-04',
      ticketNumber: 'MNT-2026-044',
      blockName: 'Mary Seacole Hall',
      roomCode: 'MSH-201',
      category: 'Solar Power / Inverter',
      description: 'Inverter changeover switch inspection routine audit.',
      severity: 'NORMAL',
      reportedDate: '2026-11-13',
      reportedBy: 'Solar Engineer T. Adeleke',
      assignedArtisan: 'Solar Energy Vendor',
      status: 'PENDING',
      resolutionNotes: 'Scheduled for Saturday morning routine maintenance.',
    },
  ]);

  /* ─── SEARCH & FILTER STATES ─── */
  const [roomSearch, setRoomSearch] = useState('');
  const [hallFilter, setHallFilter] = useState('ALL');
  const [roomTypeFilter, setRoomTypeFilter] = useState('ALL');

  const [allocSearch, setAllocSearch] = useState('');
  const [allocHallFilter, setAllocHallFilter] = useState('ALL');
  const [allocStatusFilter, setAllocStatusFilter] = useState('ALL');

  const [checkInSearch, setCheckInSearch] = useState('');
  const [maintenanceSearch, setMaintenanceSearch] = useState('');

  /* ─── MODAL STATES ─── */
  const [selectedRoomForDossier, setSelectedRoomForDossier] = useState<HostelRoom | null>(null);
  const [selectedAllocationForPass, setSelectedAllocationForPass] = useState<BedAllocation | null>(null);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [selectedCheckInCandidate, setSelectedCheckInCandidate] = useState<BedAllocation | null>(null);

  /* ─── FORM STATES: NEW ALLOCATION ─── */
  const [newAllocMatric, setNewAllocMatric] = useState('CHE/2026/0142');
  const [newAllocStudentName, setNewAllocStudentName] = useState('Amina Yusuf');
  const [newAllocGender, setNewAllocGender] = useState<HostelGender>('FEMALE');
  const [newAllocProgramme, setNewAllocProgramme] = useState('Community Health Extension Worker (CHEW)');
  const [newAllocRoomCode, setNewAllocRoomCode] = useState('FNH-102');
  const [newAllocBedSlot, setNewAllocBedSlot] = useState('Bed D');
  const [newAllocKeyTag, setNewAllocKeyTag] = useState('KEY-FNH-102-D');

  /* ─── FORM STATES: NEW MAINTENANCE TICKET ─── */
  const [newMntBlock, setNewMntBlock] = useState('Florence Nightingale Hall');
  const [newMntRoom, setNewMntRoom] = useState('FNH-101');
  const [newMntCategory, setNewMntCategory] = useState<'Plumbing' | 'Electrical' | 'Solar Power / Inverter' | 'Structural / Joinery' | 'Water Supply'>('Plumbing');
  const [newMntSeverity, setNewMntSeverity] = useState<MaintenanceSeverity>('NORMAL');
  const [newMntDesc, setNewMntDesc] = useState('');
  const [newMntArtisan, setNewMntArtisan] = useState('Works Dept - Plumber Alao');

  /* ─── ROOM MANAGEMENT CRUD STATES ─── */
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<HostelRoom | null>(null);
  const [isDeleteRoomOpen, setIsDeleteRoomOpen] = useState(false);
  const [deleteRoomTarget, setDeleteRoomTarget] = useState<HostelRoom | null>(null);

  const [newRoomForm, setNewRoomForm] = useState({
    roomCode: '',
    blockCode: 'FNH' as 'FNH' | 'MSH' | 'SAF' | 'AKH',
    floor: 'Ground Floor',
    roomType: 'QUAD_4BED' as RoomType,
    capacity: 4,
    amenities: '24/7 Solar Inverter, Ensuite Bathroom, Study Carrel',
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const hallMap = {
      FNH: { name: 'Florence Nightingale Hall', gender: 'FEMALE' as const },
      MSH: { name: 'Mary Seacole Hall', gender: 'FEMALE' as const },
      SAF: { name: 'Sir Alexander Fleming Hall', gender: 'MALE' as const },
      AKH: { name: 'Aminu Kano Hall', gender: 'MALE' as const },
    };
    const hallInfo = hallMap[newRoomForm.blockCode] || hallMap.FNH;
    const newRoom: HostelRoom = {
      id: `rm-${Date.now()}`,
      roomCode: newRoomForm.roomCode,
      blockCode: newRoomForm.blockCode,
      blockName: hallInfo.name,
      gender: hallInfo.gender,
      floor: newRoomForm.floor,
      roomType: newRoomForm.roomType,
      capacity: Number(newRoomForm.capacity) || 4,
      occupied: 0,
      status: 'AVAILABLE',
      amenities: newRoomForm.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      occupants: [],
    };
    setRooms((prev) => [newRoom, ...prev]);
    setIsAddRoomOpen(false);
    setNewRoomForm({
      roomCode: '',
      blockCode: 'FNH',
      floor: 'Ground Floor',
      roomType: 'QUAD_4BED',
      capacity: 4,
      amenities: '24/7 Solar Inverter, Ensuite Bathroom, Study Carrel',
    });
    showToast({
      type: 'success',
      title: 'Room Created',
      message: `Room ${newRoom.roomCode} in ${newRoom.blockName} has been added.`,
    });
  };

  const handleUpdateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    setRooms((prev) =>
      prev.map((r) => (r.id === editingRoom.id ? editingRoom : r))
    );
    setIsEditRoomOpen(false);
    setEditingRoom(null);
    showToast({
      type: 'success',
      title: 'Room Updated',
      message: `Room ${editingRoom.roomCode} settings have been saved.`,
    });
  };

  const handleDeleteRoom = () => {
    if (!deleteRoomTarget) return;
    setRooms((prev) => prev.filter((r) => r.id !== deleteRoomTarget.id));
    setIsDeleteRoomOpen(false);
    setDeleteRoomTarget(null);
    showToast({
      type: 'success',
      title: 'Room Removed',
      message: `Room ${deleteRoomTarget.roomCode} has been deleted.`,
    });
  };

  /* ─── FILTERED DATA LOGIC (Scoped by Student Identity) ─── */
  const filteredRooms = rooms.filter((r) => {
    if (isStudent && !r.occupants.some((o) => o.matricNo === studentMatric)) return false;
    if (hallFilter !== 'ALL' && r.blockCode !== hallFilter) return false;
    if (roomTypeFilter !== 'ALL' && r.roomType !== roomTypeFilter) return false;
    if (roomSearch.trim()) {
      const q = roomSearch.toLowerCase();
      const matchCode = r.roomCode.toLowerCase().includes(q);
      const matchBlock = r.blockName.toLowerCase().includes(q);
      const matchOccupant = r.occupants.some((o) => o.studentName.toLowerCase().includes(q) || o.matricNo.toLowerCase().includes(q));
      if (!matchCode && !matchBlock && !matchOccupant) return false;
    }
    return true;
  });

  const filteredAllocations = allocations.filter((a) => {
    if (isStudent && a.matricNo !== studentMatric) return false;
    if (allocHallFilter !== 'ALL' && a.blockCode !== allocHallFilter) return false;
    if (allocStatusFilter !== 'ALL' && a.status !== allocStatusFilter) return false;
    if (allocSearch.trim()) {
      const q = allocSearch.toLowerCase();
      const matchName = a.studentName.toLowerCase().includes(q);
      const matchMatric = a.matricNo.toLowerCase().includes(q);
      const matchRef = a.allocationRef.toLowerCase().includes(q);
      const matchRoom = a.roomCode.toLowerCase().includes(q);
      if (!matchName && !matchMatric && !matchRef && !matchRoom) return false;
    }
    return true;
  });

  const filteredCheckIns = checkIns.filter((c) => {
    if (isStudent && c.matricNo !== studentMatric) return false;
    if (checkInSearch.trim()) {
      const q = checkInSearch.toLowerCase();
      const matchName = c.studentName.toLowerCase().includes(q);
      const matchMatric = c.matricNo.toLowerCase().includes(q);
      const matchRoom = c.roomCode.toLowerCase().includes(q);
      const matchKey = c.keyTag.toLowerCase().includes(q);
      if (!matchName && !matchMatric && !matchRoom && !matchKey) return false;
    }
    return true;
  });

  const filteredMaintenance = maintenanceTickets.filter((m) => {
    if (maintenanceSearch.trim()) {
      const q = maintenanceSearch.toLowerCase();
      const matchNum = m.ticketNumber.toLowerCase().includes(q);
      const matchBlock = m.blockName.toLowerCase().includes(q);
      const matchRoom = m.roomCode.toLowerCase().includes(q);
      const matchCategory = m.category.toLowerCase().includes(q);
      if (!matchNum && !matchBlock && !matchRoom && !matchCategory) return false;
    }
    return true;
  });

  /* ─── ACTION HANDLERS ─── */
  const handleCommitAllocation = () => {
    if (!newAllocMatric.trim() || !newAllocStudentName.trim() || !newAllocRoomCode) {
      showToast({ type: 'warning', title: 'Missing Information', message: 'Please provide complete student and bed space details.' });
      return;
    }

    const newRef = `HST-2026-00${allocations.length + 15}`;
    const targetRoom = rooms.find((r) => r.roomCode === newAllocRoomCode);
    const hallName = targetRoom ? targetRoom.blockName : 'Florence Nightingale Hall';
    const blockCode = targetRoom ? targetRoom.blockCode : 'FNH';

    const newAlc: BedAllocation = {
      id: `alc-0${allocations.length + 1}`,
      allocationRef: newRef,
      studentName: newAllocStudentName,
      matricNo: newAllocMatric,
      gender: newAllocGender,
      department: newAllocProgramme.includes('CHEW') ? 'Community Health' : 'Medical Laboratory Tech',
      level: '100L',
      blockCode,
      blockName: hallName,
      roomCode: newAllocRoomCode,
      bedSlot: newAllocBedSlot,
      keyTag: newAllocKeyTag,
      session: '2026/2027 Session',
      bursaryClearance: 'CLEARED',
      feeAmountKobo: 4500000,
      allocationDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      wardenNotes: 'Bursary hostel levy verified. Official bed space booked.',
    };

    setAllocations((prev) => [newAlc, ...prev]);

    // Update room occupancy
    setRooms((prev) =>
      prev.map((r) => {
        if (r.roomCode === newAllocRoomCode) {
          const newOccupied = r.occupied + 1;
          return {
            ...r,
            occupied: newOccupied,
            status: newOccupied >= r.capacity ? 'FULL' : 'AVAILABLE',
            occupants: [
              ...r.occupants,
              {
                bedSlot: newAllocBedSlot,
                studentName: newAllocStudentName,
                matricNo: newAllocMatric,
                programme: newAllocProgramme,
                level: '100L',
                phone: '+234 812 000 0000',
              },
            ],
          };
        }
        return r;
      })
    );

    recordAudit('HOSTEL_BED_ALLOCATED', 'HOSTEL_MGMT', newRef);
    showToast({
      type: 'success',
      title: 'Bed Space Allocated',
      message: `${newAlc.bedSlot} in ${newAlc.roomCode} assigned to ${newAlc.studentName}.`,
    });
    setIsAllocateModalOpen(false);
  };

  const handleCreateMaintenanceTicket = () => {
    if (!newMntDesc.trim()) {
      showToast({ type: 'warning', title: 'Description Required', message: 'Please describe the facility defect.' });
      return;
    }

    const newTicket: MaintenanceTicket = {
      id: `mnt-0${maintenanceTickets.length + 1}`,
      ticketNumber: `MNT-2026-04${maintenanceTickets.length + 5}`,
      blockName: newMntBlock,
      roomCode: newMntRoom,
      category: newMntCategory,
      description: newMntDesc.trim(),
      severity: newMntSeverity,
      reportedDate: new Date().toISOString().split('T')[0],
      reportedBy: 'Hall Warden Desk',
      assignedArtisan: newMntArtisan,
      status: 'PENDING',
      resolutionNotes: 'Ticket logged and dispatched to College Works Department.',
    };

    setMaintenanceTickets((prev) => [newTicket, ...prev]);
    recordAudit('MAINTENANCE_TICKET_LOGGED', 'HOSTEL_FACILITIES', newTicket.ticketNumber);
    showToast({
      type: 'success',
      title: 'Maintenance Request Logged',
      message: `Ticket ${newTicket.ticketNumber} registered for ${newTicket.roomCode}.`,
    });
    setIsMaintenanceModalOpen(false);
    setNewMntDesc('');
  };

  const handleResolveTicket = (ticketId: string) => {
    setMaintenanceTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'RESOLVED', resolutionNotes: 'Repairs completed and certified by College Works Inspector.' }
          : t
      )
    );
    recordAudit('MAINTENANCE_RESOLVED', 'HOSTEL_FACILITIES', ticketId);
    showToast({
      type: 'success',
      title: 'Ticket Marked Resolved',
      message: 'Facility repair work completed and inspected.',
    });
  };

  const handleConfirmCheckIn = () => {
    if (!selectedCheckInCandidate) return;

    const newCheckIn: CheckInRecord = {
      id: `chk-0${checkIns.length + 1}`,
      studentName: selectedCheckInCandidate.studentName,
      matricNo: selectedCheckInCandidate.matricNo,
      roomCode: selectedCheckInCandidate.roomCode,
      bedSlot: selectedCheckInCandidate.bedSlot,
      keyTag: selectedCheckInCandidate.keyTag,
      checkInDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      mattressIssued: true,
      wardrobeKeyIssued: true,
      inventorySigned: true,
      checkInStatus: 'CHECKED_IN',
      wardenRemarks: 'Official key and mattress issued. Inventory sign-off complete.',
    };

    setCheckIns((prev) => [
      newCheckIn,
      ...prev.filter((c) => c.matricNo !== selectedCheckInCandidate.matricNo),
    ]);

    setAllocations((prev) =>
      prev.map((a) => (a.id === selectedCheckInCandidate.id ? { ...a, status: 'ACTIVE' } : a))
    );

    recordAudit('HOSTEL_STUDENT_CHECKIN', 'HOSTEL_PORTER', selectedCheckInCandidate.matricNo);
    showToast({
      type: 'success',
      title: 'Student Checked In',
      message: `Room keys issued to ${selectedCheckInCandidate.studentName} for ${selectedCheckInCandidate.roomCode}.`,
    });
    setIsCheckInModalOpen(false);
    setSelectedCheckInCandidate(null);
  };

  /* ─── TABLE 1: ROOM INVENTORY COLUMNS ─── */
  const roomColumns = [
    {
      key: 'roomCode',
      header: 'Room Code',
      nowrap: true,
      render: (r: HostelRoom) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.roomCode}</span>
          <span className="text-[11px] text-slate-400">{r.floor}</span>
        </div>
      ),
    },
    {
      key: 'blockName',
      header: 'Hostel Hall & Gender',
      render: (r: HostelRoom) => (
        <div>
          <span className="font-semibold text-slate-900 block">{r.blockName}</span>
          <span className="text-[11px] text-slate-500 font-medium">
            {r.gender === 'FEMALE' ? 'Female Hall of Residence' : 'Male Hall of Residence'}
          </span>
        </div>
      ),
    },
    {
      key: 'roomType',
      header: 'Room Standard',
      nowrap: true,
      render: (r: HostelRoom) => (
        <span className="text-xs font-medium text-slate-700">
          {r.roomType === 'QUAD_4BED' ? 'Standard 4-Bed Quad' : r.roomType === 'DOUBLE_2BED' ? 'Double Room (2 Beds)' : 'Executive Single'}
        </span>
      ),
    },
    {
      key: 'occupancy',
      header: 'Capacity & Beds',
      align: 'center' as const,
      nowrap: true,
      render: (r: HostelRoom) => {
        const available = r.capacity - r.occupied;
        return (
          <div className="flex flex-col items-center">
            <span className="font-bold text-slate-900 text-xs">
              {r.occupied} / {r.capacity} Beds
            </span>
            <span className={`text-[11px] font-semibold ${available > 0 ? 'text-[#13A348]' : 'text-slate-400'}`}>
              {available > 0 ? `${available} Available` : 'Fully Occupied'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'amenities',
      header: 'Key Amenities',
      render: (r: HostelRoom) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {r.amenities.slice(0, 2).map((a, i) => (
            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-[4px] text-[10px] font-medium">
              {a}
            </span>
          ))}
          {r.amenities.length > 2 && (
            <span className="text-[10px] text-slate-400 font-semibold">+{r.amenities.length - 2} more</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      nowrap: true,
      render: (r: HostelRoom) => {
        if (r.status === 'UNDER_MAINTENANCE') {
          return <Badge variant="danger" size="sm">UNDER REPAIR</Badge>;
        }
        return r.status === 'AVAILABLE' ? (
          <Badge variant="success" size="sm">AVAILABLE</Badge>
        ) : (
          <Badge variant="neutral" size="sm">FULL</Badge>
        );
      },
    },
    {
      key: 'action',
      header: 'Actions',
      align: 'right' as const,
      nowrap: true,
      render: (r: HostelRoom) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSelectedRoomForDossier(r)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            className="whitespace-nowrap"
          >
            Occupants
          </Button>
          {!isStudent && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingRoom({ ...r });
                  setIsEditRoomOpen(true);
                }}
                leftIcon={<Edit2 className="w-3.5 h-3.5 text-slate-500" />}
                className="hover:text-slate-900"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDeleteRoomTarget(r);
                  setIsDeleteRoomOpen(true);
                }}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                className="hover:text-red-700 hover:bg-red-50"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  /* ─── TABLE 2: BED ALLOCATIONS COLUMNS ─── */
  const allocationColumns = [
    {
      key: 'allocationRef',
      header: 'Key / Allocation ID',
      nowrap: true,
      render: (a: BedAllocation) => (
        <div>
          <span className="font-bold text-[#0F7640] block">{a.allocationRef}</span>
          <span className="text-[11px] text-slate-500 font-medium">{a.keyTag}</span>
        </div>
      ),
    },
    {
      key: 'studentName',
      header: 'Student Trainee',
      render: (a: BedAllocation) => (
        <div>
          <span className="font-bold text-slate-900 block">{a.studentName}</span>
          <span className="text-[11px] text-slate-500 font-medium">
            {a.matricNo} • {a.department} ({a.level})
          </span>
        </div>
      ),
    },
    {
      key: 'roomCode',
      header: 'Hall & Bed Space',
      nowrap: true,
      render: (a: BedAllocation) => (
        <div>
          <span className="font-semibold text-slate-900 block">
            {a.roomCode} ({a.bedSlot})
          </span>
          <span className="text-[11px] text-slate-400">{a.blockName}</span>
        </div>
      ),
    },
    {
      key: 'bursaryClearance',
      header: 'Hostel Fee Clearance',
      align: 'center' as const,
      nowrap: true,
      render: (a: BedAllocation) => (
        <div className="flex flex-col items-center">
          <Badge variant={a.bursaryClearance === 'CLEARED' ? 'success' : 'danger'} size="sm">
            {a.bursaryClearance === 'CLEARED' ? 'CLEARED (₦45,000)' : 'PENDING PAYMENT'}
          </Badge>
          <span className="text-[10px] text-slate-400 mt-0.5">2026/2027 Session</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Allocation State',
      align: 'center' as const,
      nowrap: true,
      render: (a: BedAllocation) => {
        if (a.status === 'ACTIVE') return <Badge variant="success" size="sm">ACTIVE OCCUPANT</Badge>;
        if (a.status === 'PENDING_CHECKIN') return <Badge variant="warning" size="sm">PENDING KEY ISSUE</Badge>;
        return <Badge variant="neutral" size="sm">{a.status}</Badge>;
      },
    },
    {
      key: 'action',
      header: 'Hostel Gate Pass',
      align: 'right' as const,
      nowrap: true,
      render: (a: BedAllocation) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setSelectedAllocationForPass(a)}
          leftIcon={<Printer className="w-3.5 h-3.5" />}
          className="whitespace-nowrap"
        >
          Print Pass
        </Button>
      ),
    },
  ];

  /* ─── TABLE 3: CHECK-IN & CLEARANCE COLUMNS ─── */
  const checkInColumns = [
    {
      key: 'studentName',
      header: 'Student Name & Matric',
      render: (c: CheckInRecord) => (
        <div>
          <span className="font-bold text-slate-900 block">{c.studentName}</span>
          <span className="text-[11px] text-slate-500 font-medium">{c.matricNo}</span>
        </div>
      ),
    },
    {
      key: 'roomCode',
      header: 'Assigned Bed Space',
      nowrap: true,
      render: (c: CheckInRecord) => (
        <div>
          <span className="font-semibold text-slate-900 block">{c.roomCode} — {c.bedSlot}</span>
          <span className="text-[11px] text-slate-400">Tag: {c.keyTag}</span>
        </div>
      ),
    },
    {
      key: 'inventory',
      header: 'Mattress & Inventory',
      align: 'center' as const,
      nowrap: true,
      render: (c: CheckInRecord) => (
        <div className="flex items-center justify-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold ${c.mattressIssued ? 'bg-emerald-50 text-[#0F7640]' : 'bg-slate-100 text-slate-400'}`}>
            Mattress: {c.mattressIssued ? 'Issued' : 'Pending'}
          </span>
          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold ${c.inventorySigned ? 'bg-emerald-50 text-[#0F7640]' : 'bg-slate-100 text-slate-400'}`}>
            Inventory: {c.inventorySigned ? 'Signed' : 'Pending'}
          </span>
        </div>
      ),
    },
    {
      key: 'checkInDate',
      header: 'Check-in Time',
      nowrap: true,
      render: (c: CheckInRecord) => (
        <span className="text-xs text-slate-600 font-sans">{c.checkInDate}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      nowrap: true,
      render: (c: CheckInRecord) => (
        <Badge variant={c.checkInStatus === 'CHECKED_IN' ? 'success' : 'warning'} size="sm">
          {c.checkInStatus === 'CHECKED_IN' ? 'CHECKED IN' : 'AWAITING SIGN-OFF'}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right' as const,
      nowrap: true,
      render: (c: CheckInRecord) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            showToast({
              type: 'info',
              title: 'Asset Inspection Signed',
              message: `Official hostel custody verified for ${c.studentName}.`,
            });
          }}
          leftIcon={<Check className="w-3.5 h-3.5" />}
          className="whitespace-nowrap"
        >
          Verify Assets
        </Button>
      ),
    },
  ];

  /* ─── TABLE 4: MAINTENANCE COLUMNS ─── */
  const maintenanceColumns = [
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      nowrap: true,
      render: (m: MaintenanceTicket) => (
        <div>
          <span className="font-bold text-slate-900 block">{m.ticketNumber}</span>
          <span className="text-[11px] text-slate-400">{m.reportedDate}</span>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Room & Hall Block',
      nowrap: true,
      render: (m: MaintenanceTicket) => (
        <div>
          <span className="font-semibold text-slate-900 block">{m.roomCode}</span>
          <span className="text-[11px] text-slate-500">{m.blockName}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Trade & Fault Description',
      render: (m: MaintenanceTicket) => (
        <div>
          <span className="font-semibold text-slate-800 block text-xs">{m.category}</span>
          <span className="text-[11px] text-slate-600 line-clamp-1">{m.description}</span>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      align: 'center' as const,
      nowrap: true,
      render: (m: MaintenanceTicket) => {
        if (m.severity === 'CRITICAL') return <Badge variant="danger" size="sm">CRITICAL</Badge>;
        if (m.severity === 'HIGH') return <Badge variant="warning" size="sm">HIGH</Badge>;
        return <Badge variant="neutral" size="sm">{m.severity}</Badge>;
      },
    },
    {
      key: 'artisan',
      header: 'Assigned Technician',
      nowrap: true,
      render: (m: MaintenanceTicket) => (
        <span className="text-xs text-slate-700 font-medium">{m.assignedArtisan}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      nowrap: true,
      render: (m: MaintenanceTicket) => {
        if (m.status === 'RESOLVED') return <Badge variant="success" size="sm">RESOLVED</Badge>;
        if (m.status === 'IN_PROGRESS') return <Badge variant="warning" size="sm">IN PROGRESS</Badge>;
        return <Badge variant="neutral" size="sm">PENDING</Badge>;
      },
    },
    {
      key: 'action',
      header: 'Resolution',
      align: 'right' as const,
      nowrap: true,
      render: (m: MaintenanceTicket) => (
        m.status !== 'RESOLVED' ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleResolveTicket(m.id)}
            leftIcon={<Check className="w-3.5 h-3.5" />}
            className="whitespace-nowrap"
          >
            Mark Fixed
          </Button>
        ) : (
          <span className="text-[11px] text-[#13A348] font-bold">Closed</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── MODULE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel & Accommodation (HST)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            College Halls of Residence • Bed Space Allocation Engine • Check-In Registers • Facility Maintenance
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => setIsMaintenanceModalOpen(true)}
            leftIcon={<Wrench className="w-3.5 h-3.5 text-amber-600" />}
            className="whitespace-nowrap text-xs"
          >
            Report Defect
          </Button>
          {!isStudent && (
            <Button
              onClick={() => setIsAllocateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="whitespace-nowrap text-xs bg-[#0F7640] hover:bg-[#093322]"
            >
              Allocate Bed Space
            </Button>
          )}
        </div>
      </div>

      {/* ─── TOP STAT CARDS (VERTICAL STACKING, STRICT 4PX BORDER RADIUS) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Bed Capacity
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">480 Beds</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#0F7640] font-semibold">4 Residence Halls</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">120 Rooms</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Occupancy Rate
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">87.5%</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">420 Allocated</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">60 Available Beds</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hostel Fee Clearance
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">94.2%</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">396 Bursary Cleared</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">24 Fee Pending</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Repairs
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">4</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-amber-700 font-semibold">Active Workorders</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">1 Critical Wing, 3 Routine</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── NAVIGATION TABS ─── */}
      <Tabs
        tabs={
          isStudent
            ? [
                { id: 'allocations', label: 'My Bed Space Pass' },
                { id: 'inventory', label: 'My Room Details' },
                { id: 'maintenance', label: 'Maintenance & Repairs' },
              ]
            : [
                { id: 'inventory', label: 'Room Inventory' },
                { id: 'allocations', label: 'Bed Allocations' },
                { id: 'checkin', label: 'Check-In & Clearance' },
                { id: 'maintenance', label: 'Maintenance & Repairs' },
              ]
        }
        activeTab={activeTab}
        onChange={(id: any) => handleTabChange(id)}
      />

      {/* ─── TAB 1: ROOM INVENTORY ─── */}
      {activeTab === 'inventory' && (
        <Card>
          <Table
            columns={roomColumns}
            data={filteredRooms}
            keyExtractor={(r) => r.id}
            isDense={isDense}
            searchValue={roomSearch}
            onSearchChange={setRoomSearch}
            searchPlaceholder="Search room code, hall name, or occupant..."
            toolbarFilters={
              <>
                <div className="w-52">
                  <Select
                    value={hallFilter}
                    onChange={(val) => setHallFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Residence Halls' },
                      { value: 'FNH', label: 'Florence Nightingale (Female)' },
                      { value: 'MSH', label: 'Mary Seacole Hall (Female)' },
                      { value: 'SAF', label: 'Sir Alexander Fleming (Male)' },
                      { value: 'AKH', label: 'Aminu Kano Hall (Male)' },
                    ]}
                  />
                </div>
                <div className="w-44">
                  <Select
                    value={roomTypeFilter}
                    onChange={(val) => setRoomTypeFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Room Types' },
                      { value: 'QUAD_4BED', label: 'Standard 4-Bed Quad' },
                      { value: 'DOUBLE_2BED', label: 'Double Room (2-Bed)' },
                      { value: 'SINGLE_EXEC', label: 'Executive Single' },
                    ]}
                  />
                </div>
              </>
            }
            toolbarActions={
              !isStudent ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsAddRoomOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="bg-[#0F7640] hover:bg-[#093322]"
                >
                  Add Room
                </Button>
              ) : undefined
            }
          />
        </Card>
      )}

      {/* ─── TAB 2: BED ALLOCATIONS ─── */}
      {activeTab === 'allocations' && (
        <Card>
          <Table
            columns={allocationColumns}
            data={filteredAllocations}
            keyExtractor={(a) => a.id}
            isDense={isDense}
            searchValue={allocSearch}
            onSearchChange={setAllocSearch}
            searchPlaceholder="Search matric no, student name, or room code..."
            toolbarFilters={
              <>
                <div className="w-48">
                  <Select
                    value={allocHallFilter}
                    onChange={(val) => setAllocHallFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Halls' },
                      { value: 'FNH', label: 'Florence Nightingale' },
                      { value: 'MSH', label: 'Mary Seacole Hall' },
                      { value: 'SAF', label: 'Sir Alexander Fleming' },
                      { value: 'AKH', label: 'Aminu Kano Hall' },
                    ]}
                  />
                </div>
                <div className="w-44">
                  <Select
                    value={allocStatusFilter}
                    onChange={(val) => setAllocStatusFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Allocations' },
                      { value: 'ACTIVE', label: 'Active Occupants' },
                      { value: 'PENDING_CHECKIN', label: 'Pending Key Issue' },
                      { value: 'CHECKED_OUT', label: 'Checked Out' },
                    ]}
                  />
                </div>
              </>
            }
            toolbarActions={
              !isStudent ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsAddRoomOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="bg-[#0F7640] hover:bg-[#093322]"
                >
                  Add Room
                </Button>
              ) : undefined
            }
          />
        </Card>
      )}

      {/* ─── TAB 3: CHECK-IN & CLEARANCE ─── */}
      {activeTab === 'checkin' && (
        <Card>
          <Table
            columns={checkInColumns}
            data={filteredCheckIns}
            keyExtractor={(c) => c.id}
            isDense={isDense}
            searchValue={checkInSearch}
            onSearchChange={setCheckInSearch}
            searchPlaceholder="Search trainee name, matric no, or key tag..."
            toolbarFilters={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  showToast({
                    type: 'info',
                    title: 'Hall Warden Inspection',
                    message: 'Official custody audit logs synced with Student Affairs Division.',
                  });
                }}
                leftIcon={<UserCheck className="w-3.5 h-3.5 text-[#0F7640]" />}
                className="whitespace-nowrap"
              >
                Sync Porter Logs
              </Button>
            }
          />
        </Card>
      )}

      {/* ─── TAB 4: MAINTENANCE & REPAIRS ─── */}
      {activeTab === 'maintenance' && (
        <Card>
          <Table
            columns={maintenanceColumns}
            data={filteredMaintenance}
            keyExtractor={(m) => m.id}
            isDense={isDense}
            searchValue={maintenanceSearch}
            onSearchChange={setMaintenanceSearch}
            searchPlaceholder="Search defect ticket, room, or trade category..."
            toolbarFilters={
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Facilities Desk:</span>
                <span>Works Dept on-call for plumbing, solar, & power</span>
              </div>
            }
          />
        </Card>
      )}

      {/* ─── MODAL 1: ROOM SPECIFICATION & OCCUPANTS DOSSIER ─── */}
      <Modal
        isOpen={Boolean(selectedRoomForDossier)}
        onClose={() => setSelectedRoomForDossier(null)}
        title="Hostel Room Occupants Dossier"
        size="md"
      >
        {selectedRoomForDossier && (
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#0F7640] text-sm">{selectedRoomForDossier.roomCode}</span>
                <Badge variant={selectedRoomForDossier.status === 'AVAILABLE' ? 'success' : 'neutral'} size="sm">
                  {selectedRoomForDossier.status}
                </Badge>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{selectedRoomForDossier.blockName}</h3>
              <p className="text-slate-500 text-[11px]">
                {selectedRoomForDossier.floor} • {selectedRoomForDossier.gender === 'FEMALE' ? 'Female Residence' : 'Male Residence'} • Capacity: {selectedRoomForDossier.capacity} Beds ({selectedRoomForDossier.occupied} Occupied)
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                Current Assigned Occupants ({selectedRoomForDossier.occupants.length}):
              </span>
              {selectedRoomForDossier.occupants.length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-[4px]">
                  No active occupants assigned to this room.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedRoomForDossier.occupants.map((occ, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-[4px] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-[#0F7640] rounded-[4px] font-bold text-[10px]">
                            {occ.bedSlot}
                          </span>
                          <span className="font-bold text-slate-900">{occ.studentName}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {occ.matricNo} • {occ.programme} ({occ.level})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-600 font-semibold block">{occ.phone}</span>
                        <span className="text-[10px] text-[#13A348] font-bold">FEES CLEARED</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1">
              <span className="font-bold text-slate-900 block">Room Facilities & Certified Amenities:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedRoomForDossier.amenities.map((am, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded-[4px] text-[11px] font-medium text-slate-700">
                    ✓ {am}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setSelectedRoomForDossier(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  showToast({
                    type: 'info',
                    title: 'Roster Exported',
                    message: `Occupancy list for ${selectedRoomForDossier.roomCode} exported for Hall Matron.`,
                  });
                }}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="whitespace-nowrap"
              >
                Export Room Roster
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 2: PRINT OFFICIAL HOSTEL PASS ─── */}
      <Modal
        isOpen={Boolean(selectedAllocationForPass)}
        onClose={() => setSelectedAllocationForPass(null)}
        title="Official Student Hostel Accommodation Pass"
        size="lg"
      >
        {selectedAllocationForPass && (
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
                  className="w-14 h-14 mx-auto mb-2 rounded-[4px] object-contain shadow-xs"
                />
                <h2 className="text-base font-bold text-slate-900 tracking-wide uppercase">
                  {schoolProfile?.institutionName || 'Bethsaida College of Health Technology'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Division of Student Affairs & Directorate of Halls of Residence • {schoolProfile?.campusAddress || "Ogbomoso, Oyo State"}
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 rounded-[4px] text-xs font-bold text-[#0F7640] border border-emerald-200 uppercase">
                  OFFICIAL HOSTEL RESIDENT PASS • {schoolProfile?.activeSession || "2026/2027"} ACADEMIC SESSION
                </div>
              </div>

              {/* Resident Bio Data */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Trainee Name</span>
                  <span className="font-bold text-slate-900 text-sm block">{selectedAllocationForPass.studentName}</span>
                  <span className="text-slate-500 text-xs">
                    Matric: <strong className="text-slate-900">{selectedAllocationForPass.matricNo}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department & Level</span>
                  <span className="font-bold text-slate-900 text-xs block">{selectedAllocationForPass.department}</span>
                  <span className="text-slate-500 text-xs">{selectedAllocationForPass.level} Trainee</span>
                </div>
              </div>

              {/* Room & Bed Allocation Breakdown */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] my-4 grid grid-cols-3 gap-3 text-center">
                <div className="border-r border-slate-200 pr-2">
                  <span className="text-slate-400 text-[10px] block uppercase font-semibold">Hall of Residence</span>
                  <span className="font-bold text-slate-900 text-xs block">{selectedAllocationForPass.blockName}</span>
                  <span className="text-[10px] text-slate-500">{selectedAllocationForPass.gender} Wing</span>
                </div>
                <div className="border-r border-slate-200 pr-2">
                  <span className="text-slate-400 text-[10px] block uppercase font-semibold">Assigned Room & Bed</span>
                  <span className="font-extrabold text-[#0F7640] text-sm block">{selectedAllocationForPass.roomCode}</span>
                  <span className="font-semibold text-slate-700 text-xs">{selectedAllocationForPass.bedSlot}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-semibold">Room Key Tag</span>
                  <span className="font-bold text-slate-900 text-xs block">{selectedAllocationForPass.keyTag}</span>
                  <span className="text-[10px] text-[#13A348] font-semibold">Porter Tag Verified</span>
                </div>
              </div>

              {/* Bursary Clearance Stamp */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 uppercase block">Hostel Maintenance Levy:</span>
                  <span className="text-[11px] text-emerald-600">Double-entry verified by College Bursary</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#0F7640] block font-sans">
                    {formatNaira(selectedAllocationForPass.feeAmountKobo)} PAID
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase">OFFICIAL BURSARY RECEIPT CLEARED</span>
                </div>
              </div>

              {/* Hall Code of Conduct Pledge */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-900 block">Hostel Resident Terms & Security Pledge:</span>
                <p>1. Curfew is strictly 10:00 PM. Gate is locked by College Security and Porters.</p>
                <p>2. High-wattage heating coils, hot plates, and unauthorized electrical extensions are prohibited.</p>
                <p>3. Room keys must be returned to Hall Porter Lodge during semester vacations.</p>
              </div>

              {/* Official Signatures */}
              <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 items-end">
                <div>
                  <div className="w-28 border-b border-slate-700 mb-1"></div>
                  <span className="font-bold text-slate-900 text-xs block">Hall Warden / Matron</span>
                  <span className="text-[10px] text-slate-400">Directorate of Halls of Residence</span>
                </div>
                <div className="text-right">
                  <div className="w-28 border-b border-slate-700 ml-auto mb-1"></div>
                  <span className="font-bold text-slate-900 text-xs block">Dean of Student Affairs</span>
                  <span className="text-[10px] text-slate-400">{schoolProfile?.institutionName || "College of Health Technology"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setSelectedAllocationForPass(null)}>
                Close
              </Button>
              <Button
                onClick={() => window.print()}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
              >
                Print Resident Gate Pass
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 3: ALLOCATE BED SPACE WIZARD ─── */}
      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        title="Allocate Hostel Bed Space"
        size="md"
      >
        <div className="space-y-4 text-xs text-slate-800">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-slate-600">
            Assign eligible trainee to an available hostel bed space. Bursary accommodation fee clearance is automatically cross-referenced.
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Candidate Trainee (Matric & Name):</label>
            <Select
              value={newAllocMatric}
              onChange={(val) => {
                setNewAllocMatric(val);
                if (val === 'CHE/2026/0142') {
                  setNewAllocStudentName('Amina Yusuf');
                  setNewAllocGender('FEMALE');
                  setNewAllocProgramme('Community Health Extension Worker (CHEW)');
                  setNewAllocRoomCode('FNH-102');
                  setNewAllocBedSlot('Bed D');
                  setNewAllocKeyTag('KEY-FNH-102-D');
                } else if (val === 'MLT/2026/0143') {
                  setNewAllocStudentName('David Adeleke');
                  setNewAllocGender('MALE');
                  setNewAllocProgramme('Medical Laboratory Technician (MLT)');
                  setNewAllocRoomCode('SAF-102');
                  setNewAllocBedSlot('Bed B');
                  setNewAllocKeyTag('KEY-SAF-102-B');
                } else {
                  setNewAllocStudentName('Zainab Bello');
                  setNewAllocGender('FEMALE');
                  setNewAllocProgramme('Pharmacy Technician');
                  setNewAllocRoomCode('MSH-201');
                  setNewAllocBedSlot('Bed C');
                  setNewAllocKeyTag('KEY-MSH-201-C');
                }
              }}
              options={[
                { value: 'CHE/2026/0142', label: 'CHE/2026/0142 — Amina Yusuf (Community Health)' },
                { value: 'MLT/2026/0143', label: 'MLT/2026/0143 — David Adeleke (Medical Laboratory)' },
                { value: 'PHT/2026/0018', label: 'PHT/2026/0018 — Zainab Bello (Pharmacy Tech)' },
              ]}
            />
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#13A348]" />
              <span className="font-semibold text-emerald-800">Hostel Fee Clearance Status:</span>
            </div>
            <span className="font-bold text-[#13A348]">CLEARED (₦45,000 Verified)</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Target Room Code:</label>
              <Select
                value={newAllocRoomCode}
                onChange={(val) => setNewAllocRoomCode(val)}
                options={[
                  { value: 'FNH-102', label: 'FNH-102 — Florence Nightingale (1 Available)' },
                  { value: 'MSH-201', label: 'MSH-201 — Mary Seacole (2 Available)' },
                  { value: 'SAF-102', label: 'SAF-102 — Sir Alex Fleming (3 Available)' },
                  { value: 'AKH-201', label: 'AKH-201 — Aminu Kano (1 Available)' },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Bed Slot Designation:</label>
              <Select
                value={newAllocBedSlot}
                onChange={(val) => setNewAllocBedSlot(val)}
                options={[
                  { value: 'Bed A', label: 'Bed A (Lower Deck Left)' },
                  { value: 'Bed B', label: 'Bed B (Upper Deck Left)' },
                  { value: 'Bed C', label: 'Bed C (Lower Deck Right)' },
                  { value: 'Bed D', label: 'Bed D (Upper Deck Right)' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Room Key Tag Identifier:</label>
            <input
              type="text"
              value={newAllocKeyTag}
              onChange={(e) => setNewAllocKeyTag(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsAllocateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCommitAllocation} className="bg-[#0F7640] hover:bg-[#093322]">
              Confirm Bed Space Allocation
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 4: REPORT MAINTENANCE DEFECT ─── */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title="Report Hostel Facility Defect"
        size="md"
      >
        <div className="space-y-4 text-xs text-slate-800">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-[4px] text-amber-800">
            Log facility repairs for plumbing, electrical wiring, solar inverters, or structural items. Tickets are routed to the College Works Department.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Residence Hall Block:</label>
              <Select
                value={newMntBlock}
                onChange={(val) => setNewMntBlock(val)}
                options={[
                  { value: 'Florence Nightingale Hall', label: 'Florence Nightingale Hall' },
                  { value: 'Mary Seacole Hall', label: 'Mary Seacole Hall' },
                  { value: 'Sir Alexander Fleming Hall', label: 'Sir Alexander Fleming Hall' },
                  { value: 'Aminu Kano Hall', label: 'Aminu Kano Hall' },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Room Number:</label>
              <Select
                value={newMntRoom}
                onChange={(val) => setNewMntRoom(val)}
                options={[
                  { value: 'FNH-101', label: 'FNH-101' },
                  { value: 'FNH-102', label: 'FNH-102' },
                  { value: 'MSH-201', label: 'MSH-201' },
                  { value: 'SAF-101', label: 'SAF-101' },
                  { value: 'AKH-201', label: 'AKH-201' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Trade / Issue Category:</label>
              <Select
                value={newMntCategory}
                onChange={(val) => setNewMntCategory(val as any)}
                options={[
                  { value: 'Plumbing', label: 'Plumbing & Drainage' },
                  { value: 'Electrical', label: 'Electrical & Lighting' },
                  { value: 'Solar Power / Inverter', label: 'Solar Power / Inverter' },
                  { value: 'Water Supply', label: 'Borehole / Water Supply' },
                  { value: 'Structural / Joinery', label: 'Doors, Locks & Windows' },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Urgency / Severity:</label>
              <Select
                value={newMntSeverity}
                onChange={(val) => setNewMntSeverity(val as any)}
                options={[
                  { value: 'CRITICAL', label: 'Critical (Immediate Hazard)' },
                  { value: 'HIGH', label: 'High Priority' },
                  { value: 'NORMAL', label: 'Normal' },
                  { value: 'LOW', label: 'Low / Routine' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Detailed Fault Description:</label>
            <textarea
              rows={3}
              placeholder="Describe the nature of the damage or defect..."
              value={newMntDesc}
              onChange={(e) => setNewMntDesc(e.target.value)}
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Assigned Artisan / Department:</label>
            <input
              type="text"
              value={newMntArtisan}
              onChange={(e) => setNewMntArtisan(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsMaintenanceModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMaintenanceTicket} className="bg-[#0F7640] hover:bg-[#093322]">
              Dispatch Maintenance Ticket
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL: ADD HOSTEL ROOM ─── */}
      <Modal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        title="Add Residence Room"
        description="Add a new room to the college hostel inventory."
        size="md"
      >
        <form onSubmit={handleAddRoom} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Room Code"
              placeholder="e.g. FNH-105 or SAF-204"
              value={newRoomForm.roomCode}
              onChange={(e) => setNewRoomForm({ ...newRoomForm, roomCode: e.target.value })}
              required
            />
            <Select
              label="Hall of Residence"
              options={[
                { value: 'FNH', label: 'Florence Nightingale Hall (Female)' },
                { value: 'MSH', label: 'Mary Seacole Hall (Female)' },
                { value: 'SAF', label: 'Sir Alexander Fleming Hall (Male)' },
                { value: 'AKH', label: 'Aminu Kano Hall (Male)' },
              ]}
              value={newRoomForm.blockCode}
              onChange={(val) => setNewRoomForm({ ...newRoomForm, blockCode: val as any })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Floor Level"
              options={[
                { value: 'Ground Floor', label: 'Ground Floor' },
                { value: '1st Floor', label: '1st Floor' },
                { value: '2nd Floor', label: '2nd Floor' },
              ]}
              value={newRoomForm.floor}
              onChange={(val) => setNewRoomForm({ ...newRoomForm, floor: val })}
            />
            <Select
              label="Room Type"
              options={[
                { value: 'QUAD_4BED', label: 'Standard 4-Bed Quad' },
                { value: 'DOUBLE_2BED', label: 'Double Room (2-Bed)' },
                { value: 'SINGLE_EXEC', label: 'Executive Single' },
              ]}
              value={newRoomForm.roomType}
              onChange={(val) => {
                const cap = val === 'QUAD_4BED' ? 4 : val === 'DOUBLE_2BED' ? 2 : 1;
                setNewRoomForm({ ...newRoomForm, roomType: val as any, capacity: cap });
              }}
            />
            <Input
              label="Bed Capacity"
              type="number"
              value={String(newRoomForm.capacity)}
              onChange={(e) => setNewRoomForm({ ...newRoomForm, capacity: Number(e.target.value) || 1 })}
              required
            />
          </div>

          <div>
            <Input
              label="Key Amenities (Comma-separated)"
              placeholder="e.g. 24/7 Solar Inverter, Ensuite Bathroom, Study Carrel"
              value={newRoomForm.amenities}
              onChange={(e) => setNewRoomForm({ ...newRoomForm, amenities: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsAddRoomOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
              Create Room
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL: EDIT HOSTEL ROOM ─── */}
      <Modal
        isOpen={isEditRoomOpen && !!editingRoom}
        onClose={() => {
          setIsEditRoomOpen(false);
          setEditingRoom(null);
        }}
        title={`Edit Room: ${editingRoom?.roomCode || ''}`}
        description="Update room capacity, floor level, standard, or repair status."
        size="md"
      >
        {editingRoom && (
          <form onSubmit={handleUpdateRoom} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Room Code"
                value={editingRoom.roomCode}
                onChange={(e) => setEditingRoom({ ...editingRoom, roomCode: e.target.value })}
                required
              />
              <Select
                label="Floor Level"
                options={[
                  { value: 'Ground Floor', label: 'Ground Floor' },
                  { value: '1st Floor', label: '1st Floor' },
                  { value: '2nd Floor', label: '2nd Floor' },
                ]}
                value={editingRoom.floor}
                onChange={(val) => setEditingRoom({ ...editingRoom, floor: val })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Operational Status"
                options={[
                  { value: 'AVAILABLE', label: 'Available for Allocation' },
                  { value: 'FULL', label: 'Full (At Capacity)' },
                  { value: 'UNDER_MAINTENANCE', label: 'Under Repair / Maintenance' },
                ]}
                value={editingRoom.status}
                onChange={(val) => setEditingRoom({ ...editingRoom, status: val as any })}
              />
              <Input
                label="Total Capacity"
                type="number"
                value={String(editingRoom.capacity)}
                onChange={(e) => setEditingRoom({ ...editingRoom, capacity: Number(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditRoomOpen(false);
                  setEditingRoom(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ─── MODAL: DELETE ROOM CONFIRMATION ─── */}
      <Modal
        isOpen={isDeleteRoomOpen && !!deleteRoomTarget}
        onClose={() => {
          setIsDeleteRoomOpen(false);
          setDeleteRoomTarget(null);
        }}
        title="Remove Hostel Room"
        description="Are you sure you want to remove this room from the hostel directory?"
        size="sm"
      >
        <div className="space-y-4 text-xs font-sans">
          <p className="text-slate-600">
            Deleting room <span className="font-bold text-slate-900">{deleteRoomTarget?.roomCode}</span> in{' '}
            <span className="font-semibold text-slate-800">{deleteRoomTarget?.blockName}</span> will permanently remove it from the college hostel inventory.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteRoomOpen(false);
                setDeleteRoomTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteRoom}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
