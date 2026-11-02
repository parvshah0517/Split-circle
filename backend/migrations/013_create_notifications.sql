-- Migration 013: notifications
-- In-app notifications per user.
-- entity_type + entity_id create a polymorphic reference to the triggering record.

CREATE TABLE IF NOT EXISTS notifications (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED  NOT NULL,
  type        VARCHAR(80)   NOT NULL COMMENT 'e.g. EXPENSE_ADDED, APPROVAL_REQUESTED',
  title       VARCHAR(255)  NOT NULL,
  body        TEXT          NULL,
  entity_type VARCHAR(50)   NULL  COMMENT 'expense | settlement | room | approval',
  entity_id   INT UNSIGNED  NULL,
  room_id     INT UNSIGNED  NULL,
  is_read     TINYINT(1)    NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user_id   (user_id),
  INDEX idx_is_read   (is_read),
  INDEX idx_room_id   (room_id),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
