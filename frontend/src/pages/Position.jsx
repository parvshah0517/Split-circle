import { useEffect, useState } from "react";
import { Coffee, Disc, RotateCcw, Scale, Receipt, ArrowRight, Utensils, ShoppingBag } from "lucide-react";
import Card from "../components/common/Card";
import Avatar from "../components/common/Avatar";
import SettlePaymentModal from "../components/settlements/SettlePaymentModal";
import { getMyRooms } from "../services/groupService";
import { getRoomExpenses } from "../services/expenseService";
import { useAuth } from "../hooks/useAuth";
import { DribbbleIcon, SpotifyIcon } from "../components/common/BrandIcons";

export default function Position() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("balances");
  const [rooms, setRooms] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [settleRecipient, setSettleRecipient] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const myRooms = await getMyRooms();
        setRooms(myRooms);

        const expResults = await Promise.allSettled(
          myRooms.map(async (r) => {
            const list = await getRoomExpenses(r.id);
            return list.map((e) => ({ ...e, roomName: r.name }));
          })
        );

        const all = [];
        expResults.forEach((res) => {
          if (res.status === "fulfilled") all.push(...res.value);
        });
        setExpenses(all);
      } catch (err) {
        console.error("Position load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const balances = [
    {
      id: "1",
      name: "Billie Eilish",
      role: "Roommate",
      amount: "736.29",
      type: "owe",
      tone: "bg-[#D9F99D]",
    },
    {
      id: "2",
      name: "Taylor Swift",
      role: "Trip flatmate",
      amount: "1280.00",
      type: "owe",
      tone: "bg-[#FEF08A]",
    },
    {
      id: "3",
      name: "Dua Lipa",
      role: "Colleague",
      amount: "420.50",
      type: "owed",
      tone: "bg-[#CCFBF1]",
    },
    {
      id: "4",
      name: "The Weeknd",
      role: "Flatmate",
      amount: "89.00",
      type: "owed",
      tone: "bg-[#FED7AA]",
    },
  ];

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

        {/* Tab Switcher */}
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

      {activeTab === "balances" ? (
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                You Owe
              </span>
              <p className="mt-2 text-3xl font-black text-gray-900">
                $ 2,016.29
              </p>
              <p className="text-xs text-amber-600 font-semibold mt-1">
                2 pending settlements
              </p>
            </div>

            <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                You Owed
              </span>
              <p className="mt-2 text-3xl font-black text-[#00C4A7]">
                $ 509.50
              </p>
              <p className="text-xs text-teal-600 font-semibold mt-1">
                2 pending collects
              </p>
            </div>
          </div>

          {/* Balances List */}
          <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              People & Split Balances
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {balances.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone} shadow-2xs`}>
                      <Avatar name={item.name} size="sm" shape="squircle" className="bg-transparent" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400 font-medium">{item.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">
                        ${item.amount}
                      </p>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          item.type === "owe" ? "text-amber-600" : "text-[#00C4A7]"
                        }`}
                      >
                        {item.type === "owe" ? "You owe" : "Owes you"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSettleRecipient({ name: item.name, amount: item.amount })}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 hover:bg-[#18191E] hover:text-white transition-colors text-gray-600 shadow-2xs"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Expenses List */
        <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Recent Expense Breakdown
          </h2>

          <div className="space-y-3.5">
            {[
              { id: "e1", title: "Coffee", sub: "Today · 11:29AM", amount: "- $10.12", icon: Coffee },
              { id: "e2", title: "Dribbble Subscription", sub: "Today · 10:29AM", amount: "- $180.00", icon: DribbbleIcon },
              { id: "e3", title: "Spotify Family", sub: "Today · 09:21AM", amount: "- $29.00", icon: SpotifyIcon },
              { id: "e4", title: "Team Lunch", sub: "Yesterday · 01:15PM", amount: "- $64.50", icon: Utensils },
              { id: "e5", title: "Office Supplies", sub: "Yesterday · 11:00AM", amount: "- $42.00", icon: ShoppingBag },
            ].map((exp) => {
              const Icon = exp.icon;
              return (
                <div key={exp.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-100 text-gray-800 shadow-2xs">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{exp.title}</p>
                      <p className="text-xs text-gray-400">{exp.sub}</p>
                    </div>
                  </div>
                  <span className="text-base font-black text-gray-900">
                    {exp.amount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {settleRecipient && (
        <SettlePaymentModal
          isOpen={Boolean(settleRecipient)}
          onClose={() => setSettleRecipient(null)}
          recipient={settleRecipient}
        />
      )}
    </div>
  );
}
