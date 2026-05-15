-- ============================================================================
-- Migration 008 — Outputs and Reports
-- SME-Pay: Web-Based Payroll Automation System
-- ============================================================================

-- ─── document_templates ─────────────────────────────────────────────────────
CREATE TABLE document_templates (
  template_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies(company_id),
  template_type      VARCHAR(30) NOT NULL,
  template_name      VARCHAR(100) NOT NULL,
  version_no         INTEGER NOT NULL,
  template_config    JSONB NOT NULL DEFAULT '{}',
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_user_id UUID NOT NULL REFERENCES users(user_id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, template_type, version_no)
);

-- Only one active template per company/template type (DB-05 fix)
CREATE UNIQUE INDEX uix_document_templates_active
  ON document_templates (company_id, template_type)
  WHERE is_active = TRUE;

-- ─── payslips ───────────────────────────────────────────────────────────────
CREATE TABLE payslips (
  payslip_id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_employee_result_id  UUID NOT NULL REFERENCES payroll_employee_results(payroll_employee_result_id),
  payslip_no                  VARCHAR(80) NOT NULL UNIQUE,
  template_id                 UUID REFERENCES document_templates(template_id),
  file_path                   VARCHAR(255),
  file_hash                   VARCHAR(128),
  payslip_status              VARCHAR(30) NOT NULL DEFAULT 'GENERATED'
                                CHECK (payslip_status IN ('GENERATED','RELEASED','REPLACED','VOIDED')),
  generated_by_user_id        UUID NOT NULL REFERENCES users(user_id),
  generated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at                 TIMESTAMPTZ
);

CREATE INDEX idx_payslips_result ON payslips(payroll_employee_result_id);
CREATE INDEX idx_payslips_status ON payslips(payslip_status);

-- ─── report_exports ─────────────────────────────────────────────────────────
CREATE TABLE report_exports (
  report_export_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies(company_id),
  payroll_period_id  UUID REFERENCES payroll_periods(payroll_period_id),
  payroll_run_id     UUID REFERENCES payroll_runs(payroll_run_id),
  report_type        VARCHAR(50) NOT NULL,
  file_format        VARCHAR(20) NOT NULL,
  file_path          VARCHAR(255),
  file_hash          VARCHAR(128),
  generated_by_user_id UUID NOT NULL REFERENCES users(user_id),
  generated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
