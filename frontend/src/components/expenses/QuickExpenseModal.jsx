
import { useState, useEffect } from "react";
import { X, Receipt } from "lucide-react";
import { toast } from "sonner";

import { getMyRooms, getRoomById } from "../../services/groupService";
import { createExpense } from "../../services/expenseService";
import { useAuth } from "../../hooks/useAuth";

const CATEGORIES = [
  { label: "Hotel", icon: "🏨" },
  { label: "Meals", icon: "🍽️" },
  { label: "Travel", icon: "✈️" },
  { label: "Shopping", icon: "🛍️" },
  { label: "Other", icon: "📦" },
];

const SPLIT_METHODS = [
  { value: "EQUAL", label: "Equal" },
  { value: "EXACT", label: "Exact" },
  { value: "PERCENTAGE", label: "Percentage" },
];

export default function QuickExpenseModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [roomMembers, setRoomMembers] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Meals");

  const [splitMethod, setSplitMethod] = useState("EQUAL");
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [participantValues, setParticipantValues] = useState({});

  const [requestApproval, setRequestApproval] = useState(false);
  const [requestedFrom, setRequestedFrom] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = Number(user?.id ?? user?.userId);

  const activeMethodIndex = SPLIT_METHODS.findIndex(
    (method) => method.value === splitMethod
  );

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function fetchRooms() {
      try {
        const myRooms = await getMyRooms();
        if (cancelled) return;

        setRooms(myRooms);

        if (myRooms.length) {
          setSelectedRoomId(String(myRooms[0].id));
        }
      } catch (error) {
        toast.error("Could not load your rooms.");
      }
    }

    fetchRooms();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !selectedRoomId) return;

    let cancelled = false;

    async function fetchMembers() {
      try {
        const room = await getRoomById(selectedRoomId);
        if (cancelled) return;

        const members = room.members || [];
        setRoomMembers(members);
        setSelectedParticipants(members.map((member) => String(member.id)));
        setRequestedFrom(
          String(
            members.find((member) => Number(member.id) !== userId)?.id || ""
          )
        );
        setParticipantValues({});
      } catch (error) {
        if (!cancelled) toast.error("Could not load room members.");
      }
    }

    fetchMembers();

    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedRoomId, userId]);

  if (!isOpen) return null;

  const toggleParticipant = (memberId) => {
    setSelectedParticipants((current) =>
      current.includes(String(memberId))
        ? current.filter((id) => id !== String(memberId))
        : [...current, String(memberId)]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!Number.isInteger(userId) || userId <= 0) {
      toast.error("Your session is invalid. Please sign in again.");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter an expense title.");
      return;
    }

    if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    const selectedRoom = rooms.find(
      (room) => String(room.id) === selectedRoomId
    );

    if (!selectedRoom) {
      toast.error("Please select a room.");
      return;
    }

    if (!selectedParticipants.length) {
      toast.error("Select at least one participant.");
      return;
    }

    if (!selectedParticipants.includes(String(userId))) {
      toast.error("The person who paid must be included in the split.");
      return;
    }

    const participants = selectedParticipants.map((id) => {
      const participant = { user_id: Number(id) };

      if (splitMethod !== "EQUAL") {
        participant.value = participantValues[id] || "";
      }

      return participant;
    });

    if (
      splitMethod !== "EQUAL" &&
      participants.some(
        (participant) =>
          !participant.value || Number(participant.value) <= 0
      )
    ) {
      toast.error("Enter a valid split value for every selected member.");
      return;
    }

    if (splitMethod === "PERCENTAGE") {
      const totalPercentage = participants.reduce(
        (sum, participant) => sum + Number(participant.value),
        0
      );

      if (Math.abs(totalPercentage - 100) > 0.0001) {
        toast.error("Participant percentages must total 100%.");
        return;
      }
    }

    if (splitMethod === "EXACT") {
      const exactTotal = participants.reduce(
        (sum, participant) => sum + Number(participant.value),
        0
      );

      if (Math.abs(exactTotal - Number(amount)) > 0.001) {
        toast.error("Exact split amounts must equal the expense total.");
        return;
      }
    }

    if (requestApproval) {
      if (!requestedFrom || Number(requestedFrom) === userId) {
        toast.error("Choose another room member to approve this expense.");
        return;
      }
    }

    const payload = {
      title: title.trim(),
      total_amount: Number(amount).toFixed(2),
      expense_date: new Date().toISOString().slice(0, 10),
      split_method: splitMethod,
      paid_by: userId,
      participants,
      currency: selectedRoom.defaultCurrency || "INR",
      notes: `Category: ${category}`,
      request_approval: requestApproval,
      ...(requestApproval
        ? { requested_from: Number(requestedFrom) }
        : {}),
    };

    try {
      setIsSubmitting(true);

      await createExpense(selectedRoomId, payload);

      toast.success(
        requestApproval
          ? "Expense submitted for approval."
          : "Expense added successfully!"
      );

      setTitle("");
      setAmount("");
      setCategory("Meals");
      setSplitMethod("EQUAL");
      setRequestApproval(false);
      setParticipantValues({});

      if (onCreated) await onCreated();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to add expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const otherMembers = roomMembers.filter(
    (member) => Number(member.id) !== userId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#00C4A7]">
              <Receipt className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900">
              Add Expense
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              Select Room
            </label>
            <select
              value={selectedRoomId}
              onChange={(event) => setSelectedRoomId(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#00C4A7] focus:ring-2 focus:ring-teal-100"
              required
            >
              <option value="">Choose a room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              Expense Title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Dinner, Hotel, Groceries"
              className="w-full rounded-2xl border border-gray-200 px-3.5 py-3 text-sm outline-none transition focus:border-[#00C4A7] focus:ring-2 focus:ring-teal-100"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              Total Amount (₹)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="w-full rounded-2xl border border-gray-200 px-3.5 py-3 text-base font-bold outline-none transition focus:border-[#00C4A7] focus:ring-2 focus:ring-teal-100"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-500">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setCategory(item.label)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${
                    category === item.label
                      ? "border-[#00C4A7] bg-teal-50 text-teal-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:border-teal-200 hover:bg-gray-50"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-gray-200 p-4">
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">
              Split Method
            </label>

            <div className="relative grid grid-cols-3 rounded-xl bg-gray-100 p-1">
              <div
                className="absolute bottom-1 left-1 top-1 w-[calc(33.333%-2.67px)] rounded-lg bg-white shadow-sm transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(${activeMethodIndex * 100}%)`,
                }}
              />

              {SPLIT_METHODS.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => {
                    setSplitMethod(method.value);
                    setParticipantValues({});
                  }}
                  className={`relative z-10 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors ${
                    splitMethod === method.value
                      ? "text-[#009E87]"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>

            <label className="block text-xs font-bold text-gray-500">
              Split Between
            </label>

            <div className="space-y-2">
              {roomMembers.map((member) => {
                const id = String(member.id);
                const checked = selectedParticipants.includes(id);

                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 rounded-xl bg-gray-50 p-2.5"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleParticipant(id)}
                      className="h-4 w-4 accent-[#00C4A7]"
                    />

                    <span className="flex-1 text-xs font-semibold text-gray-700">
                      {member.name || member.username || `Member ${id}`}
                      {Number(id) === userId ? " (You)" : ""}
                    </span>

                    {checked && splitMethod !== "EQUAL" && (
                      <input
                        type="number"
                        min="0.0001"
                        step={splitMethod === "EXACT" ? "0.01" : "0.0001"}
                        value={participantValues[id] || ""}
                        onChange={(event) =>
                          setParticipantValues((current) => ({
                            ...current,
                            [id]: event.target.value,
                          }))
                        }
                        placeholder={
                          splitMethod === "EXACT"
                            ? "₹ amount"
                            : "%"
                        }
                        className="w-24 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#00C4A7]"
                      />
                    )}
                  </div>
                );
              })}

              {!roomMembers.length && (
                <p className="text-xs text-amber-600">
                  No room members found. Please select a room again.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={requestApproval}
                onChange={(event) => setRequestApproval(event.target.checked)}
                className="h-3.5 w-3.5 shrink-0 accent-[#00C4A7]"
              />
              Request approval for this expense
            </label>

            {requestApproval && (
              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                  Request approval from
                </label>
                <select
                  value={requestedFrom}
                  onChange={(event) => setRequestedFrom(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-[#00C4A7]"
                  required
                >
                  <option value="">Choose a member</option>
                  {otherMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name || member.username || `Member ${member.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !rooms.length ||
              !roomMembers.length ||
              !selectedRoomId
            }
            className="w-full rounded-2xl bg-[#00C4A7] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#00C4A7]/20 transition hover:bg-[#00B096] disabled:opacity-50"
          >
            {isSubmitting
              ? "Submitting..."
              : requestApproval
              ? "Submit for Approval"
              : "Create Expense"}
          </button>
        </form>
      </div>
    </div>
  );
}
