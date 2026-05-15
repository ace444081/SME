-- ============================================================================
-- Migration 001 — Extensions and Base Utilities
-- SME-Pay: Web-Based Payroll Automation System
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Common updated_at trigger function ─────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Audit log helper function ──────────────────────────────────────────────
-- Inserts a row into audit_logs. Called from application code or triggers.
-- Parameters: company, user, action_code, entity_type, entity_id, old_vals, new_vals
CREATE OR REPLACE FUNCTION insert_audit_log(
  p_company_id UUID,
  p_user_id UUID,
  p_action_code VARCHAR(80),
  p_entity_type VARCHAR(80),
  p_entity_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address VARCHAR(45) DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    audit_log_id, company_id, user_id, action_code,
    entity_type, entity_id, old_values, new_values,
    ip_address, user_agent, created_at
  ) VALUES (
    gen_random_uuid(), p_company_id, p_user_id, p_action_code,
    p_entity_type, p_entity_id, p_old_values, p_new_values,
    p_ip_address, p_user_agent, NOW()
  )
  RETURNING audit_log_id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;
