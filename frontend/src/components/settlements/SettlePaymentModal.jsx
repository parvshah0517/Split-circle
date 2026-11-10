import { useState } from "react";
import { ArrowLeft, Minus, Plus, Delete, Check } from "lucide-react";
import { toast } from "sonner";
import Avatar from "../common/Avatar";

export default function SettlePaymentModal({
  isOpen,
  onClose,
  recipient = { name: "Taylor Swift", amount: "1280.00" },
  onSuccess,
}) {
  const [currentRecipient, setCurrentRecipient] = useState(recipient);
  const [amountStr, setAmountStr] = useState(recipient.amount ? String(recipient.amount) : "1280.00");
  const [isSettling, setIsSettling] = useState(false);
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);

  if (!isOpen) return null;

  const handleKeyClick = (key) => {
    if (key === "backspace") {
      setAmountStr((prev) => {
        if (prev.length <= 1) return "0";
        return prev.slice(0, -1);
      });
      return;
    }

    if (key === ".") {
      if (!amountStr.includes(".")) {
        setAmountStr((prev) => prev + ".");
      }
      return;
    }

    setAmountStr((prev) => {
      if (prev === "0") return key;
      // limit decimal places to 2
      if (prev.includes(".")) {
        const parts = prev.split(".");
        if (parts[1] && parts[1].length >= 2) return prev;
      }
      if (prev.length >= 8) return prev;
      return prev + key;
    });
  };

  const handleStep = (delta) => {
    const num = Math.max(0, (parseFloat(amountStr) || 0) + delta);
    setAmountStr(num.toFixed(2));
  };

  const handleSettle = async () => {
    const amountNum = parseFloat(amountStr);
    if (!amountNum || amountNum <= 0) {
      toast.error("Please enter a valid settlement amount.");
      return;
    }

    setIsSettling(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSettling(false);
    toast.success(`Settled $${amountNum.toFixed(2)} with ${currentRecipient.name}!`);
    if (onSuccess) onSuccess({ recipient: currentRecipient, amount: amountNum });
    onClose();
  };

  const sampleRecipients = [
    { name: "Taylor Swift", amount: "1280.00" },
    { name: "Billie Eilish", amount: "736.29" },
    { name: "Dua Lipa", amount: "420.50" },
    { name: "The Weeknd", amount: "89.00" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[420px] rounded-[32px] bg-white p-6 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
            Settle Balance
          </span>
          <div className="w-10" />
        </div>

        {/* Recipient Section */}
        <div className="mt-2 flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#FEF08A] shadow-xs">
            <Avatar name={currentRecipient.name} size="md" shape="squircle" className="bg-transparent" />
          </div>

          <h2 className="mt-3 text-base font-bold text-gray-900">
            To: {currentRecipient.name}
          </h2>

          <button
            type="button"
            onClick={() => setShowRecipientPicker(!showRecipientPicker)}
            className="mt-1 text-xs font-semibold text-[#00C4A7] hover:text-[#00b096] transition-colors"
          >
            {showRecipientPicker ? "Close" : "Change"}
          </button>

          {showRecipientPicker && (
            <div className="mt-3 w-full rounded-2xl border border-gray-100 bg-gray-50/80 p-2 space-y-1">
              {sampleRecipients.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => {
                    setCurrentRecipient(r);
                    setAmountStr(r.amount);
                    setShowRecipientPicker(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-white transition-colors"
                >
                  <span>{r.name}</span>
                  <span className="text-gray-400">${r.amount}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stepper & Amount Display */}
        <div className="mt-6 text-center">
          <p className="text-xs font-medium text-gray-400">
            Type the Amount to be settled.
          </p>

          <div className="mt-3 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleStep(-50)}
              aria-label="Decrease amount"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors shadow-2xs"
            >
              <Minus className="h-4 w-4" />
            </button>

            <div className="min-w-[170px] text-center">
              <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                $ {parseFloat(amountStr || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleStep(50)}
              aria-label="Increase amount"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors shadow-2xs"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleSettle}
          disabled={isSettling}
          className="mt-6 w-full rounded-2xl bg-[#00C4A7] py-3.5 text-xs font-bold tracking-wider text-white shadow-lg shadow-[#00C4A7]/25 hover:bg-[#00B096] active:scale-[0.99] transition-all disabled:opacity-60 uppercase"
        >
          {isSettling ? "Settling..." : "Settle Payment"}
        </button>

        {/* Keypad Container */}
        <div className="mt-5 rounded-3xl bg-[#F4F5F7] p-3 shadow-inner">
          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKeyClick(k)}
                className="flex h-12 items-center justify-center rounded-2xl bg-white text-base font-bold text-gray-800 shadow-key hover:bg-gray-50 active:scale-95 transition-all"
              >
                {k}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKeyClick("backspace")}
              aria-label="Backspace"
              className="flex h-12 items-center justify-center rounded-2xl bg-white text-base font-bold text-gray-800 shadow-key hover:bg-gray-50 active:scale-95 transition-all"
            >
              <Delete className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

