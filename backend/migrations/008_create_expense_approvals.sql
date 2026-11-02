-- Migration 008: expense_approvals
-- Tracks approval requests for proxy expenses and expense revisions.

CREATE TABLE IF NOT EXISTS expense_approvals (
  id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  expense_id       INT UNSIGNED  NOT NULL,
  revision_id      INT UNSIGNED  NULL     COMMENT 'Set when approving a revision',
  requested_from   INT UNSIGNED  NOT NULL COMMENT 'Who must approve',
  requested_by     INT UNSIGNED  NOT NULL COMMENT 'Who triggered the approval request',
  status           ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  decided_by       INT UNSIGNED  NULL,
  decided_at       DATETIME      NULL,
  rejection_reason TEXT          NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_expense_id     (expense_id),
  INDEX idx_requested_from (requested_from),
  INDEX idx_status         (status),
  CONSTRAINT fk_appr_expense       FOREIGN KEY (expense_id)     REFERENCES expenses(id),
  CONSTRAINT fk_appr_revision      FOREIGN KEY (revision_id)    REFERENCES expense_revisions(id),
  CONSTRAINT fk_appr_req_from      FOREIGN KEY (requested_from) REFERENCES users(id),
  CONSTRAINT fk_appr_req_by        FOREIGN KEY (requested_by)   REFERENCES users(id),
  CONSTRAINT fk_appr_decided_by    FOREIGN KEY (decided_by)     REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
