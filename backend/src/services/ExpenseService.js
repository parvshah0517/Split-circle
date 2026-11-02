
'use strict';

const db = require('../config/database');
const ExpenseModel = require('../models/ExpenseModel');
const RoomModel = require('../models/RoomModel');
const AppError = require('../utils/AppError');
const { largestRemainderRound } = require('../utils/currency');

const MAX_INT_AMOUNT = 2147483647;

function toMinorUnits(value, fieldName = 'Amount') {
  const input = String(value ?? '').trim();

  if (!/^\d+(\.\d{1,2})?$/.test(input)) {
    throw new AppError(
      `${fieldName} must be a valid amount with at most 2 decimal places.`,
      422,
      'INVALID_AMOUNT'
    );
  }

  const [whole, fraction = ''] = input.split('.');
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));

  if (!Number.isSafeInteger(minor) || minor <= 0 || minor > MAX_INT_AMOUNT) {
    throw new AppError(
      `${fieldName} is outside the supported range.`,
      422,
      'INVALID_AMOUNT'
    );
  }

  return minor;
}

function toWeight(value, fieldName) {
  const input = String(value ?? '').trim();

  if (!/^\d+(\.\d{1,4})?$/.test(input)) {
    throw new AppError(
      `${fieldName} must be a positive number with at most 4 decimal places.`,
      422,
      'INVALID_SPLIT_VALUE'
    );
  }

  const [whole, fraction = ''] = input.split('.');
  const weight = Number(whole) * 10000 +
    Number(fraction.padEnd(4, '0'));

  if (!Number.isSafeInteger(weight) || weight <= 0) {
    throw new AppError(
      `${fieldName} must be greater than zero.`,
      422,
      'INVALID_SPLIT_VALUE'
    );
  }

  return weight;
}

function calculateSplits(totalMinor, participants, splitMethod) {
  if (!Array.isArray(participants) || participants.length === 0) {
    throw new AppError(
      'At least one participant is required.',
      422,
      'INVALID_PARTICIPANTS'
    );
  }

  let amounts;

  switch (splitMethod) {
    case 'EQUAL': {
      amounts = largestRemainderRound(
        totalMinor,
        participants.map(() => 1)
      );
      break;
    }

    case 'PERCENTAGE': {
      const weights = participants.map((participant) =>
        toWeight(participant.value, 'Percentage')
      );

      const totalWeight = weights.reduce((sum, value) => sum + value, 0);

      if (totalWeight !== 1000000) {
        throw new AppError(
          'Participant percentages must add up to exactly 100%.',
          422,
          'INVALID_PERCENTAGES'
        );
      }

      amounts = largestRemainderRound(totalMinor, weights);
      break;
    }

    case 'SHARES': {
      const weights = participants.map((participant) =>
        toWeight(participant.value, 'Share value')
      );

      amounts = largestRemainderRound(totalMinor, weights);
      break;
    }

    case 'EXACT': {
      amounts = participants.map((participant, index) =>
        toMinorUnits(participant.value, `Participant ${index + 1} amount`)
      );

      const sum = amounts.reduce((total, amount) => total + amount, 0);

      if (sum !== totalMinor) {
        throw new AppError(
          'Exact participant amounts must equal the total expense.',
          422,
          'SPLIT_TOTAL_MISMATCH'
        );
      }

      break;
    }

    default:
      throw new AppError(
        'Unsupported split method.',
        422,
        'INVALID_SPLIT_METHOD'
      );
  }

  return participants.map((participant, index) => ({
    user_id: Number(participant.user_id),
    share_amount: amounts[index],
    share_units: participant.value ?? null,
  }));
}

