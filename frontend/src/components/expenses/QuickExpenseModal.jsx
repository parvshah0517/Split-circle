import { useState, useEffect } from "react";
import { X, Plus, Receipt } from "lucide-react";
import { toast } from "sonner";
import { getMyRooms } from "../../services/groupService";
import { createExpense } from "../../services/expenseService";
import { useAuth } from "../../hooks/useAuth";

export default function QuickExpenseModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Dining");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    async function fetchRooms() {
      try {
        const myRooms = await getMyRooms();
        setRooms(myRooms);
        if (myRooms.length > 0) {
          setSelectedRoomId(String(myRooms[0].id));
        }
      } catch (err) {
        console.error("Could not fetch rooms for quick expense:", err);
      }
    }
    fetchRooms();
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = [
    { label: "Coffee", icon: "☕" },
    { label: "Dining", icon: "🍽️" },
    { label: "Music", icon: "🎵" },
    { label: "Design", icon: "🎨" },
    { label: "Shopping", icon: "🛍️" },
    { label: "Other", icon: "📦" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter an expense title.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!selectedRoomId) {
      toast.error("Please select a room.");
      return;
    }

    const parsedUserId = parseInt(user?.id ?? user?.userId, 10);
    const validUserId = !isNaN(parsedUserId) && parsedUserId > 0 ? parsedUserId : 1;

    const selectedRoom = rooms.find((r) => String(r.id) === selectedRoomId);
    const members = selectedRoom?.members || [];
    const participantIds = members
      .map((m) => parseInt(m.id, 10))
      .filter((id) => !isNaN(id) && id > 0);

    if (!participantIds.includes(validUserId)) {
      participantIds.push(validUserId);
    }

    const payload = {
      title: title.trim(),
      total_amount: parseFloat(amount).toFixed(2),
      expense_date: new Date().toISOString().slice(0, 10),
      split_method: "EQUAL",
      paid_by: validUserId,
      participants: participantIds.map((id) => ({ user_id: id })),
      currency: selectedRoom?.defaultCurrency || "INR",
      notes: `Category: ${category}`,
    };

    try {
      setIsSubmitting(true);
      await createExpense(selectedRoomId, payload);
      toast.success("Expense added successfully!");
      setTitle("");
      setAmount("");
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to add expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[420px] rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#00C4A7]">
              <Receipt className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Add Expense</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Select Room
            </label>
            {rooms.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                Please create a room first in the Rooms tab to record shared expenses.
              </p>
            ) : (
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.memberCount || r.members?.length || 1} members)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Expense Title
            </label>
            <input
              type="text"
              placeholder="e.g. Coffee with team, Spotify family"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-3.5 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Total Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-sm font-bold text-gray-400">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 pl-8 pr-3.5 py-3 text-base font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setCategory(c.label)}
                  className={`flex items-center gap-1.5 rounded-xl border p-2 text-xs font-medium transition-all ${
                    category === c.label
                      ? "border-[#00C4A7] bg-teal-50/60 text-[#009680]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{c.icon}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || rooms.length === 0}
            className="mt-2 w-full rounded-2xl bg-[#00C4A7] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#00C4A7]/25 hover:bg-[#00B096] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "+ Create Expense"}
          </button>
        </form>
      </div>
    </div>
  );
}

