import {
  ClipboardCheck,
  CreditCard,
  Home,
  PieChart,
  User,
} from "lucide-react";

export const navItems = [
  { to: "/", label: "HOME", icon: Home, end: true },
  { to: "/position", label: "ANALYTICS", icon: PieChart },
  { to: "/rooms", label: "ROOMS", icon: CreditCard },
  { to: "/approvals", label: "APPROVALS", icon: ClipboardCheck },
  { to: "/account", label: "PROFILE", icon: User },
];