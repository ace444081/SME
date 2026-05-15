-- ============================================================================
-- Migration 003 — Authentication and RBAC
-- SME-Pay: Web-Based Payroll Automation System
-- ============================================================================

-- ─── roles ──────────────────────────────────────────────────────────────────
CREATE TABLE roles (
  role_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_code          VARCHAR(50) NOT NULL UNIQUE,
  role_name          VARCHAR(100) NOT NULL UNIQUE,
  description        VARCHAR(255),
  is_system_role     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── permissions ────────────────────────────────────────────────────────────
CREATE TABLE permissions (
  permission_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_code    VARCHAR(100) NOT NULL UNIQUE,
  module_name        VARCHAR(80) NOT NULL,
  action_name        VARCHAR(80) NOT NULL,
  description        VARCHAR(255)
);

-- ─── users ──────────────────────────────────────────────────────────────────
-- If using Supabase Auth: add auth_user_id, make password_hash nullable
CREATE TABLE users (
  user_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies(company_id),
  employee_id        UUID,  -- FK added after employees table exists
  auth_user_id       UUID UNIQUE,  -- References auth.users(id) when using Supabase Auth
  username           VARCHAR(80) NOT NULL UNIQUE,
  email              VARCHAR(150) UNIQUE,
  password_hash      VARCHAR(255),  -- Nullable when using Supabase Auth
  account_status     VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
                       CHECK (account_status IN ('ACTIVE','LOCKED','DISABLED','PENDING')),
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at      TIMESTAMPTZ,
  created_by_user_id UUID REFERENCES users(user_id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── user_roles (junction) ──────────────────────────────────────────────────
CREATE TABLE user_roles (
  user_id            UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  role_id            UUID NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
  assigned_by_user_id UUID REFERENCES users(user_id),
  assigned_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- ─── role_permissions (junction) ────────────────────────────────────────────
CREATE TABLE role_permissions (
  role_id            UUID NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
  permission_id      UUID NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
  granted_by_user_id UUID REFERENCES users(user_id),
  granted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- ─── login_attempts ─────────────────────────────────────────────────────────
CREATE TABLE login_attempts (
  login_attempt_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES users(user_id),
  username_entered   VARCHAR(80) NOT NULL,
  attempt_status     VARCHAR(30) NOT NULL
                       CHECK (attempt_status IN ('SUCCESS','FAILED')),
  failure_reason     VARCHAR(100),
  ip_address         VARCHAR(45),
  user_agent         TEXT,
  attempted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_login_attempts_user ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_at ON login_attempts(attempted_at);

-- ─── password_reset_tokens ──────────────────────────────────────────────────
CREATE TABLE password_reset_tokens (
  reset_token_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(user_id),
  token_hash         VARCHAR(255) NOT NULL UNIQUE,
  requested_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at         TIMESTAMPTZ NOT NULL,
  used_at            TIMESTAMPTZ,
  requested_by_user_id UUID REFERENCES users(user_id)
);

-- Add FK from system_settings to users now that users table exists
ALTER TABLE system_settings
  ADD CONSTRAINT fk_system_settings_updated_by
  FOREIGN KEY (updated_by_user_id) REFERENCES users(user_id);
