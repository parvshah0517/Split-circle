
'use strict';

const db = require('../config/database');
const RoomModel = require('../models/RoomModel');
const UserModel = require('../models/UserModel');
const AppError = require('../utils/AppError');
const { generateInvitationCode } = require('../utils/generators');

const RoomService = {
  // Create a room, add its creator, and optionally create a budget.
  async createRoom(
    { name, description, default_currency, budget_amount },
    userId
  ) {
    const currency = default_currency || 'INR';

    // Validate optional room budget before starting the transaction.
    let budgetInCents = null;

    if (
      budget_amount !== undefined &&
      budget_amount !== null &&
      budget_amount !== ''
    ) {
      const amount = Number(budget_amount);
      const cents = Math.round(amount * 100);

      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !Number.isSafeInteger(cents) ||
        cents <= 0 ||
        cents > 2147483647
      ) {
        throw new AppError(
          'Room budget must be a valid positive amount.',
          422,
          'INVALID_BUDGET'
        );
      }

      budgetInCents = cents;
    }

    const conn = await db.getConnection();
    let committed = false;

    try {
      await conn.beginTransaction();

      const invitationCode = generateInvitationCode();

      const roomId = await RoomModel.create(
        {
          name,
          description,
          created_by: userId,
          invitation_code: invitationCode,
          default_currency: currency,
        },
        conn
      );

      // Automatically add the creator as a room member.
      await RoomModel.addMember(roomId, userId, conn);

      // Create the optional room budget within the same transaction.
      if (budgetInCents !== null) {
        await RoomModel.createBudget(
          {
            room_id: roomId,
            budget_amount: budgetInCents,
            currency,
            created_by: userId,
          },
          conn
        );
      }

      await conn.commit();
      committed = true;

      return await this.getRoomById(roomId, userId);

    } catch (error) {
      if (!committed) {
        await conn.rollback();
      }

      throw error;
    } finally {
      conn.release();
    }
  },

  // List all active rooms belonging to the user.
  async getMyRooms(userId) {
    return UserModel.getUserRooms(userId);
  },

  // Fetch room details after verifying membership.
  async getRoomById(roomId, userId) {
    const room = await RoomModel.findById(roomId);

    if (!room) {
      throw new AppError(
        'Room not found.',
        404,
        'ROOM_NOT_FOUND'
      );
    }

    const isMember = await RoomModel.isMember(roomId, userId);

    if (!isMember) {
      throw new AppError(
        'You are not a member of this room.',
        403,
        'ROOM_ACCESS_DENIED'
      );
    }

    const members = await RoomModel.getMembers(roomId);
    const budget = await RoomModel.getBudget(roomId);

    return {
      ...room,
      members,
      budget,
    };
  },

  // Join a room using its invitation code.
  async joinRoom(invitationCode, userId) {
    const room = await RoomModel.findByInvitationCode(invitationCode);

    if (!room) {
      throw new AppError(
        'Invalid invitation code.',
        404,
        'INVALID_INVITATION_CODE'
      );
    }

    await RoomModel.addMember(room.id, userId);

    return this.getRoomById(room.id, userId);
  },
};

module.exports = RoomService;
