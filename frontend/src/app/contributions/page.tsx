"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi, MyContribution } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import { ListItemSkeleton } from "@/components/Skeleton";

export default function ContributionsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [contributions, setContributions] = useState<MyContribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (token) {
      authApi.myContributions(token).then(setContributions).finally(() => setLoading(false));
    }
  }, [token]);

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
        <div className="skeleton h-8 w-48 mb-6" />
        <ListItemSkeleton />
        <ListItemSkeleton />
        <ListItemSkeleton />
      </div>
    );
  }

  const totalContributed = contributions.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => router.push("/dashboard")} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to dashboard
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Contributions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {contributions.length} contribution{contributions.length !== 1 ? "s" : ""}
            {contributions.length > 0 && ` \u00B7 ${formatPrice(totalContributed, "EUR")} total`}
          </p>
        </div>
      </div>

      {contributions.length === 0 ? (
        <EmptyState
          icon="gift"
          title="No contributions yet"
          description="When you contribute to a friend's wishlist, it will appear here. Your contributions are always anonymous to the wishlist creator."
        />
      ) : (
        <div className="space-y-3">
          {contributions.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all animate-slide-up"
            >
              {c.item_image_url ? (
                <img src={c.item_image_url} alt={c.item_name} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100" />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-violet-50 to-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{c.item_name}</h3>
                <p className="text-sm text-gray-400 truncate">
                  {c.wishlist_slug ? (
                    <Link href={`/list/${c.wishlist_slug}`} className="hover:text-violet-500 transition-colors">
                      {c.wishlist_title}
                    </Link>
                  ) : (
                    c.wishlist_title
                  )}
                </p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-violet-600">{formatPrice(c.amount, "EUR")}</p>
                <p className="text-xs text-gray-400">of {formatPrice(c.item_price, "EUR")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
