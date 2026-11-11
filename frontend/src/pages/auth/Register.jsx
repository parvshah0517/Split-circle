
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../hooks/useAuth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: "",
    mobile: "",
    username: "",
    mpin: "",
    confirmMpin: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "username") {
      nextValue = value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30);
    }

    if (name === "mpin" || name === "confirmMpin") {
      nextValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setValues((previous) => ({ ...previous, [name]: nextValue }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const { name, mobile, username, mpin, confirmMpin } = values;

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      setError("Username must be 3-30 characters using letters, numbers, and underscores.");
      return;
    }

    if (!/^\+[1-9]\d{7,14}$/.test(mobile.trim())) {
      setError("Enter a valid mobile number with country code, e.g. +919876543210.");
      return;
    }

    if (!/^\d{4}$/.test(mpin)) {
      setError("MPIN must contain exactly four digits.");
      return;
    }

    if (mpin !== confirmMpin) {
      setError("MPIN and confirmation do not match.");
      return;
    }

    try {
      setIsSubmitting(true);

      await register({
        name: name.trim(),
        mobile: mobile.trim(),
        username,
        mpin,
      });

      toast.success("Your SplitCircle account has been created!");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your SplitCircle account in a few steps."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Full name
          </label>
          <input
            name="name"
            type="text"
            autoComplete="name"
            maxLength={100}
            value={values.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Mobile number
          </label>
          <input
            name="mobile"
            type="tel"
            autoComplete="tel"
            value={values.mobile}
            onChange={handleChange}
            placeholder="+919876543210"
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
          />
          <p className="mt-1 text-[11px] text-gray-400">
            Include your country code.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Create username
          </label>
          <input
            name="username"
            type="text"
            autoComplete="username"
            maxLength={30}
            value={values.username}
            onChange={handleChange}
            placeholder="e.g. parv_d1"
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
          />
          <p className="mt-1 text-[11px] text-gray-400">
            3-30 characters. Letters, numbers, and underscores.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Set four-digit MPIN
          </label>
          <input
            name="mpin"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={4}
            value={values.mpin}
            onChange={handleChange}
            placeholder="Create your MPIN"
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base tracking-[0.5em] text-gray-900 placeholder:tracking-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Confirm MPIN
          </label>
          <input
            name="confirmMpin"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={4}
            value={values.confirmMpin}
            onChange={handleChange}
            placeholder="Re-enter your MPIN"
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base tracking-[0.5em] text-gray-900 placeholder:tracking-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00C4A7] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#00C4A7]/25 transition-all hover:bg-[#00B096] active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </button>

        <p className="pt-2 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#009680] hover:text-[#007f6d]"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
