import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
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
  CreditCard,
  Plus,
  FileText,
  Printer,
  ShieldCheck,
  QrCode,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { formatNaira, FeeCategory, PaymentMethod } from '@campusone/contracts';

export const BursaryView: React.FC = () => {
  const { ledgerEntries, receipts, addLedgerPayment, isDense } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'ledger' | 'receipts' | 'structure' | 'debtors'>('ledger');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Form state for payment
  const [studentId, setStudentId] = useState('stu-001');
  const [matricNumber, setMatricNumber] = useState('CHE/2026/0014');
  const [studentName, setStudentName] = useState('Blessing Adeyemi');
  const [amountNaira, setAmountNaira] = useState('55000');
  const [category, setCategory] = useState<FeeCategory>('tuition');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack');

  const handlePostPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountKobo = Math.round(parseFloat(amountNaira) * 100);
    if (!amountKobo || amountKobo <= 0) {
      showToast({ type: 'danger', title: 'Invalid Amount', message: 'Amount must be greater than zero' });
      return;
    }

    const receipt = addLedgerPayment({
      studentId,
      matricNumber,
      studentName,
      amountKobo,
      category,
      description: `${paymentMethod.toUpperCase()} Direct Settlement — ${category.replace('_', ' ').toUpperCase()}`,
      paymentMethod,
    });

    setIsPaymentModalOpen(false);
    showToast({
      type: 'success',
      title: 'Payment Confirmed & Posted',
      message: `Receipt #${receipt.receiptNumber} generated with immutable ledger audit`,
    });
    setSelectedReceipt(receipt);
  };

  const ledgerColumns = [
    { key: 'createdAt', header: 'Date', render: (l: any) => l.createdAt.split('T')[0] },
    { key: 'matricNumber', header: 'Matric No.', render: (l: any) => <span className="font-semibold">{l.matricNumber}</span> },
    { key: 'category', header: 'Fee Category', render: (l: any) => <Badge variant="neutral">{l.category.replace('_', ' ')}</Badge> },
    { key: 'description', header: 'Description / Line Item' },
    {
      key: 'entryType',
      header: 'Type',
      render: (l: any) => (
        <Badge variant={l.entryType === 'credit' ? 'success' : 'danger'}>
          {l.entryType.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'amountKobo',
      header: 'Amount',
      align: 'right' as const,
      render: (l: any) => (
        <span className={`font-semibold font-tabular ${l.entryType === 'credit' ? 'text-[#13A348]' : 'text-slate-900'}`}>
          {l.entryType === 'credit' ? '-' : '+'}{formatNaira(l.amountKobo)}
        </span>
      ),
    },
    {
      key: 'balanceAfterKobo',
      header: 'Derived Balance',
      align: 'right' as const,
      render: (l: any) => (
        <span className="font-bold text-slate-800 font-tabular">{formatNaira(l.balanceAfterKobo)}</span>
      ),
    },
  ];

  const receiptColumns = [
    { key: 'receiptNumber', header: 'Receipt No.', render: (r: any) => <span className="font-bold text-[#0A77FE]">{r.receiptNumber}</span> },
    { key: 'paidAt', header: 'Date & Time', render: (r: any) => r.paidAt.replace('T', ' ').slice(0, 16) },
    { key: 'studentName', header: 'Student Name' },
    { key: 'matricNumber', header: 'Matric No.' },
    { key: 'paymentMethod', header: 'Gateway / Channel', render: (r: any) => <Badge variant="primary">{r.paymentMethod.toUpperCase()}</Badge> },
    { key: 'formattedAmount', header: 'Amount Paid', align: 'right' as const, render: (r: any) => <span className="font-bold text-[#13A348]">{r.formattedAmount}</span> },
    {
      key: 'actions',
      header: 'Action',
      align: 'right' as const,
      render: (r: any) => (
        <Button size="sm" variant="secondary" onClick={() => setSelectedReceipt(r)}>
          View Receipt
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fees & Bursary Operations (FIN)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Double-Entry Student Ledger • Immutable E-Receipts • Debtor & Cashbook Reconciliation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsPaymentModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Record Verified Payment
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'ledger', label: 'Student Master Ledger' },
          { id: 'receipts', label: 'Official Receipts Vault' },
          { id: 'structure', label: 'Fee Structures (Versioned)' },
          { id: 'debtors', label: 'Debtors & Defaulter Tracking' },
        ]}
        activeTab={activeTab}
        onChange={(id: any) => setActiveTab(id)}
      />

      {/* Tab 1: Master Ledger */}
      {activeTab === 'ledger' && (
        <Card>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Double-Entry Student Transaction Ledger
            </span>
            <span className="text-xs text-slate-500">
              Deterministic Integer Kobo Arithmetic • Rule P2 Audited
            </span>
          </div>
          <Table
            columns={ledgerColumns}
            data={ledgerEntries}
            keyExtractor={(l) => l.id}
            isDense={isDense}
            emptyTitle="No Ledger Entries"
            emptyDescription="There are no debit or credit transactions recorded."
          />
        </Card>
      )}

      {/* Tab 2: Receipts Vault */}
      {activeTab === 'receipts' && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Immutable E-Receipts Issued
            </span>
            <span className="text-xs text-slate-500">QR-Verifiable Cryptographic Proof</span>
          </div>
          <Table
            columns={receiptColumns}
            data={receipts}
            keyExtractor={(r) => r.receiptNumber}
            isDense={isDense}
          />
        </Card>
      )}

      {/* Tab 3: Versioned Fee Structures */}
      {activeTab === 'structure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Community Health Extension Worker (CHEW) — 2026/2027
                </span>
                <Badge variant="success">Version 2026.1 (Active)</Badge>
              </div>
            }
          >
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <span>Tuition (Harmattan + Rain Semesters)</span>
                <span className="font-semibold font-tabular">₦120,000.00</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Clinical Posting & Rural PHC Levy</span>
                <span className="font-semibold font-tabular">₦35,000.00</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Laboratory Consumables & Logbook</span>
                <span className="font-semibold font-tabular">₦20,000.00</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>CHPRBN Professional Examination Levy</span>
                <span className="font-semibold font-tabular">₦45,000.00</span>
              </div>
              <div className="py-2.5 flex justify-between font-bold text-slate-900 bg-slate-50 px-2 rounded-[4px]">
                <span>Total Compulsory Session Charges</span>
                <span className="font-tabular">₦220,000.00</span>
              </div>
            </div>
          </Card>

          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Medical Laboratory Technician (MLT) — 2026/2027
                </span>
                <Badge variant="success">Version 2026.1 (Active)</Badge>
              </div>
            }
          >
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <span>Tuition (Harmattan + Rain Semesters)</span>
                <span className="font-semibold font-tabular">₦140,000.00</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Hospital Laboratory Bench Fee</span>
                <span className="font-semibold font-tabular">₦40,000.00</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Reagents & Diagnostic Kits</span>
                <span className="font-semibold font-tabular">₦30,000.00</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>MLSCN National Board Examination Levy</span>
                <span className="font-semibold font-tabular">₦50,000.00</span>
              </div>
              <div className="py-2.5 flex justify-between font-bold text-slate-900 bg-slate-50 px-2 rounded-[4px]">
                <span>Total Compulsory Session Charges</span>
                <span className="font-tabular">₦260,000.00</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Debtors & Defaulters Tracking */}
      {activeTab === 'debtors' && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Active Defaulter Registry
              </span>
              <p className="text-xs text-slate-500">
                Any student with unpaid fee installment lines past scheduled due dates
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => showToast({ type: 'info', title: 'SMS Notice Dispatched', message: 'Automated installment reminders queued for 142 debtors' })}
            >
              Dispatch Overdue Reminders
            </Button>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">Blessing Adeyemi (CHE/2026/0014)</span>
                <p className="text-slate-500 text-[11px]">CHEW 200L • Overdue: 2nd Semester Installment</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#F83A20] font-tabular">₦55,000.00</span>
                <div><Badge variant="danger" size="sm">Exam Gate Restricted</Badge></div>
              </div>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">Khadijat Sani (PHT/2026/0009)</span>
                <p className="text-slate-500 text-[11px]">Pharmacy Tech 100L • Overdue: Acceptance & Kit Fee</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#F83A20] font-tabular">₦40,000.00</span>
                <div><Badge variant="warning" size="sm">Reminder Sent</Badge></div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Verified Student Payment"
        description="Posts a credit line to the student ledger and issues an official immutable receipt."
      >
        <form onSubmit={handlePostPayment} className="space-y-4">
          <Input
            label="Matriculation Number"
            value={matricNumber}
            onChange={(e) => setMatricNumber(e.target.value)}
            required
          />
          <Input
            label="Student Full Name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
          />
          <Input
            label="Amount Paid (NGN ₦)"
            type="number"
            value={amountNaira}
            onChange={(e) => setAmountNaira(e.target.value)}
            required
          />
          <Select
            label="Fee Category"
            value={category}
            onChange={(v) => setCategory(v as FeeCategory)}
            options={[
              { value: 'tuition', label: 'Tuition Fee' },
              { value: 'clinical_posting', label: 'Clinical Posting Levy' },
              { value: 'acceptance', label: 'Acceptance Fee' },
              { value: 'exam', label: 'Board Examination Levy' },
              { value: 'hostel', label: 'Hostel Accommodation Fee' },
              { value: 'uniform_kit', label: 'Uniform & Clinical Kit' },
            ]}
          />
          <Select
            label="Payment Gateway / Provider"
            value={paymentMethod}
            onChange={(v) => setPaymentMethod(v as PaymentMethod)}
            options={[
              { value: 'paystack', label: 'Paystack (Card / USSD / Bank Transfer)' },
              { value: 'flutterwave', label: 'Flutterwave' },
              { value: 'remita', label: 'Remita (RRR / Bank Branch Transfer)' },
              { value: 'bank_transfer_direct', label: 'Direct Bank Settlement (Confirmed)' },
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm & Post to Ledger</Button>
          </div>
        </form>
      </Modal>

      {/* Official Receipt Viewer Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Official Electronic Receipt"
          description="Tamper-evident institutional record of payment issued by Bursary Department."
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-400 font-medium">
                Ref: {selectedReceipt.qrVerificationHash.slice(0, 24)}...
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Official Copy
              </Button>
            </div>
          }
        >
          <div className="border border-slate-300 p-6 rounded-[4px] bg-white space-y-4 text-xs font-sans">
            {/* College Header */}
            <div className="text-center border-b border-slate-200 pb-4">
              <h2 className="text-base font-bold text-slate-900 tracking-wide uppercase">
                Bethsaida College of Health Tech Ltd
              </h2>
              <p className="text-[11px] text-slate-500">
                P.M.B. 1042, Oyo State, Nigeria • accredited by NBTE & Health Boards
              </p>
              <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-[4px] text-xs font-bold text-[#0A77FE]">
                RECEIPT NO: {selectedReceipt.receiptNumber}
              </div>
            </div>

            {/* Receipt Details */}
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Paid By</span>
                <span className="font-bold text-slate-900 text-sm">{selectedReceipt.studentName}</span>
                <span className="block text-slate-600 font-medium">{selectedReceipt.matricNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase">Date & Time</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.paidAt.replace('T', ' ').slice(0, 19)}</span>
                <span className="block text-slate-400 text-[10px]">Payment Method: {selectedReceipt.paymentMethod.toUpperCase()}</span>
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                  <th className="py-2 px-2">Description</th>
                  <th className="py-2 px-2">Category</th>
                  <th className="py-2 px-2 text-right">Amount (NGN)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-2 font-medium">Harmattan 2026/2027 Academic Fees</td>
                  <td className="py-2 px-2 capitalize">{selectedReceipt.category.replace('_', ' ')}</td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900">{selectedReceipt.formattedAmount}</td>
                </tr>
              </tbody>
            </table>

            {/* Security Proof */}
            <div className="bg-slate-50 p-3 rounded-[4px] border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-10 h-10 text-slate-800 p-1 border border-slate-300 rounded-[4px] bg-white shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#13A348]" /> Cryptographically Sealed
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium">
                    Gateway Ref: {selectedReceipt.gatewayReference}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Authorized Signature</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.issuer}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
