import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LogOut, Phone, User, ShieldCheck, AtSign } from "lucide-react";

import Avatar from "../components/common/Avatar";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || user?.username || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const username = user?.username || user?.id || "user";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();

    if (!trimmedName) {
      toast.error("Name cannot be empty.");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateProfile({
        name: trimmedName,
        mobile: trimmedMobile,
      });
      toast.success("Profile & mobile number updated!");
    } catch (error) {
      toast.error(error?.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    toast.info("Signed out successfully.");
  };

  return (
    <div className="mx-auto w-full max-w-[440px] space-y-4 pb-28 pt-2">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-black tracking-tight text-gray-900">
            Account & Profile
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Manage your username identity and contact details
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#FEF08A] shadow-xs">
          <Avatar name={name || username} size="xl" shape="squircle" className="bg-transparent" />
        </div>

        <h2 className="mt-4 text-lg font-black text-gray-900">{name || username}</h2>
        <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-gray-500 font-mono">
          <AtSign className="h-3.5 w-3.5 text-[#00C4A7]" />
          <span>{username}</span>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-[#009680]">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Active Identity</span>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="mt-6 text-left space-y-4">
          {/* Unique Username Display */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Username ID (Used across rooms)
            </label>
            <div className="relative">
              <input
                type="text"
                value={`@${username}`}
                disabled
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm font-bold text-gray-600 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-[10px] text-gray-400">
              Only one unique username is used to identify you in groups and rooms.
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210 or +1 (555) 019-2834"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
              />
            </div>
            <p className="mt-1 text-[10px] text-gray-400">
              Your mobile number for room invitations and settlement reminders.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 rounded-2xl bg-[#00C4A7] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#00C4A7]/20 hover:bg-[#00B096] active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Update Profile"}
          </button>
        </form>

        {/* Switch / Sign Out Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#18191E] py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-black active:scale-[0.98] transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Switch User / Sign Out</span>
        </button>
      </div>
    </div>
  );
}
