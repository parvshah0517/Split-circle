import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Users,
  CalendarDays,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Coffee,
  ShoppingBag,
  Disc,
  Utensils,
  ShieldCheck,
} from "lucide-react";

import Avatar from "../components/common/Avatar";
import StatusBadge from "../components/common/StatusBadge";
import QuickExpenseModal from "../components/expenses/QuickExpenseModal";
import { DribbbleIcon, SpotifyIcon } from "../components/common/BrandIcons";

import { useAuth } from "../hooks/useAuth";
import { getRoomById } from "../services/groupService";
import { getRoomExpenses, getExpenseById } from "../services/expenseService";

const categoryIconMap = {
  coffee: Coffee,
  dribbble: DribbbleIcon,
  design: DribbbleIcon,
  spotify: SpotifyIcon,
  music: SpotifyIcon,
  food: Utensils,
  dining: Utensils,
  shopping: ShoppingBag,
  refund: RotateCcw,
};

function getCategoryIcon(title = "", category = "") {
  const lower = `${title} ${category}`.toLowerCase();
  for (const [key, Icon] of Object.entries(categoryIconMap)) {
    if (lower.includes(key)) return Icon;
  }
  return ShoppingBag;
}
function formatMoney(amount, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(Number(amount || 0));
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
}
export default function RoomDetails() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const [expandedExpense, setExpandedExpense] = useState(null);
  const [expenseDetails, setExpenseDetails] = useState({});

  const loadRoom = useCallback(async () => {
    try {
      setIsLoading(true);
      const roomData = await getRoomById(roomId);
      setRoom(roomData);
      const expList = await getRoomExpenses(roomId);
      setExpenses(expList);
    } catch (error) {
      toast.error(error.message || "Unable to load room.");
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  const handleCopyCode = async () => {
    if (!room?.code) return;
    try {
      await navigator.clipboard.writeText(room.code);
      toast.success("Room invitation code copied!");
    } catch {
      toast.error("Unable to copy room code.");
    }
  };

  const toggleExpense = async (id) => {
    if (expandedExpense === id) {
      setExpandedExpense(null);
      return;
    }
    setExpandedExpense(id);
    if (!expenseDetails[id]) {
      try {
        const details = await getExpenseById(roomId, id);
        setExpenseDetails((prev) => ({ ...prev, [id]: details }));
      } catch (err) {
        console.error("Could not fetch expense details:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-gray-400">
        Loading room details from backend...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600 font-bold">Room not found.</p>
        <button
          type="button"
          onClick={() => navigate("/rooms")}
          className="mt-3 inline-block text-xs font-bold text-[#00C4A7] hover:underline"
        >
          &larr; Back to all rooms
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/rooms")}
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>All Rooms</span>
        </button>

        <button
          type="button"
          onClick={loadRoom}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Room Hero Card */}
      <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Room Circle · Currency {room.defaultCurrency || "INR"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            {room.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {room.memberCount || room.members?.length || 1} registered participants
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Invite Code Pill */}
          <div className="flex items-center gap-2.5 rounded-2xl bg-[#F8F9FA] px-4 py-2.5 border border-gray-100">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">
                Invitation Code
              </span>
              <span className="font-mono text-sm font-bold text-gray-900 tracking-wider">
                {room.code}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#00C4A7] hover:bg-teal-50 shadow-2xs"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-2 rounded-2xl bg-[#00C4A7] hover:bg-[#00B096] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#00C4A7]/20 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Room Expenses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                Expenses in this Circle ({expenses.length})
              </h2>
            </div>

            {expenses.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-400">No expenses recorded yet in this room.</p>
                <button
                  type="button"
                  onClick={() => setShowAddExpense(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#00C4A7] text-white px-4 py-2 text-xs font-bold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Record First Expense</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {expenses.map((exp) => {
                  const Icon = getCategoryIcon(exp.title, exp.categoryName);
                  const isExpanded = expandedExpense === exp.id;
                  const details = expenseDetails[exp.id];

                  return (
                    <div
                      key={exp.id}
                      className="rounded-2xl border border-gray-100 p-4 hover:bg-gray-50/60 transition-colors"
                    >
                      <div
                        onClick={() => toggleExpense(exp.id)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-100 text-gray-800 shadow-2xs shrink-0">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{exp.title}</p>
                            <p className="text-xs text-gray-400 font-medium">
                              Paid by {exp.paidByName || "Member"} · {exp.expenseDate || "Recent"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-base font-black text-gray-900">
                            ${Number(exp.totalAmount || 0).toFixed(2)}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Expandable Split Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600 space-y-2.5 animate-in fade-in">
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-medium">Split Method:</span>
                            <span className="font-bold text-gray-800">{exp.splitMethod || "Equal"}</span>
                          </div>
                          {details?.splits && (
                            <div>
                              <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">
                                Participant Splits:
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {details.splits.map((s) => (
                                  <div
                                    key={s.id}
                                    className="flex items-center justify-between p-2 rounded-xl bg-gray-50 text-xs"
                                  >
                                    <span className="font-semibold text-gray-800">{s.userName || "Member"}</span>
                                    <span className="font-black text-gray-900">
                                      ${Number(s.shareAmount || 0).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Room Members */}
        <div className="space-y-4">
          <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Circle Members ({room.members?.length || 1})
            </h3>

            <div className="space-y-3">
              {(room.members || []).map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} size="sm" shape="squircle" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{m.name}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{m.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                    Member
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <QuickExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onCreated={loadRoom}
      />
    </div>
  );
}
