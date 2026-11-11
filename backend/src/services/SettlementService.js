'use strict';

const db = require('../config/database');
const RoomModel = require('../models/RoomModel');
const SettlementModel = require('../models/SettlementModel');
const AppError = require('../utils/AppError');

function toMinorUnits(value) {
  const amount = String(value);

  if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    throw new AppError('Enter a valid amount with up to 2 decimal places.', 400);
  }

  const [whole, fraction = ''] = amount.split('.');
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));

  if (!Number.isSafeInteger(result) || result <= 0 || result > 2147483647) {
    throw new AppError('Settlement amount is outside the allowed range.', 400);
  }

  return result;
}

function calculateBalances(debts, settlements) {
  const balances = new Map();

  function add(fromId, toId, amount, currency, direction) {
    const low = Math.min(Number(fromId), Number(toId));
    const high = Math.max(Number(fromId), Number(toId));

    const key = `${low}:${high}:${currency}`;

    if (!balances.has(key)) {
      balances.set(key, {
        from_user_id: low,
        to_user_id: high,
        amount_minor: 0,
        currency,
      });
    }

    const entry = balances.get(key);

    // Positive means lower ID owes higher ID.
    const sign = Number(fromId) < Number(toId) ? 1 : -1;

    entry.amount_minor += sign * Number(amount) * direction;
  }

  for (const debt of debts) {
    add(
      debt.debtor_id,
      debt.paid_by,
      debt.share_amount,
      debt.currency,
      1
    );
  }

  for (const settlement of settlements) {
    add(
      settlement.payer_id,
      settlement.receiver_id,
      settlement.amount,
      settlement.currency,
      -1
    );
  }

  return [...balances.values()]
    .filter((item) => item.amount_minor !== 0)
    .map((item) => {
      if (item.amount_minor < 0) {
        return {
          from_user_id: item.to_user_id,
          to_user_id: item.from_user_id,
          amount_minor: Math.abs(item.amount_minor),
          currency: item.currency,
        };
      }

      return item;
    });
}

const SettlementService = {
  async getBalances(roomId) {
    const [members, debts, settlements] = await Promise.all([
      RoomModel.getMembers(roomId),
      SettlementModel.getExpenseDebts(roomId),
      SettlementModel.getRecordedSettlements(roomId),
    ]);

    return {
      members: members.map((member) => ({
        id: member.id,
        name: member.name,
        username: member.username,
        avatar_url: member.avatar_url,
      })),
      balances: calculateBalances(debts, settlements),
    };
  },

  async getHistory(roomId) {
    return SettlementModel.getHistory(roomId);
  },

  async createSettlement(roomId, userId, payload) {
    const payerId = Number(payload.payer_id);
    const receiverId = Number(payload.receiver_id);

    if (payerId === receiverId) {
      throw new AppError('Payer and receiver must be different.', 400);
    }

    if (payerId !== Number(userId) && receiverId !== Number(userId)) {
      throw new AppError(
        'You can only record a payment involving your own account.',
        403
      );
    }

    const members = await RoomModel.getMembers(roomId);
    const memberIds = new Set(members.map((member) => Number(member.id)));

    if (!memberIds.has(payerId) || !memberIds.has(receiverId)) {
      throw new AppError('Both users must be active room members.', 400);
    }

    const currency = String(
      payload.currency || 'INR'
    ).toUpperCase();

    const amountMinor = toMinorUnits(payload.amount);

    const currentBalances = await this.getBalances(roomId);

    const outstanding = currentBalances.balances.find(
      (balance) =>
        Number(balance.from_user_id) === payerId &&
        Number(balance.to_user_id) === receiverId &&
        balance.currency === currency
    );

    if (!outstanding || amountMinor > outstanding.amount_minor) {
      throw new AppError(
        'Settlement amount exceeds the outstanding balance.',
        400
      );
    }

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const settlementId = await SettlementModel.create(
        {
          room_id: roomId,
          payer_id: payerId,
          receiver_id: receiverId,
          amount: amountMinor,
          currency,
          settled_at: payload.settled_at,
          created_by: userId,
          notes: payload.notes,
        },
        conn
      );

      await conn.commit();

      return {
        id: settlementId,
        amount: amountMinor,
        currency,
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },
};

module.exports = SettlementService;