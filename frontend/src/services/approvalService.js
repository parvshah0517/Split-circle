import api from "./api";

export async function getPendingApprovals() {
  const response = await api.get("/approvals/pending");
  return response.data.data;
}

export async function approveExpense(approvalId) {
  const response = await api.post(
    `/approvals/${approvalId}/approve`
  );
  return response.data;
}

export async function rejectExpense(approvalId, rejectionReason = "") {
  const response = await api.post(
    `/approvals/${approvalId}/reject`,
    { rejection_reason: rejectionReason }
  );
  return response.data;
}