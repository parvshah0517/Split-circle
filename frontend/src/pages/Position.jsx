
import { useState } from "react";
import { Receipt, Scale } from "lucide-react";
import Card from "../components/common/Card";

const tabs = [
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "balances", label: "Balances", icon: Scale },
];

export default function Position() {
  const [activeTab, setActiveTab] = useState("expenses");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Position
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your expenses and balances across your rooms.
        </p>
      </div>

      {/* Sliding tab switch */}
      <div className="relative grid w-full max-w-md grid-cols-2 rounded-xl bg-muted p-1">
        <div
          className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-transform duration-300 ease-in-out ${
            activeTab === "balances"
              ? "translate-x-full"
              : "translate-x-0"
          }`}
        />

        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            aria-pressed={activeTab === id}
            className={`relative z-10 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === id
                ? "text-brand-700"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Selected section */}
      <div key={activeTab} className="animate-in fade-in duration-200">
        {activeTab === "expenses" ? (
          <ComingSoonSection
            icon={Receipt}
            title="Expenses"
            description="Your room expenses will appear here. You'll be able to view, track and manage shared expenses across your rooms."
          />
        ) : (
          <ComingSoonSection
            icon={Scale}
            title="Balances"
            description="Your balances will appear here. You'll be able to see who owes you, whom you owe, and your overall position across rooms."
          />
        )}
      </div>
    </div>
  );
}

function ComingSoonSection({ icon: Icon, title, description }) {
  return (
    <Card className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon className="h-8 w-8" />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-foreground">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <span className="mt-5 rounded-full bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
        Coming soon
      </span>
    </Card>
  );
}
