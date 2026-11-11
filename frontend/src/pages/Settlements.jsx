
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";
import { getMyRooms } from "../services/groupService";
import {
  getRoomBalances,
  getRoomSettlements,
  createSettlement,
} from "../services/settlementService";

function formatMoney(amountMinor, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(Number(amountMinor || 0) / 100);
  } catch {
    return `${currency} ${(Number(amountMinor || 0) / 100).toFixed(2)}`;
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Settlements() {
  const { user } = useContext(AuthContext);
  const userId = Number(user?.id);

  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [members, setMembers] = useState([]);
  const [balances, setBalances] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedBalance, setSelectedBalance] = useState(null);

  const [amount, setAmount] = useState("");
  const [settledAt, setSettledAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadRooms = useCallback(async () => {
    try {
      const result = await getMyRooms();
      setRooms(result);

      if (result.length) {
        setRoomId((current) => current || result[0].id);
      }
    } catch (error) {
      toast.error(error.message || "Could not load rooms.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoomData = useCallback(async () => {
    if (!roomId) return;

    try {
      const [balanceData, settlementData] = await Promise.all([
        getRoomBalances(roomId),
        getRoomSettlements(roomId),
      ]);

      setMembers(balanceData.members || []);
      setBalances(balanceData.balances || []);
      setHistory(settlementData || []);
    } catch (error) {
      toast.error(error.message || "Could not load settlements.");
    }
  }, [roomId]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    loadRoomData();
  }, [loadRoomData]);

  const memberMap = useMemo(
    () => new Map(members.map((member) => [Number(member.id), member])),
    [members]
  );

  const myBalances = balances.filter(
    (balance) =>
      Number(balance.from_user_id) === userId ||
      Number(balance.to_user_id) === userId
  );

  const openSettlement = (balance) => {
    setSelectedBalance(balance);
    setAmount((Number(balance.amount_minor) / 100).toFixed(2));
    setSettledAt(new Date().toISOString().slice(0, 10));
    setNotes("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedBalance || !amount || Number(amount) <= 0) {
      toast.error("Enter a valid settlement amount.");
      return;
    }

    const payerId = Number(selectedBalance.from_user_id);
    const receiverId = Number(selectedBalance.to_user_id);

    setSaving(true);

    try {
      await createSettlement(roomId, {
        payer_id: payerId,
        receiver_id: receiverId,
        amount,
        currency: selectedBalance.currency,
        settled_at: settledAt,
        notes,
      });

      toast.success("Settlement recorded successfully.");
      setSelectedBalance(null);
      await loadRoomData();
    } catch (error) {
      toast.error(error.message || "Could not record settlement.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading settlements...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900">
          Settlements
        </h1>
        <p className="mt-1 text-xs text-gray-400">
          View outstanding balances and record payments between room members.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <label className="mb-2 block text-xs font-bold text-gray-500">
          SELECT ROOM
        </label>

        <select
          value={roomId}
          onChange={(event) => setRoomId(event.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none"
        >
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </div>

      {!rooms.length ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500">
          You haven't joined any rooms yet.
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-gray-800">
              Your outstanding balances
            </h2>

            {!myBalances.length ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center">
                <p className="text-sm font-semibold text-gray-800">
                  You're all settled up!
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  No outstanding balances in this room.
                </p>
              </div>
            ) : (
              myBalances.map((balance) => {
                const iOwe = Number(balance.from_user_id) === userId;
                const otherId = iOwe
                  ? Number(balance.to_user_id)
                  : Number(balance.from_user_id);
                const member = memberMap.get(otherId);

                return (
                  <div
                    key={`${balance.from_user_id}-${balance.to_user_id}-${balance.currency}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4"
                  >
                    <div>
                      <p className="font-bold text-gray-900">
                        {member?.name || member?.username || "Room member"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        @{member?.username || "member"}
                      </p>
                      <p className={`mt-2 text-xs font-semibold ${
                        iOwe ? "text-red-500" : "text-emerald-600"
                      }`}>
                        {iOwe ? "You owe" : "Owes you"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-black text-gray-900">
                        {formatMoney(balance.amount_minor, balance.currency)}
                      </p>
                      <button
                        type="button"
                        onClick={() => openSettlement(balance)}
                        className="mt-2 rounded-xl bg-[#18191E] px-4 py-2 text-xs font-bold text-white hover:bg-black"
                      >
                        Record payment
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-gray-800">
              Settlement history
            </h2>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              {!history.length ? (
                <p className="p-6 text-center text-sm text-gray-400">
                  No settlements recorded yet.
                </p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 border-b border-gray-100 p-4 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {item.payer_username || item.payer_name}
                        {" → "}
                        {item.receiver_username || item.receiver_name}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(item.settled_at)}
                        {item.notes ? ` · ${item.notes}` : ""}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {formatMoney(item.amount, item.currency)}
                      </p>
                      <p className="text-[10px] font-semibold text-emerald-600">
                        {item.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}

      {selectedBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Record settlement
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {selectedBalance.from_user_id === userId
                  ? `You pay ${memberMap.get(Number(selectedBalance.to_user_id))?.name || "member"}`
                  : `${memberMap.get(Number(selectedBalance.from_user_id))?.name || "Member"} pays you`}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Outstanding amount</p>
              <p className="mt-1 text-lg font-black text-gray-900">
                {formatMoney(selectedBalance.amount_minor, selectedBalance.currency)}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600">
                PAYMENT AMOUNT ({selectedBalance.currency})
              </label>
              <input
                type="number"
                min="0.01"
                max={(selectedBalance.amount_minor / 100).toFixed(2)}
                step="0.01"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#00C4A7]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600">
                SETTLEMENT DATE
              </label>
              <input
                type="date"
                required
                value={settledAt}
                onChange={(event) => setSettledAt(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600">
                NOTES (OPTIONAL)
              </label>
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={1000}
                placeholder="e.g. Paid through UPI"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBalance(null)}
                disabled={saving}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-xs font-bold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-[#00C4A7] py-3 text-xs font-bold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Confirm payment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
