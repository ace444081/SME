-- ============================================================================
-- Migration 005 — Payroll Setup and Input
-- SME-Pay: Web-Based Payroll Automation System
-- ============================================================================

-- ─── company_payroll_settings ───────────────────────────────────────────────
CREATE TABLE company_payroll_settings (
  payroll_setting_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id                   UUID NOT NULL REFERENCES companies(company_id),
  default_frequency_id         UUID NOT NULL REFERENCES payroll_frequencies(frequency_id),
  default_working_days_per_month NUMERIC(5,2) NOT NULL DEFAULT 26.00,
  default_working_hours_per_day  NUMERIC(5,2) NOT NULL DEFAULT 8.00,
  default_overtime_multiplier  NUMERIC(8,6) NOT NULL DEFAULT 1.250000,
  allow_manual_adjustments     BOOLEAN NOT NULL DEFAULT TRUE,
  require_manager_approval     BOOLEAN NOT NULL DEFAULT TRUE,
  effective_from               DATE NOT NULL,
  effective_to                 DATE,
  created_by_user_id           UUID NOT NULL REFERENCES users(user_id),
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── payroll_periods ────────────────────────────────────────────────────────
CREATE TABLE payroll_periods (
  payroll_period_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies(company_id),
  frequency_id       UUID NOT NULL REFERENCES payroll_frequencies(frequency_id),
  period_code        VARCHAR(50) NOT NULL,
  period_name        VARCHAR(100) NOT NULL,
  period_start_date  DATE NOT NULL,
  period_end_date    DATE NOT NULL,
  cutoff_start_date  DATE NOT NULL,
  cutoff_end_date    DATE NOT NULL,
  pay_date           DATE,
  period_status      VARCHAR(30) NOT NULL DEFAULT 'OPEN'
                       CHECK (period_status IN (
                         'OPEN','COMPUTED','SUBMITTED','RETURNED',
                         'FINALIZED','REOPENED','ARCHIVED'
                       )),
  created_by_user_id UUID NOT NULL REFERENCES users(user_id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, period_code),
  CHECK (period_end_date >= period_start_date),
  CHECK (cutoff_end_date >= cutoff_start_date)
);

CREATE INDEX idx_payroll_periods_company ON payroll_periods(company_id);
CREATE INDEX idx_payroll_periods_status ON payroll_periods(period_status);
CREATE INDEX idx_payroll_periods_dates ON payroll_periods(period_start_date, period_end_date);

CREATE TRIGGER trg_payroll_periods_updated_at
  BEFORE UPDATE ON payroll_periods
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── payroll_period_status_history ──────────────────────────────────────────
CREATE TABLE payroll_period_status_history (
  status_history_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_period_id  UUID NOT NULL REFERENCES payroll_periods(payroll_period_id),
  old_status         VARCHAR(30)
                       CHECK (old_status IS NULL OR old_status IN (
                         'OPEN','COMPUTED','SUBMITTED','RETURNED',
                         'FINALIZED','REOPENED','ARCHIVED'
                       )),
  new_status         VARCHAR(30) NOT NULL
                       CHECK (new_status IN (
                         'OPEN','COMPUTED','SUBMITTED','RETURNED',
                         'FINALIZED','REOPENED','ARCHIVED'
                       )),
  changed_by_user_id UUID NOT NULL REFERENCES users(user_id),
  changed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  remarks            TEXT
);

-- ─── attendance_payroll_inputs ──────────────────────────────────────────────
CREATE TABLE attendance_payroll_inputs (
  attendance_input_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_period_id   UUID NOT NULL REFERENCES payroll_periods(payroll_period_id),
  employee_id         UUID NOT NULL REFERENCES employees(employee_id),
  days_worked         NUMERIC(6,2) NOT NULL CHECK (days_worked >= 0),
  regular_hours_worked NUMERIC(7,2),
  absence_days        NUMERIC(6,2) NOT NULL CHECK (absence_days >= 0),
  late_minutes        INTEGER NOT NULL CHECK (late_minutes >= 0),
  undertime_minutes   INTEGER NOT NULL CHECK (undertime_minutes >= 0),
  overtime_hours      NUMERIC(7,2) NOT NULL CHECK (overtime_hours >= 0),
  rest_day_overtime_hours NUMERIC(7,2)
                       CHECK (rest_day_overtime_hours IS NULL OR rest_day_overtime_hours >= 0),
  holiday_overtime_hours  NUMERIC(7,2)
                       CHECK (holiday_overtime_hours IS NULL OR holiday_overtime_hours >= 0),
  source_type         VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
  input_status        VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
                       CHECK (input_status IN ('DRAFT','VALIDATED','CORRECTED','LOCKED','VOIDED')),
  remarks             TEXT,
  encoded_by_user_id  UUID NOT NULL REFERENCES users(user_id),
  encoded_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by_user_id  UUID REFERENCES users(user_id),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (payroll_period_id, employee_id)
);

CREATE INDEX idx_attendance_period ON attendance_payroll_inputs(payroll_period_id);
CREATE INDEX idx_attendance_employee ON attendance_payroll_inputs(employee_id);

CREATE TRIGGER trg_attendance_updated_at
  BEFORE UPDATE ON attendance_payroll_inputs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── manual_payroll_adjustments ─────────────────────────────────────────────
CREATE TABLE manual_payroll_adjustments (
  manual_adjustment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_period_id    UUID NOT NULL REFERENCES payroll_periods(payroll_period_id),
  employee_id          UUID NOT NULL REFERENCES employees(employee_id),
  adjustment_type_id   UUID NOT NULL REFERENCES manual_adjustment_types(adjustment_type_id),
  amount               NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  remarks              TEXT,
  created_by_user_id   UUID NOT NULL REFERENCES users(user_id),
  approved_by_user_id  UUID REFERENCES users(user_id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
