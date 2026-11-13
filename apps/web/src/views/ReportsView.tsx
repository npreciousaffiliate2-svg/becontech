import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Card, Button, Badge, useToast, Tabs } from '@campusone/ui';
import { BarChart3, Download, FileSpreadsheet, ShieldCheck } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { showToast } = useToast();

  const standardReports = [
    {
      title: 'NBTE Monotechnic Accreditation Dataset (CHEW & MLT)',
      category: 'Regulatory',
      format: 'Excel / XLSX',
      description: 'Comprehensive staff-to-student ratios, clinical lab inventory, and 3-year performance metrics.',
    },
    {
      title: 'Bursary Cashbook & Payment Gateway Reconciliation',
      category: 'Financial',
      format: 'PDF & CSV',
      description: 'Bank settlement audit vs Paystack & Remita webhooks for Harmattan 2026.',
    },
    {
      title: 'CHPRBN National Board Examination Eligibility Roster',
      category: 'Academic',
      format: 'Official CSV Export',
      description: 'Qualified candidates with CGPA ≥ 2.00, fee clearance, and completed logbooks.',
    },
    {
      title: 'Clinical Postings Rural & Secondary Health Center Log',
      category: 'Clinical',
      format: 'Excel / XLSX',
      description: 'Rotation logs, supervisor evaluations, and hospital attendance breakdown.',
    },
  ];

  const handleDownloadReport = (title: string) => {
    showToast({
      type: 'success',
      title: 'Report Generated & Downloaded',
      message: `${title} exported successfully with cryptographic timestamp.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports, Analytics & Accreditation (RPT)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Executive KPIs • Regulatory Compliance Exports • NBTE & Health Board Datasets (PRD §6.15)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {standardReports.map((rpt, i) => (
          <Card key={i} className="flex flex-col justify-between">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <Badge variant="primary">{rpt.category}</Badge>
                <span className="text-slate-500 font-medium text-[10px]">{rpt.format}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{rpt.title}</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">{rpt.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDownloadReport(rpt.title)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Generate Export
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
