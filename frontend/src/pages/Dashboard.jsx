import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Coffee,
  Plus,
  RotateCcw,
  ShoppingBag,
  Utensils,
  Zap,
  Users,
  ArrowRight,
  Search,
  DoorOpen,
  ArrowLeftRight,
} from "lucide-react";

import QuickExpenseModal from "../components/expenses/QuickExpenseModal";
import SettlePaymentModal from "../components/settlements/SettlePaymentModal";

import { useAuth } from "../hooks/useAuth";
import { getMyRooms } from "../services/groupService";
import { getRoomExpenses } from "../services/expenseService";

import { formatDate } from "../utils/format";

const categoryIconMap = {
  coffee: Coffee,
  food: Utensils,
  dining: Utensils,
  shopping: ShoppingBag,
  refund: RotateCcw,
  utilities: Zap,
};

function getCategoryIcon(title = "", category = "") {
  const lower = `${title} ${category}`.toLowerCase();
  for (const [key, Icon] of Object.entries(categoryIconMap)) {
    if (lower.includes(key)) return Icon;
  }
  return ShoppingBag;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomFilter, setSelectedRoomFilter] = useState("all");

  // Modals & subviews
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const settleRecipient = { name: "", amount: "0.00" };

  const loadData = async () => {
    try {
      setLoading(true);
      const userRooms = await getMyRooms();
      setRooms(userRooms);

      const results = await Promise.allSettled(
        userRooms.map(async (room) => {
          const roomExpenses = await getRoomExpenses(room.id);
          return roomExpenses.map((expense) => ({
            ...expense,
            roomId: room.id,
            roomName: room.name,
            currency: expense.currency || room.defaultCurrency || "INR",
          }));
        })
      );

      const loadedExpenses = [];
      results.forEach((res) => {
        if (res.status === "fulfilled") {
          loadedExpenses.push(...res.value);
        }
      });

      loadedExpenses.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setExpenses(loadedExpenses);
    } catch (err) {
      console.error("Dashboard loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute "You Owe" and "You Owed"
  const { youOwe, youOwed, totalBalance } = useMemo(() => {
    const currentUserId = String(user?.id ?? user?.userId ?? user?.username ?? "");
    let owe = 0;
    let owed = 0;

    expenses.forEach((expense) => {
      const isPayer = String(expense.paidBy) === currentUserId;
      if (isPayer) {
        (expense.splits || []).forEach((split) => {
          if (String(split.userId) !== currentUserId) {
            owed += split.shareAmount || 0;
          }
        });
      } else {
        const mySplit = (expense.splits || []).find((s) => String(s.userId) === currentUserId);
        if (mySplit) {
          owe += mySplit.shareAmount || 0;
        }
      }
    });

    return {
      youOwe: owe,
      youOwed: owed,
      totalBalance: owed - owe,
    };
  }, [expenses, user]);

  const filteredExpenses = expenses.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      (item.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRoom =
      selectedRoomFilter === "all" || item.roomName === selectedRoomFilter;
    return matchesSearch && matchesRoom;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner Row: Total Balance + Owe/Owed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Balance Card (Teal to Yellow gradient with attached dark bottom tab) */}
        <div className="overflow-hidden rounded-[28px] shadow-[0_12px_32px_-6px_rgba(0,196,167,0.22)] md:col-span-1 flex flex-col justify-between">
          {/* Top Gradient Section */}
          <div className="relative p-6 bg-balance-gradient text-white flex-1">
            <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-yellow-300/40 blur-2xl" />

            <div className="relative flex items-center justify-between">
              <span className="text-xs font-semibold text-white/90 tracking-wide">
                Total Balance
              </span>

            </div>

            <div className="relative mt-3">
              <p className="text-3xl lg:text-4xl font-black tracking-tight text-white">
                ₹ {totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-white/80 mt-1">Across all active circles</p>
            </div>
          </div>

          {/* Attached Dark Tab: + ADD EXPENSE */}
          <button
            type="button"
            onClick={() => setShowAddExpense(true)}
            className="flex w-full items-center justify-center gap-2 bg-[#18191E] py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-black transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* YOU OWE Card */}
        <button
          type="button"
          onClick={() => setShowSettleModal(true)}
          className="rounded-[28px] bg-white p-6 text-left border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="relative flex h-8 w-8 items-center">
              <div className="absolute left-0 h-6 w-6 rounded-full bg-[#00C4A7]" />
              <div className="absolute left-3 h-6 w-6 rounded-full bg-[#18191E]" />
            </div>

            <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-gray-900">
              You Owe
            </p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              You should pay to others
            </p>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-2xl lg:text-3xl font-black tracking-tight text-gray-900">
              ₹{youOwe.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-xs font-bold text-[#00C4A7] hover:underline">
              Settle now &rarr;
            </span>
          </div>
        </button>

        {/* YOU OWED Card */}
        <div className="rounded-[28px] bg-white p-6 text-left border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="relative flex h-8 w-8 items-center">
              <div className="absolute left-0 h-6 w-6 rounded-full bg-[#00C4A7]" />
              <div className="absolute left-3 h-6 w-6 rounded-full bg-[#18191E]" />
            </div>

            <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-gray-900">
              You Owed
            </p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Others should pay you
            </p>
          </div>

          <div className="mt-4">
            <p className="text-2xl lg:text-3xl font-black tracking-tight text-gray-900">
              ₹{youOwed.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Settle & Friends */}
      <div className="rounded-[28px] bg-white p-5 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between pb-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Quick Settle & Member Circles</h2>
            <p className="text-xs text-gray-400">
              Member settlement shortcuts will appear when balance details are available.
            </p>
          </div>
        </div>
        <div className="py-6 text-center text-xs text-gray-400">
          No member balances to display yet.
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Multi-Room Transactions & Expenses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Recent Transactions</h2>
                <p className="text-xs text-gray-400">Live expenses across your different circles</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Room Filter Selector */}
                {rooms.length > 1 && (
                  <select
                    value={selectedRoomFilter}
                    onChange={(e) => setSelectedRoomFilter(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
                  >
                    <option value="all">All Circles</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                )}

                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl border border-gray-200 pl-8 pr-3 py-1.5 text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4A7] w-full sm:w-44"
                  />
                </div>
              </div>
            </div>

            {/* List */}
            <div className="mt-4 space-y-3.5">
              {filteredExpenses.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  {loading
                    ? "Loading expenses..."
                    : expenses.length === 0
                      ? "No expenses recorded yet."
                      : "No expenses match your search."}
                </div>
              ) : (
                filteredExpenses.map((tx) => {
                  const Icon = tx.icon || getCategoryIcon(tx.title);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-xs border border-gray-100 text-gray-800 shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900">{tx.title}</p>
                            {tx.roomName && (
                              <span className="inline-flex items-center rounded-lg bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-[#008F7A] border border-teal-100/70">
                                {tx.roomName}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                            {tx.time || (tx.createdAt ? formatDate(tx.createdAt) : "Recent")}
                            {tx.paidByName ? ` · Paid by ${tx.paidByName}` : ""}
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-bold text-gray-900 tracking-tight">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: tx.currency || "INR",
                          }).format(Number(tx.totalAmount || 0))}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Active Circles & Shortcuts (Replaced Upgrade Plan Banner) */}
        <div className="space-y-5">
          {/* Your Circles / Rooms Card */}
          <div className="rounded-[28px] bg-white p-5 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-sm font-bold text-gray-900">Your Circles & Rooms</h3>
              <Link to="/rooms" className="text-xs font-bold text-[#00C4A7] hover:underline">
                View all ({rooms.length})
              </Link>
            </div>

            {rooms.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                No rooms joined yet.
                <button
                  type="button"
                  onClick={() => navigate("/rooms")}
                  className="mt-2 block mx-auto text-xs font-bold text-[#00C4A7]"
                >
                  + Create First Room
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {rooms.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/rooms/${r.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50 border border-gray-100/70 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#00C4A7] font-bold text-xs shrink-0">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{r.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">Code: {r.code}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Circle Shortcuts Card (Replaced the Upgrade Plan Banner) */}
          <div className="rounded-[28px] bg-white p-5 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-3">
            <h3 className="text-sm font-bold text-gray-900">Circle Shortcuts</h3>
            
            <button
              type="button"
              onClick={() => navigate("/rooms")}
              className="flex w-full items-center justify-between p-3 rounded-2xl bg-[#F8F9FA] hover:bg-teal-50/60 border border-gray-100 text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00C4A7] text-white">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Create New Room</p>
                  <p className="text-[10px] text-gray-400">Start splitting shared expenses</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/rooms")}
              className="flex w-full items-center justify-between p-3 rounded-2xl bg-[#F8F9FA] hover:bg-teal-50/60 border border-gray-100 text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#18191E] text-white">
                  <DoorOpen className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Join with Code</p>
                  <p className="text-[10px] text-gray-400">Enter a 10-character room code</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>

            <button
              type="button"
              onClick={() => setShowSettleModal(true)}
              className="flex w-full items-center justify-between p-3 rounded-2xl bg-[#F8F9FA] hover:bg-teal-50/60 border border-gray-100 text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <ArrowLeftRight className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Settle Up</p>
                  <p className="text-[10px] text-gray-400">Record a settlement with member</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <QuickExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onCreated={loadData}
      />

      {/* Settle Keypad Modal (Screen 3) */}
      <SettlePaymentModal
        isOpen={showSettleModal}
        onClose={() => setShowSettleModal(false)}
        recipient={settleRecipient}
        onSuccess={loadData}
      />
    </div>
  );
}
