
import { useEffect, useState } from "react";
import { ArrowRight, Receipt, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import Avatar from "../components/common/Avatar";
import { getMyRooms } from "../services/groupService";
import { getRoomExpenses } from "../services/expenseService";
import { getRoomBalances } from "../services/settlementService";
import { useAuth } from "../hooks/useAuth";

function formatMoney(amountMinor, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amountMinor) / 100);
}

function formatExpenseDate(date) {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Position() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("balances");
  const [balances, setBalances] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const myRooms = await getMyRooms();

        const results = await Promise.allSettled(
          myRooms.map(async (room) => {
            const [balanceData, roomExpenses] = await Promise.all([
              getRoomBalances(room.id),
              getRoomExpenses(room.id),
            ]);

            return {
              room,
              balanceData,
              expenses: roomExpenses,
            };
          })
        );

        if (cancelled) return;

        const successfulResults = results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);

        const failedCount = results.length - successfulResults.length;

        setRooms(myRooms);

        if (failedCount > 0) {
          setError(
            `Could not load data for ${failedCount} room(s). Some results may be missing.`
          );
        }

        const currentUserId = String(user?.id);

        // Build balances across all rooms.
        const combinedBalances = new Map();

        successfulResults.forEach(({ room, balanceData }) => {
          const members = new Map(
            (balanceData.members || []).map((member) => [
              String(member.id),
              member,
            ])
          );

          (balanceData.balances || []).forEach((balance) => {
            const fromId = String(balance.from_user_id);
            const toId = String(balance.to_user_id);

            if (
              fromId !== currentUserId &&
              toId !== currentUserId
            ) {
              return;
            }

            const currentUserOwes = fromId === currentUserId;
            const counterpartId = currentUserOwes ? toId : fromId;
            const counterpart = members.get(counterpartId);

            const currency = balance.currency || room.defaultCurrency || "INR";
            const direction = currentUserOwes ? "owe" : "owed";

            const key = `${counterpartId}:${direction}:${currency}`;

            if (!combinedBalances.has(key)) {
              combinedBalances.set(key, {
                id: key,
                userId: counterpartId,
                name: counterpart?.username || counterpart?.name || "Room member",
                username: counterpart?.username || "",
                amountMinor: 0,
                currency,
                type: direction,
                rooms: [],
              });
            }

            const entry = combinedBalances.get(key);
            entry.amountMinor += Number(balance.amount_minor);

            if (!entry.rooms.includes(room.name)) {
              entry.rooms.push(room.name);
            }
          });
        });

        setBalances(
          [...combinedBalances.values()].sort(
            (a, b) => b.amountMinor - a.amountMinor
          )
        );

        // Combine expenses from all rooms.
        const allExpenses = successfulResults.flatMap(
          ({ room, expenses: roomExpenses }) =>
            roomExpenses.map((expense) => ({
              ...expense,
              roomName: room.name,
            }))
        );

        allExpenses.sort(
          (a, b) =>
            new Date(b.expenseDate || 0) -
            new Date(a.expenseDate || 0)
        );

        setExpenses(allExpenses);
      } catch (err) {
        console.error("Position load error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load your positions."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const totalOwe = balances
    .filter((item) => item.type === "owe")
    .reduce((sum, item) => sum + item.amountMinor, 0);

  const totalOwed = balances
    .filter((item) => item.type === "owed")
    .reduce((sum, item) => sum + item.amountMinor, 0);

  // Keep summary totals separated by currency.
  function getCurrencyTotals(type) {
    const totals = {};

    balances
      .filter((item) => item.type === type)
      .forEach((item) => {
        totals[item.currency] =
          (totals[item.currency] || 0) + item.amountMinor;
      });

    return Object.entries(totals);
  }

  const oweTotals = getCurrencyTotals("owe");
  const owedTotals = getCurrencyTotals("owed");

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Position & Shared Balances
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-medium">
            Monitor shared balances and expense activity across all your rooms
          </p>
        </div>

        <div className="flex rounded-2xl bg-[#E5E7EB] p-1 shadow-inner self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("balances")}
            className={`rounded-xl px-5 py-2 text-xs font-bold tracking-wider uppercase transition-all ${
              activeTab === "balances"
                ? "bg-[#18191E] text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Balances
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className={`rounded-xl px-5 py-2 text-xs font-bold tracking-wider uppercase transition-all ${
              activeTab === "expenses"
                ? "bg-[#18191E] text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Expenses
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-[28px] bg-white p-10 text-center text-sm font-medium text-gray-400">
          Loading your positions...
        </div>
      ) : activeTab === "balances" ? (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                You Owe
              </span>

              {oweTotals.length ? (
                <div className="mt-2 space-y-1">
                  {oweTotals.map(([currency, amount]) => (
                    <p
                      key={currency}
                      className="text-3xl font-black text-gray-900"
                    >
                      {formatMoney(amount, currency)}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-3xl font-black text-gray-900">
                  ₹0.00
                </p>
              )}

              <p className="text-xs text-amber-600 font-semibold mt-1">
                Outstanding amounts you need to pay
              </p>
            </div>

            <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                You Are Owed
              </span>

              {owedTotals.length ? (
                <div className="mt-2 space-y-1">
                  {owedTotals.map(([currency, amount]) => (
                    <p
                      key={currency}
                      className="text-3xl font-black text-[#00C4A7]"
                    >
                      {formatMoney(amount, currency)}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-3xl font-black text-[#00C4A7]">
                  ₹0.00
                </p>
              )}

              <p className="text-xs text-teal-600 font-semibold mt-1">
                Outstanding amounts others need to pay you
              </p>
            </div>
          </div>

          {/* Balance List */}
          <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                People & Split Balances
              </h2>
              <span className="text-xs text-gray-400">
                {rooms.length} rooms
              </span>
            </div>

            {balances.length === 0 ? (
              <div className="py-10 text-center">
                <Wallet className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-3 text-sm font-bold text-gray-700">
                  All settled up!
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  You currently have no outstanding balances.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {balances.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          item.type === "owe"
                            ? "bg-[#FEF08A]"
                            : "bg-[#CCFBF1]"
                        }`}
                      >
                        <Avatar
                          name={item.name}
                          size="sm"
                          shape="squircle"
                          className="bg-transparent"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400 font-medium truncate">
                          {item.rooms.join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900">
                          {formatMoney(item.amountMinor, item.currency)}
                        </p>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            item.type === "owe"
                              ? "text-amber-600"
                              : "text-[#00C4A7]"
                          }`}
                        >
                          {item.type === "owe" ? "You owe" : "Owes you"}
                        </span>
                      </div>

                      <Link
                        to="/settlements"
                        title="Open settlements"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 hover:bg-[#18191E] hover:text-white transition-colors text-gray-600 shadow-2xs"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Actual Expenses */
        <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Recent Expense Breakdown
          </h2>

          {expenses.length === 0 ? (
            <div className="py-10 text-center">
              <Receipt className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-3 text-sm font-bold text-gray-700">
                No expenses yet
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Expenses from your rooms will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {expenses.map((expense) => (
                <div
                  key={`${expense.roomId}-${expense.id}`}
                  className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white border border-gray-100 text-gray-800 shadow-2xs">
                      <span className="text-xl">
                        {expense.categoryIcon || "📦"}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {expense.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {expense.roomName} · {formatExpenseDate(expense.expenseDate)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Paid by {expense.paidByName || "Room member"}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-black text-gray-900 shrink-0">
                    {formatMoney(
                      expense.totalAmountMinor,
                      expense.currency
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
