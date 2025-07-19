
# 📘 SHG Platform - Project Summary
**Date:** 2025-07-12

---

## ✅ Phase 1 – Core Digital Saving Group Features

### 👥 User & Member Management
- `MemberUser`: Secure authentication entity (with `username`, `password`, `Set<Role>`)
- `Member`: Actual SHG member info (`name`, `aadhaar`, `gender`, `email`, `phone`, `group`, `approved`, etc.)
- Group-based onboarding by `ADMIN` or `PRESIDENT`
- Approval workflow: Members must be approved before accessing features

---

### 🏦 Savings Module
- `SavingDeposit`: Tracks amount, date, remarks, and `Member`
- Features:
  - Deposit savings to group fund
  - Track personal and group savings history
  - View monthly/annual summaries
  - Export reports (CSV/PDF)
- Access Control:
  - Members can view/manage their own
  - Group admins can view all in their group

---

### 💸 Loan Management
- `LoanApplication`: Tracks status (`PENDING`, `APPROVED`, `DISBURSED`, `REPAID`, `REJECTED`), purpose, amount
- Approval Workflow:
  - `MEMBER` applies
  - `PRESIDENT` approves
  - `TREASURER` disburses
- Repayment:
  - Tracked per loan
  - Group fund updated and `profit/loss` recorded
  - Overdue detection

---

### 📈 Profit & Loss Tracking
- `GroupFund`: Per-group `totalBalance`, `totalProfit`, `totalLoss`, `lastUpdated`
- Automatically updated on deposits, loan disbursements, and repayments

---

### 🧾 Export & Reporting
- Export: `Savings`, `Repayments` – PDF & CSV
- Date-range support and group filtering
- iText 8 PDF generation
- Admin export controller

---

### 🔐 Security & Auth
- JWT-based auth
- Spring Security
- Role-based access (`MEMBER`, `TREASURER`, `PRESIDENT`, `ADMIN`)
- Roles stored as entity with `Set<Permission>`
- Seeder for default roles & permissions

---

## ✅ Phase 2 – Governance & SDG Alignment

### 🗳️ Governance Module
- `Poll`: Voting with `PRESIDENT`-only closure
- `Meeting`: Attendance tracking
- Support for file attachments, digital signatures

---

### 🎯 SDG Goal Integration
- `SDGMapping`: Maps keywords (loan purpose, deposit remarks) to SDGs
- `SDGImpact`: Monthly impact tracking
- `SDGBatchProcessor`:
  - Processes untagged loans/deposits
  - Tracks jobs created, women empowered, savings growth
- Status tracked via `SDGProcessingStatus`

---

## 💼 Role/Permission Management
- `Role` with `Set<Permission>` (entity)
- DTOs for Role & Permission
- Controllers for assignment
- Admin can manage roles/permissions

---

## 🚦 UI (React Native PWA)
- PWA with shadcn/ui (no Tailwind)
- Screens for:
  - Login/Register
  - Loan apply/approve/disburse
  - Savings deposit
  - Group creation & onboarding
  - Meetings & polls
  - Exporting PDF/CSV
- Role-based UI rendering
- Digital signature in PDF receipts

---

## 💡 Design Highlights
- Per-SHG group isolation
- Secure, workflow-based operations
- SDG-aligned reporting and analytics
- Transparent, trust-driven design

---

## 📍 Future Enhancements (Phase 3 Ideas)
- SMS/WhatsApp notifications
- UPI integration
- NGO dashboards
- AI loan scoring
- Offline-first PWA support

---
