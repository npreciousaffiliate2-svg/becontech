# CampusOne — Agentic Development Constitution (`AGENTS.md`)
> **Normative reference:** PRD Section 11 & Universal SaaS Master Prompt. Binding on all human engineers and AI coding agents.

---

## 1. BRAND & PROJECT CONTEXT
- **Platform Name:** CampusOne
- **Client:** Bethsaida College of Health Tech Ltd (bethsaida)
- **Vendor:** Checker Web Services
- **Primary Domain:** Institutional School Management Platform for Health Training Institutions
- **Tech Stack:** TypeScript Monorepo (Node.js 24 + React 18/Vite + Tailwind CSS + PostgreSQL)
- **Brand Colors:**
  - Primary Blue: `#0A77FE`
  - Accent Amber / Yellow: `#FEC10A`
  - Success Green: `#13A348`
  - Danger / Coral Red: `#F83A20`
  - Neutral Slate scale: 50–900 for surfaces, borders, and institutional density.

---

## 2. STRICT OPERATIONAL PRINCIPLES
1. **Contract before code:** No endpoint, event, or database table may exist that is not first declared in `packages/contracts`.
2. **Modular by construction:** Each module owns its domain logic and data store. No cross-module database joins or direct cross-module table reads. Inter-module communication happens strictly via published contracts and events.
3. **No Mocks or Fake Data:** Never fabricate fake data, mock statistics, or fake success indicators in production paths. Real errors must be caught and displayed with actionable recovery.
4. **No Preloaders — Skeletons Only:** Never use full-page spinner preloaders. Always render clean, structured Skeleton Loaders matching the target layout.
5. **No Emojis:** Zero emojis in code, UI, notifications, email, SMS, or log messages. Calm, professional institutional tone only.
6. **Zero Native Browser Chrome:** Never use native `<select>`, `<dialog>`, `alert()`, `confirm()`, `prompt()`, or native unstyled date pickers. Use `@campusone/ui` components.
7. **Strict 4px Border Radius:** All cards, borders, buttons, pills, toggles, badges, inputs, selects, and modals conform to 4px radius (`rounded` / 4px).
8. **Deterministic Calculations:** Money stored as integer kobo (`NGN`). CGPA/GPA computations follow exact frozen vectors.

---

## 3. WORKSPACE STRUCTURE
```
BECONTECH/
├── packages/
│   ├── contracts/     # OpenAPI schemas, event catalog, domain types, error codes
│   └── ui/            # @campusone/ui design system (tokens, primitives, composites)
├── apps/
│   └── web/           # CampusOne institutional web client (React 18 + Vite + TS)
├── services/
│   └── core/          # Platform Core service (Identity, RBAC, Audit, Vault, Dispatch)
└── infra/             # Deployment, Docker, and IaC definitions
```
