import { useCallback, useEffect, useState } from "react";
import { Check, Clock, RefreshCw, X } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import {
  approveExpense,
  getPendingApprovals,
  rejectExpense,
} from "../services/approvalService";
import { formatMoney } from "../utils/money";

export default function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPendingApprovals();
      setApprovals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load approval requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  async function handleApprove(id) {
    setProcessingId(id);
    setError("");

    try {
      await approveExpense(id);
      setApprovals((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (err) {
      setError(err.message || "Unable to approve this expense.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id) {
    setProcessingId(id);
    setError("");

    try {
      await rejectExpense(id, rejectionReason.trim());
      setApprovals((current) =>
        current.filter((item) => item.id !== id)
      );
      setRejectingId(null);
      setRejectionReason("");
    } catch (err) {
      setError(err.message || "Unable to reject this expense.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <PageHeader
        title="Approvals"
        description="Review expenses that other room members have asked you to approve."
        actions={
          <button
            type="button"
            onClick={loadApprovals}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
          Loading approval requests...
        </div>
      ) : approvals.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Clock className="h-6 w-6 text-gray-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            You're all caught up
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any pending expense approvals.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      Pending approval
                    </span>
                    <span className="text-xs text-gray-400">
                      {item.room_name}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-gray-900">
                    {item.expense_title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Requested by{" "}
                    <span className="font-semibold text-gray-700">
                      {item.requested_by_name}
                    </span>
                  </p>
                </div>

                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-xl font-black text-gray-900">
                    {formatMoney(
                      Number(item.total_amount),
                      item.currency || "INR"
                    )}
                  </p>
                  <p className="text-xs text-gray-400">Expense amount</p>
                </div>
              </div>

              {rejectingId === item.id ? (
                <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Rejection reason (optional)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(event) =>
                      setRejectionReason(event.target.value)
                    }
                    maxLength={500}
                    rows={2}
                    placeholder="Tell them why you're rejecting this expense..."
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-gray-400"
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingId(null);
                        setRejectionReason("");
                      }}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={processingId === item.id}
                      onClick={() => handleReject(item.id)}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Confirm rejection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    disabled={processingId === item.id}
                    onClick={() => setRejectingId(item.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>

                  <button
                    type="button"
                    disabled={processingId === item.id}
                    onClick={() => handleApprove(item.id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#18191E] px-4 py-2 text-sm font-bold text-white hover:bg-black disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    {processingId === item.id ? "Processing..." : "Approve"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}