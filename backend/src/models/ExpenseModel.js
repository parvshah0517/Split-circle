'use strict';

const db = require('../config/database');

const ExpenseModel = {
  // ─── Create ──────────────────────────────────────────────────────────────────
  async create(data, conn) {
    const c = conn || db;
    const {
      room_id, title, description, total_amount, currency,
      category_id, expense_date, paid_by, created_by,
      on_behalf_of, split_method, status, notes
    } = data;
    const [result] = await c.execute(
      `INSERT INTO expenses
         (room_id, title, description, total_amount, currency, category_id,
          expense_date, paid_by, created_by, on_behalf_of, split_method, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [room_id, title, description || null, total_amount, currency || 'INR',
       category_id || null, expense_date, paid_by, created_by,
       on_behalf_of || null, split_method, status || 'APPROVED', notes || null]
    );
    return result.insertId;
  },

  // ─── Splits ──────────────────────────────────────────────────────────────────
  async createSplits(splits, conn) {
    const c = conn || db;
    for (const s of splits) {
      await c.execute(
        `INSERT INTO expense_splits (expense_id, user_id, share_amount, share_units, is_payer)
         VALUES (?, ?, ?, ?, ?)`,
        [s.expense_id, s.user_id, s.share_amount, s.share_units ?? null, s.is_payer ? 1 : 0]
      );
    }
  },

  async deleteSplits(expenseId, conn) {
    const c = conn || db;
    await c.execute('DELETE FROM expense_splits WHERE expense_id = ?', [expenseId]);
  },

  // ─── Read ────────────────────────────────────────────────────────────────────
  async findById(id) {
    const [rows] = await db.query(
      `SELECT e.*,
              u_paid.name   AS paid_by_name,
              u_created.name AS created_by_name,
              u_behalf.name  AS on_behalf_of_name,
              u_approved.name AS approved_by_name,
              cat.name       AS category_name,
              cat.icon       AS category_icon
       FROM expenses e
       LEFT JOIN users u_paid    ON u_paid.id    = e.paid_by
       LEFT JOIN users u_created ON u_created.id = e.created_by
       LEFT JOIN users u_behalf  ON u_behalf.id  = e.on_behalf_of
       LEFT JOIN users u_approved ON u_approved.id = e.approved_by
       LEFT JOIN categories cat   ON cat.id = e.category_id
       WHERE e.id = ? AND e.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  },

  async findByRoom(roomId, { limit = 50, offset = 0, status } = {}) {
    let sql = `
      SELECT e.*,
             u_paid.name    AS paid_by_name,
             u_created.name AS created_by_name,
             cat.name       AS category_name,
             cat.icon       AS category_icon,
             (SELECT COUNT(*) FROM expense_splits WHERE expense_id = e.id) AS participant_count
      FROM expenses e
      LEFT JOIN users u_paid    ON u_paid.id    = e.paid_by
      LEFT JOIN users u_created ON u_created.id = e.created_by
      LEFT JOIN categories cat  ON cat.id = e.category_id
      WHERE e.room_id = ? AND e.deleted_at IS NULL`;
    const params = [roomId];
    if (status) { sql += ' AND e.status = ?'; params.push(status); }
    sql += ' ORDER BY e.expense_date DESC, e.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await db.query(sql, params);
    return rows;
  },

  async getSplits(expenseId) {
    const [rows] = await db.query(
      `SELECT es.*, u.name AS user_name, u.email AS user_email
       FROM expense_splits es
       JOIN users u ON u.id = es.user_id
       WHERE es.expense_id = ?`,
      [expenseId]
    );
    return rows;
  },

  // ─── Update ──────────────────────────────────────────────────────────────────
  async update(id, data, conn) {
    const c = conn || db;
    const { title, description, total_amount, currency, category_id,
            expense_date, paid_by, split_method, status, notes,
            approved_by, approved_at, rejection_reason } = data;
    await c.execute(
      `UPDATE expenses SET
         title = ?, description = ?, total_amount = ?, currency = ?,
         category_id = ?, expense_date = ?, paid_by = ?,
         split_method = ?, status = ?, notes = ?,
         approved_by = ?, approved_at = ?, rejection_reason = ?
       WHERE id = ?`,
      [title, description || null, total_amount, currency,
       category_id || null, expense_date, paid_by,
       split_method, status, notes || null,
       approved_by || null, approved_at || null, rejection_reason || null,
       id]
    );
  },

  async updateStatus(id, status, { approved_by, approved_at, rejection_reason } = {}, conn) {
    const c = conn || db;
    await c.execute(
      `UPDATE expenses SET status = ?, approved_by = ?, approved_at = ?, rejection_reason = ?
       WHERE id = ?`,
      [status, approved_by || null, approved_at || null, rejection_reason || null, id]
    );
  },

  async softDelete(id) {
    await db.query('UPDATE expenses SET deleted_at = NOW(), status = "CANCELLED" WHERE id = ?', [id]);
  },

  // ─── Revisions ───────────────────────────────────────────────────────────────
  async createRevision({ expense_id, revision_number, snapshot_json, changed_by, change_summary }, conn) {
    const c = conn || db;
    const [result] = await c.execute(
      `INSERT INTO expense_revisions (expense_id, revision_number, snapshot_json, changed_by, change_summary)
       VALUES (?, ?, ?, ?, ?)`,
      [expense_id, revision_number, JSON.stringify(snapshot_json), changed_by, change_summary || null]
    );
    return result.insertId;
  },

  async getRevisions(expenseId) {
    const [rows] = await db.query(
      `SELECT er.*, u.name AS changed_by_name
       FROM expense_revisions er
       JOIN users u ON u.id = er.changed_by
       WHERE er.expense_id = ?
       ORDER BY er.revision_number ASC`,
      [expenseId]
    );
    return rows;
  },

  async getLatestRevisionNumber(expenseId) {
    const [rows] = await db.query(
      'SELECT MAX(revision_number) AS max_rev FROM expense_revisions WHERE expense_id = ?',
      [expenseId]
    );
    return rows[0].max_rev || 0;
  },

  // ─── Approvals ───────────────────────────────────────────────────────────────
  async createApproval({ expense_id, revision_id, requested_from, requested_by }, conn) {
    const c = conn || db;
    const [result] = await c.execute(
      `INSERT INTO expense_approvals (expense_id, revision_id, requested_from, requested_by)
       VALUES (?, ?, ?, ?)`,
      [expense_id, revision_id || null, requested_from, requested_by]
    );
    return result.insertId;
  },
  async findApprovalByIdForUpdate(id, conn) {
  const [rows] = await conn.query(
    `SELECT ea.*,
            e.status AS expense_status,
            e.room_id,
            e.title AS expense_title,
            e.total_amount,
            e.currency
     FROM expense_approvals ea
     JOIN expenses e ON e.id = ea.expense_id
     WHERE ea.id = ?
     FOR UPDATE`,
    [id]
  );

  return rows[0] || null;
},

  async findApprovalById(id) {
    const [rows] = await db.query(
      `SELECT ea.*,
              u_from.name AS requested_from_name,
              u_by.name   AS requested_by_name,
              e.room_id, e.title AS expense_title, e.total_amount, e.currency
       FROM expense_approvals ea
       JOIN users u_from ON u_from.id = ea.requested_from
       JOIN users u_by   ON u_by.id   = ea.requested_by
       JOIN expenses e   ON e.id      = ea.expense_id
       WHERE ea.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async getPendingApprovalsForUser(userId) {
    const [rows] = await db.query(
      `SELECT ea.*,
              e.title AS expense_title, e.total_amount, e.currency, e.room_id,
              r.name  AS room_name,
              u_by.name AS requested_by_name
       FROM expense_approvals ea
       JOIN expenses e ON e.id = ea.expense_id
       JOIN rooms r    ON r.id = e.room_id
       JOIN users u_by ON u_by.id = ea.requested_by
       WHERE ea.requested_from = ? AND ea.status = 'PENDING'
       ORDER BY ea.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async updateApprovalStatus(id, status, { decided_by, rejection_reason } = {}, conn) {
    const c = conn || db;
    await c.execute(
      `UPDATE expense_approvals SET status = ?, decided_by = ?, decided_at = NOW(), rejection_reason = ?
       WHERE id = ?`,
      [status, decided_by || null, rejection_reason || null, id]
    );
  },

  // ─── Categories ──────────────────────────────────────────────────────────────
  async getCategories() {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  },
};

module.exports = ExpenseModel;
