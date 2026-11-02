-- Migration 003: room_members
-- Junction table for users <-> rooms membership.
-- left_at and is_active preserve membership history.

CREATE TABLE IF NOT EXISTS room_members (
  id        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  room_id   INT UNSIGNED  NOT NULL,
  user_id   INT UNSIGNED  NOT NULL,
  joined_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  left_at   DATETIME      NULL,
  is_active TINYINT(1)    NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_room_user (room_id, user_id),
  INDEX idx_room_id  (room_id),
  INDEX idx_user_id  (user_id),
  INDEX idx_is_active (is_active),
  CONSTRAINT fk_rm_room FOREIGN KEY (room_id) REFERENCES rooms(id),
  CONSTRAINT fk_rm_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
