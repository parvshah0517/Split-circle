'use strict';

const config              = require('../config');
const LocalStorageAdapter = require('./LocalStorageAdapter');

let _instance = null;

/**
 * Factory: returns the appropriate storage adapter based on STORAGE_PROVIDER env var.
 *
 * Currently supported:
 *   local  → LocalStorageAdapter  (default, for development)
 *   s3     → S3Adapter            (future — uncomment when ready)
 *
 * @returns {StorageService}
 */
function createStorageService() {
  if (_instance) return _instance;

  const provider = config.storage.provider;

  switch (provider) {
    case 'local':
      _instance = new LocalStorageAdapter();
      break;

    // case 's3':
    //   const S3Adapter = require('./S3Adapter');
    //   _instance = new S3Adapter();
    //   break;

    default:
      console.warn(`[storage] Unknown provider "${provider}", falling back to local`);
      _instance = new LocalStorageAdapter();
  }

  console.log(`[storage] Using ${_instance.constructor.name}`);
  return _instance;
}

module.exports = createStorageService;
