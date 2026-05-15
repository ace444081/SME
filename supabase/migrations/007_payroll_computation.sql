-- ============================================================================
-- Migration 007 — Payroll Computation
-- SME-Pay: Web-Based Payroll Automation System
-- ============================================================================

-- ─── payroll_runs ───────────────────────────────────────────────────────────
CREATE TABLE payroll_runs (
  payroll_run_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_period_id  UUID NOT NULL REFERENCES payroll_periods(payroll_period_id),
  run_number         INTEGER NOT NULL,
  run_status         VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
                       CHECK (run_status IN (
                         'DRAFT','COMPUTED','SUBMITTED','RETURNED','FINALIZED','VOIDED'
                       )),
  computed_by_user_id UUID NOT NULL REFERENCES users(user_id),
  computed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  formula_version    VARCHAR(50),
  remarks            TEXT,
  UNIQUE (payroll_period_id, run_number)
);

CREATE INDEX idx_payroll_runs_period ON payroll_runs(payroll_period_id);
CREATE INDEX idx_payroll_runs_status ON payroll_runs(run_status);

-- ─── payroll_employee_results ───────────────────────────────────────────────
CREATE TABLE payroll_employee_results (
  payroll_employee_result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id     UUID NOT NULL REFERENCES payroll_runs(payroll_run_id),
  employee_id        UUID NOT NULL REFERENCES employees(employee_id),
  attendance_input_id UUID NOT NULL REFERENCES attendance_payroll_inputs(attendance_input_id),
  rate_history_id    UUID NOT NULL REFERENCES employee_rate_history(rate_history_id),
  computation_status VARCHAR(30) NOT NULL DEFAULT 'OK'
                       CHECK (computation_status IN ('OK','WARNING','ERROR','VOIDED')),
  warning_message    TEXT,
  computed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (payroll_run_id, employee_id)
);

CREATE INDEX idx_payroll_results_run ON payroll_employee_results(payroll_run_id);
CREATE INDEX idx_payroll_results_employee ON payroll_employee_results(employee_id);

-- ─── payroll_earning_lines ──────────────────────────────────────────────────
CREATE TABLE payroll_earning_lines (
  earning_line_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_employee_result_id    UUID NOT NULL REFERENCES payroll_employee_results(payroll_employee_result_id)
                                  ON DELETE CASCADE,
  earning_type_id               UUID NOT NULL REFERENCES earning_types(earning_type_id),
  source_manual_adjustment_id   UUID REFERENCES manual_payroll_adjustments(manual_adjustment_id),
  description                   VARCHAR(150) NOT NULL,
  quantity                      NUMERIC(10,2),
  rate_used                     NUMERIC(12,2),
  amount                        NUMERIC(12,2) NOT NULL,
  is_taxable                    BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_earning_lines_result ON payroll_earning_lines(payroll_employee_result_id);

-- ─── payroll_deduction_lines ────────────────────────────────────────────────
CREATE TABLE payroll_deduction_lines (
  deduction_line_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_employee_result_id    UUID NOT NULL REFERENCES payroll_employee_results(payroll_employee_result_id)
                                  ON DELETE CASCADE,
  deduction_type_id             UUID NOT NULL REFERENCES deduction_types(deduction_type_id),
  reference_set_id              UUID REFERENCES statutory_reference_sets(reference_set_id),
  contribution_bracket_id       UUID REFERENCES statutory_contribution_brackets(contribution_bracket_id),
  tax_bracket_id                UUID REFERENCES withholding_tax_brackets(tax_bracket_id),
  source_manual_adjustment_id   UUID REFERENCES manual_payroll_adjustments(manual_adjustment_id),
  description                   VARCHAR(150) NOT NULL,
  amount                        NUMERIC(12,2) NOT NULL,
  reduces_taxable_income        BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_deduction_lines_result ON payroll_deduction_lines(payroll_employee_result_id);

-- ─── payroll_employer_contribution_lines ────────────────────────────────────
CREATE TABLE payroll_employer_contribution_lines (
  employer_contribution_line_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_employee_result_id    UUID NOT NULL REFERENCES payroll_employee_results(payroll_employee_result_id)
                                  ON DELETE CASCADE,
  deduction_type_id             UUID NOT NULL REFERENCES deduction_types(deduction_type_id),
  reference_set_id              UUID REFERENCES statutory_reference_sets(reference_set_id),
  contribution_bracket_id       UUID REFERENCES statutory_contribution_brackets(contribution_bracket_id),
  description                   VARCHAR(150) NOT NULL,
  amount                        NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_employer_contrib_result ON payroll_employer_contribution_lines(payroll_employee_result_id);

-- ─── payroll_review_actions ─────────────────────────────────────────────────
CREATE TABLE payroll_review_actions (
  review_action_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id     UUID NOT NULL REFERENCES payroll_runs(payroll_run_id),
  action_type        VARCHAR(30) NOT NULL
                       CHECK (action_type IN (
                         'SUBMIT','REVIEW','RETURN','APPROVE','FINALIZE','REOPEN'
                       )),
  action_by_user_id  UUID NOT NULL REFERENCES users(user_id),
  action_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  remarks            TEXT
);
