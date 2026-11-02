
'use strict';

const db = require('../config/database');
const RoomModel = require('../models/RoomModel');
const UserModel = require('../models/UserModel');
const AppError = require('../utils/AppError');
const { generateInvitationCode } = require('../utils/generators');

const RoomService = {
  // Create a room and automatically add its creator as a member.
  async createRoom({ name, description, default_currency }, userId) {
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
          default_currency: default_currency || 'INR',
        },
        conn
      );

      await RoomModel.addMember(roomId, userId, conn);

      await conn.commit();
      committed = true;

      return this.getRoomById(roomId, userId);
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
      throw new AppError('Room not found.', 404, 'ROOM_NOT_FOUND');
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

    return {
      ...room,
      members,
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
