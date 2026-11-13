export interface AuditEventRecord {
  id: string;
  collegeId: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeSnapshot?: Record<string, unknown> | null;
  afterSnapshot?: Record<string, unknown> | null;
  ipAddress: string;
  userAgent: string;
  timestamp: string; // ISO 8601 UTC
  chainHash: string; // SHA-256 tamper-evident hash
  prevHash: string;
}
