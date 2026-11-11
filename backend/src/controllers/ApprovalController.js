'use strict';

const ApprovalService = require('../services/ApprovalService');

const ApprovalController = {
  async getPending(req, res) {
    const approvals = await ApprovalService.getPending(req.user.id);

    res.json({
      success: true,
      data: approvals,
    });
  },

  async approve(req, res) {
    const result = await ApprovalService.decide(
      Number(req.params.approvalId),
      req.user.id,
      'APPROVED'
    );

    res.json({
      success: true,
      message: 'Expense approved.',
      data: result,
    });
  },

  async reject(req, res) {
    const result = await ApprovalService.decide(
      Number(req.params.approvalId),
      req.user.id,
      'REJECTED',
      req.body.rejection_reason || null
    );

    res.json({
      success: true,
      message: 'Expense rejected.',
      data: result,
    });
  },
};

module.exports = ApprovalController;