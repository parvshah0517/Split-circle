-- Migration 012: room_budgets
-- Optional 1-to-1 budget for a room.

CREATE TABLE IF NOT EXISTS room_budgets (
  id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  room_id        INT UNSIGNED  NOT NULL,
  budget_amount  INT           NOT NULL COMMENT 'Minor currency units',
  currency       CHAR(3)       NOT NULL DEFAULT 'INR',
  period_label   VARCHAR(100)  NULL     COMMENT 'e.g. "Goa Trip" or "October 2024"',
  created_by     INT UNSIGNED  NOT NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_room_budget (room_id),
  CONSTRAINT fk_budget_room       FOREIGN KEY (room_id)    REFERENCES rooms(id),
  CONSTRAINT fk_budget_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
