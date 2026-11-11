
'use strict';

const db = require('../config/database');

const UserModel = {
  async findByUsername(username) {
    const [rows] = await db.query(
      `SELECT id, name, username, mobile, mpin_hash
       FROM users
       WHERE username = ? AND deleted_at IS NULL`,
      [username]
    );

    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT id, name, username, mobile, email,
              avatar_url, created_at
       FROM users
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    return rows[0] || null;
  },

  async create({ name, username, mobile, mpin_hash }) {
    const [result] = await db.query(
      `INSERT INTO users
        (name, username, mobile, mpin_hash)
       VALUES (?, ?, ?, ?)`,
      [name, username, mobile, mpin_hash]
    );

    return result.insertId;
  },

  async updateProfile(id, updates) {
    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.mobile !== undefined) {
      fields.push('mobile = ?');
      values.push(updates.mobile);
    }

    if (updates.avatar_url !== undefined) {
      fields.push('avatar_url = ?');
      values.push(updates.avatar_url);
    }

    if (fields.length === 0) return;

    values.push(id);

    await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  // Existing room listing method retained.
  async getUserRooms(userId) {
    const [rows] = await db.query(
      `SELECT r.id, r.name, r.description, r.invitation_code,
              r.default_currency, r.created_by, r.created_at,
              (
                SELECT COUNT(*)
                FROM room_members rm2
                WHERE rm2.room_id = r.id
                  AND rm2.is_active = 1
              ) AS member_count
       FROM rooms r
       INNER JOIN room_members rm
         ON rm.room_id = r.id
       WHERE rm.user_id = ?
         AND rm.is_active = 1
         AND r.deleted_at IS NULL
       ORDER BY rm.joined_at DESC`,
      [userId]
    );

    return rows;
  },
};

module.exports = UserModel;
