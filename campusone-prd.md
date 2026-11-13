# CampusOne — Product Requirements Document (PRD)

| Field | Value |
|---|---|
| Product | CampusOne — School Management Platform for Health Training Institutions |
| Client | Bethsaida College of Health Tech Ltd |
| Vendor | Checker Web Services (checkerwebservices.com.ng) |
| Document version | 1.0 |
| Status | Draft for discovery-phase confirmation |
| Date | November 2026 |
| Source document | "A Comprehensive Cloud Solution for Academic & Administrative Operations" (v1.0, Sept 2026) |
| Commercial terms | Out of scope for this PRD. Pricing placeholders (₦[X], ₦[Y]) are resolved in the commercial proposal, not here. |

**Keyword convention.** The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be interpreted as in RFC 2119. "MUST" items are release-gating.

---

## 1. Product Vision

CampusOne is a cloud-based school management platform that unifies the academic, administrative, financial, and clinical operations of a College of Health Technology into one secure system of record. It replaces disconnected spreadsheets and paper files with a single platform covering admissions through graduation, clinical postings, bursary operations, and regulatory reporting.

The delivered product is **owned outright by the client** (one-time license, source code and data handover). The vendor optionally provides hosting, maintenance, and support under an annual plan. The system MUST remain fully operable by the client if the maintenance plan lapses.

**Design posture.** CampusOne is institutional software: dense with capability, quiet in presentation. Nothing in the product may look or feel improvised. There are no decorative elements, no emojis anywhere in the UI or notification copy, no placeholder screens, no stock-photo clutter, and no native browser controls (modals, alerts, confirms, selects, date pickers) — every interactive element is a designed component from the design system in Section 9.

### 1.1 Product principles (binding on all implementation)

1. **Modular by construction.** Every module is an independently versioned, independently deployable unit with its own data store. Cross-module access occurs only through published contracts (APIs and events). There is no shared database, no cross-module table joins, no cross-module imports.
2. **Contract before code.** No module code is written before its OpenAPI schema, event catalog entries, and data ownership statement are merged.
3. **One screen, one job.** Every view has a single primary task. Secondary information is progressively disclosed, never stacked.
4. **Boring reliability.** Correctness of money, grades, and records outranks feature count. Financial and academic computations are deterministic, audited, and reversible only through documented correction workflows.
5. **Mobile-first, but desktop-dense.** Works fully on a phone (registrar in the field, bursary queues, clinical supervisors); the desktop layout uses density appropriate to administrative work.
6. **Nigeria-first.** Local payment gateways, SMS, Naira formatting, NDPA 2023 compliance, and the academic calendar of Nigerian health institutions are defaults, not configuration afterthoughts.
7. **Accessibility is not optional.** WCAG 2.1 AA is a release gate, not a pass.

---

## 2. Scope

### 2.1 In scope — the 14 functional modules

| # | Module | Code | Core responsibility |
|---|---|---|---|
| 1 | Admissions & Enrollment | ADM | Applications, screening, admission lists, matriculation |
| 2 | Student Information System | SIS | Student records, registration, status lifecycle, ID cards |
| 3 | Fees & Bursary | FIN | Fee structures, payments, receipts, ledger, debtor management |
| 4 | Academics & Examination | EXM | Curriculum, scores, grading, CGPA, transcripts, board exams |
| 5 | Attendance | ATT | Class and clinical attendance, eligibility rules |
| 6 | Clinical Postings & SIWES | CLN | Sites, allocations, rotations, logbooks, clearance |
| 7 | E-Learning / LMS | LMS | Materials, assignments, quizzes, CBT practice, virtual classes |
| 8 | Staff & HR | HRM | Staff records, leave, payroll, pensions, appraisal |
| 9 | Hostel & Accommodation | HST | Inventory, bed allocation, hostel fees |
| 10 | Timetable & Scheduling | TTS | Class/practical/exam timetables, clash detection, rotations |
| 11 | Communication & Notifications | COM | SMS, email, in-app announcements, sponsor portal feeds |
| 12 | Library (optional) | LIB | Catalog, lending, e-resource tracking |
| 13 | Alumni (optional) | ALM | Alumni records, induction/internship tracking |
| 14 | Reports, Analytics & Dashboard | RPT | KPIs, standard/custom reports, accreditation exports |

Plus **Platform Core (CORE)** — not a business module but a required foundation: Identity & Access (auth, RBAC, 2FA), Tenant & Configuration, Audit & Compliance, Notification Dispatch (the transport used by COM), Scheduler/Jobs, File & Document Vault, and Integration Hub (payment gateways, SMS/email providers).

### 2.2 Out of scope for v1

- Native mobile apps (optional add-on; the web app MUST be fully responsive and installable as a PWA)
- Public marketing website redesign (optional add-on)
- On-premise deployment (supported architecture, but not part of this delivery)
- Accounting beyond bursary operations (no full GL; export to accounting packages is a report, not an integration)
- Biometric/physical access control hardware

---

## 3. Personas and Roles

Access control is role-based and granular. Roles are seeded per deployment and extensible. One user MAY hold multiple roles (e.g., Instructor + Clinical Supervisor); effective permissions are the union, constrained by scope (department, site, or college-wide).

| Role code | Persona | Primary scope |
|---|---|---|
| PROVOST | Provost / Rector | College-wide, read-everything, approvals |
| REG | Registrar | Admissions, student records, status changes |
| BURSAR | Bursar | Fees, payments, reconciliation, payroll view |
| HOD | Head of Department | Department: courses, results approval, attendance reports |
| INSTR | Instructor / Lecturer | Own courses: scores, attendance, materials |
| EXAM | Exams Officer | Examination session control, broadsheets, transcripts |
| CLINSUP | Clinical Supervisor | Posting sites: logbooks, assessments, site attendance |
| SADMIN | System Administrator | Configuration, users, roles, audit — no academic approval rights |
| STU | Student | Own records: registration, fees, results, postings, materials |
| SPON | Sponsor / Parent | Linked ward(s): fees, results, attendance, notices |

**Hard permission rules**

- P1: A user MUST NOT approve their own submission (no self-approval in grade workflow, leave, posting assessments).
- P2: Financial write operations (fee structure change, payment reversal, refund) require a role with `fin.write` AND are audit-logged with before/after values.
- P3: Grade changes after publication require EXAM role plus a documented reason; the prior value is retained immutably.
- P4: Sponsors see only their linked wards, and see results only after publication.
- P5: Every privileged action writes an audit event (actor, role, action, entity, before/after, timestamp, IP/device).

