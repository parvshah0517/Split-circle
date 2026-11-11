'use strict';

const db = require('../config/database');

const SettlementModel = {
  async getExpenseDebts(roomId) {
    const [rows] = await db.query(
      `SELECT
         e.currency,
         e.paid_by,
         es.user_id AS debtor_id,
         es.share_amount
       FROM expenses e
       JOIN expense_splits es ON es.expense_id = e.id
       WHERE e.room_id = ?
         AND e.status = 'APPROVED'
         AND e.deleted_at IS NULL
         AND es.user_id <> e.paid_by`,
      [roomId]
    );

    return rows;
  },

  async getRecordedSettlements(roomId) {
    const [rows] = await db.query(
      `SELECT payer_id, receiver_id, amount, currency
       FROM settlements
       WHERE room_id = ?
         AND status = 'RECORDED'`,
      [roomId]
    );

    return rows;
  },

  async getHistory(roomId) {
    const [rows] = await db.query(
      `SELECT
         s.id,
         s.payer_id,
         s.receiver_id,
         s.amount,
         s.currency,
         s.settled_at,
         s.notes,
         s.status,
         s.created_at,
         payer.name AS payer_name,
         payer.username AS payer_username,
         receiver.name AS receiver_name,
         receiver.username AS receiver_username,
         creator.username AS created_by_username
       FROM settlements s
       JOIN users payer ON payer.id = s.payer_id
       JOIN users receiver ON receiver.id = s.receiver_id
       JOIN users creator ON creator.id = s.created_by
       WHERE s.room_id = ?
       ORDER BY s.settled_at DESC, s.created_at DESC
       LIMIT 100`,
      [roomId]
    );

    return rows;
  },

  async create(data, conn) {
    const [result] = await conn.execute(
      `INSERT INTO settlements
       (room_id, payer_id, receiver_id, amount, currency,
        settled_at, created_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.room_id,
        data.payer_id,
        data.receiver_id,
        data.amount,
        data.currency,
        data.settled_at,
        data.created_by,
        data.notes || null,
      ]
    );

    return result.insertId;
  },
};

module.exports = SettlementModel;