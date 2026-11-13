import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Card, Button, Table, Badge, useToast, Tabs } from '@campusone/ui';
import { Building2, Bed, Check } from 'lucide-react';

export const HostelsView: React.FC = () => {
  const { isDense } = useApp();
  const { showToast } = useToast();

  const rooms = [
    { block: 'Hall A (Female)', roomNo: 'A-102', capacity: 4, occupied: 4, status: 'FULL' },
    { block: 'Hall A (Female)', roomNo: 'A-103', capacity: 4, occupied: 3, status: 'AVAILABLE' },
    { block: 'Hall B (Male)', roomNo: 'B-201', capacity: 4, occupied: 2, status: 'AVAILABLE' },
    { block: 'Hall B (Male)', roomNo: 'B-202', capacity: 4, occupied: 4, status: 'FULL' },
  ];

  const columns = [
    { key: 'block', header: 'Hostel Block' },
    { key: 'roomNo', header: 'Room Number', render: (r: any) => <span className="font-semibold">{r.roomNo}</span> },
    { key: 'capacity', header: 'Total Capacity', align: 'center' as const },
    { key: 'occupied', header: 'Occupied Beds', align: 'center' as const },
    {
      key: 'status',
      header: 'Status',
      render: (r: any) => <Badge variant={r.status === 'FULL' ? 'danger' : 'success'}>{r.status}</Badge>,
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right' as const,
      render: (r: any) =>
        r.status === 'AVAILABLE' ? (
          <Button size="sm" variant="secondary" onClick={() => showToast({ type: 'success', title: 'Bed Allocated', message: `Bed reserved in ${r.roomNo} upon fee verification.` })}>
            Allocate Bed
          </Button>
        ) : (
          <Button size="sm" variant="ghost" disabled>Full</Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hostel & Accommodation (HST)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hostel Inventory • Bed Allocation Engine • Room Transfers • Fee Clearance Gates
          </p>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Hostel Blocks Inventory
          </span>
          <span className="text-xs text-slate-500">Gender & Programme Quota Rules Enforced</span>
        </div>
        <Table columns={columns} data={rooms} keyExtractor={(r) => r.roomNo} isDense={isDense} />
      </Card>
    </div>
  );
};
