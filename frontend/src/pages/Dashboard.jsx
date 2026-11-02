
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  Plus,
  Receipt,
  Search,
  Users,
  Wallet,
} from "lucide-react";

import Alert from "../components/common/Alert";
import Avatar from "../components/common/Avatar";
import Card from "../components/common/Card";
import StatusBadge from "../components/common/StatusBadge";

import { useAuth } from "../hooks/useAuth";
import { getMyRooms } from "../services/groupService";
import { getRoomExpenses } from "../services/expenseService";

import { cn } from "../lib/utils";
import {
  formatDate,
  formatDateTime,
  getFirstName,
} from "../utils/format";
import { formatMoney } from "../utils/money";

const money = (amount, currency = "INR") =>
  formatMoney(amount, currency);

const quickActions = [
  { to: "/expenses", label: "Add expense", icon: Plus },
  { to: "/rooms", label: "Groups", icon: Users },
  { to: "/settlements", label: "Settle up", icon: ArrowLeftRight },
  { to: "/expenses", label: "Expenses", icon: Receipt },
];

const expenseFilters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
];

const categoryColors = [
  "#6366f1",
  "#0d9488",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
];

function normalizeStatus(status) {
  const value = String(status || "").toUpperCase();

  if (value === "PENDING_APPROVAL") return "pending";
  if (value === "APPROVED") return "approved";
  if (value === "REJECTED") return "rejected";
  if (value === "CANCELLED") return "cancelled";

  return value.toLowerCase();
}

function getExpenseDate(expense) {
  return expense.expenseDate || expense.createdAt;
}

function getMonthKey(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return null;

  return `${date.getFullYear()}-${date.getMonth()}`;
}

function formatCurrencyTotals(totals) {
  const entries = Object.entries(totals);

  if (entries.length === 0) return money(0);

  return entries
    .map(([currency, amount]) => money(amount, currency))
    .join(" / ");
}

