import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Home,
  PieChart,
  User,
  ArrowLeftRight,
  Activity as ActivityIcon,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import Logo from "../common/Logo";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

const desktopNavItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/rooms", label: "Rooms", icon: CreditCard },
  { to: "/position", label: "Position", icon: PieChart },
  { to: "/activity", label: "Activity", icon: ActivityIcon },
  { to: "/settlements", label: "Settlements", icon: ArrowLeftRight },
];

const mobileNavItems = [
  { to: "/", label: "HOME", icon: Home },
  { to: "/position", label: "ANALYTICS", icon: PieChart },
  { to: "/rooms", label: "ROOMS", icon: CreditCard },
  { to: "/account", label: "PROFILE", icon: User },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTabActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const username = user?.username || user?.name || "user";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-gray-900 flex flex-col justify-between selection:bg-[#00C4A7] selection:text-white">
      {/* Top Application Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Clean SPLITCIRCLE Logo & Desktop Navigation */}
          <div className="flex items-center gap-6 shrink-0">
            <Link to="/" className="inline-flex items-center shrink-0">
              <Logo />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 shrink-0 whitespace-nowrap">
              {desktopNavItems.map(({ to, label, icon: Icon }) => {
                const active = isTabActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all",
                      active
                        ? "bg-[#18191E] text-white shadow-xs"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/70"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* User Profile Pill */}
            <Link
              to="/account"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200/80 bg-white hover:bg-gray-50 p-1 sm:px-2.5 sm:py-1 transition-colors whitespace-nowrap shrink-0"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FEF08A] text-[#854D0E] font-bold text-xs shrink-0">
                {username.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left whitespace-nowrap">
                <p className="text-xs font-bold text-gray-900 leading-tight whitespace-nowrap">
                  @{username}
                </p>
                <p className="text-[10px] text-gray-400 leading-tight whitespace-nowrap">
                  {user?.name || "Active"}
                </p>
              </div>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 shrink-0"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2">
            {desktopNavItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                  isTabActive(to)
                    ? "bg-[#18191E] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 whitespace-nowrap"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Responsive Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Floating Bottom Navigation Bar (For Mobile screens only) */}
      <nav
        aria-label="Bottom Navigation"
        className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-[390px] rounded-[30px] bg-white/95 backdrop-blur-md px-3 py-2 shadow-dock border border-gray-100/80"
      >
        <div className="flex items-center justify-around">
          {mobileNavItems.map(({ to, label, icon: Icon }) => {
            const active = isTabActive(to);
            return (
              <Link
                key={to}
                to={to}
                className="group flex flex-col items-center gap-1 transition-all active:scale-95 whitespace-nowrap"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                    active
                      ? "bg-[#18191E] text-white shadow-xs"
                      : "text-gray-400 group-hover:text-gray-700"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-extrabold tracking-wider transition-colors whitespace-nowrap",
                    active ? "text-gray-900" : "text-gray-400"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
