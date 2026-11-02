'use strict';

const db = require('../config/database');

const UserModel = {
  async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, password_hash }) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, password_hash]
    );
    return result.insertId;
  },

  async updateProfile(id, { name, avatar_url }) {
    await db.query(
      'UPDATE users SET name = ?, avatar_url = ? WHERE id = ?',
      [name, avatar_url, id]
    );
  },

  // Return user rooms with balance summary
  async getUserRooms(userId) {
    const [rows] = await db.query(
      `SELECT r.id, r.name, r.description, r.invitation_code, r.default_currency,
              r.created_by, r.created_at,
              (SELECT COUNT(*) FROM room_members rm2 WHERE rm2.room_id = r.id AND rm2.is_active = 1) AS member_count
       FROM rooms r
       INNER JOIN room_members rm ON rm.room_id = r.id
       WHERE rm.user_id = ? AND rm.is_active = 1 AND r.deleted_at IS NULL
       ORDER BY rm.joined_at DESC`,
      [userId]
    );
    return rows;
  },
};

module.exports = UserModel;
