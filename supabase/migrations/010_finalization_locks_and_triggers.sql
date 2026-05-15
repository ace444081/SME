-- ============================================================================
-- Migration 010 — Database-Level Finalization Locks and Integrity Triggers
-- SME-Pay: Web-Based Payroll Automation System
--
-- These triggers enforce payroll data integrity at the database level.
-- App-only locking is NOT sufficient for payroll data protection.
-- ============================================================================

-- ─── 1. Prevent changes to attendance inputs for finalized/archived periods ─
CREATE OR REPLACE FUNCTION prevent_finalized_period_input_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_status VARCHAR(30);
BEGIN
  -- For INSERT, use NEW; for UPDATE/DELETE, use OLD (or NEW for UPDATE)
  IF TG_OP = 'INSERT' THEN
    SELECT period_status INTO v_status
    FROM payroll_periods
    WHERE payroll_period_id = NEW.payroll_period_id;
  ELSE
    SELECT period_status INTO v_status
    FROM payroll_periods
    WHERE payroll_period_id = OLD.payroll_period_id;
  END IF;

  IF v_status IN ('FINALIZED', 'ARCHIVED') THEN
    RAISE EXCEPTION 'Cannot modify records for a % payroll period', v_status;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Block INSERT/UPDATE/DELETE on attendance_payroll_inputs for finalized periods
CREATE TRIGGER trg_lock_attendance_inputs
  BEFORE INSERT OR UPDATE OR DELETE ON attendance_payroll_inputs
  FOR EACH ROW EXECUTE FUNCTION prevent_finalized_period_input_changes();

-- Block INSERT/UPDATE/DELETE on manual_payroll_adjustments for finalized periods
CREATE TRIGGER trg_lock_manual_adjustments
  BEFORE INSERT OR UPDATE OR DELETE ON manual_payroll_adjustments
  FOR EACH ROW EXECUTE FUNCTION prevent_finalized_period_input_changes();


-- ─── 2. Prevent changes to payroll results for finalized runs ───────────────
CREATE OR REPLACE FUNCTION prevent_finalized_run_result_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_run_status VARCHAR(30);
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT run_status INTO v_run_status
    FROM payroll_runs
    WHERE payroll_run_id = OLD.payroll_run_id;
  ELSE
    SELECT run_status INTO v_run_status
    FROM payroll_runs
    WHERE payroll_run_id = COALESCE(NEW.payroll_run_id, OLD.payroll_run_id);
  END IF;

  IF v_run_status = 'FINALIZED' THEN
    RAISE EXCEPTION 'Cannot modify payroll results for a FINALIZED payroll run';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Block UPDATE/DELETE on payroll_employee_results for finalized runs
CREATE TRIGGER trg_lock_payroll_results
  BEFORE UPDATE OR DELETE ON payroll_employee_results
  FOR EACH ROW EXECUTE FUNCTION prevent_finalized_run_result_changes();


-- ─── 3. Prevent changes to payroll lines for finalized results ──────────────
CREATE OR REPLACE FUNCTION prevent_finalized_result_line_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_run_status VARCHAR(30);
  v_result_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_result_id := OLD.payroll_employee_result_id;
  ELSE
    v_result_id := COALESCE(NEW.payroll_employee_result_id, OLD.payroll_employee_result_id);
  END IF;

  SELECT pr.run_status INTO v_run_status
  FROM payroll_employee_results per
  JOIN payroll_runs pr ON pr.payroll_run_id = per.payroll_run_id
  WHERE per.payroll_employee_result_id = v_result_id;

  IF v_run_status = 'FINALIZED' THEN
    RAISE EXCEPTION 'Cannot modify payroll lines for a FINALIZED payroll run';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all three line tables
CREATE TRIGGER trg_lock_earning_lines
  BEFORE UPDATE OR DELETE ON payroll_earning_lines
  FOR EACH ROW EXECUTE FUNCTION prevent_finalized_result_line_changes();

CREATE TRIGGER trg_lock_deduction_lines
  BEFORE UPDATE OR DELETE ON payroll_deduction_lines
  FOR EACH ROW EXECUTE FUNCTION prevent_finalized_result_line_changes();

CREATE TRIGGER trg_lock_employer_contrib_lines
  BEFORE UPDATE OR DELETE ON payroll_employer_contribution_lines
  FOR EACH ROW EXECUTE FUNCTION prevent_finalized_result_line_changes();


-- ─── 4. Prevent deletion of finalized payroll runs ──────────────────────────
CREATE OR REPLACE FUNCTION prevent_finalized_run_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.run_status = 'FINALIZED' THEN
    RAISE EXCEPTION 'Cannot delete a FINALIZED payroll run';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lock_finalized_runs
  BEFORE DELETE ON payroll_runs
  FOR EACH ROW EXECUTE FUNCTION prevent_finalized_run_deletion();


-- ─── 5. Make audit_logs append-only ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are append-only. Updates and deletes are not allowed.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_logs_append_only
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();
