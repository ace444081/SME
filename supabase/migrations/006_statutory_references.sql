-- ============================================================================
-- Migration 006 — Statutory References
-- SME-Pay: Web-Based Payroll Automation System
-- ============================================================================

-- ─── statutory_reference_sets ───────────────────────────────────────────────
CREATE TABLE statutory_reference_sets (
  reference_set_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deduction_type_id  UUID NOT NULL REFERENCES deduction_types(deduction_type_id),
  reference_name     VARCHAR(150) NOT NULL,
  version_label      VARCHAR(50) NOT NULL,
  effective_from     DATE NOT NULL,
  effective_to       DATE,
  source_note        TEXT,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_user_id UUID NOT NULL REFERENCES users(user_id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: Overlapping effective ranges per deduction_type_id should be
-- prevented by application validation.

-- ─── statutory_contribution_brackets ────────────────────────────────────────
CREATE TABLE statutory_contribution_brackets (
  contribution_bracket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_set_id        UUID NOT NULL REFERENCES statutory_reference_sets(reference_set_id)
                            ON DELETE CASCADE,
  min_compensation        NUMERIC(12,2) NOT NULL,
  max_compensation        NUMERIC(12,2),
  salary_credit           NUMERIC(12,2),
  employee_rate           NUMERIC(8,6),
  employer_rate           NUMERIC(8,6),
  employee_fixed_amount   NUMERIC(12,2),
  employer_fixed_amount   NUMERIC(12,2),
  formula_note            TEXT
);

-- ─── withholding_tax_tables ─────────────────────────────────────────────────
CREATE TABLE withholding_tax_tables (
  tax_table_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID REFERENCES companies(company_id),
  frequency_id       UUID NOT NULL REFERENCES payroll_frequencies(frequency_id),
  table_name         VARCHAR(150) NOT NULL,
  effective_from     DATE NOT NULL,
  effective_to       DATE,
  source_note        TEXT,
  created_by_user_id UUID NOT NULL REFERENCES users(user_id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: Overlapping effective ranges per frequency_id should be
-- prevented by application validation.

-- ─── withholding_tax_brackets ───────────────────────────────────────────────
CREATE TABLE withholding_tax_brackets (
  tax_bracket_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_table_id       UUID NOT NULL REFERENCES withholding_tax_tables(tax_table_id)
                       ON DELETE CASCADE,
  bracket_no         INTEGER NOT NULL,
  lower_bound        NUMERIC(12,2) NOT NULL,
  upper_bound        NUMERIC(12,2),
  base_tax_amount    NUMERIC(12,2) NOT NULL,
  excess_over_amount NUMERIC(12,2) NOT NULL,
  marginal_rate      NUMERIC(8,6) NOT NULL
);
