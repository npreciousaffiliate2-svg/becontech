import React, { useState } from 'react';
import { useApp, SupportTicketItem } from '../context/AppContext.tsx';
import {
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Input,
  Select,
  useToast,
  Tabs,
} from '@campusone/ui';
import {
  LifeBuoy,
  MessageSquare,
  HelpCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  Send,
  Building2,
  FileQuestion,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
} from 'lucide-react';

export interface KnowledgeBaseItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface ContactOfficeItem {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  isEmergency?: boolean;
}

export const SupportView: React.FC = () => {
  const {
    session,
    persona,
    supportTickets,
    createSupportTicket,
    replyToSupportTicket,
    resolveSupportTicket,
    isDense,
  } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'tickets' | 'faq' | 'directory'>('tickets');
  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // New ticket form
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<SupportTicketItem['category']>('PORTAL_ACCESS');
  const [newPriority, setNewPriority] = useState<SupportTicketItem['priority']>('NORMAL');
  const [newMessage, setNewMessage] = useState('');
  const [newContactPhone, setNewContactPhone] = useState(persona.phone || '+234 800 000 0000');

  // FAQ Accordion states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const isStudent = session.activeRole === 'STU' || session.activeRole === 'SPON';

  /* ─── DERIVED TICKETS (Scoped by role) ─── */
  const visibleTickets = supportTickets.filter((t) => {
    if (isStudent && t.userId !== session.userId && t.userEmail !== session.email) {
      return false;
    }
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase();
      const matchSubject = t.subject.toLowerCase().includes(q);
      const matchNumber = t.ticketNumber.toLowerCase().includes(q);
      const matchSender = t.userName.toLowerCase().includes(q);
      if (!matchSubject && !matchNumber && !matchSender) return false;
    }
    return true;
  });

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) {
      showToast({
        type: 'warning',
        title: 'Validation Error',
        message: 'Please provide both a ticket subject and description.',
      });
      return;
    }

    await createSupportTicket({
      subject: newSubject.trim(),
      category: newCategory,
      priority: newPriority,
      message: newMessage.trim(),
      department: persona.department,
    });

    setIsNewTicketOpen(false);
    setNewSubject('');
    setNewMessage('');
    showToast({
      type: 'success',
      title: 'Ticket Submitted',
      message: 'Your support inquiry has been registered with the college help desk.',
    });
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    await replyToSupportTicket(selectedTicket.id, replyMessage.trim());
    setReplyMessage('');

    // Refresh selected ticket in modal
    const updated = supportTickets.find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);

    showToast({
      type: 'success',
      title: 'Response Posted',
      message: 'Your reply has been added to the ticket history.',
    });
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    setIsResolving(true);
    await resolveSupportTicket(selectedTicket.id, resolutionNotes.trim() || 'Inquiry resolved by college help desk.');
    setIsResolving(false);
    setSelectedTicket(null);
    setResolutionNotes('');
    showToast({
      type: 'success',
      title: 'Ticket Resolved',
      message: 'The support request has been marked as resolved.',
    });
  };

  /* ─── TABLE COLUMNS ─── */
  const ticketColumns = [
    {
      key: 'ticketNumber',
      header: 'Ticket ID',
      nowrap: true,
      render: (t: SupportTicketItem) => (
        <div>
          <span className="font-bold text-[#0F7640] block">{t.ticketNumber}</span>
          <span className="text-[10px] text-slate-400">
            {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject & Category',
      render: (t: SupportTicketItem) => {
        const catMap: Record<string, string> = {
          TUITION_FEES: 'Bursary & Payments',
          COURSE_REG: 'Course Registration',
          EXAM_RESULTS: 'Examination & Broadsheets',
          HOSTEL: 'Hostels & Accommodation',
          PORTAL_ACCESS: 'Portal Logins & Access',
          GENERAL: 'General Administrative',
        };
        return (
          <div>
            <span className="font-bold text-slate-900 block text-xs">{t.subject}</span>
            <span className="text-[11px] text-slate-500 font-medium">
              {catMap[t.category] || t.category}
            </span>
          </div>
        );
      },
    },
    ...(!isStudent
      ? [
          {
            key: 'userName',
            header: 'Requester',
            render: (t: SupportTicketItem) => (
              <div>
                <span className="font-semibold text-slate-800 block text-xs">{t.userName}</span>
                <span className="text-[11px] text-slate-400">{t.userRole} • {t.userEmail}</span>
              </div>
            ),
          },
        ]
      : []),
    {
      key: 'priority',
      header: 'Priority',
      align: 'center' as const,
      nowrap: true,
      render: (t: SupportTicketItem) => {
        const map = {
          URGENT: { variant: 'danger' as const, label: 'URGENT' },
          HIGH: { variant: 'warning' as const, label: 'HIGH' },
          NORMAL: { variant: 'primary' as const, label: 'NORMAL' },
          LOW: { variant: 'neutral' as const, label: 'LOW' },
        };
        return <Badge variant={map[t.priority]?.variant || 'neutral'} size="sm">{map[t.priority]?.label || t.priority}</Badge>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      nowrap: true,
      render: (t: SupportTicketItem) => {
        const map = {
          OPEN: { variant: 'danger' as const, label: 'OPEN' },
          IN_PROGRESS: { variant: 'warning' as const, label: 'IN PROGRESS' },
          RESOLVED: { variant: 'success' as const, label: 'RESOLVED' },
          CLOSED: { variant: 'neutral' as const, label: 'CLOSED' },
        };
        return <Badge variant={map[t.status]?.variant || 'neutral'} size="sm">{map[t.status]?.label || t.status}</Badge>;
      },
    },
    {
      key: 'action',
      header: 'Actions',
      align: 'right' as const,
      nowrap: true,
      render: (t: SupportTicketItem) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setSelectedTicket(t)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          className="whitespace-nowrap"
        >
          View Details
        </Button>
      ),
    },
  ];

  /* ─── DYNAMIC KNOWLEDGE BASE FAQS STATE ─── */
  const [faqs, setFaqs] = useState<KnowledgeBaseItem[]>(() => {
    try {
      const saved = localStorage.getItem('campusone_knowledge_base');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'faq-01',
        category: 'Tuition & Payment Receipts',
        question: 'What should I do if my bank transfer or Paystack fee payment is debited but the receipt is not generated?',
        answer: 'Online payments via Paystack and Remita usually reconcile immediately. In rare cases of interbank network delay, our webhook re-queries the banking switch every 15 minutes. If your receipt is still pending after 1 hour, open a support ticket under "Bursary & Payments" and attach your transaction reference ID.',
      },
      {
        id: 'faq-02',
        category: 'Course Registration',
        question: 'How do I add or drop a course after the semester registration portal has closed?',
        answer: 'Course add/drop forms must be endorsed by your Departmental Course Advisor and approved by the Head of Department (HOD). Once endorsed, submit a ticket under "Course Registration" with the affected course codes to request late manual course enrollment.',
      },
      {
        id: 'faq-03',
        category: 'Examination & Broadsheets',
        question: 'How do I apply for result remarking or official transcript generation?',
        answer: 'Official semester broadsheets are ratified by the Academic Senate. If you observe an omission in your CA continuous assessment or exam scores, consult your lecturer first. Formal remark requests require an academic audit request submitted to the Exams & Records Officer.',
      },
      {
        id: 'faq-04',
        category: 'Hostel Accommodation',
        question: 'How do I complete hostel clearance and collect my room keys?',
        answer: 'After payment of the hostel accommodation fee, visit the "My Accommodation" tab in the portal to download your official Bed Space Pass. Present this pass alongside your student identity card to the Hall Warden at Florence Nightingale or Sir Alexander Fleming Hall for room check-in and key assignment.',
      },
      {
        id: 'faq-05',
        category: 'Portal Logins & Access',
        question: 'I cannot sign in to my student or staff portal account. How do I regain access?',
        answer: 'Ensure you are using your official college email address (e.g., name@bethsaida.edu.ng) or matriculation number. If you forgot your password, click "Forgot Password" on the login screen to receive a secure password reset link. For locked accounts, contact the ICT Support Desk.',
      },
    ];
  });

  /* ─── DYNAMIC CONTACT DIRECTORY STATE ─── */
  const [contactOffices, setContactOffices] = useState<ContactOfficeItem[]>(() => {
    try {
      const saved = localStorage.getItem('campusone_contact_directory_v2');
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem('campusone_contact_directory');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (parsed.some((o: any) => o.location?.includes('Ogbomoso'))) {
          return parsed;
        }
      }
    } catch (e) {}
    return [
      {
        id: 'off-01',
        name: 'Central Administration & Admissions Office',
        description: 'Admissions verification, registrar inquiries, statement of results, academic transcripts, and institutional administration.',
        email: 'info@becohtech.edu.ng',
        phone: '+234 907 578 9045, +234 907 451 7476',
        location: 'Ikolaba Aladan layout, off Ayegun Yemetu Road, along CAC grammar school, Ogbomoso, Oyo State',
      },
      {
        id: 'off-02',
        name: 'Bursary & Student Accounts Desk',
        description: 'Assistance with fee payments, Paystack/Remita reconciliation, official payment receipts, and installment clearances.',
        email: 'info@becohtech.edu.ng',
        phone: '+234 907 578 9045',
        location: 'Bursary Complex, Ogbomoso Campus',
      },
      {
        id: 'off-03',
        name: 'ICT & Digital Portal Support',
        description: 'Technical assistance with student and staff portal logins, course registration forms, and examination slips.',
        email: 'info@becohtech.edu.ng',
        phone: '+234 907 451 7476',
        location: 'ICT Innovation Center, Ogbomoso Campus',
      },
      {
        id: 'off-04',
        name: 'Campus Clinic & Emergency Medical Response',
        description: '24-Hour urgent healthcare, student health emergency triage, clinical checkups, and campus clinic response.',
        email: 'info@becohtech.edu.ng',
        phone: '+234 907 578 9045 (Emergency Hotline)',
        location: 'College Health Center, Ogbomoso Campus',
        isEmergency: true,
      },
    ];
  });

  // Save changes to localStorage
  const saveFaqs = (updated: KnowledgeBaseItem[]) => {
    setFaqs(updated);
    try {
      localStorage.setItem('campusone_knowledge_base', JSON.stringify(updated));
    } catch (e) {}
  };

  const saveContacts = (updated: ContactOfficeItem[]) => {
    setContactOffices(updated);
    try {
      localStorage.setItem('campusone_contact_directory_v2', JSON.stringify(updated));
      localStorage.setItem('campusone_contact_directory', JSON.stringify(updated));
    } catch (e) {}
  };

  // Modal and form states for FAQ
  const [editingFaq, setEditingFaq] = useState<KnowledgeBaseItem | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState<KnowledgeBaseItem | null>(null);
  const [isDeleteFaqOpen, setIsDeleteFaqOpen] = useState(false);

  // Modal and form states for Contact Office
  const [editingContact, setEditingContact] = useState<ContactOfficeItem | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState<ContactOfficeItem | null>(null);
  const [isDeleteContactOpen, setIsDeleteContactOpen] = useState(false);

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;
    if (faqs.some((f) => f.id === editingFaq.id)) {
      saveFaqs(faqs.map((f) => (f.id === editingFaq.id ? editingFaq : f)));
      showToast({ type: 'success', title: 'FAQ Guide Updated', message: `Knowledge base guide "${editingFaq.question.slice(0, 30)}..." updated.` });
    } else {
      saveFaqs([...faqs, editingFaq]);
      showToast({ type: 'success', title: 'FAQ Guide Added', message: 'New knowledge base guide published successfully.' });
    }
    setIsFaqModalOpen(false);
    setEditingFaq(null);
  };

  const handleDeleteFaq = () => {
    if (!deletingFaq) return;
    saveFaqs(faqs.filter((f) => f.id !== deletingFaq.id));
    showToast({ type: 'info', title: 'FAQ Guide Removed', message: 'Knowledge base guide was removed.' });
    setIsDeleteFaqOpen(false);
    setDeletingFaq(null);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    if (contactOffices.some((c) => c.id === editingContact.id)) {
      saveContacts(contactOffices.map((c) => (c.id === editingContact.id ? editingContact : c)));
      showToast({ type: 'success', title: 'Office Contact Updated', message: `${editingContact.name} updated.` });
    } else {
      saveContacts([...contactOffices, editingContact]);
      showToast({ type: 'success', title: 'Office Contact Added', message: `${editingContact.name} added to directory.` });
    }
    setIsContactModalOpen(false);
    setEditingContact(null);
  };

  const handleDeleteContact = () => {
    if (!deletingContact) return;
    saveContacts(contactOffices.filter((c) => c.id !== deletingContact.id));
    showToast({ type: 'info', title: 'Office Contact Removed', message: `${deletingContact.name} removed from directory.` });
    setIsDeleteContactOpen(false);
    setDeletingContact(null);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-[#0F7640]" />
            Help Desk & Institutional Support
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit assistance requests, track ticket resolutions, search knowledge base guides, or contact college offices.
          </p>
        </div>
        <Button
          onClick={() => setIsNewTicketOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-[#0F7640] hover:bg-[#093322] text-xs font-semibold self-start sm:self-auto"
        >
          Submit Support Ticket
        </Button>
      </div>

      {/* ─── STAT SUMMARY CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Active Inquiries</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {visibleTickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-[4px] bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Awaiting officer resolution</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Resolved Inquiries</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {visibleTickets.filter((t) => t.status === 'RESOLVED').length}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Closed with confirmed resolution</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Target Helpdesk SLA</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">&lt; 2 Hours</h3>
            </div>
            <div className="w-9 h-9 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Standard academic inquiry response time</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Emergency Desk</p>
              <h3 className="text-xl font-bold text-[#0F7640] mt-1">Available 24/7</h3>
            </div>
            <div className="w-9 h-9 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Campus ICT & Health Center lines active</p>
        </Card>
      </div>

      {/* ─── TABS ─── */}
      <Tabs
        tabs={[
          { id: 'tickets', label: isStudent ? 'My Support Tickets' : 'Institutional Support Tickets' },
          { id: 'faq', label: 'Knowledge Base & FAQ' },
          { id: 'directory', label: 'Departmental Contact Directory' },
        ]}
        activeTab={activeTab}
        onChange={(id: any) => setActiveTab(id)}
      />

      {/* ─── TAB 1: SUPPORT TICKETS ─── */}
      {activeTab === 'tickets' && (
        <Card>
          <Table
            columns={ticketColumns}
            data={visibleTickets}
            keyExtractor={(t) => t.id}
            isDense={isDense}
            searchValue={ticketSearch}
            onSearchChange={setTicketSearch}
            searchPlaceholder="Search tickets by subject, ID, or name..."
            toolbarFilters={
              <>
                <div className="w-40">
                  <Select
                    value={statusFilter}
                    onChange={(val) => setStatusFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Statuses' },
                      { value: 'OPEN', label: 'Open' },
                      { value: 'IN_PROGRESS', label: 'In Progress' },
                      { value: 'RESOLVED', label: 'Resolved' },
                    ]}
                  />
                </div>
                <div className="w-48">
                  <Select
                    value={categoryFilter}
                    onChange={(val) => setCategoryFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Categories' },
                      { value: 'TUITION_FEES', label: 'Bursary & Payments' },
                      { value: 'COURSE_REG', label: 'Course Registration' },
                      { value: 'EXAM_RESULTS', label: 'Examination Results' },
                      { value: 'HOSTEL', label: 'Hostel Accommodation' },
                      { value: 'PORTAL_ACCESS', label: 'Portal Logins & Access' },
                      { value: 'GENERAL', label: 'General Administrative' },
                    ]}
                  />
                </div>
              </>
            }
          />
        </Card>
      )}

      {/* ─── TAB 2: KNOWLEDGE BASE & FAQ ─── */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-[4px] text-xs text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Self-Service Knowledge Base</h3>
              <p className="text-slate-600">
                Find instant answers to common questions regarding fee settlements, course registrations, semester broadsheets, hostel clearance, and portal access.
              </p>
            </div>
            {!isStudent && (
              <Button
                size="sm"
                className="bg-[#0F7640] hover:bg-[#093322] shrink-0 whitespace-nowrap"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setEditingFaq({
                    id: `faq-${Date.now().toString().slice(-4)}`,
                    category: 'General Administrative',
                    question: '',
                    answer: '',
                  });
                  setIsFaqModalOpen(true);
                }}
              >
                Add FAQ Guide
              </Button>
            )}
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.id || idx}
                  className="border border-slate-200 rounded-[4px] bg-white overflow-hidden shadow-xs transition-colors"
                >
                  <div className="w-full p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="text-left flex-1"
                    >
                      <span className="text-[10px] font-bold text-[#0F7640] uppercase tracking-wider block mb-0.5">
                        {faq.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {faq.question}
                      </h4>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      {!isStudent && (
                        <div className="flex items-center gap-1.5 mr-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditingFaq({ ...faq });
                              setIsFaqModalOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              setDeletingFaq(faq);
                              setIsDeleteFaqOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="text-slate-400 p-1"
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: CONTACT DIRECTORY ─── */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-[4px]">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Institutional Help & Office Directory</h3>
              <p className="text-slate-500 text-xs">Direct contact channels for administrative directorates and urgent escalation desks.</p>
            </div>
            {!isStudent && (
              <Button
                size="sm"
                className="bg-[#0F7640] hover:bg-[#093322] shrink-0 whitespace-nowrap"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setEditingContact({
                    id: `off-${Date.now().toString().slice(-4)}`,
                    name: '',
                    description: '',
                    email: '',
                    phone: '',
                    location: '',
                  });
                  setIsContactModalOpen(true);
                }}
              >
                Add Office Contact
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactOffices.map((office) => (
              <Card key={office.id} className="p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm flex flex-col justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-[4px] ${office.isEmergency ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-[#0F7640]'} flex items-center justify-center shrink-0`}>
                    {office.isEmergency ? <Phone className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{office.name}</h3>
                      {office.isEmergency && (
                        <Badge variant="danger" size="sm">24/7 HOTLINE</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{office.description}</p>
                    <div className="pt-3 space-y-1.5 text-xs text-slate-700 font-medium font-sans">
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{office.email}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className={office.isEmergency ? 'font-bold text-red-700' : ''}>{office.phone}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{office.location}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {!isStudent && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingContact({ ...office });
                        setIsContactModalOpen(true);
                      }}
                    >
                      Edit Office
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setDeletingContact(office);
                        setIsDeleteContactOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── MODAL 1: SUBMIT NEW TICKET ─── */}
      <Modal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        title="Submit Support Request"
        description="Our college administrative and technical team will review your inquiry."
        size="md"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-sans">
          <Input
            label="Ticket Subject"
            placeholder="e.g. Fee Payment Reconciliation for CHEW 200L"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Inquiry Category"
              options={[
                { value: 'TUITION_FEES', label: 'Bursary & Payments' },
                { value: 'COURSE_REG', label: 'Course Registration' },
                { value: 'EXAM_RESULTS', label: 'Examination & Broadsheets' },
                { value: 'HOSTEL', label: 'Hostel & Accommodation' },
                { value: 'PORTAL_ACCESS', label: 'Portal Logins & Access' },
                { value: 'GENERAL', label: 'General Administrative' },
              ]}
              value={newCategory}
              onChange={(val) => setNewCategory(val as any)}
            />
            <Select
              label="Urgency / Priority"
              options={[
                { value: 'URGENT', label: 'Urgent (Within 4 Hours)' },
                { value: 'HIGH', label: 'High Priority' },
                { value: 'NORMAL', label: 'Normal' },
                { value: 'LOW', label: 'Low / Routine' },
              ]}
              value={newPriority}
              onChange={(val) => setNewPriority(val as any)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Detailed Description:</label>
            <textarea
              rows={4}
              placeholder="Provide full details of your inquiry, including relevant course codes, transaction reference numbers, or room codes..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              required
            />
          </div>

          <Input
            label="Contact Phone / WhatsApp"
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsNewTicketOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 2: TICKET DOSSIER & DISCUSSION THREAD ─── */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket ? `Ticket ${selectedTicket.ticketNumber}` : 'Ticket Details'}
        description="Inquiry history and helpdesk conversation thread."
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-4 text-xs font-sans">
            {/* Ticket Header Metadata */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[4px] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{selectedTicket.subject}</span>
                <span className="text-[11px] text-slate-500">
                  Submitted by <strong>{selectedTicket.userName}</strong> ({selectedTicket.userRole}) • {new Date(selectedTicket.createdAt).toLocaleString('en-GB')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={selectedTicket.priority === 'URGENT' ? 'danger' : 'warning'} size="sm">
                  {selectedTicket.priority}
                </Badge>
                <Badge variant={selectedTicket.status === 'RESOLVED' ? 'success' : 'neutral'} size="sm">
                  {selectedTicket.status}
                </Badge>
              </div>
            </div>

            {/* Original Message */}
            <div className="p-3 bg-white border border-slate-200 rounded-[4px]">
              <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Original Inquiry</p>
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
            </div>

            {/* Conversation Thread */}
            {selectedTicket.replies && selectedTicket.replies.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Discussion History</p>
                {selectedTicket.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-3 rounded-[4px] border border-slate-200 bg-slate-50/70"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-xs">{reply.authorName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Resolution Notes (If Resolved) */}
            {selectedTicket.status === 'RESOLVED' && selectedTicket.resolutionNotes && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-[4px]">
                <p className="font-bold text-xs flex items-center gap-1.5 mb-1 text-[#0F7640]">
                  <CheckCircle2 className="w-4 h-4" /> Official Resolution Notes:
                </p>
                <p className="text-xs">{selectedTicket.resolutionNotes}</p>
              </div>
            )}

            {/* Reply Form */}
            {selectedTicket.status !== 'RESOLVED' && (
              <form onSubmit={handleSendReply} className="space-y-2 pt-2 border-t border-slate-200">
                <label className="font-bold text-slate-900 block text-xs">Post Reply / Update:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your response here..."
                    className="flex-1 h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                    required
                  />
                  <Button type="submit" leftIcon={<Send className="w-3.5 h-3.5" />} className="bg-[#0F7640] hover:bg-[#093322]">
                    Reply
                  </Button>
                </div>
              </form>
            )}

            {/* Admin Resolution Action */}
            {!isStudent && selectedTicket.status !== 'RESOLVED' && (
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Resolution notes (e.g. Payment verified in bank schedule)..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="flex-1 h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                />
                <Button
                  onClick={handleResolveTicket}
                  disabled={isResolving}
                  className="bg-[#13A348] hover:bg-[#093322] text-xs font-semibold whitespace-nowrap"
                >
                  Mark as Resolved
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ─── MODAL 3: ADD / EDIT FAQ GUIDE ─── */}
      {editingFaq && (
        <Modal
          isOpen={isFaqModalOpen}
          onClose={() => {
            setIsFaqModalOpen(false);
            setEditingFaq(null);
          }}
          title={faqs.some((f) => f.id === editingFaq.id) ? 'Edit Knowledge Base Guide' : 'Add Knowledge Base Guide'}
          description="Provide a clear, student-facing question and helpful answer."
          size="md"
        >
          <form onSubmit={handleSaveFaq} className="space-y-4 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Category:</label>
              <Input
                value={editingFaq.category}
                onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                placeholder="e.g. Tuition & Payment Receipts / Course Registration"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Question / Inquiry Title:</label>
              <Input
                value={editingFaq.question}
                onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                placeholder="e.g. What should I do if my payment is debited but pending?"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Detailed Solution / Answer:</label>
              <textarea
                rows={5}
                value={editingFaq.answer}
                onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                placeholder="Provide clear steps for resolution..."
                className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsFaqModalOpen(false);
                  setEditingFaq(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
                Save FAQ Guide
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 4: DELETE FAQ CONFIRMATION ─── */}
      {deletingFaq && (
        <Modal
          isOpen={isDeleteFaqOpen}
          onClose={() => {
            setIsDeleteFaqOpen(false);
            setDeletingFaq(null);
          }}
          title="Remove FAQ Guide"
          description="Are you sure you want to remove this knowledge base guide?"
          size="sm"
        >
          <div className="space-y-3 text-xs text-slate-700 font-sans">
            <p className="font-bold text-slate-900">{deletingFaq.question}</p>
            <p>This guide will no longer appear on student and staff self-service search.</p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteFaqOpen(false);
                  setDeletingFaq(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteFaq}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── MODAL 5: ADD / EDIT OFFICE CONTACT ─── */}
      {editingContact && (
        <Modal
          isOpen={isContactModalOpen}
          onClose={() => {
            setIsContactModalOpen(false);
            setEditingContact(null);
          }}
          title={contactOffices.some((c) => c.id === editingContact.id) ? 'Edit Office Contact' : 'Add Office Contact'}
          description="Enter institutional contact information for this directorate or department."
          size="md"
        >
          <form onSubmit={handleSaveContact} className="space-y-3.5 text-xs font-sans">
            <div className="space-y-1">
              <label className="font-bold text-slate-900 block">Directorate / Office Name:</label>
              <Input
                value={editingContact.name}
                onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                placeholder="e.g. Directorate of Academic Planning & Quality Assurance"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-900 block">Office Scope & Description:</label>
              <Input
                value={editingContact.description}
                onChange={(e) => setEditingContact({ ...editingContact, description: e.target.value })}
                placeholder="e.g. Curriculum regulation, institutional accreditation and audit"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-900 block">Official Support Email:</label>
                <Input
                  type="email"
                  value={editingContact.email}
                  onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                  placeholder="e.g. planning@bethsaida.edu.ng"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-900 block">Official Phone Numbers:</label>
                <Input
                  value={editingContact.phone}
                  onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                  placeholder="e.g. +234 803 000 0000"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-900 block">Campus Office Location:</label>
              <Input
                value={editingContact.location}
                onChange={(e) => setEditingContact({ ...editingContact, location: e.target.value })}
                placeholder="e.g. Administrative Complex, 2nd Floor"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsContactModalOpen(false);
                  setEditingContact(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
                Save Office Contact
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 6: DELETE OFFICE CONTACT CONFIRMATION ─── */}
      {deletingContact && (
        <Modal
          isOpen={isDeleteContactOpen}
          onClose={() => {
            setIsDeleteContactOpen(false);
            setDeletingContact(null);
          }}
          title="Remove Office Contact"
          description="Are you sure you want to remove this office from the directory?"
          size="sm"
        >
          <div className="space-y-3 text-xs text-slate-700 font-sans">
            <p className="font-bold text-slate-900">{deletingContact.name}</p>
            <p>This office contact listing will be removed from the institutional help directory.</p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteContactOpen(false);
                  setDeletingContact(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteContact}>
                Confirm Remove
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
