
import { useEffect, useState } from "react";
import {
  Receipt,
  ArrowLeftRight,
  CalendarDays,
  LoaderCircle,
  Activity as ActivityIcon,
} from "lucide-react";
import { toast } from "sonner";

import { getMyRooms } from "../services/groupService";
import { getRoomExpenses } from "../services/expenseService";
import { getRoomSettlements } from "../services/settlementService";
import { useAuth } from "../hooks/useAuth";

const FILTERS = [
  { id: "all", label: "All Activity" },
  { id: "expense", label: "Expenses" },
  { id: "settle", label: "Settlements" },
];

function formatAmount(amountMinor, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amountMinor || 0) / 100);
}

function getDate(value) {
  if (!value) return new Date();

  // Keep date-only values in local time to avoid timezone shifts.
  const dateString = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ? new Date(`${dateString}T00:00:00`)
    : new Date(dateString);

  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function getDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getSection(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (getDateKey(date) === getDateKey(today)) return "Today";
  if (getDateKey(date) === getDateKey(yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Activity() {
  const { user } = useAuth();

  const [filter, setFilter] = useState("all");
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      setIsLoading(true);
      setLoadError("");

      try {
        const rooms = await getMyRooms();

        const results = await Promise.all(
          rooms.map(async (room) => {
            const [expenses, settlements] = await Promise.all([
              getRoomExpenses(room.id),
              getRoomSettlements(room.id),
            ]);

            return { room, expenses, settlements };
          })
        );

        if (cancelled) return;

        const expenseActivities = results.flatMap(
          ({ room, expenses }) =>
            expenses.map((expense) => {
              const date = getDate(
                expense.createdAt || expense.expenseDate
              );

              return {
                id: `expense-${room.id}-${expense.id}`,
                type: "expense",
                title: expense.title,
                subtitle: `${room.name} · ${
                  expense.paidByName
                    ? `Paid by ${expense.paidByName}`
                    : "Expense"
                }`,
                amount: formatAmount(
                  expense.totalAmountMinor,
                  expense.currency || room.defaultCurrency || "INR"
                ),
                date,
                status: expense.status,
                icon: Receipt,
              };
            })
        );

        const settlementActivities = results.flatMap(
          ({ room, settlements }) =>
            settlements.map((settlement) => {
              const date = getDate(
                settlement.settled_at || settlement.created_at
              );

              const payerName =
                settlement.payer_name ||
                settlement.payer_username ||
                "Member";

              const receiverName =
                settlement.receiver_name ||
                settlement.receiver_username ||
                "Member";

              const currentUserId = Number(user?.id ?? user?.userId);
              const isPayer =
                Number(settlement.payer_id) === currentUserId;
              const isReceiver =
                Number(settlement.receiver_id) === currentUserId;

              let amountPrefix = "";
              if (isPayer) amountPrefix = "− ";
              else if (isReceiver) amountPrefix = "+ ";

              return {
                id: `settlement-${room.id}-${settlement.id}`,
                type: "settle",
                title: "Settlement",
                subtitle: `${room.name} · ${payerName} paid ${receiverName}`,
                amount:
                  amountPrefix +
                  formatAmount(
                    settlement.amount,
                    settlement.currency || room.defaultCurrency || "INR"
                  ),
                date,
                status: settlement.status,
                notes: settlement.notes,
                icon: ArrowLeftRight,
              };
            })
        );

        const combined = [
          ...expenseActivities,
          ...settlementActivities,
        ].sort((a, b) => b.date.getTime() - a.date.getTime());

        setActivities(combined);
      } catch (error) {
        if (!cancelled) {
          setLoadError("Could not load your activity.");
          toast.error("Could not load activity. Please try again.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredActivities = activities.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  const groupedActivities = filteredActivities.reduce((groups, item) => {
    const section = getSection(item.date);

    if (!groups[section]) groups[section] = [];
    groups[section].push(item);

    return groups;
  }, {});

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Activity Timeline
          </h1>
          <p className="mt-1 text-xs font-medium text-gray-400 sm:text-sm">
            Recent expenses and settlements across all your rooms
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto self-start pb-1 sm:self-auto">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filter === item.id
                  ? "bg-[#18191E] text-white shadow-sm"
                  : "border border-gray-100 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] sm:p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <LoaderCircle className="mb-3 h-7 w-7 animate-spin text-[#00C4A7]" />
            <p className="text-sm font-medium">Loading activity...</p>
          </div>
        ) : loadError ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-gray-700">
              {loadError}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-xs font-bold text-[#009E87] hover:underline"
            >
              Reload page
            </button>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-[#00C4A7]">
              <ActivityIcon className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">
              No activity yet
            </h3>
            <p className="mt-1 max-w-xs text-xs text-gray-400">
              Expenses and recorded settlements will appear here when
              they're available.
            </p>
          </div>
        ) : (
          <div className="space-y-7">
            {Object.entries(groupedActivities).map(([section, items]) => (
              <section key={section}>
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {section}
                  </h2>
                </div>

                <div className="space-y-2">
                  {items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-2xl p-3 transition hover:bg-gray-50"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                              item.type === "expense"
                                ? "border-teal-100 bg-teal-50 text-[#009E87]"
                                : "border-blue-100 bg-blue-50 text-blue-600"
                            }`}
                          >
                            <Icon className="h-4.5 w-4.5" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900">
                              {item.title}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-gray-400">
                              {item.subtitle}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="text-[11px] text-gray-400">
                                {formatTime(item.date)}
                              </span>

                              {item.status === "PENDING_APPROVAL" && (
                                <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                                  Pending approval
                                </span>
                              )}

                              {item.status === "REJECTED" && (
                                <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                                  Rejected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 text-right text-xs font-bold sm:text-sm ${
                            item.type === "settle" &&
                            item.amount.startsWith("+")
                              ? "text-[#00A58F]"
                              : "text-gray-900"
                          }`}
                        >
                          {item.amount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
