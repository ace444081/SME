-- ============================================================================
-- Migration 013 — Employee Portal
-- SME-Pay: Web-Based Payroll Automation System
-- ============================================================================

CREATE TABLE employee_payslip_concerns (
    concern_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(employee_id),
    payroll_period_id UUID NOT NULL REFERENCES payroll_periods(payroll_period_id),
    concern_text TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED')),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE employee_profile_change_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(employee_id),
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('ADDRESS', 'CONTACT', 'CIVIL_STATUS', 'OTHER')),
    requested_changes JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS
ALTER TABLE employee_payslip_concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_profile_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company isolation portal" ON employee_payslip_concerns FOR SELECT TO authenticated
  USING (employee_id IN (SELECT employee_id FROM employees WHERE company_id = auth_company_id()));

CREATE POLICY "Company isolation portal req" ON employee_profile_change_requests FOR SELECT TO authenticated
  USING (employee_id IN (SELECT employee_id FROM employees WHERE company_id = auth_company_id()));

CREATE POLICY "Company isolation notifications" ON notifications FOR SELECT TO authenticated
  USING (user_id IN (SELECT user_id FROM users WHERE company_id = auth_company_id()));

-- Trigger for updated_at
CREATE TRIGGER set_timestamp_employee_payslip_concerns
BEFORE UPDATE ON employee_payslip_concerns
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_employee_profile_change_requests
BEFORE UPDATE ON employee_profile_change_requests
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
