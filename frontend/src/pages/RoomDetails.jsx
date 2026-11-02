
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Users,
  CalendarDays,
  Receipt,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import PageHeader from "../components/common/PageHeader";
import Avatar from "../components/common/Avatar";
import StatusBadge from "../components/common/StatusBadge";

import { useAuth } from "../hooks/useAuth";
import { getRoomById } from "../services/groupService";

import {
  getRoomExpenses,
  getExpenseById,
  createExpense,
  getExpenseCategories,
} from "../services/expenseService";

const SPLIT_METHODS = [
  { value: "EQUAL", label: "Equally" },
  { value: "EXACT", label: "Exact amounts" },
  { value: "PERCENTAGE", label: "By percentage" },
  { value: "SHARES", label: "By shares" },
];

function formatMoney(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLocalDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;

  return new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, 10);
}

export default function RoomDetails() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expandedExpense, setExpandedExpense] = useState(null);
  const [expenseDetails, setExpenseDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    total_amount: "",
    expense_date: getLocalDate(),
    category_id: "",
    split_method: "EQUAL",
    notes: "",
  });

  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [participantValues, setParticipantValues] = useState({});

  const loadExpenses = useCallback(async () => {
    try {
      setIsLoadingExpenses(true);

      const result = await getRoomExpenses(roomId);
      setExpenses(result);
    } catch (error) {
      toast.error(error.message || "Unable to load expenses.");
    } finally {
      setIsLoadingExpenses(false);
    }
  }, [roomId]);

  const loadRoom = useCallback(async () => {
    try {
      setIsLoading(true);

      const [roomData, categoryData] = await Promise.all([
        getRoomById(roomId),
        getExpenseCategories(),
      ]);

      setRoom(roomData);
      setCategories(categoryData);

      setSelectedParticipants(
        roomData.members.map((member) => String(member.id))
      );
    } catch (error) {
      setRoom(null);
      toast.error(error.message || "Unable to load room.");
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  useEffect(() => {
    if (room) {
      loadExpenses();
    }
  }, [room, loadExpenses]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      toast.success("Room invitation code copied.");
    } catch {
      toast.error("Unable to copy room code.");
    }
  };

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const toggleParticipant = (memberId) => {
    setSelectedParticipants((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    );
  };

  const updateParticipantValue = (memberId, value) => {
    setParticipantValues((current) => ({
      ...current,
      [memberId]: value,
    }));
  };

  const handleCreateExpense = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Enter an expense title.");
      return;
    }

    if (!form.total_amount || Number(form.total_amount) <= 0) {
      toast.error("Enter a valid expense amount.");
      return;
    }

    if (selectedParticipants.length === 0) {
      toast.error("Select at least one participant.");
      return;
    }

    const currentUserId = String(user?.id ?? user?.userId ?? "");

    if (!currentUserId) {
      toast.error("Unable to identify the current user.");
      return;
    }

    if (!selectedParticipants.includes(currentUserId)) {
      toast.error("You must include yourself in the expense participants.");
      return;
    }

    const participants = selectedParticipants.map((memberId) => {
      const participant = {
        user_id: Number(memberId),
      };

      if (form.split_method !== "EQUAL") {
        participant.value = participantValues[memberId];
      }

      return participant;
    });

    if (
      form.split_method !== "EQUAL" &&
      participants.some(
        (participant) =>
          participant.value === undefined ||
          participant.value === "" ||
          Number(participant.value) <= 0
      )
    ) {
      toast.error("Enter a valid split value for every participant.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      total_amount: form.total_amount,
      expense_date: form.expense_date,
      category_id: form.category_id || undefined,
      split_method: form.split_method,
      paid_by: Number(currentUserId),
      participants,
      notes: form.notes.trim() || undefined,
      currency: room.defaultCurrency || "INR",
    };

    try {
      setIsCreating(true);

      await createExpense(roomId, payload);

      toast.success("Expense created successfully.");

      setForm({
        title: "",
        description: "",
        total_amount: "",
        expense_date: getLocalDate(),
        category_id: "",
        split_method: "EQUAL",
        notes: "",
      });

      setParticipantValues({});
      setSelectedParticipants(
        room.members.map((member) => String(member.id))
      );

      setShowExpenseForm(false);

      await loadExpenses();
    } catch (error) {
      toast.error(error.message || "Unable to create expense.");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleExpenseDetails = async (expenseId) => {
    if (expandedExpense === expenseId) {
      setExpandedExpense(null);
      return;
    }

    setExpandedExpense(expenseId);

    if (expenseDetails[expenseId]) return;

    try {
      setLoadingDetails(expenseId);

      const details = await getExpenseById(roomId, expenseId);

      setExpenseDetails((current) => ({
        ...current,
        [expenseId]: details,
      }));
    } catch (error) {
      toast.error(error.message || "Unable to load expense details.");
      setExpandedExpense(null);
    } finally {
      setLoadingDetails(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Loading Room"
          description="Retrieving room information."
        />

        <Card className="p-8 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading room details...
          </p>
        </Card>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Room Not Found"
          description="This room may no longer be available."
        />

        <Card className="p-8 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

          <h2 className="font-semibold text-foreground">
            Unable to find this room
          </h2>

          <Button
            className="mt-5"
            onClick={() => navigate("/rooms")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Rooms
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate("/rooms")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Rooms
      </button>

      <PageHeader
        title={room.name}
        description="Room overview, members and shared expenses."
      />

      {/* ROOM INFORMATION */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-foreground">
                Room Information
              </h2>
              <p className="text-sm text-muted-foreground">
                Basic details about this room.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Room Name</p>
              <p className="font-medium">{room.name}</p>
            </div>

            {room.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{room.description}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Created On</p>
              <div className="mt-1 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {formatDate(room.createdAt)}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="font-medium">{room.members.length}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Default Currency</p>
              <p className="font-medium">{room.defaultCurrency || "INR"}</p>
            </div>
          </div>
        </Card>

        {/* INVITATION CODE */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Copy className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">Invitation Code</h2>
              <p className="text-sm text-muted-foreground">
                Share this code to invite people.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-dashed border-border bg-muted p-5 text-center">
            <p className="text-xs text-muted-foreground">ROOM CODE</p>

            <p className="mt-2 font-mono text-2xl font-bold tracking-[0.2em]">
              {room.code}
            </p>

            <Button
              className="mt-4"
              variant="secondary"
              onClick={handleCopyCode}
            >
              <Copy className="h-4 w-4" />
              Copy Code
            </Button>
          </div>
        </Card>
      </div>

      {/* ROOM MEMBERS */}
      <Card className="p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Room Members</h2>
          <p className="text-sm text-muted-foreground">
            People who belong to this room.
          </p>
        </div>

        {room.members.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No members found.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {room.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={member.name} size="md" />

                  <div className="min-w-0">
                    <p className="truncate font-medium">{member.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {member.email || "No email available"}
                    </p>
                  </div>
                </div>

                {member.id === room.createdBy && (
                  <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                    Creator
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ROOM EXPENSES */}
      <Card className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Receipt className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">Room Expenses</h2>
              <p className="text-sm text-muted-foreground">
                Shared expenses recorded in this room.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={loadExpenses}
              disabled={isLoadingExpenses}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingExpenses ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button onClick={() => setShowExpenseForm((current) => !current)}>
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* CREATE EXPENSE FORM */}
        {showExpenseForm && (
          <form
            onSubmit={handleCreateExpense}
            className="mt-6 space-y-5 rounded-xl border border-border bg-muted/30 p-5"
          >
            <div>
              <h3 className="font-semibold">New Expense</h3>
              <p className="text-sm text-muted-foreground">
                Enter the expense information and select how it should be split.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="expense-title"
                name="title"
                label="Expense Title"
                placeholder="e.g. Dinner, Groceries"
                value={form.title}
                onChange={updateForm}
                required
              />

              <Input
                id="expense-amount"
                name="total_amount"
                label={`Total Amount (${room.defaultCurrency || "INR"})`}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.total_amount}
                onChange={updateForm}
                required
              />

              <Input
                id="expense-description"
                name="description"
                label="Description (Optional)"
                placeholder="Add some details"
                value={form.description}
                onChange={updateForm}
              />

              <Input
                id="expense-date"
                name="expense_date"
                label="Expense Date"
                type="date"
                value={form.expense_date}
                onChange={updateForm}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Category
              </label>

              <select
                name="category_id"
                value={form.category_id}
                onChange={updateForm}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon || "📦"} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Split Method
              </label>

              <select
                name="split_method"
                value={form.split_method}
                onChange={updateForm}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              >
                {SPLIT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">
                Participants
              </h4>

              <p className="mb-3 text-xs text-muted-foreground">
                Select the members who share this expense. You must include yourself because you are recording and paying for this expense.
              </p>

              <div className="space-y-3 rounded-lg border border-border bg-white p-4">
                {room.members.map((member) => {
                  const selected = selectedParticipants.includes(
                    String(member.id)
                  );

                  return (
                    <div
                      key={member.id}
                      className="flex flex-wrap items-center justify-between gap-3"
                    >
                      <label className="flex items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={selected}
                          disabled={String(member.id) === String(user?.id ?? user?.userId ?? "")}
                          onChange={() => toggleParticipant(String(member.id))}
                          className="h-4 w-4 rounded"
                        />
                        <Avatar name={member.name} size="sm" />
                        <span>{member.name}</span>
                      </label>

                      {selected && form.split_method !== "EQUAL" && (
                        <div className="w-36">
                          <input
                            type="number"
                            min="0.0001"
                            step={form.split_method === "EXACT" ? "0.01" : "0.0001"}
                            placeholder={
                              form.split_method === "EXACT"
                                ? "Amount"
                                : form.split_method === "PERCENTAGE"
                                  ? "%"
                                  : "Shares"
                            }
                            value={participantValues[member.id] ?? ""}
                            onChange={(event) =>
                              updateParticipantValue(
                                String(member.id),
                                event.target.value
                              )
                            }
                            className="h-9 w-full rounded-md border border-input px-2 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {form.split_method === "PERCENTAGE" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  All participant percentages must add up to exactly 100%.
                </p>
              )}

              {form.split_method === "EXACT" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  All participant amounts must add up to the expense total.
                </p>
              )}

              {form.split_method === "SHARES" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Enter the relative number of shares for each participant.
                </p>
              )}
            </div>

            <Input
              id="expense-notes"
              name="notes"
              label="Notes (Optional)"
              placeholder="Additional notes"
              value={form.notes}
              onChange={updateForm}
            />

            <div className="flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowExpenseForm(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>

              <Button type="submit" loading={isCreating}>
                Create Expense
              </Button>
            </div>
          </form>
        )}

        {/* EXPENSE LIST */}
        <div className="mt-6">
          {isLoadingExpenses ? (
            <div className="py-10 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Loading expenses...
              </p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
              <Receipt className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="font-medium">No expenses yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first expense to start tracking shared costs.
              </p>

              {!showExpenseForm && (
                <Button
                  className="mt-4"
                  onClick={() => setShowExpenseForm(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add First Expense
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {expenses.map((expense) => {
                const isExpanded = expandedExpense === expense.id;
                const details = expenseDetails[expense.id];

                return (
                  <div key={expense.id} className="py-4 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => toggleExpenseDetails(expense.id)}
                      className="flex w-full flex-wrap items-center justify-between gap-4 text-left"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
                          {expense.categoryIcon}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {expense.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {expense.categoryName} · {formatDate(expense.expenseDate)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Paid by {expense.paidByName || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatMoney(expense.totalAmount, expense.currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {expense.participantCount} participants
                          </p>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </button>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StatusBadge status={expense.status} />
                      <span className="text-xs text-muted-foreground">
                        {expense.splitMethod} split
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
                        {loadingDetails === expense.id ? (
                          <p className="text-sm text-muted-foreground">
                            Loading expense details...
                          </p>
                        ) : details ? (
                          <div className="space-y-3">
                            {details.description && (
                              <p className="text-sm text-muted-foreground">
                                {details.description}
                              </p>
                            )}

                            <h4 className="font-semibold text-sm">
                              Participant Breakdown
                            </h4>

                            {details.splits.map((split) => (
                              <div
                                key={split.id}
                                className="flex items-center justify-between gap-3 text-sm"
                              >
                                <div>
                                  <p className="font-medium">
                                    {split.userName}
                                    {split.isPayer && (
                                      <span className="ml-2 text-xs text-brand-700">
                                        Paid
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {split.userEmail}
                                  </p>
                                </div>

                                <p className="font-semibold">
                                  {formatMoney(
                                    split.shareAmount,
                                    details.currency
                                  )}
                                </p>
                              </div>
                            ))}

                            {details.notes && (
                              <div className="border-t border-border pt-3">
                                <p className="text-xs text-muted-foreground">
                                  Notes
                                </p>
                                <p className="text-sm">{details.notes}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Unable to load details.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
