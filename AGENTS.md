# CampusOne — Agentic Development Constitution (`AGENTS.md`)
> **Normative reference:** PRD Section 11 & Universal SaaS Master Prompt. Binding on all human engineers and AI coding agents.

---

## 1. BRAND & PROJECT CONTEXT
- **Platform Name:** CampusOne
- **Client:** Bethsaida College of Health Tech Ltd (bethsaida)
- **Vendor:** Checker Web Services
- **Primary Domain:** Institutional School Management Platform for Health Training Institutions
- **Tech Stack:** TypeScript Monorepo (Node.js 24 + React 18/Vite + Tailwind CSS + PostgreSQL)
- **Brand Colors (Bethsaida College Health Tech Green Identity):**
  - Primary Institutional Green: `#0F7640` (Emerald/Health Green)
  - Executive Forest Green: `#093322` down to `#052015` (Velvet Institutional Sidebar)
  - Success Green: `#13A348`
  - Accent Amber / Yellow: `#FEC10A`
  - Danger / Coral Red: `#F83A20`
  - Neutral Slate scale: 50–900 for surfaces, borders, and institutional density.

---

## 2. STRICT OPERATIONAL PRINCIPLES
1. **Contract before code:** No endpoint, event, or database table may exist that is not first declared in `packages/contracts`.
2. **Modular by construction:** Each module owns its domain logic and data store. No cross-module database joins or direct cross-module table reads. Inter-module communication happens strictly via published contracts and events.
3. **Unified Brain Architecture (Zero Fragmented Design):** All modules, views, and dashboards must feel like one cohesive system. One shared component library (`@campusone/ui`), unified color tokens, identical styling, and consistent institutional typography.
4. **No Mocks or Fake Data:** Never fabricate fake data, mock statistics, or fake success indicators in production paths. Real errors must be caught and displayed with actionable recovery.
5. **No Preloaders — Skeletons Only:** Never use full-page spinner preloaders. Always render clean, structured Skeleton Loaders matching the target layout.
6. **No Emojis & No Unnecessary Clutter:** Zero emojis in code, UI, notifications, email, SMS, or log messages. Calm, professional institutional tone only. NEVER insert PRD section quotes (e.g. "Rule §5.1", "PRD §6.15"), raw hashes, or arbitrary decorative dots in headers, sidebars, or breadcrumbs.
7. **Zero Native Browser Chrome:** Never use native `<select>`, `<dialog>`, `alert()`, `confirm()`, `prompt()`, or native unstyled date pickers. Use `@campusone/ui` components.
8. **Strict 4px Border Radius:** All cards, borders, buttons, pills, toggles, badges, inputs, selects, and modals conform to 4px radius (`rounded` / 4px).
9. **Modal Standards (Xiroly Specification):**
   - Modals must render a full-screen backdrop with `backdrop-blur-md` and `bg-slate-900/60`.
   - The page behind the modal MUST NOT be scrollable while the modal is open (`document.body.style.overflow = 'hidden'`).
   - Clean, centered container on desktop (`rounded-[4px]`), responsive on mobile, with dedicated header, scrollable body, and action footer.
10. **Sidebar Submenu & Accordion Behavior:**
    - Sub-menu items use a low-opacity background (`bg-white/[0.08]`) when active, with no decorative vertical lines on the left.
    - Single accordion behavior: opening/expanding a module automatically collapses all other open modules.
11. **Responsive Mobile-First Architecture (Anti-Drift):**
    - Platform must be strictly verified across 375px (mobile), 768px (tablet), 1024px, and 1440px (desktop).
    - No horizontal scrolling, no text squeezing, no broken badge wraps, and viewport zooming strictly disabled (`maximum-scale=1.0, user-scalable=no`).
12. **Deterministic Calculations:** Money stored as integer kobo (`NGN`). CGPA/GPA computations follow exact frozen vectors.
13. **Mandatory Custom Dropdowns:** NEVER use native HTML `<select>`. Every dropdown on the platform, across all modules, tables, filters, forms, and modals, MUST use the custom `Select` component from `@campusone/ui` with viewport auto-positioning.

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
