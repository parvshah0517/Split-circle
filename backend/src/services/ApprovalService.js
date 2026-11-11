'use strict';

const db = require('../config/database');
const ExpenseModel = require('../models/ExpenseModel');
const AppError = require('../utils/AppError');

const ApprovalService = {
  async getPending(userId) {
    return ExpenseModel.getPendingApprovalsForUser(userId);
  },

  async decide(approvalId, userId, decision, rejectionReason = null) {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const approval = await ExpenseModel.findApprovalByIdForUpdate(
        approvalId,
        conn
      );

      if (!approval) {
        throw new AppError('Approval request not found.', 404, 'NOT_FOUND');
      }

      if (Number(approval.requested_from) !== Number(userId)) {
        throw new AppError(
          'You are not authorized to decide this request.',
          403,
          'FORBIDDEN'
        );
      }

      if (approval.status !== 'PENDING') {
        throw new AppError(
          'This approval request has already been decided.',
          409,
          'ALREADY_DECIDED'
        );
      }

      if (approval.expense_status !== 'PENDING_APPROVAL') {
        throw new AppError(
          'This expense is no longer awaiting approval.',
          409,
          'EXPENSE_NOT_PENDING'
        );
      }

      const approved = decision === 'APPROVED';

      await ExpenseModel.updateApprovalStatus(
        approvalId,
        decision,
        {
          decided_by: userId,
          rejection_reason: approved ? null : rejectionReason,
        },
        conn
      );

      await ExpenseModel.updateStatus(
        approval.expense_id,
        approved ? 'APPROVED' : 'REJECTED',
        {
          approved_by: approved ? userId : null,
          approved_at: approved ? new Date() : null,
          rejection_reason: approved ? null : rejectionReason,
        },
        conn
      );

      await conn.commit();

      return {
        approval_id: Number(approvalId),
        expense_id: approval.expense_id,
        status: decision,
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },
};

module.exports = ApprovalService;