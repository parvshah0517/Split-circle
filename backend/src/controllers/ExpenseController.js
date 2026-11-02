
'use strict';

const ExpenseService = require('../services/ExpenseService');

const ExpenseController = {
  async getCategories(req, res) {
    const categories = await ExpenseService.getCategories();

    return res.status(200).json({
      success: true,
      data: { categories },
    });
  },

  async getRoomExpenses(req, res) {
    const expenses = await ExpenseService.getRoomExpenses(
      Number(req.params.roomId),
      req.user.id,
      {
        limit: req.query.limit,
        offset: req.query.offset,
        status: req.query.status,
      }
    );

    return res.status(200).json({
      success: true,
      data: { expenses },
    });
  },

  async getExpenseById(req, res) {
    const expense = await ExpenseService.getExpenseById(
      Number(req.params.roomId),
      Number(req.params.expenseId),
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: { expense },
    });
  },

  async createExpense(req, res) {
    const expense = await ExpenseService.createExpense(
      Number(req.params.roomId),
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: 'Expense created successfully.',
      data: { expense },
    });
  },
};

module.exports = ExpenseController;
