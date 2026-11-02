-- Migration 006: expense_splits
-- Per-participant share of each expense.
-- share_amount: integer minor units actually owed by this user.
-- share_units:  raw input value (percentage, share count, or exact amount for display).
-- is_payer:     marks the participant who paid (1 row per expense will have is_payer=1).

CREATE TABLE IF NOT EXISTS expense_splits (
  id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  expense_id   INT UNSIGNED   NOT NULL,
  user_id      INT UNSIGNED   NOT NULL COMMENT 'Participant user',
  share_amount INT            NOT NULL COMMENT 'Minor units this user owes',
  share_units  DECIMAL(10,4)  NULL     COMMENT 'Raw percentage / share count for display',
  is_payer     TINYINT(1)     NOT NULL DEFAULT 0,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_expense_user (expense_id, user_id),
  INDEX idx_expense_id (expense_id),
  INDEX idx_user_id    (user_id),
  CONSTRAINT fk_split_expense FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
  CONSTRAINT fk_split_user    FOREIGN KEY (user_id)    REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
