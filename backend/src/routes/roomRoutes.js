
'use strict';

const express = require('express');
const { param, query } = require('express-validator');

const router = express.Router();

const RoomController = require('../controllers/RoomController');
const ExpenseController = require('../controllers/ExpenseController');

const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');
const requireRoomMember = require('../middleware/requireRoomMember');
const validate = require('../middleware/validate');

const {
  createRoomValidator,
  joinRoomValidator,
  createExpenseValidator,
} = require('../validators/validators');

const roomIdValidator = param('roomId')
  .isInt({ min: 1 })
  .withMessage('Invalid room ID.');

const expenseIdValidator = param('expenseId')
  .isInt({ min: 1 })
  .withMessage('Invalid expense ID.');

// Create room
router.post(
  '/',
  authenticate,
  createRoomValidator,
  validate,
  asyncHandler(RoomController.create)
);

// List user's rooms
router.get(
  '/',
  authenticate,
  asyncHandler(RoomController.getMyRooms)
);

// Join room
router.post(
  '/join',
  authenticate,
  joinRoomValidator,
  validate,
  asyncHandler(RoomController.join)
);

// Room details
router.get(
  '/:roomId',
  authenticate,
  roomIdValidator,
  validate,
  asyncHandler(RoomController.getById)
);

// List room expenses
router.get(
  '/:roomId/expenses',
  authenticate,
  roomIdValidator,
  query('status')
    .optional()
    .isIn(['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED']),
  validate,
  requireRoomMember,
  asyncHandler(ExpenseController.getRoomExpenses)
);

// Create room expense
router.post(
  '/:roomId/expenses',
  authenticate,
  roomIdValidator,
  validate,
  requireRoomMember,
  createExpenseValidator,
  validate,
  asyncHandler(ExpenseController.createExpense)
);

// Expense details
router.get(
  '/:roomId/expenses/:expenseId',
  authenticate,
  roomIdValidator,
  expenseIdValidator,
  validate,
  requireRoomMember,
  asyncHandler(ExpenseController.getExpenseById)
);

module.exports = router;
