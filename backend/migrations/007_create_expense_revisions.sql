-- Migration 007: expense_revisions
-- Immutable audit snapshots of every expense edit.
-- snapshot_json stores the full expense + splits state before the change.

CREATE TABLE IF NOT EXISTS expense_revisions (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  expense_id      INT UNSIGNED  NOT NULL,
  revision_number INT UNSIGNED  NOT NULL,
  snapshot_json   JSON          NOT NULL COMMENT 'Full expense + splits before this revision',
  changed_by      INT UNSIGNED  NOT NULL,
  change_summary  TEXT          NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_expense_revision (expense_id, revision_number),
  INDEX idx_expense_id (expense_id),
  CONSTRAINT fk_rev_expense    FOREIGN KEY (expense_id) REFERENCES expenses(id),
  CONSTRAINT fk_rev_changed_by FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
