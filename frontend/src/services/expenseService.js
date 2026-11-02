
import api from "./api";

function mapSplit(split) {
  return {
    id: String(split.id),
    userId: String(split.user_id),
    userName: split.user_name,
    userEmail: split.user_email,
    shareAmountMinor: Number(split.share_amount),
    shareAmount: Number(split.share_amount) / 100,
    shareUnits: split.share_units,
    isPayer: Boolean(split.is_payer),
  };
}

function mapExpense(expense) {
  return {
    id: String(expense.id),
    roomId: String(expense.room_id),
    title: expense.title,
    description: expense.description,
    totalAmountMinor: Number(expense.total_amount),
    totalAmount: Number(expense.total_amount) / 100,
    currency: expense.currency || "INR",
    categoryId: expense.category_id
      ? String(expense.category_id)
      : null,
    categoryName: expense.category_name || "Other",
    categoryIcon: expense.category_icon || "📦",
    expenseDate: expense.expense_date,
    paidBy: String(expense.paid_by),
    paidByName: expense.paid_by_name,
    createdBy: String(expense.created_by),
    createdByName: expense.created_by_name,
    splitMethod: expense.split_method,
    status: expense.status,
    notes: expense.notes,
    participantCount: Number(expense.participant_count ?? expense.splits?.length ?? 0),
    splits: (expense.splits ?? []).map(mapSplit),
    createdAt: expense.created_at,
  };
}

export async function getRoomExpenses(roomId) {
  const response = await api.get(`/rooms/${roomId}/expenses`);

  return response.data.data.expenses.map(mapExpense);
}

export async function getExpenseById(roomId, expenseId) {
  const response = await api.get(
    `/rooms/${roomId}/expenses/${expenseId}`
  );

  return mapExpense(response.data.data.expense);
}

export async function createExpense(roomId, payload) {
  const response = await api.post(
    `/rooms/${roomId}/expenses`,
    payload
  );

  return mapExpense(response.data.data.expense);
}

export async function getExpenseCategories() {
  const response = await api.get("/expenses/categories");

  return response.data.data.categories.map((category) => ({
    id: String(category.id),
    name: category.name,
    icon: category.icon,
  }));
}
