# CampusOne — School Management & Accreditation SaaS

> **Institutional Enterprise Platform for Health Training Institutions**  
> Client: **Bethsaida College of Health Technology (BCHT)**  
> Architecture: **Contract-First Hexagonal Modular Monorepo**  
> Tech Stack: **TypeScript • React 18 • Vite • Tailwind CSS • Supabase (PostgreSQL 17) • Node.js**

---

## 🏛️ Platform Overview

**CampusOne** is an institutional-grade school management platform purpose-built for Colleges of Health Technology, Paramedic Institutes, and Allied Health Sciences colleges. Built around the **"One Brain" Architecture**, it eliminates fragmented systems by unifying tuition financial ledgers, national regulatory board accreditations, deterministic examination broadsheets, clinical hospital rotations, and student self-service into one cohesive ecosystem.

---

## 🎯 Core Capabilities & Institutional Workflows

### 1. Statutory Health Council Compliance & Accreditation
- Built for compliance with statutory regulatory bodies:
  - **CHPRBN** — Community Health Practitioners Registration Board of Nigeria
  - **MLSCN** — Medical Laboratory Science Council of Nigeria
  - **PCN** — Pharmacy Council of Nigeria
  - **HRORBN** — Health Records Officers Registration Board of Nigeria
  - **EHORECON** — Environmental Health Officers Registration Council of Nigeria
  - **NBTE** — National Board for Technical Education
- Automated nominal rolls, regulatory exam quota monitoring, and digital accreditation dossier binders.

### 2. Double-Entry Bursary & Student Ledger (`PRD §6`)
- **Integer Kobo Financial Arithmetic:** Stored as `NGN * 100` (`BIGINT`) to prevent floating-point calculation errors.
- **Real-Time Settlement Reconciliation:** Automatic reconciliation for card payments (Paystack), bank transfers (Remita), and institutional teller vouchers.
- **Official Digital Receipts:** Issued with tamper-evident cryptographic QR verification hashes and printable bursary vouchers.
- **Debtor Management:** Aging brackets (0–30 days, 31–60 days, 60+ days) and installment payment plan scheduling.

### 3. Examination Broadsheets & Golden Vector Grading (`PRD §5`)
- **Deterministic GPA/CGPA Computations:** Grade calculations follow exact frozen vectors matching RFC guidelines.
- **Multi-Level Approval Workflow:** `Draft` ➔ `HOD Verification` ➔ `Dean Recommendation` ➔ `Senate Ratification`.
- **Exam Eligibility Gatekeeper:** Enforces the statutory **75% minimum classroom & clinical attendance rule** coupled with tuition clearance before issuing examination gate passes.

### 4. Clinical Postings & Hospital Logbook Rubric
- Multi-site hospital rotation scheduling (e.g. University College Hospital, State General Hospitals, Primary Health Centers).
- Digital procedure logbooks with preceptor verification and competency sign-offs.
- Student hepatitis B vaccination, serology status, and hospital clearance tracking.

### 5. Role-Based Access Control (RBAC) & Scoped Data Isolation
Granular permissions and isolated workspaces across 10 institutional personas:
- **Provost / Senate Chair:** Executive oversight, policy approvals, and audit review.
- **Chief Bursar:** Master tuition ledgers, payment receipts, and bank gateway reconciliation.
- **College Registrar:** Admissions screening, candidate merit lists, and matriculation records.
- **Director of Examinations:** Broadsheets, transcripts, and senate ratification controls.
- **Head of Department (HOD):** Departmental score approvals, clinical rotation monitoring, and faculty workload.
- **Lecturer / Instructor:** Course continuous assessment marksheets and daily class registers.
- **Clinical Preceptor:** Ward trainee supervision and logbook grading.
- **Student Portal:** Self-service grades, fee receipts, clinical logbook submissions, and exam passes.
- **Parent / Sponsor:** Ward academic broadsheets, tuition receipts, and college circulars.
- **Super Administrator:** Infrastructure configuration, SHA-256 chained audit logs, and gateway ping telemetry.

### 6. Cloud Database & Cryptographic Security
- **Remote Database:** Powered by Supabase (PostgreSQL 17) with Row-Level Security (RLS) policies.
- **Non-Repudiable Audit Trail:** Every sensitive mutation (fee reversal, score edit, role switch) is cryptographically chained using SHA-256 hashes (`prevHash` + `currentPayload`).

---

## 📁 Repository Structure

```
BECONTECH/
├── packages/
│   ├── contracts/     # Pure Domain Layer: OpenAPI schemas, domain events,
│   │                  # deterministic calculation models, and golden vector test suite.
│   └── ui/            # @campusone/ui Design System: Custom tokens, strict 4px radius,
│                      # Inter typography, and zero native browser chrome.
├── apps/
│   └── web/           # CampusOne Single-Page Application (React 18 + Vite + Tailwind CSS).
├── supabase/
│   └── migrations/    # Declarative, versioned PostgreSQL schema migrations and seed scripts.
└── services/
    └── core/          # Independent Service Core: Identity, RBAC, Vault, and Dispatch.
```

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js 20+ / 24+
- npm 10+

### Installation & Execution
```bash
# Clone the repository
git clone https://github.com/npreciousaffiliate2-svg/becontech.git
cd becontech

# Install all workspace dependencies
npm install

# Run contract golden vector tests
npm test

# Start the Vite development server
npm run dev
```

Visit `http://localhost:5173` to explore the live application. Use the Topbar **Role Persona Switcher** to experience the platform through any institutional role.

---

## 🔒 Security & Governance

- Strict credential isolation: all personal access tokens, database passwords, and secrets reside exclusively in local uncommitted environment variables (`.env`) or cloud key vaults.
- Zero mock data in production paths.
- WCAG 2.1 AA accessible, fully responsive across 375px (mobile), 768px (tablet), and 1440px (desktop).

---

*Vendor: Checker Web Services • Client: Bethsaida College of Health Tech Ltd*