---

## 4. System Architecture

### 4.1 Architecture style

CampusOne is built as a **distributed modular architecture**: independently deployable services behind an API gateway, communicating synchronously via REST (versioned, OpenAPI-published) and asynchronously via a durable event stream. It MUST NOT degrade into a monolith, and it MUST NOT become a "distributed monolith" (services that require each other's databases or share tables).

- **Service per module.** Each of the 14 modules plus CORE capabilities is its own deployable unit with its own repository package, its own CI pipeline, its own database (schema-per-service minimum; separate database instance preferred for FIN, SIS, EXM).
- **Database-per-service.** No service reads another service's tables. This is enforced in CI (Section 11), not by convention.
- **API Gateway (edge).** Single entry point: authentication termination, rate limiting, request routing, tenant resolution. BFF (backend-for-frontend) aggregation layer for the web client so the frontend never orchestrates more than one backend call per screen where avoidable.
- **Event backbone.** A durable log (e.g., NATS JetStream / Kafka-class broker). Services publish facts (`payment.succeeded`, `student.admitted`, `score.approved`, `posting.allocated`); interested services subscribe. Commands that need a synchronous answer use REST; everything that can be eventual is an event.
- **Outbox pattern.** Every state change that produces an event writes the event to an outbox table in the same transaction, then a relay publishes it. No dual-write bugs.
- **Saga/compensation for cross-module flows.** E.g., "withdraw student" (SIS) triggers fee-clearance check (FIN) and posting recall (CLN) via orchestrated sagas with compensation steps; partial failure leaves the system in a defined, resumable state.
- **Idempotency.** All mutating endpoints accept an `Idempotency-Key`; all event consumers are idempotent (dedupe by event id). Payment webhooks MUST be idempotent by provider reference.

### 4.2 Module dependency rules

- The dependency graph MUST be a directed acyclic graph. CORE (identity, audit, notification transport, config) is depended on by all; no module depends on another business module's internals — only on its published API/events.
- **Modules may not call each other synchronously in request chains deeper than 2 hops** from the gateway. Deeper flows use events.
- **Shared kernel is forbidden except for one small, versioned contracts package** (types, event schemas, error codes). No shared business logic, no shared ORM models, no shared utility dumping ground.
- New cross-module dependencies require an Architecture Decision Record (ADR) approved before implementation.

### 4.3 Reference technology stack (binding unless ADR'd)

| Layer | Choice | Rationale |
|---|---|---|
| Web client | TypeScript, React, Vite; server state via TanStack Query; forms via a typed schema form engine | Typed end-to-end; PWA-capable |
| UI system | Custom component library built on design tokens (Radix-style headless primitives permitted, styled in-house) | Zero native browser controls; no off-the-shelf theme look |
| API services | Node (NestJS) or Python (FastAPI) — one language per service family, fixed at kickoff | Team velocity; OpenAPI generation |
| Databases | PostgreSQL per service; Redis for cache/rate limits; object storage (S3-compatible) for documents | ACID for money/grades |
| Event backbone | NATS JetStream (or Kafka where scale demands) | Durable replay, work queues |
| Gateway/BFF | Kong or Envoy + thin BFF services | Edge policy enforcement |
| Auth | OIDC provider (Keycloak-class) with 2FA (TOTP) for staff | Standards-based; NDPA-friendly audit |
| Payments | Paystack, Flutterwave, Remita behind an internal Payment Provider SPI | Swap/extend without touching FIN logic |
| Messaging | Termii-class SMS provider, SMTP/transactional email, WhatsApp via provider template API | Local realities |
| Infra | Docker; IaC (Terraform); orchestration on AWS/Azure; GitHub Actions CI | 99.9% uptime target; reproducible deploys |
| Observability | OpenTelemetry traces, structured logs, metrics, uptime + error tracking | SLA accountability |

### 4.4 Deployment and tenancy model

- Deployment model per client: **single-tenant instance** with its own subdomain (`bethsaida.<vendor-domain>`) or custom domain, its own database instances, and its own encryption keys. The "multi-tenant SaaS" language in the sales proposal is realized as *many isolated single-tenant deployments* — this preserves the ownership promise, simplifies NDPA compliance and data residency, and eliminates noisy-neighbor risk.
- All tables nonetheless carry `college_id` (tenant key) so the codebase remains multi-college-capable without rework.
- Environments per client: `prod`, `staging` (client-visible UAT), `dev`. No production data in `dev`; staging uses anonymized snapshots.
- Daily automated backups (PITR where available), encrypted at rest, with quarterly restore drills. RPO ≤ 24h (target 1h), RTO ≤ 4h.
- Zero infrastructure cost to the client under the maintenance plan; the delivered system MUST be deployable to a standard cloud account the client controls (documented handover).

### 4.5 Integration Hub (CORE capability)

All third-party integrations live behind internal anti-corruption adapters. Business modules never call Paystack/Termii/etc. directly.

- **Payments SPI:** `initializePayment`, `verifyPayment`, `refund`, `webhook normalization`, `reconcile`. Providers: Paystack, Flutterwave, Remita (bank transfer confirmation flow included). Webhook payloads are verified by signature, stored raw, then normalized into `payment.succeeded` / `payment.failed` events.
- **Messaging SPI:** `sendSms`, `sendEmail`, `sendWhatsApp` with template registry, per-tenant rate limits, delivery receipts, and cost accounting.
- **Scheduler:** all time-based work (reminders, posting rotation start/end, fee-deadline jobs, report generation) is a scheduled job with an audit trail — never cron-on-a-laptop.

---

## 5. Cross-Cutting Domain Model and Canonical Business Rules

These rules are normative. Module specs reference them; changing them requires an ADR and a migration note.

### 5.1 Identity and numbering

- Matriculation numbers: format `<PROGRAMME_CODE>/<ADMISSION_YEAR>/<SERIAL>` (e.g., `CHT/2026/0042`), generated atomically per programme per session by ADM; SIS consumes via event. Numbers are never reused, including for withdrawn students.
- Index numbers (board exams) are EXM-managed, sequential per exam diet per programme, never reused.
- All monetary amounts are stored as integer kobo (minor units) with ISO currency `NGN`. Floating point for money is forbidden.

### 5.2 Academic structure

- Hierarchy: College → School/Faculty → Department → Programme → Level → Semester/Session.
- A **Course** belongs to a Department; has code, title, credit units (0–6), prerequisites (course IDs), and is offered per programme per level per semester.
- Session = academic year (e.g., 2026/2027); semester = Harmattan/Rain (configurable names).
- Health programmes ship as seed data: Community Health, Med Lab Tech, Pharmacy Tech, Health Records, Environmental Health, Nutrition & Dietetics, Dental Therapy, etc. Seed data is configuration, not hard-coded logic.

### 5.3 Grading and results (EXM)

- Grading scale (default, configurable per programme before first use, then frozen per session): A=70–100 (5.0), B=60–69 (4.0), C=50–59 (3.0), D=45–49 (2.0), E=40–44 (1.0), F=0–39 (0.0). The frozen scale for a session is stored with each result record — historical results never change when policy changes.
- CA/Exam split default 30/70 or 40/60, set per course at allocation time and frozen for the session.
- GPA = Σ(grade point × credit units) / Σ(credit units) per semester; CGPA = cumulative over all registered semesters. Computations are pure functions with golden test vectors.
- Approval workflow: Instructor enters → HOD approves → Dean approves → Exams Officer publishes. Scores are locked at each step; unlocking requires EXAM role with reason (P3). A broadsheet is immutable once published; corrections happen via result-amendment records that append, never overwrite.
- Carryover/resit: any F grade generates a carryover record; resit scores are recorded separately and capped per policy (default cap 40 → grade E maximum for resit courses), and flagged on transcripts.
- Probation alert: CGPA below programme threshold (default 1.50) for a semester raises an alert to HOD/PROVOST.
- Attendance-based exam eligibility: configurable minimum attendance % per course (default 75%); EXM consumes ATT aggregates — it never queries ATT tables.

### 5.4 Financial rules (FIN)

- Fee structure is versioned: changes take effect for a defined session/level/category and never retroactively alter posted ledger entries.
- Categories: tuition, acceptance, clinical posting, uniform/kit, hostel, exam, application, other (extensible).
- Every payment creates: a settlement record, an immutable receipt (numbered, printable, QR-verifiable), and ledger postings (double-entry style: student account debit/credit lines). Balances are derived from the ledger, never stored as a mutable number without derivation.
- Installment plans: schedule of due dates per level/category; overdue lines accrue reminders (COM events), not automatic penalties, unless configured.
- Reversal/refund is a compensating entry with approval (P2), never a delete.
- Debtor definition: any due, unpaid installment line past its due date. Dashboards and reports derive from this single definition.

### 5.5 Clinical postings (CLN)

- Rotation templates per programme/level define site-type sequence, duration (weeks), and capacity.
- Allocation respects: site capacity, student level/prerequisites, conflicts with TTS exam timetable, and unpaid posting-fee clearance (FIN event) where the college enables that rule.
- Logbook entries are student-submitted, supervisor-assessed; assessments are P1-protected.
- Posting clearance is generated only when: attendance threshold met (ATT), logbook complete, supervisor assessment submitted, and posting fee settled (FIN) — all via events.

---

## 6. Functional Requirements by Module

Requirement IDs are stable: `FR-<MODULE>-<nnn`. Priority: **M** = must (v1 release gate), **S** = should (v1 if capacity allows), **C** = could (post-v1 backlog). Every M requirement ships with acceptance criteria in the module's spec pack (contract-first artifacts, Section 11).

### 6.1 CORE — Platform Core

| ID | Requirement | Pri |
|---|---|---|
| FR-CORE-001 | OIDC login for all users; session management; device listing and revocation | M |
| FR-CORE-002 | 2FA (TOTP) mandatory for staff roles, optional for students/sponsors; recovery codes | M |
| FR-CORE-003 | RBAC engine: role + scope (college/department/site/self) with permission union; enforced server-side on every endpoint | M |
| FR-CORE-004 | Full audit log: every privileged/mutating action with actor, before/after, IP/device; tamper-evident (hash-chained); searchable and exportable by SADMIN | M |
| FR-CORE-005 | Tenant configuration: academic calendar, programme seeds, grading scale drafts, fee categories, branding (logo, colors within design-system bounds) | M |
| FR-CORE-006 | Document vault: object storage, virus scan on upload, access-scoped links, retention rules | M |
| FR-CORE-007 | Scheduler service for timed jobs with audit trail and retry policy | M |
| FR-CORE-008 | Notification dispatch SPI (sms/email/whatsapp/in-app) with template registry and delivery receipts; used by COM module for user-facing composition | M |
| FR-CORE-009 | Idempotency keys on all POST/PUT endpoints; safe retries | M |
| FR-CORE-010 | Health endpoints, structured logs, trace propagation across services | M |

### 6.2 ADM — Admissions & Enrollment

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-001 | Configurable online application forms per programme (field sets, required documents) | M |
| FR-ADM-002 | Application fee payment via Integration Hub; application submits only on confirmed payment | M |
| FR-ADM-003 | O'Level result capture (subjects, grades, exam type, sitting) with verification workflow and document upload | M |
| FR-ADM-004 | Entrance screening: CBT option (question bank, scheduling, auto-scoring) or manual screening checklist | M |
| FR-ADM-005 | Admission list generation (batch), with criteria filters; publish to portal and bulk SMS | M |
| FR-ADM-006 | Admission letter generation (template-driven PDF) and acceptance-fee payment trigger | M |
| FR-ADM-007 | Auto matriculation number generation on acceptance (per §5.1), published via `student.admitted` event | M |
| FR-ADM-008 | Bulk upload of admitted candidates (validated CSV/XLSX with row-level error report) | M |
| FR-ADM-009 | Application analytics: funnel by programme, source, payment status | S |

### 6.3 SIS — Student Information System

| ID | Requirement | Pri |
|---|---|---|
| FR-SIS-001 | Complete student record: biodata, documents (vault), academic history, contacts, sponsor links | M |
| FR-SIS-002 | Semester course registration against curriculum; add/drop window with departmental approval workflow | M |
| FR-SIS-003 | Status lifecycle: active, suspended, withdrawn, deferred, graduated, expelled — each transition is an audited workflow with reason codes and downstream events | M |
| FR-SIS-004 | Print-ready student ID card generation (template + photo rules) | M |
| FR-SIS-005 | Medical/immunization fields (configurable field group) for health students; access-restricted | M |
| FR-SIS-006 | Sponsor portal linkage: invite/approve sponsor, per-ward visibility rules (P4) | M |
| FR-SIS-007 | Student profile timeline: admissions, registrations, payments, results, postings, status events | S |
| FR-SIS-008 | Duplicate detection (name+DOB, phone, email) on create | S |

### 6.4 FIN — Fees & Bursary

| ID | Requirement | Pri |
|---|---|---|
| FR-FIN-001 | Versioned fee structures per programme/level/category/indigene status/installment plan | M |
| FR-FIN-002 | Online payment via Paystack/Flutterwave/Remita through the Payment SPI; bank transfer confirmation flow | M |
| FR-FIN-003 | Instant e-receipt (numbered, immutable, QR-verifiable) on confirmed payment; receipt reprint from portal | M |
| FR-FIN-004 | Student ledger: full derived balance and per-line history; student/sponsor-visible | M |
| FR-FIN-005 | Debtor tracking per §5.4 with scheduled reminders (events to COM) and defaulter dashboards | M |
| FR-FIN-006 | Bursary reports: daily collections, reconciliation (provider settlement vs ledger), summary statements | M |
| FR-FIN-007 | Separate fee categories incl. tuition, acceptance, clinical posting, uniform/kit, hostel, exam (§5.4) | M |
| FR-FIN-008 | Reversals/refunds via compensating entries with dual approval (P2) | M |
| FR-FIN-009 | Payment plans: custom schedules per student with approval workflow | S |
| FR-FIN-010 | Excel/PDF export of all bursary reports | M |

### 6.5 EXM — Academics & Examination

| ID | Requirement | Pri |
|---|---|---|
| FR-EXM-001 | Curriculum/course setup with credit units and prerequisites; versioning per session | M |
| FR-EXM-002 | Instructor course allocation per semester (events to LMS, ATT, TTS consumers) | M |
| FR-EXM-003 | CA and exam score entry per allocated instructor; frozen split per §5.3 | M |
| FR-EXM-004 | Grade approval chain Instructor → HOD → Dean → Exams Officer; locking per §5.3; no self-approval (P1) | M |
| FR-EXM-005 | Automatic GPA/CGPA computation and result broadsheets (deterministic, golden-tested) | M |
| FR-EXM-006 | Carryover/resit management and probation alerts per §5.3 | M |
| FR-EXM-007 | Transcript generation (official — sealed/numbered; student copy), statement of result | M |
| FR-EXM-008 | Graduation list processing (eligibility rules: CGPA, carryover clearance, fee clearance via FIN event, posting clearance via CLN event) | M |
| FR-EXM-009 | Board exam support: eligibility list export (e.g., CHPRBN/NMCN-related registrations), index number management, registration dataset export | M |
| FR-EXM-010 | Result publication to student/sponsor portals; publish is a one-way state transition with notification | M |

### 6.6 ATT — Attendance

| ID | Requirement | Pri |
|---|---|---|
| FR-ATT-001 | Instructor-led class register, mobile-first, one-tap marking with bulk actions | M |
| FR-ATT-002 | Clinical/practical attendance at posting sites (CLINSUP or site-based marking) | M |
| FR-ATT-003 | Eligibility aggregation service per course per student (threshold %, §5.3), consumed by EXM via API | M |
| FR-ATT-004 | Excuse/appeal workflow for missed classes with approval | S |
| FR-ATT-005 | Attendance reports for HODs and management | M |

### 6.7 CLN — Clinical Postings & SIWES

| ID | Requirement | Pri |
|---|---|---|
| FR-CLN-001 | Posting site registry: teaching hospitals, general hospitals, PHCs, partner clinics/labs; contacts, capacity, MOU documents (vault) | M |
| FR-CLN-002 | Rotation templates and allocation engine per §5.5 with manual override (audited) | M |
| FR-CLN-003 | Supervisory instructor assignment per site/batch; supervision schedule | M |
| FR-CLN-004 | Student logbook (structured entries + attachments) and supervisor assessments (P1) | M |
| FR-CLN-005 | Posting fee tracking (FIN events) and clearance generation per §5.5 | M |
| FR-CLN-006 | Posting notifications to students/sponsors/sites (via COM events) | M |

### 6.8 LMS — E-Learning

| ID | Requirement | Pri |
|---|---|---|
| FR-LMS-001 | Materials upload per course (notes, slides, videos, lab guides) with access scoping to registered students | M |
| FR-LMS-002 | Assignments and quizzes with auto-grading (objective) and manual grading (subjective) | M |
| FR-LMS-003 | CBT practice/exam mode mirroring board-exam style (timed, question banks, instant scoring) | M |
| FR-LMS-004 | Virtual class integration: Zoom/Google Meet link generation per scheduled class (TTS events) | S |
| FR-LMS-005 | Progress tracking per student per course | S |

### 6.9 HRM — Staff & HR

| ID | Requirement | Pri |
|---|---|---|
| FR-HRM-001 | Staff records: biodata, qualifications, professional licenses/registration numbers, document vault | M |
| FR-HRM-002 | Leave management: annual/sick/study with approval workflow, balance ledger, calendar view | M |
| FR-HRM-003 | Payroll: salary structures, allowances, deductions, PAYE computation; payslips; payroll run locking and approval | M |
| FR-HRM-004 | Statutory schedules: pension, NSITF, ITF reports (exportable) | M |
| FR-HRM-005 | Staff appraisal workflow with P1 protection | S |
| FR-HRM-006 | Contract/licence expiry alerts (via scheduler/COM events) | S |

### 6.10 HST — Hostel & Accommodation

| ID | Requirement | Pri |
|---|---|---|
| FR-HST-001 | Hostel/room/bed inventory with gender and programme rules | M |
| FR-HST-002 | Bed allocation workflow integrated with hostel-fee payment status (FIN events) | M |
| FR-HST-003 | Room transfer and disciplinary deallocation, both audited workflows | M |
| FR-HST-004 | Occupancy reports | S |

### 6.11 TTS — Timetable & Scheduling

| ID | Requirement | Pri |
|---|---|---|
| FR-TTS-001 | Class timetable builder with automatic instructor/room clash detection | M |
| FR-TTS-002 | Practical/lab scheduling with equipment and room capacity constraints | M |
| FR-TTS-003 | Clinical rotation timetable generation (consumes CLN rotation templates) | M |
| FR-TTS-004 | Exam timetable generation and publication (eligibility roster from EXM/ATT) | M |
| FR-TTS-005 | Conflict resolution UI: detected conflicts listed with proposed resolutions, never silent | M |

### 6.12 COM — Communication & Notifications

| ID | Requirement | Pri |
|---|---|---|
| FR-COM-001 | Bulk SMS/email composition with audience builder (role, programme, level, fee status, posting batch), templates, and send throttling | M |
| FR-COM-002 | Event-triggered notifications (fee reminder, result published, posting notice, emergency) via CORE dispatch SPI | M |
| FR-COM-003 | In-app announcements with targeting and read receipts | M |
| FR-COM-004 | Sponsor feed: ward-scoped notices, fees, results | M |
| FR-COM-005 | Emergency broadcast channel with mandatory-acknowledgement option | S |
| FR-COM-006 | Delivery reports and cost dashboard | S |

### 6.13 LIB — Library (optional)

| ID | Requirement | Pri |
|---|---|---|
| FR-LIB-001 | Catalog with accessioning, search, and member records | C |
| FR-LIB-002 | Lending/circulation with fines and reservations | C |
| FR-LIB-003 | E-book/journal access tracking | C |

### 6.14 ALM — Alumni (optional)

| ID | Requirement | Pri |
|---|---|---|
| FR-ALM-001 | Alumni database auto-created from graduation records (EXM events) | C |
| FR-ALM-002 | Internship/induction tracking and employer feedback capture | C |

### 6.15 RPT — Reports, Analytics & Dashboard

| ID | Requirement | Pri |
|---|---|---|
| FR-RPT-001 | Executive KPI dashboard: enrollment, revenue, retention, pass rates, board exam performance; role-scoped | M |
| FR-RPT-002 | Standard reports: student lists by programme, fee collection, broadsheets, payroll, posting reports | M |
| FR-RPT-003 | Custom report builder (field picker, filters, grouping) with Excel/PDF export and scheduling | M |
| FR-RPT-004 | Accreditation-ready exports (NBTE/MONOTECH-style visitation datasets) | M |
| FR-RPT-005 | Report definitions are versioned; a published report regenerates identically for the same data snapshot | S |

### 6.16 Critical end-to-end flows (release-gating E2E tests)

1. **Admit → enroll → pay → register:** application → payment → admission → acceptance fee → matriculation → course registration.
2. **Score → approve → publish → transcript:** instructor entry → chain approval → publication → student/sponsor visibility → transcript.
3. **Fee lifecycle:** structure → charge → installment reminder → payment → receipt → ledger → reconciliation.
4. **Posting lifecycle:** rotation → allocation → fee clearance → logbook → assessment → clearance generation.
5. **Graduation eligibility:** rule evaluation consuming FIN/CLN/EXM/ATT facts → list → board exam export.
6. **Correction with audit:** grade amendment and payment reversal, both with approval and immutable history.

---

## 7. Data Architecture

### 7.1 Ownership map (normative)

| Data | Owner (only writer) | Consumers (read via API/events) |
|---|---|---|
| Applications, admission decisions | ADM | SIS (events), RPT |
| Student master record, status | SIS | everything (events `student.*`) |
| Fee structures, charges, ledger, receipts | FIN | EXM (clearance), CLN, HST, RPT |
| Curriculum, scores, grades, transcripts | EXM | SIS, RPT, ALM |
| Attendance facts | ATT | EXM (eligibility), RPT |
| Sites, rotations, logbooks, assessments | CLN | RPT |
| Materials, submissions, quiz attempts | LMS | — |
| Staff, leave, payroll | HRM | RPT, TTS (availability) |
| Hostel inventory, allocations | HST | RPT |
| Timetables | TTS | LMS, CLN, portals |
| Messages, templates, receipts of delivery | COM | RPT |
| Users, roles, sessions, audit | CORE | everything (authn/z, audit queries) |
| Documents (binary) | CORE vault | all (scoped links) |

### 7.2 Conventions

- Every entity: UUID PK, `college_id`, `created_at/updated_at` (UTC), `created_by`, optimistic-lock version column; soft delete only where the domain allows (never for ledger, scores, audit).
- Money: integer kobo + currency. Dates: ISO 8601, stored UTC, rendered in `Africa/Lagos`.
- All events: `cloud.events`-style envelope (id, source, type, time, subject, college_id, traceparent, data schema version). Event schemas are versioned and backward-compatible (additive-only within a major version).
- Data retention and NDPA: defined per data class (audit ≥ 7 years; financial ≥ 7 years; applicant data purged/anonymized 24 months after session close unless admitted; sponsor data purged on unlink + grace period). Data-subject export and erasure workflows are provided, with erasure implemented as anonymization where statutory retention conflicts.
- Migrations: forward-only, reversible-by-compensation, expand/contract pattern for breaking changes; a migration MUST NOT lock a hot table for more than 1s during business hours (batched backfills).

### 7.3 Reporting read model

RPT does not query service databases directly in production flows. A change-data-capture pipeline projects events into a read-optimized reporting store (per-tenant). This keeps module stores private and dashboards fast. Ad-hoc operational needs use published query APIs with pagination and server-side filtering only.

---

## 8. UI/UX Specification — Structure and Behavior

### 8.1 Design philosophy

CampusOne's interface is calm, precise, and institutional. It should feel like well-made professional software — closer to a Bloomberg terminal's discipline than a consumer app. The user explicitly rejects "vibe coded" output; the following are hard rules:

- **No emojis** anywhere in the UI, notifications, emails, SMS, empty states, or seed content. Ever.
- **No native browser controls**: no `alert()`, `confirm()`, `prompt()`, no unstyled `<select>`, `<input type="date">`, or default focus rings. Everything is a design-system component.
- **No decorative noise**: no gradients-as-decoration, no stock photography, no mascot illustrations, no confetti/success animations beyond a restrained 150–200ms state transition.
- **No placeholder text** ("Lorem ipsum", "TODO label", "Coming soon") in any shippable state. Unbuilt features are hidden, not stubbed.
- **Information hierarchy through typography and spacing**, not boxes-within-boxes. One accent color family; color never carries meaning alone (icons + text accompany status color).

### 8.2 Information architecture and app shell

- **Shell:** left sidebar navigation (collapsible to icons on desktop; drawer on mobile), top bar (global search, session/impersonation banner when active, notifications, user menu), content region max-width 1440px with a 12-column grid.
- **Module IA:** sidebar groups mirror modules: Admissions, Students, Bursary, Academics, Attendance, Postings, Learning, Staff, Hostels, Timetable, Messages, Reports, Administration. Optional modules (LIB, ALM) appear only when enabled per tenant — no dead menu items.
- **Role-based default landing:** each role lands on its dashboard (Section 8.4). Navigation items the role cannot use are hidden (server-driven), not merely disabled.
- **Breadcrumbs on every view deeper than level 1.** Page title + one-line description + exactly one primary action button (top right). Destructive actions never sit adjacent to the primary action.
- **Route map (contract for frontend):** each module ships a route manifest: `/app/<module>/<entity>/<id?>/<view?>` with a registered list view, detail view (tabbed: overview / related / history), and create/edit flows as full pages on desktop, full-screen sheets on mobile.

### 8.3 Key screens (per module, minimum)

| Module | Screens |
|---|---|
| CORE | Login, 2FA setup/challenge, user/role administration, audit explorer, tenant settings, integration status |
| ADM | Application form builder, applications queue, screening board, admission lists, letters |
| SIS | Student 360 (profile timeline), registration console, status workflow, ID card studio |
| FIN | Fee structure editor (versioned), collections dashboard, student ledger, reconciliation, debtors board |
| EXM | Curriculum editor, score entry grid, approval inbox, broadsheets, transcripts, board exam exports |
| ATT | Register (mobile-first), eligibility board, reports |
| CLN | Site registry, rotation planner, allocation board, logbook review, clearance board |
| LMS | Course spaces, assignment/quiz builder, CBT console |
| HRM | Staff records, leave board, payroll run wizard, statutory reports |
| HST | Inventory map, allocation board, transfers |
| TTS | Timetable canvas (week grid), conflict inbox, exam timetable publisher |
| COM | Composer, templates, audiences, delivery reports |
| RPT | Executive dashboard, report catalog, custom builder, scheduled reports |
| STU/SPON | Portal home (cards: fees, registration, results, postings, notices), per-card detail |

**Table specification (the workhorse pattern):** server-driven pagination (25/50/100), column sort, multi-filter chips row, saved views per user, column visibility toggle, keyboard-navigable, sticky header, row actions in an overflow menu, bulk selection with a bulk-action bar, empty/loading/error states per Section 8.6, export honors current filters. Dense mode toggle (compact row height) for registrar/bursary users.

**Form specification:** single-column on mobile, two-column max on desktop; labels above fields; inline validation on blur; error summary at top on submit failure with anchor links to fields; unsaved-changes guard (custom modal); autosave draft for long forms (application form, logbook); destructive confirmations require typing the entity name for irreversible actions.

### 8.4 Dashboards (role-scoped, KPI definitions in RPT)

- **PROVOST:** enrollment trend, revenue vs target, pass rates, board exam outcomes, outstanding debtors, alerts requiring attention.
- **REG:** admissions funnel, registration progress by level, pending status workflows.
- **BURSAR:** today's collections, reconciliation status, debtor aging, payment-channel split.
- **HOD/INSTR:** pending approvals, course performance, attendance at risk, posting supervision schedule.
- **STU:** balance due, registration status, published results, next posting, notices. **SPON:** same, ward-scoped.
- Every dashboard widget: definition tooltip (how the number is computed), last-refreshed time, and drill-through to the underlying filtered list. No vanity charts; every visualization answers an operational question.

### 8.5 Design tokens (normative defaults)

| Token group | Specification |
|---|---|
| Color | Neutral scale (slate-based) 50–900 for surface/text/border; one brand primary (indigo-leaning, configurable per tenant within contrast bounds); semantic: success green, warning amber, danger red, info blue — all meeting 4.5:1 on their paired surfaces. Dark mode: v1 not required; design tokens must not preclude it. |
| Typography | One sans family (Inter or equivalent, self-hosted). Scale (px): 12 caption / 13 table-dense / 14 body / 16 body-emph / 20 card-title / 24 page-title / 28 dashboard-stat. Line-height 1.5 body, 1.2 headings. Tabular numerals in all tables and money figures. |
| Spacing | 4pt grid: 4/8/12/16/24/32/48. No arbitrary values outside the scale. |
| Radius | 6px controls, 8px cards, 999px pills only. |
| Elevation | Two levels only: card (subtle border, no shadow), overlay (soft shadow). No stacked shadows. |
| Motion | 150–200ms ease-out for state transitions; respect `prefers-reduced-motion`; no parallax, no animated counters. |
| Iconography | One outline icon set (Lucide-style, 16/20px), stroke 1.5–2. No emoji substitution, no mixed icon families. |

### 8.6 States (every view, every component)

Four states are designed, not improvised: **loading** (skeleton matching final layout — no spinners over blank pages), **empty** (one sentence explaining what will appear + the primary action that creates it), **error** (plain-language cause, correlation ID, retry action; never a raw stack trace), **permission-denied** (what access is needed and who grants it). Offline/network interruption shows a persistent banner and queues non-conflicting form submissions.

### 8.7 Responsive behavior

Breakpoints: 360 (minimum supported width) / 768 / 1024 / 1440. Mobile: drawer nav, card-stacked lists, bottom action bar for primary action, register marking and payment flows fully operable one-handed. Desktop: multi-pane where it aids comparison (score grid, allocation board). Nothing is desktop-only except heavy planners, which degrade to structured list editors on mobile.

### 8.8 Accessibility (release gate)

WCAG 2.1 AA: full keyboard operability with visible focus (custom focus ring token), skip links, semantic landmarks, ARIA only where semantics are insufficient, contrast per token rules, touch targets ≥ 44px, form errors programmatically associated, modals trap focus and restore it, data tables expose headers/scope. Every release includes an automated axe pass on key routes and a manual keyboard walkthrough of the critical flows (Section 6.16).

### 8.9 Content and voice

Sentence case everywhere. Plain, operational English; no exclamation marks; no playful copy. Buttons are verbs ("Approve results", "Generate receipt"). Empty states say what to do next. Numbers: Naira formatted ₦1,234,567.89; dates `13 Nov 2026`; times `14:05`. SMS copy ≤ 320 characters, no emojis, includes college short name. All user-facing strings live in a message catalog (i18n-ready from day one even though v1 ships English only).

---

## 9. Design System Deliverables (the "Section 9" system)

The design system is a versioned package (`@campusone/ui`) consumed by the web client, with: token layer (Section 8.5), primitive components (Button, IconButton, Input, Select, Combobox, DatePicker, Checkbox, Radio, Switch, Textarea), composite components (Modal/Dialog, Drawer, Toast, Tabs, Table, DataGrid, Form field wrapper, Stepper, FileUpload, EmptyState, ErrorState, Skeleton, Badge, Avatar, Timeline, Calendar, Scheduler grid), and pattern templates (list page, detail page, wizard, approval inbox). Storybook with every component in all four states (Section 8.6) is a required artifact; a component without stories does not merge. Visual regression tests run on the Storybook and the 20 highest-traffic screens.

---

## 10. Non-Functional Requirements

| ID | Requirement | Target / gate |
|---|---|---|
| NFR-001 | Uptime (production, per-tenant) | 99.9% monthly, measured at edge; SLA with compensation per proposal §7 |
| NFR-002 | Performance | LCP < 2.5s on 4G mid-range phone for portal home; API p95 < 400ms reads, < 800ms writes; score-entry grid interaction < 100ms; dashboards < 3s cold |
| NFR-003 | Scale | 20,000 students, 2,000 concurrent at peak (results publication day is the stress case); load test before each admission/exam season |
| NFR-004 | Security | TLS 1.2+, AES-256 at rest, per-tenant keys, OWASP ASVS L2, quarterly dependency scans, secrets in a vault, no PII in logs, signed webhooks, 2FA for staff, session revocation |
| NFR-005 | Privacy | NDPA 2023 compliance: lawful basis registry, DPO contact, data-subject export/erasure workflows, residency pinning per tenant, processor agreements |
| NFR-006 | Backup/DR | Daily full + PITR; RPO ≤ 1h target (24h max), RTO ≤ 4h; quarterly restore drill with evidence |
| NFR-007 | Auditability | Hash-chained audit log; financial and grade records immutable (correction-by-append only) |
| NFR-008 | Maintainability (handover promise) | Every service: README, runbook, OpenAPI docs, ADRs; a competent external team can operate the system from the handover docs alone |
| NFR-009 | Observability | Correlation IDs end-to-end, SLO dashboards, alerting on error budget burn, provider outage detection (payments/SMS) |
| NFR-010 | Browser support | Latest two versions of Chrome/Edge/Safari/Firefox; Android WebView for in-app browsers common in Nigeria |

---

## 11. Agentic Development Guardrails (Drift Prevention)

This section governs how AI coding agents and human engineers work on CampusOne. Its purpose: any agent, in any session, produces code that is indistinguishable in discipline from the reference standard — no architecture drift, no stylistic drift, no scope drift.

### 11.1 Repo and workspace constitution

- **Monorepo, strict boundaries:** `services/<module>` (backend), `packages/contracts` (versioned OpenAPI/AsyncAPI/event schemas, error codes, shared types only), `packages/ui` (design system), `apps/web` (client), `infra/` (IaC). A service may import from `packages/contracts` and its own code. Importing another service's internals is a build error.
- **Root `AGENTS.md` is the constitution** and MUST be loaded before any agent task; per-module `AGENTS.md` files add module-specific rules. Any conflict: root wins, PRD wins over both.

### 11.2 Non-negotiable agent rules (verbatim, enforced by CI)

1. Implement only the ticket's scope. If the ticket is wrong or incomplete, stop and comment — do not "improve" adjacent code, do not refactor beyond the task, do not add unrequested features.
2. Contracts before code: no endpoint, event, or table may exist that is not first declared in `packages/contracts` and reviewed. Generated server stubs and client SDKs come from the contract, never hand-written drift.
3. No cross-module database access: no connection strings to other services' databases, no cross-schema joins, no reading another service's tables even "temporarily." Reads go through published APIs; writes go through the owning service.
4. No shared business logic: duplication across modules is preferable to a shared kernel. If a rule is genuinely universal (e.g., money formatting), it goes in `packages/contracts` or `packages/ui` with an owner and a version.
5. Follow the golden path: every new endpoint follows the reference implementation pattern (auth guard → RBAC scope check → validation via schema → service use-case → repository → outbox event → audit); every new screen follows the pattern templates. Deviations require an ADR.
6. UI rules are absolute: design-system components only; no native browser controls; no emojis; no new color/spacing values outside tokens; all four states designed; keyboard and screen-reader behavior included; no placeholder content.
7. Typed end-to-end: no `any`, no untyped API responses, no suppressed lint/type errors without a linked ticket and expiry comment.
8. Money, grades, and identity logic are written once, tested against golden vectors (Section 5.3/5.4), and never "simplified."
9. No new third-party dependency without a stated justification in the PR and security scan pass. Prefer the standard library or an existing approved dependency.
10. Every mutating operation: idempotency handling, audit event, authorization check, and a test — all four or it does not merge.
11. Migrations are forward-only, expand/contract, and reviewed by a second engineer/agent pass before merge.
12. Definition of Done (all required): acceptance criteria met; contract updated; unit + integration tests pass (coverage ≥ 80% on changed code, 100% on money/grade rules); axe-clean on touched routes; Storybook stories for touched components; runbook touched if ops behavior changed; changelog entry.
13. Commit and PR discipline: conventional commits scoped to the module (`feat(fin): ...`); PRs under ~400 changed lines or split; PR description links ticket, contract change, and screenshots for UI work (light mode, both mobile and desktop widths).

### 11.3 Drift detection (fitness functions in CI — the build fails, not the reviewer)

- **Architecture tests:** import-linter/dependency-cruiser checks on module boundaries and the DAG (Section 4.2); forbidden-import rules; no service reaches another service's DB config.
- **Contract tests:** provider verification (schemas are the source of truth); consumer-driven contract tests for every cross-module API consumer; event schema compatibility check (additive-only) on every publish.
- **Golden vectors:** grading/CGPA, fee ledger arithmetic, and eligibility rules run against fixed vectors; any diff fails the build.
- **Lint gates:** ESLint/Ruff with strict configs, no-console in client code, no `alert/confirm/prompt`, no emoji regex in UI string catalogs, token-only style lint (stylelint denies off-scale values).
- **Security gates:** dependency audit, secret scanning, SAST on PR, container scan on image build.
- **Visual regression:** Chromatic-class diffs on Storybook + top-20 screens; a diff requires explicit approval.
- **E2E gates:** the six critical flows (Section 6.16) run on every release candidate; failure blocks release.

### 11.4 Session protocol for agents (how tasks are framed)

1. Task input must name: target module, ticket ID, the exact FR IDs in scope, and the contract files to read first.
2. Agent reads: root `AGENTS.md` → module `AGENTS.md` → relevant PRD section → contract files → golden-path reference implementation. Only then writes code.
3. Agents never modify: contracts, tokens, CI rules, or another module — unless the task explicitly says so; such changes are separate PRs.
4. Output is a diff against the ticket, nothing else. "While I was in there" changes are reverted on sight.
5. A final agent pass self-reviews against the Section 11.2 checklist and posts the checklist as the PR's review comment.

### 11.5 Change control

- ADRs for: new modules, new cross-module dependencies, contract major versions, auth model changes, grading-rule changes, new providers.
- Semver per service and per contract package; breaking changes require a deprecation window and a migration guide.
- The PRD is versioned with this document; scope changes go through the discovery/change-request process with the client, not through code.

---

## 12. Testing Strategy

- **Pyramid:** unit (domain rules, pure functions) → integration (service + real DB + broker, testcontainers-style) → contract (Section 11.3) → E2E (six critical flows + payment sandbox webhooks + SMS provider sandbox) → UAT.
- **Fixtures:** synthetic college dataset (programmes, 300 students, 2 sessions of results, ledgers) generated by a seeder; anonymized staging snapshots for migration rehearsals.
- **Migration testing:** the Phase-2 client data is migrated twice — once to staging, timed and validated row-counts + checksums + spot audits — before production cutover.
- **Performance:** results-publication-day load profile (2,000 concurrent portal hits + score publishing) rehearsed before each exam season (NFR-003).
- **UAT:** pilot department (e.g., Community Health) runs real fee collection and result entry for the soft launch (Phase 3); UAT sign-off is a go-live gate.

---

## 13. Implementation Roadmap (aligned to the proposal)

| Phase | Timeline | Exit criteria |
|---|---|---|
| 0 — Foundations (pre-kickoff) | Weeks 0–1 | Monorepo, CI fitness functions, contracts skeleton, CORE (auth/RBAC/audit/vault/dispatch), design system primitives, environments live |
| 1 — Discovery & Setup | Weeks 1–2 | Requirements confirmed against this PRD; college structure configured (schools, departments, programmes, fee structures, grading scale); branding tokens set; contract pack v1 merged |
| 2 — Data Migration | Weeks 3–4 | Student/staff/fee/course data imported and validated on staging; staff training begins (admin 2 days, instructors 1 day, bursary 1 day — on-site or virtual) |
| 3 — Pilot (Soft Launch) | Weeks 5–6 | One department live on fee collection + result entry; E2E flows green on production-shaped environment; pilot UAT sign-off |
| 4 — Full Go-Live | Week 7 | All departments live; training completed; hypercare (intensified support) begins; handover documentation delivered |

Parallelization note: SIS/FIN/EXM/ATT are the critical path; CLN/TTS/LMS/HRM/HST/COM/RPT proceed in parallel once contracts v1 are frozen at end of Phase 1. LIB and ALM are post-go-live unless separately scheduled.

---

## 14. Release Gates and Acceptance

A module is "done" for the client only when: all its M-requirements pass UAT; its four-state UI review passes; an accessibility spot-check passes; audit, idempotency, and permission tests pass; runbook and training material exist. Go-live requires: all six critical flows green, load test passed, backup/restore drill evidenced, NDPA artifacts (registry, privacy notice, processor terms) in place, and client sign-off recorded.

---

## 15. Risks and Open Decisions

| Item | Risk / decision needed | Owner |
|---|---|---|
| Pricing placeholders (₦[X], ₦[Y]) | Commercial proposal must resolve before contract | Vendor |
| Payment structure (e.g., 50/50) | Confirm with client | Vendor + Client |
| Grading scale per programme | Confirm defaults in §5.3 at discovery | Client (Academic) |
| Attendance eligibility % | Confirm default 75% per course | Client |
| Resit grade cap policy | Confirm default cap 40 | Client |
| ND/HND accreditation scope | Confirm whether ND/HND programmes are in scope for Bethsaida | Client |
| Board exam bodies list | Confirm exact export formats (CHPRBN and others) | Client + Vendor |
| Data quality of legacy records | Migration rehearsal (Phase 2) may surface cleanup needs | Client |
| SMS/WhatsApp costs | Confirm budget owner and bundle sizing | Client |
| Optional modules (LIB/ALM) | Confirm in/out before Phase 1 freeze | Client |

---

## 16. Appendices

### 16.1 Event catalog (starter — normative envelope, types versioned)

`student.admitted.v1`, `student.status.changed.v1`, `student.registered.v1`, `finance.charge.posted.v1`, `finance.installment.due.v1`, `payment.succeeded.v1`, `payment.failed.v1`, `payment.reversed.v1`, `result.published.v1`, `grade.amended.v1`, `posting.allocated.v1`, `posting.completed.v1`, `attendance.threshold.breached.v1`, `timetable.published.v1`, `notification.requested.v1`, `notification.delivered.v1`, `staff.licence.expiring.v1`.

### 16.2 API conventions

REST/JSON, `/api/v1/<module>/...`; cursor pagination (`?cursor=&limit=`); filtering/sorting via explicit whitelisted params; errors as RFC 7807 problem+json with stable machine codes from `packages/contracts`; all mutating requests accept `Idempotency-Key`; all list responses include `X-Total-Count` or equivalent; ETag/optimistic concurrency on editable aggregates.

### 16.3 Glossary

**CA** Continuous Assessment. **CGPA** Cumulative GPA. **CHPRBN** Community Health Practitioners Registration Board of Nigeria. **CBT** Computer-Based Test. **NDPA** Nigeria Data Protection Act 2023. **PHC** Primary Health Centre. **SIWES** Students Industrial Work Experience Scheme. **PITR** Point-in-Time Recovery. **SPI** Service Provider Interface (internal adapter). **BFF** Backend-for-Frontend. **ADR** Architecture Decision Record.

*End of PRD v1.0. This document is the single source of truth for scope, architecture, and quality bars; it is refined with the client during the discovery session and versioned thereafter.*
