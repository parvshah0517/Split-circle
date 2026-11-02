
'use strict';

const RoomService = require('../services/RoomService');

const RoomController = {
  // POST /api/rooms
  async create(req, res) {
    const room = await RoomService.createRoom(
      {
        name: req.body.name,
        description: req.body.description,
        default_currency: req.body.default_currency,
      },
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: 'Room created successfully.',
      data: { room },
    });
  },

  // GET /api/rooms
  async getMyRooms(req, res) {
    const rooms = await RoomService.getMyRooms(req.user.id);

    return res.status(200).json({
      success: true,
      data: { rooms },
    });
  },

  // GET /api/rooms/:roomId
  async getById(req, res) {
    const room = await RoomService.getRoomById(
      Number(req.params.roomId),
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: { room },
    });
  },

  // POST /api/rooms/join
  async join(req, res) {
    const room = await RoomService.joinRoom(
      req.body.invitation_code,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: 'You joined the room successfully.',
      data: { room },
    });
  },
};

module.exports = RoomController;
