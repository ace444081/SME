-- ============================================================================
-- Migration 002 — Company, System Settings, and Lookup Tables
-- SME-Pay: Web-Based Payroll Automation System
-- ============================================================================

-- ─── companies ──────────────────────────────────────────────────────────────
CREATE TABLE companies (
  company_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name       VARCHAR(150) NOT NULL UNIQUE,
  business_name      VARCHAR(150),
  tin                VARCHAR(30),
  address_line       VARCHAR(255),
  city               VARCHAR(100),
  province           VARCHAR(100),
  postal_code        VARCHAR(20),
  contact_number     VARCHAR(30),
  email              VARCHAR(150),
  logo_file_path     VARCHAR(255),
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── system_settings (EAV pattern) ──────────────────────────────────────────
CREATE TABLE system_settings (
  setting_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID REFERENCES companies(company_id),
  setting_key        VARCHAR(100) NOT NULL,
  setting_value      TEXT NOT NULL,
  value_type         VARCHAR(30) NOT NULL
                       CHECK (value_type IN ('STRING','NUMBER','BOOLEAN','JSON')),
  description        VARCHAR(255),
  updated_by_user_id UUID,  -- FK added after users table exists
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, setting_key)
);

-- ─── payroll_frequencies ────────────────────────────────────────────────────
CREATE TABLE payroll_frequencies (
  frequency_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frequency_code     VARCHAR(30) NOT NULL UNIQUE,
  frequency_name     VARCHAR(80) NOT NULL,
  periods_per_year   INTEGER
);

-- ─── employment_statuses ────────────────────────────────────────────────────
CREATE TABLE employment_statuses (
  employment_status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_code          VARCHAR(30) NOT NULL UNIQUE,
  status_name          VARCHAR(80) NOT NULL,
  description          VARCHAR(255)
);

-- ─── government_id_types ────────────────────────────────────────────────────
CREATE TABLE government_id_types (
  government_id_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_code             VARCHAR(30) NOT NULL UNIQUE,
  type_name             VARCHAR(100) NOT NULL,
  is_required_for_payroll BOOLEAN NOT NULL DEFAULT TRUE
);

-- ─── deduction_types ────────────────────────────────────────────────────────
CREATE TABLE deduction_types (
  deduction_type_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deduction_code       VARCHAR(50) NOT NULL UNIQUE,
  deduction_name       VARCHAR(100) NOT NULL,
  deduction_category   VARCHAR(30) NOT NULL
                         CHECK (deduction_category IN ('STATUTORY','TAX','CUSTOM','LOAN','OTHER')),
  calculation_method   VARCHAR(30) NOT NULL
                         CHECK (calculation_method IN ('BRACKET','PERCENTAGE','FIXED','MANUAL')),
  reduces_taxable_income BOOLEAN NOT NULL DEFAULT FALSE,
  has_employer_share   BOOLEAN NOT NULL DEFAULT FALSE,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE
);

-- ─── earning_types ──────────────────────────────────────────────────────────
CREATE TABLE earning_types (
  earning_type_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  earning_code         VARCHAR(50) NOT NULL UNIQUE,
  earning_name         VARCHAR(100) NOT NULL,
  is_taxable           BOOLEAN NOT NULL DEFAULT TRUE,
  is_system_generated  BOOLEAN NOT NULL DEFAULT TRUE,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE
);

-- ─── manual_adjustment_types ────────────────────────────────────────────────
CREATE TABLE manual_adjustment_types (
  adjustment_type_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_code      VARCHAR(50) NOT NULL UNIQUE,
  adjustment_name      VARCHAR(100) NOT NULL,
  adjustment_class     VARCHAR(30) NOT NULL
                         CHECK (adjustment_class IN ('EARNING','DEDUCTION')),
  is_taxable           BOOLEAN NOT NULL DEFAULT FALSE,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE
);
