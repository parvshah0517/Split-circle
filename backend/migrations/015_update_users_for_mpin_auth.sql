

-- Migration 015: Support username + mobile + MPIN authentication.
-- Preserve existing email/password records for compatibility.

ALTER TABLE users
  MODIFY COLUMN email VARCHAR(255) NULL,
  MODIFY COLUMN password_hash VARCHAR(255) NULL,

  ADD COLUMN username VARCHAR(30) NULL AFTER name,
  ADD COLUMN mobile VARCHAR(20) NULL AFTER username,
  ADD COLUMN mpin_hash VARCHAR(255) NULL AFTER mobile,

  ADD COLUMN failed_login_attempts INT UNSIGNED NOT NULL DEFAULT 0,
  ADD COLUMN locked_until DATETIME NULL,
  ADD COLUMN token_version INT UNSIGNED NOT NULL DEFAULT 0,

  ADD UNIQUE KEY uq_users_username (username),
  ADD INDEX idx_users_mobile (mobile);
