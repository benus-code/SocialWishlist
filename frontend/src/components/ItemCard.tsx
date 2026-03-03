"use client";

import { useState, useEffect } from "react";
import { WishlistItem, Contribution, contributionApi } from "@/lib/api";
import { formatPrice, getStatusBadge } from "@/lib/utils";
import ProgressBar from "./ProgressBar";
import Toast from "./Toast";
import Link from "next/link";

interface ItemCardProps {
  item: WishlistItem;
  currency: string;
  token: string | null;
  isOwner: boolean;
  isArchived?: boolean;
  onUpdate?: () => void;
}

export default function ItemCard({ item, currency, token, isOwner, isArchived, onUpdate }: ItemCardProps) {
  const [showContribute, setShowContribute] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [myContribution, setMyContribution] = useState<Contribution | null>(null);

  const badge = getStatusBadge(item.status, item.total_funded, item.price);
  const remaining = item.price - item.total_funded;
  const isFullyFunded = item.status === "FULLY_FUNDED";
  const pct = item.price > 0 ? Math.round((item.total_funded / item.price) * 100) : 0;

  // Fetch user's existing contribution
  useEffect(() => {
    if (!token || isOwner) return;
    contributionApi.mine(item.id, token).then(setMyContribution).catch(() => {});
  }, [item.id, token, isOwner, item.total_funded]);

  const handleReserve = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await contributionApi.reserve(item.id, token);
      setToast({ message: "Item reserved! The surprise is safe.", type: "success" });
      onUpdate?.();
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Failed to reserve", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async () => {
    if (!token) return;
    const cents = Math.round(parseFloat(amount) * 100);
    if (isNaN(cents) || cents < 100) {
      setToast({ message: "Minimum contribution is 1.00", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await contributionApi.create(item.id, cents, token);
      setToast({ message: "Contribution recorded!", type: "success" });
      setShowContribute(false);
      setAmount("");
      onUpdate?.();
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Failed to contribute", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContribution = async () => {
    if (!token) return;
    const cents = Math.round(parseFloat(amount) * 100);
    if (isNaN(cents) || cents < 100) {
      setToast({ message: "Minimum contribution is 1.00", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await contributionApi.update(item.id, cents, token);
      setToast({ message: "Contribution updated!", type: "success" });
      setShowEdit(false);
      setAmount("");
      onUpdate?.();
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Failed to update", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await contributionApi.update(item.id, 0, token);
      setToast({ message: "Contribution withdrawn", type: "success" });
      setShowEdit(false);
      onUpdate?.();
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Cannot withdraw", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const hasContributed = myContribution && myContribution.amount > 0;
  const myRemainingMax = hasContributed ? remaining + myContribution.amount : remaining;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 animate-slide-up group">
      {item.image_url ? (
        <div className="relative overflow-hidden">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {isFullyFunded && (
            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
              <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                Fully Funded
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center relative">
          <svg className="w-14 h-14 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          {isFullyFunded && (
            <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
              <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                Fully Funded
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="font-semibold text-gray-900 flex-1 leading-snug">{item.name}</h3>
          <span className={`ml-2 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        <p className="text-xl font-bold text-violet-600 mb-3">{formatPrice(item.price, currency)}</p>

        <ProgressBar funded={item.total_funded} total={item.price} />

        <div className="flex justify-between text-xs text-gray-500 mt-1.5 mb-3">
          <span>{formatPrice(item.total_funded, currency)} funded ({pct}%)</span>
          <span>{item.contributor_count} contributor{item.contributor_count !== 1 ? "s" : ""}</span>
        </div>

        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-violet-500 hover:text-violet-700 mb-3 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View product
          </a>
        )}

        {/* User's existing contribution */}
        {!isOwner && hasContributed && !showEdit && (
          <div className="flex items-center justify-between p-2.5 bg-violet-50 rounded-xl mb-2">
            <span className="text-sm text-violet-700">
              Your contribution: <strong>{formatPrice(myContribution.amount, currency)}</strong>
            </span>
            {!isArchived && (
              <button
                onClick={() => { setShowEdit(true); setAmount((myContribution.amount / 100).toFixed(2)); }}
                className="text-xs text-violet-500 hover:text-violet-700 font-medium transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        )}

        {/* Edit contribution form */}
        {showEdit && !isArchived && (
          <div className="space-y-2 mb-2 animate-slide-up">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : "\u20AC"}</span>
                <input
                  type="number"
                  step="0.01"
                  min="1.00"
                  max={(myRemainingMax / 100).toFixed(2)}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
                />
              </div>
              <button
                onClick={handleUpdateContribution}
                disabled={loading}
                className="px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "..." : "Save"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={handleWithdraw}
                disabled={loading}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Withdraw contribution
              </button>
              <button
                onClick={() => setShowEdit(false)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action buttons for users who haven't contributed */}
        {!isOwner && !isFullyFunded && !isArchived && !hasContributed && token && (
          <div className="flex gap-2 mt-1">
            {item.total_funded === 0 && (
              <button
                onClick={handleReserve}
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-emerald-500 text-white rounded-xl font-medium text-sm hover:bg-emerald-600 disabled:opacity-50 transition-colors"
              >
                Reserve
              </button>
            )}
            <button
              onClick={() => setShowContribute(!showContribute)}
              className="flex-1 py-2.5 px-4 bg-violet-600 text-white rounded-xl font-medium text-sm hover:bg-violet-700 transition-colors"
            >
              Chip in
            </button>
          </div>
        )}

        {!isOwner && isFullyFunded && (
          <div className="flex items-center justify-center gap-1.5 py-2.5 mt-1 bg-emerald-50 rounded-xl">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium text-emerald-600">Fully funded!</span>
          </div>
        )}

        {!isOwner && !isFullyFunded && !isArchived && !token && (
          <Link href="/login" className="block text-center text-sm text-violet-500 hover:text-violet-700 py-2 transition-colors font-medium">
            Sign in to contribute
          </Link>
        )}

        {showContribute && !isFullyFunded && (
          <div className="mt-3 space-y-2 animate-slide-up">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : "\u20AC"}</span>
                <input
                  type="number"
                  step="0.01"
                  min="1.00"
                  max={(remaining / 100).toFixed(2)}
                  placeholder={`1.00 - ${(remaining / 100).toFixed(2)}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
                />
              </div>
              <button
                onClick={handleContribute}
                disabled={loading}
                className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
            <p className="text-[11px] text-gray-400">
              Min 1.00 {currency} - Max {formatPrice(remaining, currency)} remaining
            </p>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
