import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { supabase } from './supabase.ts';

const writes = new Map<string, number>();

export const SAVE_ERROR_EVENT = 'campusone:save-error';

function reportSaveError(kind: string, message: string) {
  console.warn(`[CampusOne] ${kind} remote sync notice (local backup active):`, message);
  window.dispatchEvent(new CustomEvent(SAVE_ERROR_EVENT, { detail: { kind, message } }));
}

function recordId(kind: string, item: unknown, index: number): string {
  const row = item as Record<string, unknown> | null;
  const raw =
    row?.id ||
    row?.code ||
    row?.matricNumber ||
    row?.applicationNumber ||
    row?.memoRef ||
    row?.batchRef ||
    row?.ticketNumber ||
    row?.receiptNumber ||
    `${index}`;
  return `${kind}:${String(raw)}`.slice(0, 180);
}

async function syncStudentRegister(rows: unknown[]) {
  const payload = rows
    .map((item) => item as Record<string, unknown>)
    .filter((item) => item.matricNumber && item.fullName)
    .map((item) => ({
      id: String(item.id || item.matricNumber),
      college_id: 'bethsaida',
      matric_number: String(item.matricNumber),
      full_name: String(item.fullName),
      email: String(item.email || ''),
      phone: item.phone ? String(item.phone) : null,
      department_code: String(item.departmentCode || item.department || 'GEN'),
      programme: String(item.programme || item.programmeCode || 'Programme'),
      level: String(item.level || '100 Level'),
      cgpa: Number(item.cgpa || 0),
      fees_status: String(item.feesStatus || 'OWING'),
      clinical_clearance: String(item.clinicalClearance || 'PENDING'),
      status: String(item.status || 'ACTIVE'),
      details: item,
    }));
  if (payload.length === 0) return;
  await supabase.from('students').upsert(payload, { onConflict: 'id' });
}

export async function persistRecords<T>(kind: string, rows: T[]) {
  // Always persist locally first so data is never lost regardless of RLS or network
  try {
    localStorage.setItem(`campusone_shared_${kind}`, JSON.stringify(rows));
  } catch (e) {}

  const generation = (writes.get(kind) || 0) + 1;
  writes.set(kind, generation);

  const stamped = rows.map((item, index) => ({
    id: recordId(kind, item, index),
    college_id: 'bethsaida',
    record_kind: kind,
    payload: item,
    updated_at: new Date().toISOString(),
  }));

  if (stamped.length === 0) {
    try {
      const { error } = await supabase.from('operational_records').delete().eq('record_kind', kind);
      if (error) reportSaveError(kind, error.message);
      if (!error && kind === 'sis.students') await syncStudentRegister([]);
    } catch (e) {}
    return;
  }

  try {
    const { error } = await supabase.from('operational_records').upsert(stamped, { onConflict: 'id' });
    if (error) {
      reportSaveError(kind, error.message);
      return;
    }
  } catch (err: any) {
    reportSaveError(kind, err?.message || 'Remote sync failed');
    return;
  }
  if (writes.get(kind) !== generation) return;

  try {
    const { data: existing } = await supabase.from('operational_records').select('id').eq('record_kind', kind);
    const keep = new Set(stamped.map((row) => row.id));
    const stale = (existing || []).map((row) => row.id).filter((id) => !keep.has(id));
    for (let index = 0; index < stale.length; index += 40) {
      if (writes.get(kind) !== generation) return;
      await supabase.from('operational_records').delete().in('id', stale.slice(index, index + 40));
    }
  } catch (e) {}

  if (kind === 'sis.students') await syncStudentRegister(rows);
}

export async function loadRecords<T>(kind: string): Promise<T[] | null> {
  try {
    const { data, error } = await supabase
      .from('operational_records')
      .select('payload')
      .eq('record_kind', kind)
      .order('updated_at', { ascending: true });
    if (!error && data && data.length > 0) {
      const loaded = data.map((row) => row.payload as T);
      try {
        localStorage.setItem(`campusone_shared_${kind}`, JSON.stringify(loaded));
      } catch (e) {}
      return loaded;
    }
  } catch (e) {}

  // Local fallback
  try {
    const local = localStorage.getItem(`campusone_shared_${kind}`);
    if (local) return JSON.parse(local) as T[];
  } catch (e) {}
  return null;
}

export function useSharedRecords<T>(kind: string, _seed?: T[]): [T[], Dispatch<SetStateAction<T[]>>] {
  const [rows, setRows] = useState<T[]>([]);
  const ready = useRef(false);

  useEffect(() => {
    let cancel = false;
    loadRecords<T>(kind).then(async (remote) => {
      if (cancel) return;
      let rows = remote ?? [];
      if (rows.length === 0 && kind === 'sis.students') {
        const { data } = await supabase.from('students').select('*').order('full_name');
        rows = ((data || []) as Record<string, unknown>[]).map((row) => {
          const details = (row.details && typeof row.details === 'object' ? row.details : {}) as Record<string, unknown>;
          return {
            ...details,
            id: row.id,
            matricNumber: row.matric_number,
            fullName: row.full_name,
            email: row.email,
            phone: row.phone || '',
            departmentCode: row.department_code,
            programme: row.programme,
            level: row.level,
            cgpa: Number(row.cgpa || 0),
            feesStatus: row.fees_status,
            clinicalClearance: row.clinical_clearance,
            status: row.status,
          } as T;
        });
      }
      if (!cancel) {
        setRows(rows);
        ready.current = true;
      }
    });
    return () => {
      cancel = true;
    };
  }, [kind]);

  const setShared = useCallback(
    (action: SetStateAction<T[]>) => {
      setRows((prev) => {
        const next = typeof action === 'function' ? (action as (current: T[]) => T[])(prev) : action;
        if (ready.current) void persistRecords(kind, next);
        return next;
      });
    },
    [kind]
  );

  return [rows, setShared];
}
