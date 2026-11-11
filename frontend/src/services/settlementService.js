import api from "./api";

export async function getRoomBalances(roomId) {
  const response = await api.get(
    `/rooms/${roomId}/settlements/balances`
  );

  return response.data.data;
}

export async function getRoomSettlements(roomId) {
  const response = await api.get(
    `/rooms/${roomId}/settlements`
  );

  return response.data.data.settlements;
}

export async function createSettlement(roomId, payload) {
  const response = await api.post(
    `/rooms/${roomId}/settlements`,
    payload
  );

  return response.data.data.settlement;
}