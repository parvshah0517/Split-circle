'use strict';

const db = require('../config/database');

const RoomModel = {
  async create({ name, description, created_by, invitation_code, default_currency }, conn) {
    const c = conn || db;
    const [result] = await c.execute(
      `INSERT INTO rooms (name, description, created_by, invitation_code, default_currency)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description || null, created_by, invitation_code, default_currency || 'INR']
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT r.*, u.name AS creator_name
       FROM rooms r
       JOIN users u ON u.id = r.created_by
       WHERE r.id = ? AND r.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  },

  async findByInvitationCode(code) {
    const [rows] = await db.query(
      'SELECT * FROM rooms WHERE invitation_code = ? AND deleted_at IS NULL',
      [code]
    );
    return rows[0] || null;
  },

  async updateInvitationCode(roomId, newCode) {
    await db.query(
      'UPDATE rooms SET invitation_code = ? WHERE id = ?',
      [newCode, roomId]
    );
  },

  async softDelete(roomId) {
    await db.query('UPDATE rooms SET deleted_at = NOW() WHERE id = ?', [roomId]);
  },

  // ─── Members ───────────────────────────────────────────────────────────────

  async addMember(roomId, userId, conn) {
    const c = conn || db;
    await c.execute(
      `INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE is_active = 1, left_at = NULL`,
      [roomId, userId]
    );
  },

  async removeMember(roomId, userId) {
    await db.query(
      'UPDATE room_members SET is_active = 0, left_at = NOW() WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );
  },

  async getMembers(roomId) {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.avatar_url, rm.joined_at, rm.is_active
       FROM room_members rm
       JOIN users u ON u.id = rm.user_id
       WHERE rm.room_id = ? AND rm.is_active = 1
       ORDER BY rm.joined_at ASC`,
      [roomId]
    );
    return rows;
  },

  async isMember(roomId, userId) {
    const [rows] = await db.query(
      'SELECT id FROM room_members WHERE room_id = ? AND user_id = ? AND is_active = 1',
      [roomId, userId]
    );
    return rows.length > 0;
  },

  async getMembershipStats(roomId, userId) {
    // Returns counts of user's expenses in this room (for leave validation)
    const [rows] = await db.query(
      `SELECT
        (SELECT COUNT(*) FROM expenses WHERE room_id = ? AND paid_by = ? AND status = 'APPROVED') AS paid_count,
        (SELECT COUNT(*) FROM expense_splits es JOIN expenses e ON e.id = es.expense_id
          WHERE e.room_id = ? AND es.user_id = ? AND e.status = 'APPROVED') AS involved_count`,
      [roomId, userId, roomId, userId]
    );
    return rows[0];
  },
};

module.exports = RoomModel;