export default function Dashboard() {
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // Fetch rooms and their expenses for the logged-in user.
  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const userRooms = await getMyRooms();

        const results = await Promise.allSettled(
          userRooms.map(async (room) => {
            const roomExpenses = await getRoomExpenses(room.id);

            return roomExpenses.map((expense) => ({
              ...expense,
              roomName: room.name,
              currency: expense.currency || room.defaultCurrency || "INR",
              status: normalizeStatus(expense.status),
            }));
          })
        );

        const loadedExpenses = [];
        let failedRooms = 0;

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            loadedExpenses.push(...result.value);
          } else {
            failedRooms += 1;
            console.error(
              "Could not load expenses for a room:",
              result.reason
            );
          }
        });

        loadedExpenses.sort((a, b) => {
          const dateA = new Date(getExpenseDate(a) || 0).getTime();
          const dateB = new Date(getExpenseDate(b) || 0).getTime();

          return dateB - dateA;
        });

        if (!cancelled) {
          setRooms(userRooms);
          setExpenses(loadedExpenses);

          if (failedRooms > 0) {
            setError(
              `Expenses could not be loaded for ${failedRooms} room(s). Other available data is displayed.`
            );
          }
        }
      } catch (err) {
        console.error("Dashboard loading failed:", err);

        if (!cancelled) {
          setError(
            err.message || "Unable to load your dashboard. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  // Only approved expenses are included in spending summaries.
  const approvedExpenses = useMemo(
    () => expenses.filter((expense) => expense.status === "approved"),
    [expenses]
  );

  const monthlySpending = useMemo(() => {
    const currentMonth = getMonthKey(new Date());

    return approvedExpenses.reduce((totals, expense) => {
      if (getMonthKey(getExpenseDate(expense)) !== currentMonth) {
        return totals;
      }

      const currency = expense.currency || "INR";

      totals[currency] =
        (totals[currency] || 0) + expense.totalAmount;

      return totals;
    }, {});
  }, [approvedExpenses]);

  const categorySpending = useMemo(() => {
    const categories = {};

    approvedExpenses.forEach((expense) => {
      const name = expense.categoryName || "Other";
      const currency = expense.currency || "INR";
      const key = `${name}-${currency}`;

      if (!categories[key]) {
        categories[key] = {
          name,
          currency,
          amount: 0,
          color:
            categoryColors[
              Object.keys(categories).length % categoryColors.length
            ],
        };
      }

      categories[key].amount += expense.totalAmount;
    });

    const totalsByCurrency = {};

    Object.values(categories).forEach((item) => {
      totalsByCurrency[item.currency] =
        (totalsByCurrency[item.currency] || 0) + item.amount;
    });

    return Object.values(categories)
      .map((item) => ({
        ...item,
        percent: totalsByCurrency[item.currency]
          ? Math.round(
              (item.amount / totalsByCurrency[item.currency]) * 100
            )
          : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [approvedExpenses]);

  const visibleExpenses = useMemo(() => {
    const term = query.trim().toLowerCase();

    return expenses
      .filter((expense) => {
        if (filter !== "all" && expense.status !== filter) {
          return false;
        }

        if (!term) return true;

        return [
          expense.title,
          expense.roomName,
          expense.paidByName,
        ].some((field) =>
          String(field || "").toLowerCase().includes(term)
        );
      })
      .slice(0, 10);
  }, [expenses, query, filter]);

  const recentActivity = expenses.slice(0, 5);

  return (
    <div className="space-y-6 pb-28">
      {/* Welcome section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/10" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-brand-100">
              {formatDate(new Date().toISOString())}
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Hi, {getFirstName(user?.name) || "there"}
            </h1>

            <p className="mt-2 text-sm text-brand-100">
              Your SplitCircle overview
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight">
              {loading
                ? "Loading..."
                : `${rooms.length} ${rooms.length === 1 ? "Room" : "Rooms"}`}
            </p>
          </div>
        </div>
      </section>

      {error && <Alert variant="info">{error}</Alert>}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Your rooms"
          value={loading ? "..." : rooms.length}
          iconTone="bg-brand-50 text-brand-600"
          icon={Users}
        />

        <SummaryCard
          label="Total expenses"
          value={loading ? "..." : expenses.length}
          iconTone="bg-purple-50 text-purple-600"
          icon={Receipt}
        />

        <SummaryCard
          label="Spent this month"
          value={
            loading
              ? "..."
              : formatCurrencyTotals(monthlySpending)
          }
          iconTone="bg-emerald-50 text-emerald-600"
          icon={Wallet}
        />
      </div>

      {/* Expenses and room information */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Recent expenses
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Expenses across your rooms
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div
                role="group"
                aria-label="Filter expenses"
                className="inline-flex rounded-md bg-muted p-1"
              >
                {expenseFilters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={filter === item.value}
                    onClick={() => setFilter(item.value)}
                    className={cn(
                      "rounded px-3 py-1 text-xs font-medium transition-colors",
                      filter === item.value
                        ? "bg-white text-brand-700 shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <label className="relative">
                <span className="sr-only">Search expenses</span>

                <Search
                  className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search expenses"
                  className="h-9 w-full rounded-md border border-input bg-white pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-56"
                />
              </label>
            </div>
          </div>

          {loading ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              Loading your expenses...
            </p>
          ) : visibleExpenses.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              {expenses.length === 0
                ? "You haven't added any expenses yet."
                : "No expenses match your filters."}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {visibleExpenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      name={expense.paidByName || "Unknown"}
                      size="sm"
                    />

                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {expense.title}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {expense.roomName} · Paid by{" "}
                        {expense.paidByName || "Unknown"} ·{" "}
                        {formatDate(getExpenseDate(expense))}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-foreground">
                      {money(expense.totalAmount, expense.currency)}
                    </span>

                    <StatusBadge status={expense.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          {/* Spending by category */}
          <Card>
            <SectionHeader title="Spending by category" />

            {loading ? (
              <p className="px-5 pb-5 text-sm text-muted-foreground">
                Loading...
              </p>
            ) : categorySpending.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-muted-foreground">
                No approved expenses yet.
              </p>
            ) : (
              <div className="space-y-4 px-5 pb-5">
                {categorySpending.map((item) => (
                  <div key={`${item.name}-${item.currency}`}>
                    <div className="mb-1 flex justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 text-foreground">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </span>

                      <span className="text-right text-xs text-muted-foreground">
                        {money(item.amount, item.currency)} · {item.percent}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* User rooms */}
          <Card>
            <SectionHeader title="Your groups" />

            {loading ? (
              <p className="px-5 pb-5 text-sm text-muted-foreground">
                Loading your rooms...
              </p>
            ) : rooms.length === 0 ? (
              <div className="px-5 pb-5">
                <p className="text-sm text-muted-foreground">
                  You haven't joined any rooms yet.
                </p>

                <Link
                  to="/rooms"
                  className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline"
                >
                  Create or join a room
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {rooms.slice(0, 5).map((room) => (
                  <li
                    key={room.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={room.name} size="sm" />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {room.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {room.memberCount} members
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/rooms/${room.id}`}
                      className="shrink-0 text-xs font-medium text-brand-700 hover:underline"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Recent activity derived from actual expenses */}
      <Card>
        <SectionHeader title="Recent activity" />

        {loading ? (
          <p className="px-5 pb-5 text-sm text-muted-foreground">
            Loading activity...
          </p>
        ) : recentActivity.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-muted-foreground">
            No recent activity.
          </p>
        ) : (
          <ol className="relative space-y-0 px-5 pb-5">
            {recentActivity.map((expense) => (
              <li
                key={expense.id}
                className="relative flex gap-4 pb-5 last:pb-0"
              >
                <div className="flex flex-col items-center">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500 ring-4 ring-brand-50" />
                  <span className="mt-1 w-px flex-1 bg-border" />
                </div>

                <div className="min-w-0 pb-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">
                      {expense.createdByName || "A member"}
                    </span>{" "}
                    added an expense
                  </p>

                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {expense.title} in {expense.roomName}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {expense.createdAt
                      ? formatDateTime(expense.createdAt)
                      : formatDate(getExpenseDate(expense))}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      {/* Mobile quick actions */}
      <nav
        aria-label="Quick actions"
        className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-white/60 bg-white/60 p-2 shadow-xl shadow-brand-900/10 backdrop-blur-xl lg:hidden"
      >
        <ul className="grid grid-cols-4 gap-1">
          {quickActions.map(({ to, label, icon: Icon }) => (
            <li key={label}>
              <Link
                to={to}
                className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium text-foreground/80 transition-all hover:bg-white/80 hover:text-brand-700 hover:shadow-sm"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function SummaryCard({ label, value, iconTone, icon: Icon }) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            iconTone
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <p className="mt-4 text-sm font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
    </Card>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  );
}
