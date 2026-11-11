
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Sparkles } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../hooks/useAuth";

const demoUsers = ["alex_d", "maya_d", "rohan_d", "priya_d", "sam_d"];

export default function Login() {
  const { login, sessionExpired } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [mpin, setMpin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedUsername = username.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
      setError("Username must be 3-30 characters using letters, numbers, and underscores.");
      return;
    }

    if (!/^\d{4}$/.test(mpin)) {
      setError("MPIN must contain exactly four digits.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ username: normalizedUsername, mpin });
      toast.success("Welcome to SplitCircle!");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome to SplitCircle"
      subtitle="Sign in using your username and four-digit MPIN."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {sessionExpired && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-700">
            Your session has expired. Please sign in again.
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
              setError("");
            }}
            placeholder="e.g. alex_d"
            autoComplete="username"
            maxLength={30}
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Four-digit MPIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            maxLength={4}
            value={mpin}
            onChange={(e) => {
              setMpin(e.target.value.replace(/\D/g, "").slice(0, 4));
              setError("");
            }}
            placeholder="Enter your MPIN"
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base font-semibold tracking-[0.5em] text-gray-900 placeholder:tracking-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
          />
        </div>

        <div>
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Demo accounts — MPIN: 1234
          </span>
          <div className="flex flex-wrap gap-1.5">
            {demoUsers.map((demoUser) => (
              <button
                key={demoUser}
                type="button"
                onClick={() => {
                  setUsername(demoUser);
                  setMpin("1234");
                  setError("");
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-transparent bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-[#009680]"
              >
                <Sparkles className="h-3 w-3 text-[#00C4A7]" />
                {demoUser}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00C4A7] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#00C4A7]/25 transition-all hover:bg-[#00B096] active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in to SplitCircle"}
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </button>

        <p className="pt-2 text-center text-sm text-gray-500">
          New to SplitCircle?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#009680] hover:text-[#007f6d]"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
