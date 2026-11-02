-- Migration 002: rooms
-- Rooms represent expense-sharing groups.

CREATE TABLE IF NOT EXISTS rooms (
  id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name             VARCHAR(150)  NOT NULL,
  description      TEXT          NULL,
  created_by       INT UNSIGNED  NOT NULL,
  invitation_code  CHAR(10)      NOT NULL,
  default_currency CHAR(3)       NOT NULL DEFAULT 'INR',
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at       DATETIME      NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invitation_code (invitation_code),
  INDEX idx_created_by (created_by),
  INDEX idx_deleted_at (deleted_at),
  CONSTRAINT fk_rooms_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
