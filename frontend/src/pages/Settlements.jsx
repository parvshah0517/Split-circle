import { useState } from "react";
import SettlementHistoryView from "../components/settlements/SettlementHistoryView";
import SettlePaymentModal from "../components/settlements/SettlePaymentModal";

export default function Settlements() {
  const [personIndex, setPersonIndex] = useState(0);
  const [showKeypad, setShowKeypad] = useState(false);

  const people = [
    {
      name: "Billie Eilish",
      balanceText: "You Owe her $736.29",
      amount: "736.29",
    },
    {
      name: "Taylor Swift",
      balanceText: "You Owe her $1280.00",
      amount: "1280.00",
    },
    {
      name: "Dua Lipa",
      balanceText: "She Owes you $420.50",
      amount: "420.50",
    },
    {
      name: "The Weeknd",
      balanceText: "He Owes you $89.00",
      amount: "89.00",
    },
  ];

  const currentPerson = people[personIndex];

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      {/* Switcher tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Settlement Breakdown
          </h1>
          <p className="text-xs text-gray-400">
            Select a member circle to view transaction history and settle
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
          {people.map((p, idx) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setPersonIndex(idx)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                personIndex === idx
                  ? "bg-[#18191E] text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              {p.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <SettlementHistoryView
        person={currentPerson}
      />

      <SettlePaymentModal
        isOpen={showKeypad}
        onClose={() => setShowKeypad(false)}
        recipient={currentPerson}
      />
    </div>
  );
}
