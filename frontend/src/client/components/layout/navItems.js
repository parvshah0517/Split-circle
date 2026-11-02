import { Activity, ArrowLeftRight, LayoutDashboard, Receipt, Scale, User, Users } from "lucide-react";

export const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/groups", label: "My Groups", icon: Users },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/balances", label: "Balances", icon: Scale },
  { to: "/settlements", label: "Settlements", icon: ArrowLeftRight },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/profile", label: "Profile", icon: User },
];
