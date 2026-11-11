
import api from "./api";

// Convert backend room data into the format expected by the frontend.
function mapRoom(room) {
  return {
    id: String(room.id),
    name: room.name,
    code: room.invitation_code,
    createdBy: String(room.created_by),
    createdAt: room.created_at,
    description: room.description,
    defaultCurrency: room.default_currency,

    // Room listing returns member_count.
    // Room details returns the actual members array.
    memberCount: Number(
      room.member_count ?? room.members?.length ?? 0,
    ),

    members: (room.members ?? []).map((member) => ({
      id: String(member.id),
      name: member.name,
      email: member.email,
      avatarUrl: member.avatar_url,
      joinedAt: member.joined_at,
    })),
  };
}

// GET /api/rooms
export async function getMyRooms() {
  const response = await api.get("/rooms");

  return response.data.data.rooms.map(mapRoom);
}

// POST /api/rooms
export async function createRoom({ name, budgetAmount }) {
  if (!name?.trim()) {
    throw new Error("Room name is required.");
  }

  const payload = {
    name: name.trim(),
    default_currency: "INR",
  };

  if (budgetAmount !== undefined && budgetAmount !== null && budgetAmount !== "") {
    payload.budget_amount = budgetAmount;
  }

  const response = await api.post("/rooms", payload);
  return mapRoom(response.data.data.room);
}

// POST /api/rooms/join
export async function joinRoom({ code }) {
  const invitationCode = code?.trim().toUpperCase();

  if (!invitationCode) {
    throw new Error("Please enter a room code.");
  }

  const response = await api.post("/rooms/join", {
    invitation_code: invitationCode,
  });

  return mapRoom(response.data.data.room);
}

// GET /api/rooms/:roomId
export async function getRoomById(roomId) {
  const response = await api.get(`/rooms/${roomId}`);

  return mapRoom(response.data.data.room);
}
