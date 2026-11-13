import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Card,
  Button,
  Table,
  Badge,
  useToast,
  Tabs,
} from '@campusone/ui';
import { BookOpen, FileText, CheckCircle2, Clock, Play } from 'lucide-react';

export const LearningView: React.FC = () => {
  const { isDense } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'materials' | 'cbt'>('materials');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">E-Learning & CBT Practice (LMS)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Course Repository • Lab Guides • CHPRBN/MLSCN Board Exam CBT Practice Console
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'materials', label: 'Course Spaces & Materials' },
          { id: 'cbt', label: 'Board Exam CBT Practice Console' },
        ]}
        activeTab={activeTab}
        onChange={(id: any) => setActiveTab(id)}
      />

      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <Card
            header={
              <span className="font-semibold text-slate-900 uppercase tracking-wider">
                CHE 201: Primary Health Care I
              </span>
            }
          >
            <div className="divide-y divide-slate-100">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Module 1 — Maternal and Child Health in Rural Settings</p>
                  <p className="text-slate-400 text-[10px]">PDF • 3.2 MB • Uploaded by Dr. K. Bello</p>
                </div>
                <Button size="sm" variant="secondary">Download</Button>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Module 2 — Cold Chain and Vaccine Preservation Manual</p>
                  <p className="text-slate-400 text-[10px]">PDF • 5.1 MB • Uploaded by Dr. K. Bello</p>
                </div>
                <Button size="sm" variant="secondary">Download</Button>
              </div>
            </div>
          </Card>

          <Card
            header={
              <span className="font-semibold text-slate-900 uppercase tracking-wider">
                MLT 201: Clinical Chemistry & Urinalysis
              </span>
            }
          >
            <div className="divide-y divide-slate-100">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Laboratory Standard Operating Procedures (SOPs)</p>
                  <p className="text-slate-400 text-[10px]">PDF • 4.8 MB • Uploaded by Mr. O. Adebisi</p>
                </div>
                <Button size="sm" variant="secondary">Download</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'cbt' && (
        <Card>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  CHPRBN National Qualifying Practice Exam (Mock Diet 2026)
                </h3>
                <p className="text-slate-500">
                  Timed simulation mirroring the official Community Health Practitioners Registration Board CBT.
                </p>
              </div>
              <Badge variant="primary">100 Questions • 90 Mins</Badge>
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                leftIcon={<Play className="w-3.5 h-3.5" />}
                onClick={() => showToast({ type: 'info', title: 'CBT Session Initialized', message: 'Exam timer locked to Lagos timezone' })}
              >
                Launch Mock Exam
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
