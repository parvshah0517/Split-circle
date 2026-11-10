import { useState } from "react";
import { ArrowLeft, Coffee, Disc, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import Avatar from "../common/Avatar";
import SettlePaymentModal from "./SettlePaymentModal";
import { DribbbleIcon, SpotifyIcon } from "../common/BrandIcons";

export default function SettlementHistoryView({
  person = {
    name: "Billie Eilish",
    balanceText: "You Owe her $736.29",
    amount: "736.29",
  },
  onBack,
}) {
  const [showSettleModal, setShowSettleModal] = useState(false);

  const handleRequest = () => {
    toast.success(`Payment request sent to ${person.name}!`);
  };

  const todayTransactions = [
    {
      id: "1",
      title: "Coffee",
      time: "30 May - 11:29AM",
      amount: "- $10.12",
      icon: Coffee,
      isPositive: false,
    },
    {
      id: "2",
      title: "Dribbble",
      time: "30 May - 10:29AM",
      amount: "- $180.00",
      icon: DribbbleIcon,
      isPositive: false,
    },
    {
      id: "3",
      title: "Spotify",
      time: "30 May - 09:21AM",
      amount: "- $29.00",
      icon: SpotifyIcon,
      isPositive: false,
    },
  ];

  const yesterdayTransactions = [
    {
      id: "4",
      title: "Refund",
      time: "30 May - 09:21AM",
      amount: "+ $29.00",
      icon: RotateCcw,
      isPositive: true,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-xl rounded-[36px] bg-white p-6 sm:p-8 shadow-soft border border-gray-100 flex flex-col min-h-[640px]">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <div className="w-10" />
      </div>

      {/* Avatar & Subtitle */}
      <div className="mt-2 flex flex-col items-center text-center">
        <div className="flex h-18 w-18 items-center justify-center rounded-[24px] bg-[#D9F99D] shadow-xs">
          <Avatar name={person.name} size="lg" shape="squircle" className="bg-transparent" />
        </div>

        <h1 className="mt-4 text-xl font-bold tracking-tight text-gray-900">
          {person.name}
        </h1>

        <p className="mt-1 text-xs font-medium text-gray-500">
          {person.balanceText || "You Owe her $736.29"}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex w-full gap-3 px-2">
          <button
            type="button"
            onClick={() => setShowSettleModal(true)}
            className="flex-1 rounded-2xl bg-[#18191E] py-3.5 text-xs font-bold tracking-wider text-white hover:bg-black active:scale-[0.98] transition-all uppercase shadow-xs"
          >
            Settle
          </button>
          <button
            type="button"
            onClick={handleRequest}
            className="flex-1 rounded-2xl border border-gray-200 bg-white py-3.5 text-xs font-bold tracking-wider text-gray-800 hover:bg-gray-50 active:scale-[0.98] transition-all uppercase shadow-2xs"
          >
            Request
          </button>
        </div>
      </div>

      {/* Transactions Container */}
      <div className="mt-8 flex-1 rounded-[28px] bg-[#F9FAFB] p-4.5 border border-gray-100/80">
        {/* Today */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400">Today</h3>
          <div className="mt-3 space-y-3.5">
            {todayTransactions.map((tx) => {
              const Icon = tx.icon;
              return (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-2xs border border-gray-100/60 text-gray-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{tx.title}</p>
                      <p className="text-[11px] text-gray-400">{tx.time}</p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-gray-900 tracking-tight">
                    {tx.amount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Yesterday */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-gray-400">Yesterday</h3>
          <div className="mt-3 space-y-3.5">
            {yesterdayTransactions.map((tx) => {
              const Icon = tx.icon;
              return (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-2xs border border-gray-100/60 text-gray-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{tx.title}</p>
                      <p className="text-[11px] text-gray-400">{tx.time}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center rounded-xl bg-[#00C4A7] px-3 py-1 text-xs font-bold text-white shadow-xs">
                    {tx.amount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SettlePaymentModal
        isOpen={showSettleModal}
        onClose={() => setShowSettleModal(false)}
        recipient={{ name: person.name, amount: person.amount || "736.29" }}
      />
    </div>
  );
}
