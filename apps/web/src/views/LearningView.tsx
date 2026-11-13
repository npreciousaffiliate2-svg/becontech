import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import {
  Card,
  Button,
  Badge,
  useToast,
  Tabs,
} from '@campusone/ui';

export const LearningView: React.FC = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as 'materials' | 'cbt' | null;
  const [activeTab, setActiveTab] = useState<'materials' | 'cbt'>(
    tabParam === 'cbt' ? 'cbt' : 'materials'
  );

  useEffect(() => {
    if (tabParam && ['materials', 'cbt'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (id: 'materials' | 'cbt') => {
    setActiveTab(id);
    setSearchParams({ tab: id });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Online Learning & Practice Tests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lecture notes, laboratory guides, and board examination computer-based practice tests.
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'materials', label: 'Course Materials' },
          { id: 'cbt', label: 'Computer-Based Practice Tests' },
        ]}
        activeTab={activeTab}
        onChange={(id: any) => handleTabChange(id)}
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
                  <p className="font-semibold text-slate-800">Module 1: Maternal and Child Health in Rural Settings</p>
                  <p className="text-slate-400 text-[10px]">PDF (3.2 MB) • Uploaded by Dr. K. Bello</p>
                </div>
                <Button size="sm" variant="secondary">Download</Button>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Module 2: Cold Chain and Vaccine Preservation Manual</p>
                  <p className="text-slate-400 text-[10px]">PDF (5.1 MB) • Uploaded by Dr. K. Bello</p>
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
                  <p className="font-semibold text-slate-800">Laboratory Standard Operating Procedures</p>
                  <p className="text-slate-400 text-[10px]">PDF (4.8 MB) • Uploaded by Mr. O. Adebisi</p>
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
                  Community Health Board Qualifying Practice Exam (Mock 2026)
                </h3>
                <p className="text-slate-500">
                  Timed simulation mirroring the official national board computer test.
                </p>
              </div>
              <Badge variant="primary">100 Questions • 90 Minutes</Badge>
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => showToast({ type: 'info', title: 'Practice Test Started', message: 'Exam timer has commenced.' })}
              >
                Start Practice Exam
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
