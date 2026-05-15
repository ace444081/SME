<div align="center">
  <h1>💼 SME-Pay</h1>
  <p><strong>A Modern, Comprehensive Payroll Automation System for Philippine SMEs</strong></p>

  <p>
    <a href="https://github.com/ace444081/SME/graphs/contributors">
      <img src="https://img.shields.io/github/contributors/ace444081/SME?style=for-the-badge&color=blue" alt="Contributors" />
    </a>
    <a href="https://github.com/ace444081/SME/network/members">
      <img src="https://img.shields.io/github/forks/ace444081/SME?style=for-the-badge&color=blue" alt="Forks" />
    </a>
    <a href="https://github.com/ace444081/SME/stargazers">
      <img src="https://img.shields.io/github/stars/ace444081/SME?style=for-the-badge&color=blue" alt="Stargazers" />
    </a>
    <a href="https://github.com/ace444081/SME/issues">
      <img src="https://img.shields.io/github/issues/ace444081/SME?style=for-the-badge&color=blue" alt="Issues" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  </p>
</div>

<hr />

## 📖 Overview

**SME-Pay** is an enterprise-grade payroll automation platform meticulously engineered for small and medium enterprises in the Philippines. Developed as a capstone/thesis project, it demonstrates high-level software architecture, strict adherence to local labor and taxation regulations, and a beautiful, accessible user interface.

## 🚀 Key Features

*   🏢 **Multi-Tenant Architecture**: Supports multiple distinct companies seamlessly and securely using PostgreSQL Row-Level Security (RLS).
*   🔐 **Role-Based Access Control (RBAC)**: Fine-grained, immutable permission matrices for System Admins, Owners/Managers, and Payroll Admins.
*   🇵🇭 **Statutory Compliance**: Natively handles Philippine SSS, PhilHealth, Pag-IBIG contributions, and Withholding Tax calculation brackets.
*   🧮 **Robust Computation Engine**: Fully server-side payroll calculation engine supporting Monthly, Daily, and Hourly pay rates with precise overtime, undertime, and holiday pay multipliers.
*   📜 **Immutable Audit Trails**: Actions resulting in the finalization of payroll or changes in employee records are permanently logged for security and accountability.
*   🧑‍💼 **Employee Self-Service Portal**: A dedicated, clean interface for employees to view their profiles, request changes, submit concerns, and download PDF payslips.

---

## 🛠 Tech Stack & Architecture

SME-Pay relies on a modern, server-driven web architecture:

| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL (via Supabase) |
| **Authentication** | Supabase Auth (SSR Cookie-based) |
| **Validation** | Zod (Server Actions & Forms) |
| **Testing** | Vitest (Unit) & Playwright (E2E) |

> 📚 **Deep Dive:** For a comprehensive breakdown of the security design, tenant isolation, and payroll engine mechanics, please read the [System Architecture Document](./docs/SYSTEM_ARCHITECTURE.md).

---

## 📦 Local Development Setup

To run this project locally, follow these steps:

### 1. Prerequisites
*   [Node.js](https://nodejs.org/en/) (v20 or higher)
*   A [Supabase](https://supabase.com/) account (or the local Supabase CLI)
*   Git

### 2. Clone the Repository
```bash
git clone https://github.com/ace444081/SME.git
cd SME
```

### 3. Environment Variables
Create a `.env.local` file in the root directory. You will need to extract these keys from your Supabase project dashboard:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Database Initialization
SME-Pay utilizes SQL scripts to structure the database. Execute the scripts in the `supabase/` directory in this exact order via the Supabase SQL Editor:
1. All files in `supabase/migrations/*` (From `001` to `013`)
2. `supabase/seed/001_seed_lookups_roles_permissions.sql`
3. `supabase/seed/002_seed_demo_data.sql`
4. `supabase/seed/003_demo_dataset_periods.sql`

### 5. Running the Application
```bash
# Install all dependencies
npm install

# Start the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 🧪 Testing

SME-Pay enforces a strict testing regimen to guarantee computation accuracy.

```bash
# Run unit tests (Validates the Payroll Computation Engine logic)
npm run test

# Run End-to-End browser UI tests (Powered by Playwright)
npm run test:e2e
```

---

## 🛡️ Security Principles

We take data privacy and tenant isolation seriously:
1. **Service Role Isolation**: The `SUPABASE_SERVICE_ROLE_KEY` acts as our server-side superuser and is strictly confined to Next.js Server Actions. It is **never** leaked to the browser.
2. **PostgreSQL Row Level Security (RLS)**: Every database table utilizes RLS. Even if a backend query is malicious or faulty, the database engine physically prevents User A from querying Company B's data based on their verified JWT token.
3. **Database-Level Immutability**: We do not rely on UI buttons to lock finalized payrolls. A PostgreSQL Trigger (`prevent_edit_finalized_payroll`) actively blocks any `UPDATE` statements to finalized records at the engine level.

---
<div align="center">
  <p>Built with ❤️ by Ace for Philippine SMEs.</p>
</div>
