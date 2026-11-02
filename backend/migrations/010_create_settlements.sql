-- Migration 010: settlements
-- Records payment events between room members.
-- This records that a payment happened; no actual bank transfer is made.

CREATE TABLE IF NOT EXISTS settlements (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  room_id     INT UNSIGNED  NOT NULL,
  payer_id    INT UNSIGNED  NOT NULL COMMENT 'User paying the debt',
  receiver_id INT UNSIGNED  NOT NULL COMMENT 'User receiving the payment',
  amount      INT           NOT NULL COMMENT 'Minor currency units',
  currency    CHAR(3)       NOT NULL DEFAULT 'INR',
  settled_at  DATE          NOT NULL,
  status      ENUM('RECORDED','CANCELLED') NOT NULL DEFAULT 'RECORDED',
  created_by  INT UNSIGNED  NOT NULL,
  notes       TEXT          NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_room_id     (room_id),
  INDEX idx_payer_id    (payer_id),
  INDEX idx_receiver_id (receiver_id),
  CONSTRAINT fk_settle_room     FOREIGN KEY (room_id)     REFERENCES rooms(id),
  CONSTRAINT fk_settle_payer    FOREIGN KEY (payer_id)    REFERENCES users(id),
  CONSTRAINT fk_settle_receiver FOREIGN KEY (receiver_id) REFERENCES users(id),
  CONSTRAINT fk_settle_created  FOREIGN KEY (created_by)  REFERENCES users(id),
  CONSTRAINT chk_payer_receiver CHECK (payer_id <> receiver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
