# System Architecture: SME-Pay

This document outlines the architectural decisions, data flow, and security models underpinning the SME-Pay application. It is designed to serve as a technical reference for thesis documentation and future maintainers.

## 1. High-Level Architecture

SME-Pay follows a **Client-Server Architecture** utilizing the **Next.js 16 App Router**. 

### 1.1 The Frontend (Client/Browser)
- Built with **React 19** Server Components and Client Components.
- Styling is handled strictly by **Tailwind CSS v4**.
- Forms and user inputs are managed locally via `react-hook-form` before submission.

### 1.2 The Backend (Server)
- There are no traditional REST API endpoints (`/api/*`). Instead, SME-Pay utilizes **Next.js Server Actions**.
- When a user submits a form, a Server Action is invoked. This executes strictly on the Node.js server.
- The server performs **RBAC authorization**, validates input using **Zod**, and communicates securely with the PostgreSQL database.

### 1.3 The Database (Supabase / PostgreSQL)
- The system uses a managed PostgreSQL instance provided by Supabase.
- **Row-Level Security (RLS)** is enabled on all tables, acting as the ultimate gatekeeper for data access.

---

## 2. Authentication & Authorization Flow

### Authentication (AuthN)
1. User enters credentials on `/login`.
2. Supabase Auth validates the credentials and returns a JWT (JSON Web Token).
3. The Next.js server intercepts this JWT and stores it in an `HttpOnly` secure cookie (`@supabase/ssr`).
4. On subsequent requests, the Next.js middleware reads this cookie to determine the authenticated user.

### Authorization (AuthZ) & RBAC
1. Every Server Action begins by invoking `requirePermission('SPECIFIC_PERMISSION')`.
2. The RBAC utility (`src/lib/rbac/index.ts`) queries the database to check if the user's assigned role possesses the required permission.
3. If unauthorized, the action throws an error and execution halts immediately.

---

## 3. Multi-Tenant Data Isolation

To support multiple companies securely, SME-Pay implements **Tenant Isolation via PostgreSQL RLS**.

### How it works:
1. Every table (except system lookups) has a `company_id` column.
2. We defined a custom PostgreSQL function `auth_company_id()` which extracts the `company_id` from the active user's JWT metadata or session variables.
3. RLS Policies dictate: `USING (company_id = auth_company_id())`.
4. Even if a Server Action mistakenly queries `SELECT * FROM employees`, PostgreSQL intercepts the query at the engine level and automatically appends the `company_id` filter. Cross-tenant data leakage is cryptographically impossible.

---

## 4. Payroll Computation Engine

The core logic resides in `src/lib/payroll/computation.ts`. It is designed as a **pure function**, meaning it takes an input state (employee rates, attendance, statutory tables) and returns an output state (Net Pay) without mutating the database itself.

### Computation Steps:
1. **Gross Pay**: Calculate Basic Pay (based on rate and days worked) + Overtime Pay.
2. **Taxable Income Base**: Gross Pay minus Late/Undertime deductions.
3. **Statutory Deductions**:
   - SSS: Lookup bracket based on compensation.
   - PhilHealth: Apply percentage rate up to maximum cap.
   - Pag-IBIG: Apply percentage rate.
4. **Withholding Tax**: (Taxable Income Base - Statutory Deductions) -> Lookup tax bracket.
5. **Net Pay**: Taxable Income - Withholding Tax - Custom Deductions.

---

## 5. Audit & Immutability

### Audit Trail
All database mutations (INSERT, UPDATE, DELETE) triggered from the application UI must pass through the `writeAuditLog` utility. This creates an append-only JSON record of `old_values` and `new_values`, tracking *Who* did *What* and *When*.

### Finalization Locks
When a Payroll Run is marked as `FINALIZED`:
1. The application UI hides all "Edit" and "Delete" buttons.
2. A **PostgreSQL Trigger** `prevent_edit_finalized_payroll` activates. If anyone (even a database administrator running manual SQL) attempts to `UPDATE` a finalized record, the database engine throws an exception and rolls back the transaction.
