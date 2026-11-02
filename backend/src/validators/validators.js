'use strict';

const { body, param, query } = require('express-validator');

// ─── Room Validators ──────────────────────────────────────────────────────────

const createRoomValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Room name is required.')
    .isLength({ max: 150 }).withMessage('Room name must be at most 150 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters.'),
  body('default_currency')
    .optional()
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter ISO code.')
    .toUpperCase(),
];

const joinRoomValidator = [
  body('invitation_code')
    .trim()
    .notEmpty().withMessage('Invitation code is required.')
    .isLength({ min: 10, max: 10 }).withMessage('Invitation code must be exactly 10 characters.')
    .toUpperCase(),
];

// ─── Expense Validators ───────────────────────────────────────────────────────

const createExpenseValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Expense title is required.')
    .isLength({ max: 255 })
    .withMessage('Title must be at most 255 characters.'),

  body('total_amount')
    .notEmpty()
    .withMessage('Total amount is required.')
    .matches(/^\d+(\.\d{1,2})?$/)
    .withMessage('Amount must have at most 2 decimal places.'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }),

  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter ISO code.')
    .toUpperCase(),

  body('category_id')
    .optional({ values: 'falsy' })
    .isInt({ gt: 0 })
    .withMessage('Category ID must be a positive integer.'),

  body('expense_date')
    .notEmpty()
    .withMessage('Expense date is required.')
    .isISO8601()
    .withMessage('Expense date must be a valid date.'),

  body('paid_by')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('paid_by must be a positive integer.'),

  body('split_method')
    .notEmpty()
    .withMessage('Split method is required.')
    .isIn(['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES'])
    .withMessage('Invalid split method.'),

  body('participants')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required.'),

  body('participants.*.user_id')
    .isInt({ gt: 0 })
    .withMessage('Each participant must have a valid user_id.'),

  body('participants.*.value')
    .optional()
    .notEmpty()
    .withMessage('Participant value cannot be empty.'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 }),
];


// ─── Settlement Validators ────────────────────────────────────────────────────

const createSettlementValidator = [
  body('payer_id')
    .notEmpty().withMessage('Payer ID is required.')
    .isInt({ gt: 0 }).withMessage('payer_id must be a positive integer.'),
  body('receiver_id')
    .notEmpty().withMessage('Receiver ID is required.')
    .isInt({ gt: 0 }).withMessage('receiver_id must be a positive integer.'),
  body('amount')
    .notEmpty().withMessage('Amount is required.')
    .isFloat({ gt: 0 }).withMessage('Amount must be greater than 0.'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 }).toUpperCase(),
  body('settled_at')
    .notEmpty().withMessage('Settlement date is required.')
    .isISO8601().withMessage('Settlement date must be a valid date.'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }),
];

// ─── Budget Validator ─────────────────────────────────────────────────────────

const upsertBudgetValidator = [
  body('budget_amount')
    .notEmpty().withMessage('Budget amount is required.')
    .isFloat({ gt: 0 }).withMessage('Budget amount must be greater than 0.'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 }).toUpperCase(),
  body('period_label')
    .optional()
    .trim()
    .isLength({ max: 100 }),
];

// ─── Approval Validator ───────────────────────────────────────────────────────

const rejectApprovalValidator = [
  body('rejection_reason')
    .optional()
    .trim()
    .isLength({ max: 500 }),
];

module.exports = {
  createRoomValidator,
  joinRoomValidator,
  createExpenseValidator,
  createSettlementValidator,
  upsertBudgetValidator,
  rejectApprovalValidator,
};
