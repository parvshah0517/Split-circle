import { useState } from "react";
import { Coffee, Disc, RotateCcw, Utensils, ShoppingBag, ArrowLeftRight } from "lucide-react";
import { DribbbleIcon, SpotifyIcon } from "../components/common/BrandIcons";

export default function Activity() {
  const [filter, setFilter] = useState("all");

  const activities = [
    {
      id: "1",
      title: "Coffee",
      time: "30 May - 11:29AM",
      amount: "- $10.12",
      icon: Coffee,
      type: "expense",
      section: "Today",
    },
    {
      id: "2",
      title: "Dribbble Subscription",
      time: "30 May - 10:29AM",
      amount: "- $180.00",
      icon: DribbbleIcon,
      type: "expense",
      section: "Today",
    },
    {
      id: "3",
      title: "Spotify Family",
      time: "30 May - 09:21AM",
      amount: "- $29.00",
      icon: SpotifyIcon,
      type: "expense",
      section: "Today",
    },
    {
      id: "4",
      title: "Refund from Roommate",
      time: "30 May - 09:21AM",
      amount: "+ $29.00",
      icon: RotateCcw,
      type: "refund",
      section: "Yesterday",
    },
    {
      id: "5",
      title: "Settlement with Billie Eilish",
      time: "29 May - 06:40PM",
      amount: "- $150.00",
      icon: ArrowLeftRight,
      type: "settle",
      section: "Yesterday",
    },
  ];

  const filtered = activities.filter((a) => {
    if (filter === "all") return true;
    return a.type === filter;
  });

  const todayList = filtered.filter((a) => a.section === "Today");
  const yesterdayList = filtered.filter((a) => a.section === "Yesterday");

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Activity Timeline
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-medium">
            Recent payments, settlements, and shared splits across all rooms
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none self-start sm:self-auto">
          {[
            { id: "all", label: "All Activity" },
            { id: "expense", label: "Expenses" },
            { id: "refund", label: "Refunds" },
            { id: "settle", label: "Settlements" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                filter === f.id
                  ? "bg-[#18191E] text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Card */}
      <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
        {todayList.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Today</h2>
            <div className="space-y-3.5">
              {todayList.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-2xs border border-gray-100 text-gray-800">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.time}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.amount}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {yesterdayList.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Yesterday</h2>
            <div className="space-y-3.5">
              {yesterdayList.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-2xs border border-gray-100 text-gray-800">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.time}</p>
                      </div>
                    </div>
                    {item.type === "refund" ? (
                      <span className="inline-flex items-center rounded-xl bg-[#00C4A7] px-3.5 py-1 text-xs font-bold text-white shadow-xs">
                        {item.amount}
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-gray-900">{item.amount}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