const ExpenseService = {
  async getCategories() {
    return ExpenseModel.getCategories();
  },

  async getRoomExpenses(roomId, userId, options = {}) {
    const isMember = await RoomModel.isMember(roomId, userId);

    if (!isMember) {
      throw new AppError(
        'You are not a member of this room.',
        403,
        'ROOM_ACCESS_DENIED'
      );
    }

    const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 100);
    const offset = Math.max(Number(options.offset) || 0, 0);

    const expenses = await ExpenseModel.findByRoom(roomId, {
      limit,
      offset,
      status: options.status,
    });

    return expenses;
  },

  async getExpenseById(roomId, expenseId, userId) {
    const isMember = await RoomModel.isMember(roomId, userId);

    if (!isMember) {
      throw new AppError(
        'You are not a member of this room.',
        403,
        'ROOM_ACCESS_DENIED'
      );
    }

    const expense = await ExpenseModel.findById(expenseId);

    if (!expense || Number(expense.room_id) !== Number(roomId)) {
      throw new AppError(
        'Expense not found.',
        404,
        'EXPENSE_NOT_FOUND'
      );
    }

    const splits = await ExpenseModel.getSplits(expenseId);

    return {
      ...expense,
      splits,
    };
  },

  async createExpense(roomId, userId, payload) {
    const room = await RoomModel.findById(roomId);

    if (!room) {
      throw new AppError('Room not found.', 404, 'ROOM_NOT_FOUND');
    }

    const members = await RoomModel.getMembers(roomId);
    const memberIds = new Set(members.map((member) => Number(member.id)));

    const paidBy = Number(payload.paid_by || userId);

    if (!memberIds.has(paidBy)) {
      throw new AppError(
        'The selected payer is not an active room member.',
        422,
        'INVALID_PAYER'
      );
    }

    const participants = payload.participants.map((participant) => ({
      ...participant,
      user_id: Number(participant.user_id),
    }));

    const participantIds = participants.map((participant) => participant.user_id);

    if (new Set(participantIds).size !== participantIds.length) {
      throw new AppError(
        'A participant cannot be added more than once.',
        422,
        'DUPLICATE_PARTICIPANT'
      );
    }

    for (const participantId of participantIds) {
      if (!memberIds.has(participantId)) {
        throw new AppError(
          'All expense participants must be active room members.',
          422,
          'INVALID_PARTICIPANT'
        );
      }
    }

    if (!participantIds.includes(paidBy)) {
      throw new AppError(
        'The person who paid must be included in the expense participants.',
        422,
        'PAYER_NOT_INCLUDED'
      );
    }

    const totalMinor = toMinorUnits(
      payload.total_amount,
      'Expense amount'
    );

    const splitMethod = payload.split_method || 'EQUAL';

    const calculatedSplits = calculateSplits(
      totalMinor,
      participants,
      splitMethod
    );

    const splits = calculatedSplits.map((split) => ({
      ...split,
      is_payer: split.user_id === paidBy,
    }));

    const splitTotal = splits.reduce(
      (sum, split) => sum + split.share_amount,
      0
    );

    if (splitTotal !== totalMinor) {
      throw new AppError(
        'Calculated participant shares do not match the expense total.',
        422,
        'SPLIT_TOTAL_MISMATCH'
      );
    }

    const conn = await db.getConnection();
    let committed = false;
    let expenseId;

    try {
      await conn.beginTransaction();

      expenseId = await ExpenseModel.create(
        {
          room_id: roomId,
          title: payload.title.trim(),
          description: payload.description || null,
          total_amount: totalMinor,
          currency: payload.currency || room.default_currency || 'INR',
          category_id: payload.category_id || null,
          expense_date: payload.expense_date,
          paid_by: paidBy,
          created_by: userId,
          on_behalf_of: null,
          split_method: splitMethod,
          status: 'APPROVED',
          notes: payload.notes || null,
        },
        conn
      );

      await ExpenseModel.createSplits(
        splits.map((split) => ({
          ...split,
          expense_id: expenseId,
        })),
        conn
      );

      await conn.commit();
      committed = true;
    } catch (error) {
      if (!committed) {
        await conn.rollback();
      }

      throw error;
    } finally {
      conn.release();
    }

    return this.getExpenseById(roomId, expenseId, userId);
  },
};

module.exports = ExpenseService;
