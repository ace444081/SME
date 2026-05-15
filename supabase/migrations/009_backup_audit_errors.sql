-- ============================================================================
-- Migration 009 — Backup, Restore, Archive, Audit, and Error Logs
-- SME-Pay: Web-Based Payroll Automation System
-- ============================================================================

-- ─── backup_files ───────────────────────────────────────────────────────────
CREATE TABLE backup_files (
  backup_file_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies(company_id),
  backup_type        VARCHAR(30) NOT NULL,
  backup_status      VARCHAR(30) NOT NULL DEFAULT 'STARTED'
                       CHECK (backup_status IN ('STARTED','COMPLETED','FAILED')),
  file_path          VARCHAR(255),
  file_hash          VARCHAR(128),
  created_by_user_id UUID NOT NULL REFERENCES users(user_id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  remarks            TEXT
);

-- ─── restore_operations ─────────────────────────────────────────────────────
CREATE TABLE restore_operations (
  restore_operation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_file_id       UUID NOT NULL REFERENCES backup_files(backup_file_id),
  restore_status       VARCHAR(30) NOT NULL DEFAULT 'STARTED'
                         CHECK (restore_status IN ('STARTED','COMPLETED','FAILED','CANCELLED')),
  reason               TEXT NOT NULL,
  restored_by_user_id  UUID NOT NULL REFERENCES users(user_id),
  started_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at         TIMESTAMPTZ,
  remarks              TEXT
);

-- ─── archive_logs ───────────────────────────────────────────────────────────
CREATE TABLE archive_logs (
  archive_log_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies(company_id),
  entity_type        VARCHAR(50) NOT NULL,
  entity_id          UUID NOT NULL,
  archive_action     VARCHAR(30) NOT NULL
                       CHECK (archive_action IN ('ARCHIVE','RESTORE')),
  action_by_user_id  UUID NOT NULL REFERENCES users(user_id),
  action_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  remarks            TEXT
);

-- ─── audit_logs ─────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
  audit_log_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies(company_id),
  user_id            UUID REFERENCES users(user_id),
  action_code        VARCHAR(80) NOT NULL,
  entity_type        VARCHAR(80) NOT NULL,
  entity_id          UUID,
  old_values         JSONB,
  new_values         JSONB,
  ip_address         VARCHAR(45),
  user_agent         TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_code);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ─── system_error_logs ──────────────────────────────────────────────────────
CREATE TABLE system_error_logs (
  system_error_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID REFERENCES companies(company_id),
  user_id             UUID REFERENCES users(user_id),
  error_code          VARCHAR(80),
  error_message       TEXT NOT NULL,
  error_context       JSONB,
  severity            VARCHAR(30) NOT NULL DEFAULT 'MEDIUM'
                        CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  is_resolved         BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by_user_id UUID REFERENCES users(user_id),
  resolved_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
