export interface CloudEvent<T = Record<string, unknown>> {
  id: string;
  source: string; // e.g. "campusone.service.fin"
  type: string;   // e.g. "payment.succeeded.v1"
  specversion: '1.0';
  time: string;   // ISO-8601 UTC
  subject: string; // Aggregate entity ID (e.g. "student:CHT/2026/0042")
  college_id: string;
  traceparent?: string;
  data: T;
}

export type EventType =
  | 'student.admitted.v1'
  | 'student.status.changed.v1'
  | 'student.registered.v1'
  | 'finance.charge.posted.v1'
  | 'finance.installment.due.v1'
  | 'payment.succeeded.v1'
  | 'payment.failed.v1'
  | 'payment.reversed.v1'
  | 'result.published.v1'
  | 'grade.amended.v1'
  | 'posting.allocated.v1'
  | 'posting.completed.v1'
  | 'attendance.threshold.breached.v1'
  | 'timetable.published.v1'
  | 'notification.requested.v1'
  | 'notification.delivered.v1'
  | 'staff.licence.expiring.v1';
