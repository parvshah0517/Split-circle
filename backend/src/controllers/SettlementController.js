'use strict';

const SettlementService = require('../services/SettlementService');

const SettlementController = {
  async getBalances(req, res) {
    const data = await SettlementService.getBalances(
      Number(req.params.roomId)
    );

    return res.status(200).json({
      success: true,
      data,
    });
  },

  async getHistory(req, res) {
    const settlements = await SettlementService.getHistory(
      Number(req.params.roomId)
    );

    return res.status(200).json({
      success: true,
      data: { settlements },
    });
  },

  async create(req, res) {
    const settlement = await SettlementService.createSettlement(
      Number(req.params.roomId),
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: 'Settlement recorded successfully.',
      data: { settlement },
    });
  },
};

module.exports = SettlementController;