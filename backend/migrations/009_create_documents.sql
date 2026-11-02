-- Migration 009: documents
-- Metadata for receipt/document attachments.
-- object_key is the storage path (local filesystem path or future S3 key).
-- storage_provider enum allows seamless switch to S3.

CREATE TABLE IF NOT EXISTS documents (
  id                INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  expense_id        INT UNSIGNED   NOT NULL,
  uploaded_by       INT UNSIGNED   NOT NULL,
  original_filename VARCHAR(500)   NOT NULL,
  object_key        VARCHAR(1000)  NOT NULL COMMENT 'Storage path or S3 object key',
  storage_provider  ENUM('LOCAL','S3') NOT NULL DEFAULT 'LOCAL',
  file_type         VARCHAR(100)   NOT NULL COMMENT 'MIME type',
  file_size_bytes   INT UNSIGNED   NOT NULL,
  upload_status     ENUM('PENDING','COMPLETE','FAILED') NOT NULL DEFAULT 'COMPLETE',
  created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at        DATETIME       NULL,
  PRIMARY KEY (id),
  INDEX idx_expense_id  (expense_id),
  INDEX idx_uploaded_by (uploaded_by),
  CONSTRAINT fk_doc_expense     FOREIGN KEY (expense_id)  REFERENCES expenses(id),
  CONSTRAINT fk_doc_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
