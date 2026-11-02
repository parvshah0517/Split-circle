'use strict';

const fs           = require('fs');
const path         = require('path');
const StorageService = require('./StorageService');
const config       = require('../config');

/**
 * LocalStorageAdapter — stores uploaded files on the local filesystem.
 *
 * Files are saved under:  <LOCAL_UPLOAD_DIR>/<objectKey>
 * Download URLs are:      /uploads/<objectKey>   (served by Express static)
 *
 * To switch to S3: swap this adapter for S3Adapter in createStorageService().
 */
class LocalStorageAdapter extends StorageService {
  constructor() {
    super();
    this.uploadDir = path.resolve(config.storage.localUploadDir);
    // Ensure the uploads directory exists
    fs.mkdirSync(this.uploadDir, { recursive: true });
  }

  async upload(buffer, objectKey, _mimeType) {
    const dest = path.join(this.uploadDir, objectKey);
    await fs.promises.writeFile(dest, buffer);
    return objectKey;
  }

  async getDownloadUrl(objectKey) {
    // Returns a relative URL that Express static middleware will serve
    return `/uploads/${objectKey}`;
  }

  async delete(objectKey) {
    const filePath = path.join(this.uploadDir, objectKey);
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err; // ignore file-not-found
    }
  }
}

module.exports = LocalStorageAdapter;
