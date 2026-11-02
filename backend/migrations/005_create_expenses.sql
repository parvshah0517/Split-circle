-- Migration 005: expenses
-- Core expense records.
-- Monetary amounts are stored as INT (minor currency units, e.g. paise for INR).
--
-- Status flow:
--   APPROVED          → default when created_by == paid_by (self-recorded)
--   PENDING_APPROVAL  → on_behalf_of is set, OR an edit was submitted
--   REJECTED          → approval denied
--   CANCELLED         → soft-cancelled (no hard delete of financial records)

CREATE TABLE IF NOT EXISTS expenses (
  id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  room_id          INT UNSIGNED  NOT NULL,
  title            VARCHAR(255)  NOT NULL,
  description      TEXT          NULL,
  total_amount     INT           NOT NULL COMMENT 'Minor currency units (e.g. paise)',
  currency         CHAR(3)       NOT NULL DEFAULT 'INR',
  category_id      INT UNSIGNED  NULL,
  expense_date     DATE          NOT NULL,
  paid_by          INT UNSIGNED  NOT NULL COMMENT 'User who actually paid',
  created_by       INT UNSIGNED  NOT NULL COMMENT 'User who recorded the expense',
  on_behalf_of     INT UNSIGNED  NULL     COMMENT 'Proxy target — triggers approval workflow',
  split_method     ENUM('EQUAL','EXACT','PERCENTAGE','SHARES') NOT NULL DEFAULT 'EQUAL',
  status           ENUM('PENDING_APPROVAL','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'APPROVED',
  approved_by      INT UNSIGNED  NULL,
  approved_at      DATETIME      NULL,
  rejection_reason TEXT          NULL,
  notes            TEXT          NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at       DATETIME      NULL,
  PRIMARY KEY (id),
  INDEX idx_room_id    (room_id),
  INDEX idx_status     (status),
  INDEX idx_paid_by    (paid_by),
  INDEX idx_created_by (created_by),
  INDEX idx_expense_date (expense_date),
  CONSTRAINT fk_exp_room        FOREIGN KEY (room_id)      REFERENCES rooms(id),
  CONSTRAINT fk_exp_category    FOREIGN KEY (category_id)  REFERENCES categories(id),
  CONSTRAINT fk_exp_paid_by     FOREIGN KEY (paid_by)      REFERENCES users(id),
  CONSTRAINT fk_exp_created_by  FOREIGN KEY (created_by)   REFERENCES users(id),
  CONSTRAINT fk_exp_on_behalf   FOREIGN KEY (on_behalf_of) REFERENCES users(id),
  CONSTRAINT fk_exp_approved_by FOREIGN KEY (approved_by)  REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
