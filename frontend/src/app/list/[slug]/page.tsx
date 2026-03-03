"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { wishlistApi, PublicWishlist, WishlistItem } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import ItemCard from "@/components/ItemCard";
import ProgressBar from "@/components/ProgressBar";
import EmptyState from "@/components/EmptyState";
import { CardSkeleton } from "@/components/Skeleton";
import { getSocket, joinWishlist, leaveWishlist, ItemUpdateEvent } from "@/lib/socket";
import Link from "next/link";

export default function PublicWishlistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user, token } = useAuth();
  const [wishlist, setWishlist] = useState<PublicWishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await wishlistApi.getPublic(slug);
      setWishlist(data);
      setItems(data.items);
    } catch {
      setError("This wishlist no longer exists or has been removed.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!wishlist) return;
    joinWishlist(wishlist.id);
    const socket = getSocket();
    const handler = (data: ItemUpdateEvent) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === data.itemId
            ? { ...item, total_funded: data.total, contributor_count: data.contributors, status: data.status as WishlistItem["status"] }
            : item
        )
      );
    };
    socket.on("item_updated", handler);
    return () => { socket.off("item_updated", handler); leaveWishlist(wishlist.id); };
  }, [wishlist?.id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="skeleton h-32 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Wishlist not found</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link href="/" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
          Go to homepage
        </Link>
      </div>
    );
  }

  if (!wishlist) return null;

  const isOwner = user?.id === (wishlist as PublicWishlist & { user_id?: string }).user_id;
  const isExpired = !!(wishlist.event_date && new Date(wishlist.event_date) < new Date(new Date().toDateString()));
  const effectivelyArchived = wishlist.is_archived || isExpired;
  const totalFunded = items.reduce((s, i) => s + i.total_funded, 0);
  const totalPrice = items.reduce((s, i) => s + i.price, 0);
  const pct = totalPrice > 0 ? Math.round((totalFunded / totalPrice) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{wishlist.title}</h1>
            <p className="text-gray-400 text-sm">
              {wishlist.occasion && `${wishlist.occasion}`}
              {wishlist.occasion && wishlist.event_date && " · "}
              {wishlist.event_date}
            </p>
          </div>
        </div>

        {wishlist.description && (
          <p className="text-sm text-gray-500 mt-3">{wishlist.description}</p>
        )}

        {items.length > 0 && (
          <div className="mt-5">
            <div className="flex justify-between text-sm text-gray-500 mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                {pct}% funded
              </span>
              <span className="font-medium">{formatPrice(totalFunded, wishlist.currency)} / {formatPrice(totalPrice, wishlist.currency)}</span>
            </div>
            <ProgressBar funded={totalFunded} total={totalPrice} size="md" />
          </div>
        )}

        {!token && (
          <div className="mt-5 p-3.5 bg-violet-50 rounded-xl border border-violet-100">
            <p className="text-sm text-violet-700">
              <Link href="/login" className="font-semibold underline decoration-violet-300 hover:decoration-violet-500 transition-colors">
                Sign in
              </Link>{" "}
              to reserve items or contribute toward gifts.
            </p>
          </div>
        )}

        {effectivelyArchived && (
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-sm text-amber-700 font-medium">
              {isExpired && !wishlist.is_archived
                ? "This event has passed. New contributions are no longer accepted."
                : "This wishlist has been archived. New contributions are no longer accepted."}
            </p>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="gift"
          title="No items yet"
          description="The wishlist owner hasn't added any items yet. Check back later!"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              currency={wishlist.currency}
              token={token}
              isOwner={isOwner}
              isArchived={effectivelyArchived}
              onUpdate={fetchData}
            />
          ))}
        </div>
      )}

      <div className="text-center mt-8 space-y-1">
        <p className="text-xs text-gray-300">
          Contributions are indicative. Coordinate payment privately.
        </p>
        <p className="text-xs text-gray-300">
          Powered by{" "}
          <Link href="/" className="text-violet-400 hover:text-violet-500 transition-colors font-medium">
            Wishly
          </Link>
        </p>
      </div>
    </div>
  );
}
