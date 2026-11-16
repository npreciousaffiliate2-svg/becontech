import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { useSharedRecords } from '../lib/sharedRecords.ts';
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
  MessageSquare,
  Send,
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Phone,
  Mail,
  Users,
  Filter,
  Search,
  Plus,
  Eye,
  Printer,
  Download,
  Sparkles,
  RefreshCw,
  Zap,
  Clock,
  ShieldCheck,
  Check,
  FileText,
  Radio,
} from 'lucide-react';
import { formatNaira } from '@campusone/contracts';
import { escapeHtml, printInstitutionalDocument } from '../utils/documentExport.ts';

/* ─── TYPE DEFINITIONS ─── */
export type ChannelType = 'SMS_AND_INAPP' | 'SMS_ONLY' | 'EMAIL_ONLY' | 'INAPP_ONLY';
export type AudienceType =
  | 'ALL_STUDENTS'
  | 'CHEW_200L'
  | 'MLT_200L'
  | 'PHT_200L'
  | 'DEBTORS_ONLY'
  | 'CLINICAL_POSTING_TRAINEES'
  | 'ALL_FACULTY'
  | 'SPONSORS';
export type NoticePriority = 'EMERGENCY' | 'STATUTORY_DIRECTIVE' | 'EXAM_NOTICE' | 'GENERAL_MEMO';
export type DeliveryStatus = 'DELIVERED' | 'QUEUED' | 'SENT' | 'FAILED_DND';

export interface BroadcastBatch {
  id: string;
  batchRef: string;
  title: string;
  channel: ChannelType;
  audience: AudienceType;
  recipientCount: number;
  messagePreview: string;
  dispatchedAt: string;
  dispatchedBy: string;
  deliveryRate: string;
  costKobo: number;
}

export interface OfficialNotice {
  id: string;
  memoRef: string;
  title: string;
  priority: NoticePriority;
  category: 'Academic' | 'Clinical Posting' | 'Bursary' | 'Holidays & Resumption' | 'General';
  targetAudience: string;
  publishedDate: string;
  signedBy: string;
  bodyContent: string;
  pinned: boolean;
  viewsCount: number;
}

export interface DeliveryLogItem {
  id: string;
  dispatchId: string;
  recipientName: string;
  recipientContact: string;
  recipientRole: string;
  channel: 'SMS' | 'Email' | 'In-App Portal';
  messageSummary: string;
  status: DeliveryStatus;
  gatewayResponse: string;
  timestamp: string;
}

export interface NotificationTrigger {
  id: string;
  eventKey: string;
  eventName: string;
  description: string;
  channels: string[];
  active: boolean;
  templatePreview: string;
  lastTriggered: string;
  lifetimeCount: number;
}

