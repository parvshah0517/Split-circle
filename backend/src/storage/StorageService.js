'use strict';

/**
 * StorageService interface.
 *
 * Every storage adapter (LocalStorageAdapter, S3Adapter) must implement
 * these methods. This keeps the rest of the application decoupled from
 * the underlying storage mechanism.
 */
class StorageService {
  /**
   * Save a file buffer to storage.
   * @param {Buffer} buffer         File content
   * @param {string} objectKey      Storage path / S3 key
   * @param {string} mimeType       MIME type
   * @returns {Promise<string>}     The stored objectKey
   */
  // eslint-disable-next-line no-unused-vars
  async upload(buffer, objectKey, mimeType) {
    throw new Error('StorageService.upload() must be implemented by subclass');
  }

  /**
   * Generate a download URL for an object.
   * Local: returns a relative path. S3: returns a presigned URL.
   * @param {string} objectKey
   * @returns {Promise<string>}  URL (expires for S3, permanent for local)
   */
  // eslint-disable-next-line no-unused-vars
  async getDownloadUrl(objectKey) {
    throw new Error('StorageService.getDownloadUrl() must be implemented by subclass');
  }

  /**
   * Delete a stored object.
   * @param {string} objectKey
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async delete(objectKey) {
    throw new Error('StorageService.delete() must be implemented by subclass');
  }
}

module.exports = StorageService;
