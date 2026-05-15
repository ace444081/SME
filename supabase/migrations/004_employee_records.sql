-- ============================================================================
-- Migration 004 — Employee Records
-- SME-Pay: Web-Based Payroll Automation System
-- ============================================================================

-- ─── departments ────────────────────────────────────────────────────────────
CREATE TABLE departments (
  department_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies(company_id),
  department_name    VARCHAR(100) NOT NULL,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (company_id, department_name)
);

-- ─── job_positions ──────────────────────────────────────────────────────────
CREATE TABLE job_positions (
  position_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies(company_id),
  position_title     VARCHAR(100) NOT NULL,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (company_id, position_title)
);

-- ─── employees ──────────────────────────────────────────────────────────────
CREATE TABLE employees (
  employee_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies(company_id),
  employee_no        VARCHAR(50) NOT NULL,
  first_name         VARCHAR(80) NOT NULL,
  middle_name        VARCHAR(80),
  last_name          VARCHAR(80) NOT NULL,
  suffix             VARCHAR(20),
  birth_date         DATE,
  sex                VARCHAR(20),
  civil_status       VARCHAR(30),
  contact_number     VARCHAR(30),
  email              VARCHAR(150),
  address_line       VARCHAR(255),
  department_id      UUID REFERENCES departments(department_id),
  position_id        UUID REFERENCES job_positions(position_id),
  employment_status_id UUID NOT NULL REFERENCES employment_statuses(employment_status_id),
  hire_date          DATE NOT NULL,
  separation_date    DATE,
  created_by_user_id UUID NOT NULL REFERENCES users(user_id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, employee_no)
);

CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_last_name ON employees(last_name);
CREATE INDEX idx_employees_status ON employees(employment_status_id);

CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Add FK from users to employees now that employees table exists
ALTER TABLE users
  ADD CONSTRAINT fk_users_employee
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id);

-- ─── employee_government_ids ────────────────────────────────────────────────
CREATE TABLE employee_government_ids (
  employee_government_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id            UUID NOT NULL REFERENCES employees(employee_id),
  government_id_type_id  UUID NOT NULL REFERENCES government_id_types(government_id_type_id),
  id_number              VARCHAR(50) NOT NULL,
  verified_at            TIMESTAMPTZ,
  verified_by_user_id    UUID REFERENCES users(user_id),
  updated_at             TIMESTAMPTZ,
  updated_by_user_id     UUID REFERENCES users(user_id),
  UNIQUE (employee_id, government_id_type_id)
);

CREATE INDEX idx_emp_gov_ids_employee ON employee_government_ids(employee_id);

-- ─── employee_rate_history ──────────────────────────────────────────────────
CREATE TABLE employee_rate_history (
  rate_history_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id        UUID NOT NULL REFERENCES employees(employee_id),
  pay_basis          VARCHAR(30) NOT NULL
                       CHECK (pay_basis IN ('MONTHLY','DAILY','HOURLY')),
  rate_amount        NUMERIC(12,2) NOT NULL,
  effective_from     DATE NOT NULL,
  effective_to       DATE,
  change_reason      VARCHAR(255),
  approved_by_user_id UUID REFERENCES users(user_id),
  created_by_user_id UUID NOT NULL REFERENCES users(user_id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_history_employee ON employee_rate_history(employee_id);
CREATE INDEX idx_rate_history_effective ON employee_rate_history(effective_from, effective_to);

-- Note: Overlapping effective-date ranges should be prevented by application
-- validation or an exclusion constraint (requires btree_gist extension).
