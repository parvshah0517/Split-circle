
import {
  Activity,
  ArrowLeftRight,
  LayoutDashboard,
  Scale,
  UserRound,
  Users,
} from "lucide-react";

export const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/rooms", label: "My Rooms", icon: Users },
  { to: "/position", label: "Position", icon: Scale },
  { to: "/settlements", label: "Settlements", icon: ArrowLeftRight },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/account", label: "Account Information", icon: UserRound },
];
