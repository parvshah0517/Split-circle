import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Plus, Receipt, Search, Users, Wallet } from "lucide-react";
import Alert from "../components/common/Alert";
import Avatar from "../components/common/Avatar";
import Card from "../components/common/Card";
import PreviewBadge from "../components/common/PreviewBadge";
import StatusBadge from "../components/common/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import {
  PREVIEW_CURRENCY,
  previewActivity,
  previewGroups,
  previewRecentExpenses,
  previewSpending,
  previewSummary,
} from "../data/previewData";
import { cn } from "../lib/utils";
import { formatDate, formatDateTime, getFirstName } from "../utils/format";
import { formatMoney } from "../utils/money";

const money = (amount) => formatMoney(amount, PREVIEW_CURRENCY);

const quickActions = [
  { to: "/expenses", label: "Add expense", icon: Plus },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/settlements", label: "Settle up", icon: ArrowLeftRight },
  { to: "/expenses", label: "Expenses", icon: Receipt },
];

const expenseFilters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const spendingTotal = previewSpending.reduce((sum, item) => sum + item.amount, 0);
  const netBalance = previewSummary.totalOwedToYou - previewSummary.totalYouOwe;

  const visibleExpenses = useMemo(() => {
    const term = query.trim().toLowerCase();
    return previewRecentExpenses.filter((expense) => {
      if (filter !== "all" && expense.status !== filter) return false;
      if (!term) return true;
      return [expense.title, expense.group, expense.paidBy].some((field) => field.toLowerCase().includes(term));
    });
  }, [query, filter]);

  return (
    <div className="space-y-6 pb-28">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-brand-100">{formatDate(new Date().toISOString())}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Hi, {getFirstName(user?.name) || "there"}
            </h1>
            <p className="mt-2 text-sm text-brand-100">Your net position across all groups</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {netBalance >= 0 ? "+" : "-"}
              {money(Math.abs(netBalance))}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PreviewBadge label="Preview data" />
          </div>
        </div>
      </section>

      <Alert variant="info">
        Figures on this dashboard are preview data. Balances will reflect live numbers once the expenses and
        balances endpoints are available. Only approved expenses affect balances.
      </Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="You owe"
          value={money(previewSummary.totalYouOwe)}
          tone="text-red-600"
          iconTone="bg-red-50 text-red-600"
          icon={ArrowUpRight}
        />
        <SummaryCard
          label="You are owed"
          value={money(previewSummary.totalOwedToYou)}
          tone="text-emerald-600"
          iconTone="bg-emerald-50 text-emerald-600"
          icon={ArrowDownLeft}
        />
        <SummaryCard
          label="Spent this month"
          value={money(previewSummary.monthlyExpenses)}
          tone="text-foreground"
          iconTone="bg-brand-50 text-brand-600"
          icon={Wallet}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Recent expenses</h2>
              <PreviewBadge />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div role="group" aria-label="Filter expenses" className="inline-flex rounded-md bg-muted p-1">
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
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <label className="relative">
                <span className="sr-only">Search expenses</span>
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
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

          {visibleExpenses.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">No expenses match your filters.</p>
          ) : (
            <ul className="divide-y divide-border">
              {visibleExpenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={expense.paidBy} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{expense.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {expense.group} · Paid by {expense.paidBy} · {formatDate(expense.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-foreground">{money(expense.amount)}</span>
                    <StatusBadge status={expense.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionHeader title="Spending by category" />
            <div className="space-y-4 px-5 pb-5">
              {previewSpending.map((item) => {
                const percent = Math.round((item.amount / spendingTotal) * 100);
                return (
                  <div key={item.name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="flex items-center gap-2 text-foreground">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="text-muted-foreground">
                        {money(item.amount)} · {percent}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Your groups" />
            <ul className="divide-y divide-border">
              {previewGroups.map((group) => (
                <li key={group.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={group.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.members} members</p>
                    </div>
                  </div>
                  <BalanceText amount={group.yourBalance} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card>
        <SectionHeader title="Recent activity" />
        <ol className="relative space-y-0 px-5 pb-5">
          {previewActivity.map((item) => (
            <li key={item.id} className="relative flex gap-4 pb-5 last:pb-0">
              <div className="flex flex-col items-center">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500 ring-4 ring-brand-50" />
                <span className="mt-1 w-px flex-1 bg-border" />
              </div>
              <div className="min-w-0 pb-1">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{item.user}</span> · {item.action}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.timestamp)}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <nav
        aria-label="Quick actions"
        className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-white/60 bg-white/60 p-2 shadow-xl shadow-brand-900/10 backdrop-blur-xl lg:left-[calc(50%+8rem)] lg:w-auto lg:max-w-xl"
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

function SummaryCard({ label, value, tone, iconTone, icon: Icon }) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconTone)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <PreviewBadge />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold tracking-tight", tone)}>{value}</p>
    </Card>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <PreviewBadge />
    </div>
  );
}

function BalanceText({ amount }) {
  if (amount === 0) {
    return <span className="text-sm text-muted-foreground">Settled up</span>;
  }
  return amount > 0 ? (
    <span className="text-sm font-semibold text-emerald-600">+{money(amount)}</span>
  ) : (
    <span className="text-sm font-semibold text-red-600">-{money(Math.abs(amount))}</span>
  );
}
