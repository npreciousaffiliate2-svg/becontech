import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Card, Button, Badge, useToast, Tabs } from '@campusone/ui';
import { Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const TimetableView: React.FC = () => {
  const { showToast } = useToast();

  const timetableSlots = [
    { day: 'Monday', time: '08:00 – 10:00', course: 'CHE 201: Primary Health Care I', venue: 'Lecture Hall 2', instructor: 'Dr. K. Bello' },
    { day: 'Monday', time: '11:00 – 13:00', course: 'MLT 201: Clinical Chemistry', venue: 'Pathology Lab 1', instructor: 'Mr. O. Adebisi' },
    { day: 'Tuesday', time: '09:00 – 12:00', course: 'CHE 202: Anatomy & Physiology', venue: 'Anatomy Lab', instructor: 'Dr. (Mrs) Olukoya' },
    { day: 'Wednesday', time: '10:00 – 12:00', course: 'PHT 201: Pharmacology', venue: 'Lecture Hall 1', instructor: 'Pharm. G. Okoro' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Timetables & Class Schedules</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Classroom schedules, laboratory sessions, and clinical rotation times
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">
            <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> 0 Schedule Clashes Detected
          </Badge>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Harmattan Semester 2026/2027 Timetable Grid
          </span>
          <span className="text-xs text-slate-500">Instructor & Room Conflict Resolver Active</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {timetableSlots.map((slot, i) => (
            <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 w-24">{slot.day}</span>
                <span className="font-semibold text-slate-600 w-28">{slot.time}</span>
                <div>
                  <span className="font-semibold text-slate-800">{slot.course}</span>
                  <span className="text-slate-400 block text-[11px]">{slot.venue} • {slot.instructor}</span>
                </div>
              </div>
              <Badge variant="neutral">Confirmed</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
