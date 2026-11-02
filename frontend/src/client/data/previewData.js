// Preview data only. These sections are not backed by implemented API endpoints yet.
// Money values follow the backend contract: integer minor units (cents).
export const PREVIEW_CURRENCY = "USD";

export const previewSummary = {
  totalYouOwe: 12450,
  totalOwedToYou: 38900,
  monthlyExpenses: 84210,
};

export const previewRecentExpenses = [
  { id: "p-1", title: "Weekend groceries", group: "Flat 4B", amount: 8640, paidBy: "You", date: "2026-10-28", splitStatus: "Equal split", status: "approved" },
  { id: "p-2", title: "Airbnb deposit", group: "Goa Trip 2026", amount: 42000, paidBy: "Maya", date: "2026-10-26", splitStatus: "Exact amounts", status: "pending" },
  { id: "p-3", title: "Internet bill", group: "Flat 4B", amount: 3899, paidBy: "Jordan", date: "2026-10-20", splitStatus: "Percentage", status: "approved" },
];

export const previewActivity = [
  { id: "a-1", user: "Maya", action: "Expense created", description: "Added Airbnb deposit to Goa Trip 2026", timestamp: "2026-10-26T18:20:00.000Z" },
  { id: "a-2", user: "Jordan", action: "Settlement recorded", description: "Paid you $25.00 for the internet bill", timestamp: "2026-10-22T09:05:00.000Z" },
  { id: "a-3", user: "You", action: "Expense approved", description: "Approved Weekend groceries", timestamp: "2026-10-28T12:40:00.000Z" },
];

export const previewGroups = [
  { id: "g-1", name: "Flat 4B", members: 4, yourBalance: 5210 },
  { id: "g-2", name: "Goa Trip 2026", members: 6, yourBalance: -1875 },
  { id: "g-3", name: "Family Dinners", members: 3, yourBalance: 0 },
];

export const previewSpending = [
  { name: "Food", amount: 31240, color: "#4F46E5" },
  { name: "Travel", amount: 22800, color: "#10B981" },
  { name: "Rent & bills", amount: 21650, color: "#F59E0B" },
  { name: "Other", amount: 8520, color: "#94A3B8" },
];
