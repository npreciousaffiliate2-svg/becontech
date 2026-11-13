export type RoleCode =
  | 'PROVOST'
  | 'REG'
  | 'BURSAR'
  | 'HOD'
  | 'INSTR'
  | 'EXAM'
  | 'CLINSUP'
  | 'SADMIN'
  | 'STU'
  | 'SPON';

export type RoleScope = 'college' | 'department' | 'site' | 'self';

export interface UserRoleAssignment {
  role: RoleCode;
  scope: RoleScope;
  scopeId?: string; // departmentId, siteId, or studentId for SPON
}

export type PermissionCode =
  | 'adm:read' | 'adm:write' | 'adm:approve'
  | 'sis:read' | 'sis:read_own' | 'sis:write' | 'sis:status_change'
  | 'fin:read' | 'fin:read_own' | 'fin:write' | 'fin:reversal' | 'fin:reconciliation'
  | 'exm:read' | 'exm:read_own' | 'exm:score_entry' | 'exm:approve_hod' | 'exm:approve_dean' | 'exm:publish' | 'exm:amend'
  | 'att:read' | 'att:read_own' | 'att:mark' | 'att:override'
  | 'cln:read' | 'cln:read_own' | 'cln:allocate' | 'cln:assess' | 'cln:clearance'
  | 'lms:read' | 'lms:read_own' | 'lms:write' | 'lms:grade'
  | 'hrm:read' | 'hrm:write' | 'hrm:payroll'
  | 'hst:read' | 'hst:read_own' | 'hst:allocate'
  | 'tts:read' | 'tts:read_own' | 'tts:write'
  | 'com:read' | 'com:broadcast'
  | 'rpt:read' | 'rpt:export' | 'rpt:audit'
  | 'core:admin' | 'core:users' | 'core:tenant_config';

export interface UserSession {
  userId: string;
  collegeId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  roles: UserRoleAssignment[];
  activeRole: RoleCode;
  permissions: PermissionCode[];
}
