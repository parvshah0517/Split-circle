'use strict';

const db       = require('../config/database');
const AppError = require('../utils/AppError');

/**
 * Middleware factory: verifies that req.user is an active member of the room
 * identified by req.params.roomId.
 *
 * Attaches `req.room` with basic room info for downstream handlers.
 *
 * Usage:
 *   router.use('/:roomId', authenticate, requireRoomMember);
 */
async function requireRoomMember(req, res, next) {
  try {
    const roomId = parseInt(req.params.roomId, 10);
    const userId = req.user.id;

    if (!roomId) {
      return next(new AppError('Invalid room ID.', 400, 'INVALID_ROOM_ID'));
    }

    // Check room exists
    const [rooms] = await db.query(
      'SELECT id, name, created_by, default_currency FROM rooms WHERE id = ? AND deleted_at IS NULL',
      [roomId]
    );
    if (!rooms.length) {
      return next(new AppError('Room not found.', 404, 'ROOM_NOT_FOUND'));
    }

    // Check active membership
    const [membership] = await db.query(
      `SELECT id FROM room_members
       WHERE room_id = ? AND user_id = ? AND is_active = 1`,
      [roomId, userId]
    );
    if (!membership.length) {
      return next(new AppError('You are not a member of this room.', 403, 'NOT_ROOM_MEMBER'));
    }

    req.room = rooms[0];
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = requireRoomMember;
