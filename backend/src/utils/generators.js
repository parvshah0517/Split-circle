'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Generates a short, unique room invitation code.
 * Format: 10 uppercase alphanumeric characters.
 * Example: "A3B7K2X9QR"
 */
function generateInvitationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I confusion
  const code  = Array.from({ length: 10 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
  return code;
}

/**
 * Generates a secure unique filename for document storage.
 * Uses UUID v4 to prevent path traversal or predictable filenames.
 *
 * @param {string} originalName  Original filename with extension
 * @returns {string}             e.g. "a3b4c5d6-xxxx-xxxx-xxxx-xxxxxxxxxxxx.pdf"
 */
function generateObjectKey(originalName) {
  const ext = originalName.split('.').pop().toLowerCase();
  return `${uuidv4()}.${ext}`;
}

module.exports = { generateInvitationCode, generateObjectKey };
