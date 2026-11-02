-- Migration 011: settlement_allocations
-- Optional breakdown of which expenses a settlement is clearing.

CREATE TABLE IF NOT EXISTS settlement_allocations (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  settlement_id INT UNSIGNED  NOT NULL,
  expense_id    INT UNSIGNED  NOT NULL,
  amount        INT           NOT NULL COMMENT 'Minor units — portion against this expense',
  PRIMARY KEY (id),
  INDEX idx_settlement_id (settlement_id),
  INDEX idx_expense_id    (expense_id),
  CONSTRAINT fk_sa_settlement FOREIGN KEY (settlement_id) REFERENCES settlements(id) ON DELETE CASCADE,
  CONSTRAINT fk_sa_expense    FOREIGN KEY (expense_id)    REFERENCES expenses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