export const CommunicationsView: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { session, isDense, recordAudit, schoolProfile, addNotification } = useApp();
  const isStaff = session.activeRole !== 'STU' && session.activeRole !== 'SPON';
  const isStudent = !isStaff;
  const { showToast } = useToast();

  /* ─── TAB ROUTING STATE ─── */
  const validTabs = isStaff
    ? ['broadcasts', 'notices', 'logs', 'triggers']
    : ['notices'];
  const activeTab = tab && validTabs.includes(tab) ? tab : isStaff ? 'broadcasts' : 'notices';

  const handleTabChange = (newTab: string) => {
    navigate(`/messages/${newTab}`);
  };

  /* ─── DATA STATES ─── */
  const [broadcasts, setBroadcasts] = useSharedRecords<BroadcastBatch>('comms.broadcasts', [
    {
      id: 'bat-01',
      batchRef: 'BCST-2026-0089',
      title: 'Clinical Hospital Posting Orientation Call-Up',
      channel: 'SMS_AND_INAPP',
      audience: 'CLINICAL_POSTING_TRAINEES',
      recipientCount: 640,
      messagePreview: 'Bethsaida CHT: Orientation for clinical hospital postings commences Monday 24 Nov at Main Auditorium. Full clearance docket required.',
      dispatchedAt: '2026-11-12 09:15',
      dispatchedBy: 'Dr. Timothy Balogun (Provost)',
      deliveryRate: '99.4%',
      costKobo: 256000,
    },
    {
      id: 'bat-02',
      batchRef: 'BCST-2026-0088',
      title: 'Semester Exam Docket Collection',
      channel: 'SMS_AND_INAPP',
      audience: 'CHEW_200L',
      recipientCount: 124,
      messagePreview: 'Bethsaida CHT: Official exam dockets for CHEW 200L are ready for collection at Academic Office. 75% attendance rule applies.',
      dispatchedAt: '2026-11-10 14:30',
      dispatchedBy: 'Academic Secretary',
      deliveryRate: '100.0%',
      costKobo: 49600,
    },
    {
      id: 'bat-03',
      batchRef: 'BCST-2026-0087',
      title: 'Hostel Maintenance Levy Final Reminder',
      channel: 'SMS_ONLY',
      audience: 'DEBTORS_ONLY',
      recipientCount: 142,
      messagePreview: 'Bethsaida CHT Bursary: Overdue hostel levy must be settled within 48 hours to avoid room key revocation. Pay via portal Remita.',
      dispatchedAt: '2026-11-08 11:00',
      dispatchedBy: 'College Bursar',
      deliveryRate: '97.9%',
      costKobo: 56800,
    },
    {
      id: 'bat-04',
      batchRef: 'BCST-2026-0086',
      title: 'Regulatory Board MLSCN Council Visit Notice',
      channel: 'EMAIL_ONLY',
      audience: 'ALL_FACULTY',
      recipientCount: 44,
      messagePreview: 'Notice of statutory accreditation peer review by Medical Laboratory Science Council of Nigeria scheduled for next week.',
      dispatchedAt: '2026-11-05 16:45',
      dispatchedBy: 'Dr. Timothy Balogun (Provost)',
      deliveryRate: '100.0%',
      costKobo: 0,
    },
  ]);

  const [notices, setNotices] = useSharedRecords<OfficialNotice>('comms.notices', [
    {
      id: 'not-01',
      memoRef: 'BCHT/CIR/2026/044',
      title: 'Clinical Hospital Posting Protocols & Fee Clearance Gate',
      priority: 'STATUTORY_DIRECTIVE',
      category: 'Clinical Posting',
      targetAudience: 'All 200L & 300L Clinical Trainees (CHEW, MLT, Pharmacy Tech)',
      publishedDate: '2026-11-12',
      signedBy: 'Dr. Timothy Balogun (Provost) & Mrs. T. Adeleke (Academic Secretary)',
      bodyContent: 'In compliance with statutory requirements of the Community Health Practitioners Registration Board of Nigeria (CHPRBN) and the Medical Laboratory Science Council of Nigeria (MLSCN), all trainees scheduled for hospital rotations must present their authenticated Clinical Posting Pass, Hepatitis B immunization certificate, and Bursary clearance slip to the Clinical Preceptor upon arrival at designated primary healthcare centers and state general hospitals.',
      pinned: true,
      viewsCount: 842,
    },
    {
      id: 'not-02',
      memoRef: 'BCHT/CIR/2026/043',
      title: 'Strict Enforcement of 75% Lecture Attendance for Semester Examination Docket Eligibility',
      priority: 'EXAM_NOTICE',
      category: 'Academic',
      targetAudience: 'All Enrolled Students & Department Heads',
      publishedDate: '2026-11-10',
      signedBy: 'Mrs. T. Adeleke (Registrar & Academic Secretary)',
      bodyContent: 'The College Academic Board hereby reiterates that any trainee who fails to attain the mandatory 75% lecture and laboratory attendance threshold in any course will be barred from writing the semester examinations. Automated biometric attendance registers from the CampusOne platform will serve as the sole authoritative record for examination clearance.',
      pinned: true,
      viewsCount: 1105,
    },
    {
      id: 'not-03',
      memoRef: 'BCHT/CIR/2026/042',
      title: 'Hostel Curfew & Electrical Appliances Safety Directive',
      priority: 'EMERGENCY',
      category: 'General',
      targetAudience: 'All Hostel Residents (Florence Nightingale, Mary Seacole, Fleming, Aminu Kano)',
      publishedDate: '2026-11-06',
      signedBy: 'Directorate of Halls of Residence & College Works Department',
      bodyContent: 'Notice is hereby given that the use of high-voltage boiling rings, hot plates, and unapproved electrical extension sockets is strictly prohibited across all student hostels. Routine inspections will be conducted by Hall Wardens, and confiscated items will be destroyed without refund. Hostel gates are locked at 10:00 PM promptly.',
      pinned: false,
      viewsCount: 620,
    },
    {
      id: 'not-04',
      memoRef: 'BCHT/CIR/2026/041',
      title: 'Semester Fee Installment Window Deadlines',
      priority: 'GENERAL_MEMO',
      category: 'Bursary',
      targetAudience: 'All Students & Registered Sponsors',
      publishedDate: '2026-11-02',
      signedBy: 'College Bursar & Internal Audit Desk',
      bodyContent: 'All students with pending second installment fee balances are advised to complete their payments via the automated Remita or Paystack gateways on the student portal before Friday 21 November 2026 to ensure unrestricted examination gate clearance.',
      pinned: false,
      viewsCount: 940,
    },
  ]);

  const [deliveryLogs, setDeliveryLogs] = useSharedRecords<DeliveryLogItem>('comms.logs', [
    {
      id: 'log-01',
      dispatchId: 'MSG-2026-9812',
      recipientName: 'Blessing Adeyemi',
      recipientContact: '+234 803 124 5510',
      recipientRole: 'Community Health 200L',
      channel: 'SMS',
      messageSummary: 'Clinical Posting orientation notice dispatched via Termii.',
      status: 'DELIVERED',
      gatewayResponse: '200 OK • Delivered via MTN Nigeria',
      timestamp: '2026-11-12 09:16:04',
    },
    {
      id: 'log-02',
      dispatchId: 'MSG-2026-9813',
      recipientName: 'Oluwaseun Bakare',
      recipientContact: '+234 802 113 4455',
      recipientRole: 'Community Health 200L',
      channel: 'SMS',
      messageSummary: 'Clinical Posting orientation notice dispatched via Termii.',
      status: 'DELIVERED',
      gatewayResponse: '200 OK • Delivered via Airtel NG',
      timestamp: '2026-11-12 09:16:05',
    },
    {
      id: 'log-03',
      dispatchId: 'MSG-2026-9814',
      recipientName: 'Fatima Ibrahim',
      recipientContact: '+234 802 998 1234',
      recipientRole: 'Community Health 200L',
      channel: 'SMS',
      messageSummary: 'Clinical Posting orientation notice dispatched via Termii.',
      status: 'DELIVERED',
      gatewayResponse: '200 OK • Delivered via Globacom',
      timestamp: '2026-11-12 09:16:05',
    },
    {
      id: 'log-04',
      dispatchId: 'MSG-2026-9815',
      recipientName: 'Chinedu Eze',
      recipientContact: '+234 805 667 7889',
      recipientRole: 'Community Health 200L',
      channel: 'SMS',
      messageSummary: 'Hostel levy reminder message.',
      status: 'DELIVERED',
      gatewayResponse: '200 OK • Route Tier-1 DND Bypassed',
      timestamp: '2026-11-12 09:16:06',
    },
    {
      id: 'log-05',
      dispatchId: 'MSG-2026-9816',
      recipientName: 'Tunde Olatunji',
      recipientContact: '+234 808 990 1122',
      recipientRole: 'Medical Laboratory 200L',
      channel: 'SMS',
      messageSummary: 'MLT 204 laboratory session scheduled.',
      status: 'DELIVERED',
      gatewayResponse: '200 OK • Delivered via 9mobile',
      timestamp: '2026-11-12 09:16:06',
    },
    {
      id: 'log-06',
      dispatchId: 'MSG-2026-9817',
      recipientName: 'Dr. Kehinde Bello',
      recipientContact: 'hod.che@bethsaida.edu.ng',
      recipientRole: 'Faculty (HOD Community Health)',
      channel: 'Email',
      messageSummary: 'Council peer review briefing memo.',
      status: 'DELIVERED',
      gatewayResponse: '250 OK • Delivered via SendGrid SMTP',
      timestamp: '2026-11-12 09:16:07',
    },
  ]);

  const [triggers, setTriggers] = useSharedRecords<NotificationTrigger>('comms.triggers', [
    {
      id: 'trg-01',
      eventKey: 'BURSARY_PAYMENT_SETTLED',
      eventName: 'Bursary Fee Receipt Issued',
      description: 'Automatically triggers instant official receipt notification to student and registered sponsor when online or bank settlement clears.',
      channels: ['SMS', 'Email', 'In-App Portal'],
      active: true,
      templatePreview: 'Bethsaida CHT: Payment of ₦{amount} received for {matricNo}. Receipt: {receiptNo}. View at portal.becohtech.edu.ng.',
      lastTriggered: '10 mins ago',
      lifetimeCount: 1420,
    },
    {
      id: 'trg-02',
      eventKey: 'EXAM_CLEARANCE_DOCKET_READY',
      eventName: 'Exam Docket Clearance Pass',
      description: 'Notifies trainee when attendance threshold (≥75%) and bursary fee requirements are confirmed, unlocking the printable examination docket.',
      channels: ['SMS', 'In-App Portal'],
      active: true,
      templatePreview: 'Official College Alert: Congratulations {name}! Your examination docket is cleared. Print your docket now from your student portal.',
      lastTriggered: '2 hours ago',
      lifetimeCount: 890,
    },
    {
      id: 'trg-03',
      eventKey: 'CLINICAL_POSTING_SCHEDULED',
      eventName: 'Clinical Hospital Rotation Call-Up',
      description: 'Dispatches clinical posting assignment details, designated hospital facility, and preceptor contact to assigned trainee.',
      channels: ['SMS', 'Email', 'In-App Portal'],
      active: true,
      templatePreview: 'Bethsaida CHT: You have been assigned to {hospitalName} for {department} clinical posting starting {startDate}. Preceptor: {preceptor}.',
      lastTriggered: 'Yesterday',
      lifetimeCount: 640,
    },
    {
      id: 'trg-04',
      eventKey: 'FEE_INSTALLMENT_OVERDUE',
      eventName: 'Overdue Installment Alert',
      description: 'Dispatches automated payment reminder 7 days before semester fee deadline to avoid examination barring.',
      channels: ['SMS', 'Email'],
      active: true,
      templatePreview: 'Bethsaida CHT Reminder: Your outstanding tuition balance of ₦{balance} is due on {dueDate}. Pay online to avoid bursary hold.',
      lastTriggered: '3 days ago',
      lifetimeCount: 420,
    },
    {
      id: 'trg-05',
      eventKey: 'EMERGENCY_CAMPUS_ALERT',
      eventName: 'Emergency Campus Security Broadcast',
      description: 'Immediate high-priority SMS broadcast to all active staff and student phone numbers across all mobile networks.',
      channels: ['SMS', 'In-App Portal'],
      active: true,
      templatePreview: 'BETHSAIDA CHT EMERGENCY: {alertText}. Follow security warden instructions immediately.',
      lastTriggered: '2 months ago',
      lifetimeCount: 12,
    },
  ]);

  /* ─── COMPOSER FORM STATES ─── */
  const [broadcastTitle, setBroadcastTitle] = useState('Official College Academic Notice');
  const [targetAudience, setTargetAudience] = useState<AudienceType>('ALL_STUDENTS');
  const [deliveryChannel, setDeliveryChannel] = useState<ChannelType>('SMS_AND_INAPP');
  const [messageText, setMessageText] = useState(
    'College Notice: All students are advised that clinical posting allocations and examination clearance schedules are now published on the student portal. Office of the Registrar.'
  );

  /* ─── SEARCH & FILTER STATES ─── */
  const [batchSearch, setBatchSearch] = useState('');
  const [noticeSearch, setNoticeSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL');

  /* ─── MODAL STATES ─── */
  const [isNewNoticeModalOpen, setIsNewNoticeModalOpen] = useState(false);
  const [selectedNoticeForView, setSelectedNoticeForView] = useState<OfficialNotice | null>(null);
  const [editingNotice, setEditingNotice] = useState<OfficialNotice | null>(null);
  const [isEditNoticeOpen, setIsEditNoticeOpen] = useState(false);
  const [deletingNotice, setDeletingNotice] = useState<OfficialNotice | null>(null);
  const [isDeleteNoticeOpen, setIsDeleteNoticeOpen] = useState(false);

  /* ─── FORM STATES: NEW NOTICE ─── */
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticePriority, setNewNoticePriority] = useState<NoticePriority>('GENERAL_MEMO');
  const [newNoticeCategory, setNewNoticeCategory] = useState<'Academic' | 'Clinical Posting' | 'Bursary' | 'Holidays & Resumption' | 'General'>('Academic');
  const [newNoticeAudience, setNewNoticeAudience] = useState('All Registered Students & Faculty');
  const [newNoticeBody, setNewNoticeBody] = useState('');

  /* ─── RECIPIENT COUNT CALCULATOR ─── */
  const audienceCount = useMemo(() => {
    switch (targetAudience) {
      case 'ALL_STUDENTS':
        return 1248;
      case 'CHEW_200L':
        return 124;
      case 'MLT_200L':
        return 110;
      case 'PHT_200L':
        return 95;
      case 'DEBTORS_ONLY':
        return 142;
      case 'CLINICAL_POSTING_TRAINEES':
        return 640;
      case 'ALL_FACULTY':
        return 44;
      case 'SPONSORS':
        return 640;
      default:
        return 1248;
    }
  }, [targetAudience]);

  /* ─── SMS BILLING ESTIMATOR ─── */
  const smsSegments = Math.ceil(Math.max(1, messageText.length) / 160);
  const estimatedCostKobo = audienceCount * smsSegments * 400; // ₦4.00 per SMS segment

  /* ─── FILTERED LISTS ─── */
  const filteredBroadcasts = broadcasts.filter((b) => {
    if (batchSearch.trim()) {
      const q = batchSearch.toLowerCase();
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchRef = b.batchRef.toLowerCase().includes(q);
      const matchPrev = b.messagePreview.toLowerCase().includes(q);
      if (!matchTitle && !matchRef && !matchPrev) return false;
    }
    return true;
  });

  const filteredNotices = notices.filter((n) => {
    if (noticeSearch.trim()) {
      const q = noticeSearch.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchRef = n.memoRef.toLowerCase().includes(q);
      const matchCat = n.category.toLowerCase().includes(q);
      if (!matchTitle && !matchRef && !matchCat) return false;
    }
    return true;
  });

  const filteredLogs = deliveryLogs.filter((l) => {
    if (channelFilter !== 'ALL' && l.channel !== channelFilter) return false;
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      const matchName = l.recipientName.toLowerCase().includes(q);
      const matchContact = l.recipientContact.toLowerCase().includes(q);
      const matchId = l.dispatchId.toLowerCase().includes(q);
      if (!matchName && !matchContact && !matchId) return false;
    }
    return true;
  });

  /* ─── ACTION HANDLERS ─── */
  const handleDispatchBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      showToast({ type: 'warning', title: 'Empty Message', message: 'Please enter message content before dispatching.' });
      return;
    }

    const newBatch: BroadcastBatch = {
      id: `bat-0${broadcasts.length + 1}`,
      batchRef: `BCST-2026-00${broadcasts.length + 90}`,
      title: broadcastTitle.trim() || 'Official College Broadcast',
      channel: deliveryChannel,
      audience: targetAudience,
      recipientCount: audienceCount,
      messagePreview: messageText.trim(),
      dispatchedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      dispatchedBy: session.fullName || 'College officer',
      deliveryRate: deliveryChannel === 'INAPP_ONLY' ? 'In-app notice saved' : 'Not sent',
      costKobo: 0,
    };

    setBroadcasts((prev) => [newBatch, ...prev]);
    if (deliveryChannel === 'INAPP_ONLY' || deliveryChannel === 'SMS_AND_INAPP') {
      void addNotification({
        collegeId: 'bethsaida',
        title: newBatch.title,
        desc: newBatch.messagePreview,
        type: 'info',
        link: '/messages',
      });
    }
    recordAudit('BROADCAST_DISPATCHED', 'COM_BROADCAST', newBatch.batchRef, {
      audience: targetAudience,
      count: audienceCount,
      channel: deliveryChannel,
    });

    const external = deliveryChannel !== 'INAPP_ONLY';
    showToast({
      type: external ? 'warning' : 'success',
      title: external ? 'Notice saved' : 'Notice published',
      message: external
        ? 'The notice is in the college register. Email and SMS were not sent because no live gateway is configured.'
        : `In-app notice saved for ${audienceCount} recipients.`,
    });
  };

  const handlePublishNotice = () => {
    if (!newNoticeTitle.trim() || !newNoticeBody.trim()) {
      showToast({ type: 'warning', title: 'Missing Information', message: 'Notice title and memo body are required.' });
      return;
    }

    const newNotice: OfficialNotice = {
      id: `not-0${notices.length + 1}`,
      memoRef: `BCHT/CIR/2026/0${notices.length + 45}`,
      title: newNoticeTitle.trim(),
      priority: newNoticePriority,
      category: newNoticeCategory,
      targetAudience: newNoticeAudience.trim() || 'All Registered Students & Faculty',
      publishedDate: new Date().toISOString().split('T')[0],
      signedBy: 'Dr. Timothy Balogun (Provost) & Mrs. T. Adeleke (Academic Secretary)',
      bodyContent: newNoticeBody.trim(),
      pinned: false,
      viewsCount: 1,
    };

    setNotices((prev) => [newNotice, ...prev]);
    recordAudit('OFFICIAL_NOTICE_PUBLISHED', 'ACADEMIC_CIRCULAR', newNotice.memoRef);
    if (addNotification) {
      addNotification({
        collegeId: 'bethsaida',
        title: `Circular: ${newNotice.title}`,
        desc: newNotice.bodyContent,
        type: 'info',
        link: '/communications?tab=notices',
      });
    }
    showToast({
      type: 'success',
      title: 'Notice Published to Portal',
      message: `Circular ${newNotice.memoRef} is now live on digital bulletin boards.`,
    });
    setIsNewNoticeModalOpen(false);
    setNewNoticeTitle('');
    setNewNoticeBody('');
  };

  const handleSaveEditNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice) return;
    setNotices((prev) =>
      prev.map((n) => (n.id === editingNotice.id ? { ...editingNotice } : n))
    );
    if (selectedNoticeForView?.id === editingNotice.id) {
      setSelectedNoticeForView({ ...editingNotice });
    }
    recordAudit('CIRCULAR_NOTICE_UPDATED', 'COMMUNICATION_DISPATCH', editingNotice.memoRef, {
      title: editingNotice.title,
    });
    setIsEditNoticeOpen(false);
    setEditingNotice(null);
    showToast({
      type: 'success',
      title: 'Circular Updated',
      message: `Notice "${editingNotice.title}" has been updated.`,
    });
  };

  const handleConfirmDeleteNotice = () => {
    if (!deletingNotice) return;
    setNotices((prev) => prev.filter((n) => n.id !== deletingNotice.id));
    if (selectedNoticeForView?.id === deletingNotice.id) {
      setSelectedNoticeForView(null);
    }
    recordAudit('CIRCULAR_NOTICE_ARCHIVED', 'COMMUNICATION_DISPATCH', deletingNotice.memoRef, {
      title: deletingNotice.title,
    });
    setIsDeleteNoticeOpen(false);
    setDeletingNotice(null);
    showToast({
      type: 'info',
      title: 'Circular Archived',
      message: `Notice "${deletingNotice.title}" has been archived.`,
    });
  };

  const handleToggleTrigger = (triggerId: string) => {
    setTriggers((prev) =>
      prev.map((t) => (t.id === triggerId ? { ...t, active: !t.active } : t))
    );
    showToast({
      type: 'info',
      title: 'Trigger Status Updated',
      message: 'Automated notification workflow state toggled.',
    });
  };

  /* ─── TABLE 1: BROADCAST HISTORY COLUMNS ─── */
  const broadcastColumns = [
    {
      key: 'batchRef',
      header: 'Batch ID & Title',
      render: (b: BroadcastBatch) => (
        <div>
          <span className="font-bold text-[#0F7640] block">{b.batchRef}</span>
          <span className="font-semibold text-slate-900 block text-xs">{b.title}</span>
          <span className="text-[11px] text-slate-400 font-medium">By: {b.dispatchedBy}</span>
        </div>
      ),
    },
    {
      key: 'channel',
      header: 'Delivery Channel',
      nowrap: true,
      render: (b: BroadcastBatch) => {
        if (b.channel === 'SMS_AND_INAPP') return <Badge variant="success" size="sm">SMS + In-App</Badge>;
        if (b.channel === 'SMS_ONLY') return <Badge variant="neutral" size="sm">SMS Only</Badge>;
        if (b.channel === 'EMAIL_ONLY') return <Badge variant="primary" size="sm">Email Only</Badge>;
        return <Badge variant="neutral" size="sm">In-App Notice</Badge>;
      },
    },
    {
      key: 'audience',
      header: 'Target Audience',
      nowrap: true,
      render: (b: BroadcastBatch) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">
            {b.recipientCount} Recipients
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {b.audience.replace(/_/g, ' ')}
          </span>
        </div>
      ),
    },
    {
      key: 'cost',
      header: 'Total Cost',
      align: 'right' as const,
      nowrap: true,
      render: (b: BroadcastBatch) => (
        <span className="font-semibold text-slate-800 font-sans">
          {formatNaira(b.costKobo)}
        </span>
      ),
    },
    {
      key: 'dispatchedAt',
      header: 'Dispatch Date',
      nowrap: true,
      render: (b: BroadcastBatch) => (
        <span className="text-xs text-slate-600 font-sans">{b.dispatchedAt}</span>
      ),
    },
    {
      key: 'deliveryRate',
      header: 'Delivery Rate',
      align: 'center' as const,
      nowrap: true,
      render: (b: BroadcastBatch) => (
        <span className="font-bold text-[#13A348] text-xs font-sans">
          {b.deliveryRate}
        </span>
      ),
    },
  ];

  /* ─── TABLE 2: NOTICES COLUMNS ─── */
  const noticeColumns = [
    {
      key: 'memoRef',
      header: 'Memo Ref & Title',
      render: (n: OfficialNotice) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#0F7640] block">{n.memoRef}</span>
            {n.pinned && (
              <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 rounded-[4px] text-[10px] font-bold">
                PINNED
              </span>
            )}
          </div>
          <span className="font-bold text-slate-900 block text-xs">{n.title}</span>
          <span className="text-[11px] text-slate-500 font-medium">Audience: {n.targetAudience}</span>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      nowrap: true,
      render: (n: OfficialNotice) => {
        if (n.priority === 'EMERGENCY') return <Badge variant="danger" size="sm">EMERGENCY</Badge>;
        if (n.priority === 'STATUTORY_DIRECTIVE') return <Badge variant="warning" size="sm">STATUTORY</Badge>;
        if (n.priority === 'EXAM_NOTICE') return <Badge variant="primary" size="sm">EXAMINATION</Badge>;
        return <Badge variant="neutral" size="sm">GENERAL</Badge>;
      },
    },
    {
      key: 'category',
      header: 'Category',
      nowrap: true,
      render: (n: OfficialNotice) => (
        <span className="text-xs text-slate-700 font-medium">{n.category}</span>
      ),
    },
    {
      key: 'date',
      header: 'Published Date',
      nowrap: true,
      render: (n: OfficialNotice) => (
        <span className="text-xs text-slate-600 font-sans">{n.publishedDate}</span>
      ),
    },
    {
      key: 'action',
      header: 'Actions',
      align: 'right' as const,
      nowrap: true,
      render: (n: OfficialNotice) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSelectedNoticeForView(n)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            View
          </Button>
          {!isStudent && (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditingNotice({ ...n });
                  setIsEditNoticeOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  setDeletingNotice(n);
                  setIsDeleteNoticeOpen(true);
                }}
              >
                Archive
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  /* ─── TABLE 3: LOGS COLUMNS ─── */
  const logColumns = [
    {
      key: 'dispatchId',
      header: 'Dispatch ID',
      nowrap: true,
      render: (l: DeliveryLogItem) => (
        <div>
          <span className="font-bold text-slate-900 block">{l.dispatchId}</span>
          <span className="text-[11px] text-slate-400 font-sans">{l.timestamp}</span>
        </div>
      ),
    },
    {
      key: 'recipient',
      header: 'Recipient Trainee / Faculty',
      render: (l: DeliveryLogItem) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{l.recipientName}</span>
          <span className="text-[11px] text-slate-500 font-medium font-sans">
            {l.recipientContact} • {l.recipientRole}
          </span>
        </div>
      ),
    },
    {
      key: 'channel',
      header: 'Channel',
      nowrap: true,
      render: (l: DeliveryLogItem) => (
        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-[4px] text-[10px] font-bold">
          {l.channel}
        </span>
      ),
    },
    {
      key: 'gatewayResponse',
      header: 'Gateway Delivery Telemetry',
      render: (l: DeliveryLogItem) => (
        <div>
          <span className="font-semibold text-slate-800 block text-xs">{l.gatewayResponse}</span>
          <span className="text-[11px] text-slate-400 line-clamp-1">{l.messageSummary}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      nowrap: true,
      render: (l: DeliveryLogItem) => (
        <Badge variant={l.status === 'DELIVERED' ? 'success' : 'neutral'} size="sm">
          {l.status}
        </Badge>
      ),
    },
  ];

  /* ─── TABLE 4: TRIGGERS COLUMNS ─── */
  const triggerColumns = [
    {
      key: 'eventName',
      header: 'Event Trigger & Workflow',
      render: (t: NotificationTrigger) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{t.eventName}</span>
          <span className="text-[11px] text-slate-500 leading-snug">{t.description}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
            Key: {t.eventKey} • Lifetime Dispatches: {t.lifetimeCount}
          </span>
        </div>
      ),
    },
    {
      key: 'channels',
      header: 'Active Channels',
      render: (t: NotificationTrigger) => (
        <div className="flex items-center gap-1 flex-wrap">
          {t.channels.map((ch, i) => (
            <span key={i} className="px-1.5 py-0.2 bg-emerald-50 text-[#0F7640] rounded-[4px] text-[10px] font-bold">
              {ch}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'lastTriggered',
      header: 'Last Fired',
      nowrap: true,
      render: (t: NotificationTrigger) => (
        <span className="text-xs text-slate-600 font-sans">{t.lastTriggered}</span>
      ),
    },
    {
      key: 'active',
      header: 'Automation State',
      align: 'center' as const,
      nowrap: true,
      render: (t: NotificationTrigger) => (
        <Button
          size="sm"
          variant={t.active ? 'secondary' : 'ghost'}
          onClick={() => handleToggleTrigger(t.id)}
          className={`text-xs ${t.active ? 'text-[#13A348] font-bold' : 'text-slate-400'}`}
        >
          {t.active ? 'ENABLED' : 'PAUSED'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── MODULE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Communication & Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isStaff
              ? 'Bulk SMS (Termii SPI) • Transactional Email • Official Digital Noticeboard • Automated Event Triggers'
              : 'Official College Circulars, Memoranda & Academic Directives'}
          </p>
        </div>
        {isStaff && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              onClick={() => {
                showToast({
                  type: 'info',
                  title: 'Termii Gateway Health',
                  message: 'Termii SMS Gateway connection active. Route: DND Tier-1 Bypass. Latency: 140ms.',
                });
              }}
              leftIcon={<Radio className="w-3.5 h-3.5 text-[#0F7640]" />}
              className="whitespace-nowrap text-xs"
            >
              Gateway Status
            </Button>
            <Button
              onClick={() => setIsNewNoticeModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="whitespace-nowrap text-xs bg-[#0F7640] hover:bg-[#093322]"
            >
              Publish Circular
            </Button>
          </div>
        )}
      </div>

      {/* ─── TOP STAT CARDS (UNIFORM HEIGHT, ZERO SQUEEZING) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              {isStaff ? 'Total Dispatches' : 'Campus Notices'}
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {isStaff ? '14,820' : notices.length}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#0F7640] font-semibold">{isStaff ? '+18.5% this session' : 'Live Bulletins'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">{isStaff ? 'SMS & Email' : 'Official releases'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              {isStaff ? 'SMS Delivery Rate' : 'Pinned Directives'}
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {isStaff ? '99.4%' : '2 Active'}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">{isStaff ? 'Tier-1 DND Active' : 'Urgent priority'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">{isStaff ? 'All Nigerian Telcos' : 'Must read'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              {isStaff ? 'Termii SMS Balance' : 'Verified Publisher'}
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {isStaff ? '₦142,500.00' : 'Senate & Provost'}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">{isStaff ? '35,625 Units' : 'Official seal'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">{isStaff ? 'BETHSAIDA Sender ID' : 'Verified circular'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Active Circulars
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {notices.length} Live Memos
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-amber-700 font-semibold">2 Pinned Notices</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Student Portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION TABS ─── */}
      <Tabs
        tabs={
          isStaff
            ? [
                { id: 'broadcasts', label: 'Broadcast Dispatch' },
                { id: 'notices', label: 'Official Circulars' },
                { id: 'logs', label: 'Delivery Logs' },
                { id: 'triggers', label: 'Automated Triggers' },
              ]
            : [{ id: 'notices', label: 'Official Circulars & Memoranda' }]
        }
        activeTab={activeTab}
        onChange={(id: any) => handleTabChange(id)}
      />

      {/* ─── TAB 1: BROADCAST DISPATCH ─── */}
      {isStaff && activeTab === 'broadcasts' && (
        <div className="space-y-6">
          {/* Top Form: Compose & Dispatch */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card
                header={
                  <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Compose Targeted College Broadcast
                  </span>
                }
              >
                <form onSubmit={handleDispatchBroadcast} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-900 block">Broadcast Title / Internal Reference:</label>
                    <input
                      type="text"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="e.g. Clinical Posting Orientation Notice"
                      className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-900 block">Target Audience:</label>
                      <Select
                        value={targetAudience}
                        onChange={(v) => setTargetAudience(v as AudienceType)}
                        options={[
                          { value: 'ALL_STUDENTS', label: 'All Registered Students (1,248)' },
                          { value: 'CHEW_200L', label: 'Community Health 200L (124)' },
                          { value: 'MLT_200L', label: 'Medical Laboratory 200L (110)' },
                          { value: 'PHT_200L', label: 'Pharmacy Technician 200L (95)' },
                          { value: 'CLINICAL_POSTING_TRAINEES', label: 'Hospital Rotation Trainees (640)' },
                          { value: 'DEBTORS_ONLY', label: 'Fee Defaulters & Debtors (142)' },
                          { value: 'ALL_FACULTY', label: 'Academic Faculty & Staff (44)' },
                          { value: 'SPONSORS', label: 'Parents & Financial Sponsors (640)' },
                        ]}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-900 block">Delivery Channel:</label>
                      <Select
                        value={deliveryChannel}
                        onChange={(v) => setDeliveryChannel(v as ChannelType)}
                        options={[
                          { value: 'SMS_AND_INAPP', label: 'SMS (Termii Gateway) + In-App Notice' },
                          { value: 'SMS_ONLY', label: 'SMS Only (Termii Priority)' },
                          { value: 'EMAIL_ONLY', label: 'Official Transactional Email' },
                          { value: 'INAPP_ONLY', label: 'In-App Portal Bulletin Only' },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-900 block">
                      Message Content (Official Text • No Emojis):
                    </label>
                    <textarea
                      rows={4}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="w-full rounded-[4px] border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                    />
                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-sans">
                      <span>Standard Nigerian SMS Billing Unit: 160 Characters</span>
                      <span className="font-semibold text-slate-700">
                        {messageText.length} characters ({smsSegments} SMS Segment{smsSegments > 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Estimated Campaign Cost:</span>
                      <span className="font-bold text-slate-900 text-sm font-sans">{formatNaira(estimatedCostKobo)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[11px]">Recipients:</span>
                      <span className="font-bold text-[#0F7640] text-sm font-sans">{audienceCount} Contacts</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button size="sm" type="submit" leftIcon={<Send className="w-3.5 h-3.5" />} className="bg-[#0F7640] hover:bg-[#093322]">
                      Dispatch Notification
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Provider Info Card */}
            <div className="space-y-4">
              <Card
                header={
                  <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    SMS Gateway Telemetry & Health
                  </span>
                }
              >
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-[4px] bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block uppercase text-[10px]">Termii Wallet Balance</span>
                    <span className="text-xl font-bold text-slate-900 font-sans">₦142,500.00</span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5 font-semibold">
                      Route: DND Priority Tier-1 Bypass
                    </span>
                  </div>

                  <div className="space-y-2 text-slate-700 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery Success Rate:</span>
                      <span className="font-bold text-[#13A348] font-sans">99.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Registered Sender ID:</span>
                      <span className="font-bold text-slate-900 font-sans">BETHSAIDA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email Gateway:</span>
                      <span className="font-semibold text-slate-800">SendGrid SMTP Dedicated</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Average Dispatch Latency:</span>
                      <span className="font-semibold text-slate-800 font-sans">140ms</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Broadcast History Table */}
          <Card
            header={
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Recent Broadcast Dispatches
              </span>
            }
          >
            <Table
              columns={broadcastColumns}
              data={filteredBroadcasts}
              keyExtractor={(b) => b.id}
              isDense={isDense}
              searchValue={batchSearch}
              onSearchChange={setBatchSearch}
              searchPlaceholder="Search broadcast batch ref or title..."
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 2: OFFICIAL CIRCULARS & NOTICES ─── */}
      {activeTab === 'notices' && (
        <Card>
          <Table
            columns={noticeColumns}
            data={filteredNotices}
            keyExtractor={(n) => n.id}
            isDense={isDense}
            searchValue={noticeSearch}
            onSearchChange={setNoticeSearch}
            searchPlaceholder="Search circular title, memo ref, or category..."
            toolbarFilters={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  showToast({
                    type: 'info',
                    title: 'Digital Noticeboard Synced',
                    message: 'Official circulars published to all student and faculty portal dashboards.',
                  });
                }}
                leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#0F7640]" />}
                className="whitespace-nowrap"
              >
                Sync Noticeboard
              </Button>
            }
          />
        </Card>
      )}

      {/* ─── TAB 3: DELIVERY LOGS ─── */}
      {isStaff && activeTab === 'logs' && (
        <Card>
          <Table
            columns={logColumns}
            data={filteredLogs}
            keyExtractor={(l) => l.id}
            isDense={isDense}
            searchValue={logSearch}
            onSearchChange={setLogSearch}
            searchPlaceholder="Search recipient name, telephone, or dispatch ID..."
            toolbarFilters={
              <div className="w-40">
                <Select
                  value={channelFilter}
                  onChange={(val) => setChannelFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Channels' },
                    { value: 'SMS', label: 'SMS Termii' },
                    { value: 'Email', label: 'Email SMTP' },
                    { value: 'In-App Portal', label: 'In-App Portal' },
                  ]}
                />
              </div>
            }
          />
        </Card>
      )}

      {/* ─── TAB 4: AUTOMATED EVENT TRIGGERS ─── */}
      {isStaff && activeTab === 'triggers' && (
        <Card>
          <Table
            columns={triggerColumns}
            data={triggers}
            keyExtractor={(t) => t.id}
            isDense={isDense}
            toolbarFilters={
              <div className="text-xs text-slate-500">
                One-Brain Event Bus: Workflows trigger instantly on bursary payments, postings, and attendance gates.
              </div>
            }
          />
        </Card>
      )}

      {/* ─── MODAL 1: PUBLISH OFFICIAL CIRCULAR ─── */}
      <Modal
        isOpen={isNewNoticeModalOpen}
        onClose={() => setIsNewNoticeModalOpen(false)}
        title="Publish Official College Circular"
        size="lg"
      >
        <div className="space-y-4 text-xs text-slate-800">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-slate-600">
            Publish an official administrative circular to student and faculty portals. Memos are stamped with Provost and Registrar seals.
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Notice Title / Subject:</label>
            <input
              type="text"
              value={newNoticeTitle}
              onChange={(e) => setNewNoticeTitle(e.target.value)}
              placeholder="e.g. Schedule of Upcoming Statutory Council Examinations"
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Priority Level:</label>
              <Select
                value={newNoticePriority}
                onChange={(val) => setNewNoticePriority(val as NoticePriority)}
                options={[
                  { value: 'STATUTORY_DIRECTIVE', label: 'Statutory Directive' },
                  { value: 'EXAM_NOTICE', label: 'Examination Notice' },
                  { value: 'EMERGENCY', label: 'Emergency Safety Alert' },
                  { value: 'GENERAL_MEMO', label: 'General Administrative Memo' },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Category:</label>
              <Select
                value={newNoticeCategory}
                onChange={(val) => setNewNoticeCategory(val as any)}
                options={[
                  { value: 'Academic', label: 'Academic & Curriculum' },
                  { value: 'Clinical Posting', label: 'Clinical Hospital Postings' },
                  { value: 'Bursary', label: 'School Fees & Bursary' },
                  { value: 'Holidays & Resumption', label: 'Resumption & Holidays' },
                  { value: 'General', label: 'General Administration' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Target Audience Specification:</label>
            <input
              type="text"
              value={newNoticeAudience}
              onChange={(e) => setNewNoticeAudience(e.target.value)}
              placeholder="e.g. All Registered Trainees & Academic Department Heads"
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Official Memo Body Content:</label>
            <textarea
              rows={5}
              value={newNoticeBody}
              onChange={(e) => setNewNoticeBody(e.target.value)}
              placeholder="Type the full text of the official administrative directive..."
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsNewNoticeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublishNotice} className="bg-[#0F7640] hover:bg-[#093322]">
              Publish to Noticeboard
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 2: VIEW OFFICIAL CIRCULAR LETTERHEAD ─── */}
      <Modal
        isOpen={Boolean(selectedNoticeForView)}
        onClose={() => setSelectedNoticeForView(null)}
        title="Official College Circular"
        size="lg"
      >
        {selectedNoticeForView && (
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
                  Office of the Registrar & Academic Secretary • {schoolProfile?.campusAddress || 'Ogbomoso, Oyo State, Nigeria'}
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 rounded-[4px] text-xs font-bold text-[#0F7640] border border-emerald-200 uppercase">
                  OFFICIAL ADMINISTRATIVE CIRCULAR
                </div>
              </div>

              {/* Memo Meta */}
              <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Circular Reference</span>
                  <span className="font-bold text-slate-900 text-xs block">{selectedNoticeForView.memoRef}</span>
                  <span className="text-slate-500 text-[11px]">Category: {selectedNoticeForView.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date of Release</span>
                  <span className="font-bold text-slate-900 text-xs block font-sans">{selectedNoticeForView.publishedDate}</span>
                  <span className="text-emerald-700 font-bold text-[11px] block">{selectedNoticeForView.priority}</span>
                </div>
              </div>

              {/* Memo Subject */}
              <div className="my-4">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Subject Directive:</span>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5 uppercase tracking-wide">
                  {selectedNoticeForView.title}
                </h3>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Target Recipients: <strong className="text-slate-800">{selectedNoticeForView.targetAudience}</strong>
                </span>
              </div>

              {/* Memo Content */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-[4px] text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                {selectedNoticeForView.bodyContent}
              </div>

              {/* Signatures */}
              <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 items-end">
                <div>
                  <div className="w-28 border-b border-slate-700 mb-1"></div>
                  <span className="font-bold text-slate-900 text-xs block">Registrar & Academic Secretary</span>
                  <span className="text-[10px] text-slate-400">Academic Affairs Directorate</span>
                </div>
                <div className="text-right">
                  <div className="w-28 border-b border-slate-700 ml-auto mb-1"></div>
                  <span className="font-bold text-slate-900 text-xs block">Provost</span>
                  <span className="text-[10px] text-slate-400">Bethsaida College of Health Tech</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setSelectedNoticeForView(null)}>
                Close
              </Button>
              {!isStudent && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingNotice({ ...selectedNoticeForView });
                      setIsEditNoticeOpen(true);
                    }}
                  >
                    Edit Memo
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setDeletingNotice(selectedNoticeForView);
                      setIsDeleteNoticeOpen(true);
                    }}
                  >
                    Archive
                  </Button>
                </>
              )}
              <Button
                onClick={() => {
                  if (!selectedNoticeForView) return;
                  printInstitutionalDocument({
                    title: `Official Circular — ${selectedNoticeForView.memoRef}`,
                    badgeText: 'OFFICIAL ADMINISTRATIVE CIRCULAR & SENATE MEMO',
                    referenceNo: selectedNoticeForView.memoRef,
                    issuedDate: selectedNoticeForView.publishedDate,
                    schoolProfile,
                    officeSubtitle: 'Office of the Registrar & Academic Secretary',
                    metaItems: [
                      { label: 'Circular Reference', value: selectedNoticeForView.memoRef, highlight: true },
                      { label: 'Category', value: selectedNoticeForView.category },
                      { label: 'Priority Classification', value: selectedNoticeForView.priority, highlight: true },
                      { label: 'Target Recipients', value: selectedNoticeForView.targetAudience },
                      { label: 'Date of Release', value: selectedNoticeForView.publishedDate },
                      { label: 'Authorizing Signatory', value: selectedNoticeForView.signedBy || 'Academic Registry' },
                    ],
                    bodyHtml: `
                      <div style="margin-bottom:10px;">
                        <span style="font-size:9.5px; text-transform:uppercase; color:#64748b; font-weight:700;">Subject Directive:</span>
                        <div style="font-size:13px; font-weight:800; color:#0f172a; text-transform:uppercase; margin-top:2px;">
                          ${escapeHtml(selectedNoticeForView.title)}
                        </div>
                      </div>
                      <div class="callout-box" style="white-space:pre-line; line-height:1.65; font-size:11.5px;">
                        ${escapeHtml(selectedNoticeForView.bodyContent)}
                      </div>
                    `,
                    stampText: 'OFFICIAL REGISTRY SEAL',
                    signatures: [
                      { title: 'Registrar & Academic Secretary', subtitle: 'Academic Affairs Directorate' },
                      { title: 'College Provost', subtitle: schoolProfile?.institutionName || 'Bethsaida College of Health Tech' },
                    ],
                  });
                }}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
              >
                Print Circular Memo
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 3: EDIT ADMINISTRATIVE CIRCULAR ─── */}
      {editingNotice && (
        <Modal
          isOpen={isEditNoticeOpen}
          onClose={() => {
            setIsEditNoticeOpen(false);
            setEditingNotice(null);
          }}
          title="Edit Administrative Circular"
          description={`Update notice details for reference ${editingNotice.memoRef}.`}
          size="lg"
        >
          <form onSubmit={handleSaveEditNotice} className="space-y-4 text-xs font-sans">
            <Input
              label="Circular Subject / Directive"
              value={editingNotice.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingNotice({ ...editingNotice, title: e.target.value })
              }
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Priority Classification"
                options={[
                  { value: 'URGENT', label: 'Urgent Directive' },
                  { value: 'IMPORTANT', label: 'Important Notice' },
                  { value: 'GENERAL_MEMO', label: 'General Announcement' },
                  { value: 'EMERGENCY_CLOSURE', label: 'Emergency Bulletin' },
                ]}
                value={editingNotice.priority}
                onChange={(val) =>
                  setEditingNotice({ ...editingNotice, priority: val as NoticePriority })
                }
              />

              <Select
                label="Notice Category"
                options={[
                  { value: 'Academic', label: 'Academic Affairs' },
                  { value: 'Clinical Posting', label: 'Clinical Postings' },
                  { value: 'Bursary', label: 'Bursary & Fees' },
                  { value: 'Holidays & Resumption', label: 'Holidays & Resumption' },
                  { value: 'General', label: 'General Administration' },
                ]}
                value={editingNotice.category}
                onChange={(val) =>
                  setEditingNotice({ ...editingNotice, category: val as any })
                }
              />
            </div>

            <Input
              label="Target Audience Scope"
              value={editingNotice.targetAudience}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingNotice({ ...editingNotice, targetAudience: e.target.value })
              }
              required
            />

            <div className="space-y-1">
              <label className="font-semibold text-slate-800 block text-xs">
                Official Circular Body Text:
              </label>
              <textarea
                rows={5}
                value={editingNotice.bodyContent}
                onChange={(e) =>
                  setEditingNotice({ ...editingNotice, bodyContent: e.target.value })
                }
                className="w-full p-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640] font-sans resize-y"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsEditNoticeOpen(false);
                  setEditingNotice(null);
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

      {/* ─── MODAL 4: ARCHIVE CIRCULAR CONFIRMATION ─── */}
      {deletingNotice && (
        <Modal
          isOpen={isDeleteNoticeOpen}
          onClose={() => {
            setIsDeleteNoticeOpen(false);
            setDeletingNotice(null);
          }}
          title="Archive Circular Notice"
          description={`Are you sure you want to archive circular memo ${deletingNotice.memoRef}?`}
          size="sm"
        >
          <div className="space-y-3 text-xs text-slate-700 font-sans">
            <p className="font-bold text-slate-900">{deletingNotice.title}</p>
            <p>
              This circular notice will be retracted from bulletin boards and student/faculty view.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteNoticeOpen(false);
                  setDeletingNotice(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDeleteNotice}
              >
                Confirm Archive
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
