import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, ArrowRight, UserCheck } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { loginWithUsername } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const quickUsers = ["alex24", "parv007", "billie01", "taylor13"];

  const handleEnter = async (val) => {
    const targetUsername = (val || username).trim();
    setError("");

    if (!targetUsername) {
      setError("Please enter a username.");
      return;
    }

    // Must consist of string of name and number
    const hasLetter = /[a-zA-Z]/.test(targetUsername);
    const hasNumber = /[0-9]/.test(targetUsername);

    if (!hasLetter || !hasNumber) {
      setError("Username must contain both letters and numbers (e.g. alex24, user101).");
      return;
    }

    try {
      setIsSubmitting(true);
      await loginWithUsername(targetUsername);
      toast.success(`Welcome to SplitCircle, ${targetUsername}!`);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to enter. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleEnter(username);
  };

  return (
    <AuthLayout
      title="Welcome to SplitCircle"
      subtitle="Enter a username (name + number) to start presenting and exploring."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Your Username
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. alex24, parv007"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                setError("");
              }}
              autoFocus
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4A7] transition-all"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-gray-400">
            Consists of name & number. This unique username will identify you across all rooms and splits.
          </p>
        </div>

        {/* Quick Demo Identities for Presentation */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
            Or select a quick demo user:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickUsers.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => {
                  setUsername(u);
                  handleEnter(u);
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-gray-100 hover:bg-teal-50 hover:text-[#009680] hover:border-teal-300 border border-transparent px-3 py-1.5 text-xs font-bold text-gray-700 transition-all"
              >
                <Sparkles className="h-3 w-3 text-[#00C4A7]" />
                <span>{u}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[#00C4A7] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#00C4A7]/25 hover:bg-[#00B096] active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {isSubmitting ? (
            <span>Entering...</span>
          ) : (
            <>
              <span>Enter SplitCircle</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
