-- Migration 014: activity_logs
-- Immutable room-level audit trail.
-- meta_json stores old/new values or additional context per action.

CREATE TABLE IF NOT EXISTS activity_logs (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  room_id     INT UNSIGNED  NOT NULL,
  actor_id    INT UNSIGNED  NOT NULL,
  action      VARCHAR(80)   NOT NULL COMMENT 'e.g. EXPENSE_CREATED, SETTLEMENT_RECORDED',
  entity_type VARCHAR(50)   NOT NULL COMMENT 'expense | settlement | room | approval',
  entity_id   INT UNSIGNED  NOT NULL,
  meta_json   JSON          NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_room_id    (room_id),
  INDEX idx_actor_id   (actor_id),
  INDEX idx_action     (action),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_actlog_room  FOREIGN KEY (room_id)  REFERENCES rooms(id),
  CONSTRAINT fk_actlog_actor FOREIGN KEY (actor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
