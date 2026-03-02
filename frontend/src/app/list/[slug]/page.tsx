"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { wishlistApi, PublicWishlist, WishlistItem } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import ItemCard from "@/components/ItemCard";
import ProgressBar from "@/components/ProgressBar";
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
      setError("This wishlist no longer exists.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // WebSocket
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
    return () => {
      socket.off("item_updated", handler);
      leaveWishlist(wishlist.id);
    };
  }, [wishlist?.id]);

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-xl text-gray-400">{error}</p>
        <Link href="/" className="text-indigo-500 hover:underline mt-4 block">
          Go home
        </Link>
      </div>
    );
  }

  if (!wishlist) return null;

  const isOwner = user?.id === (wishlist as PublicWishlist & { user_id?: string }).user_id;
  const totalFunded = items.reduce((s, i) => s + i.total_funded, 0);
  const totalPrice = items.reduce((s, i) => s + i.price, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{wishlist.title}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {wishlist.occasion && `${wishlist.occasion} · `}
          {wishlist.event_date || ""}
        </p>

        {items.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Overall progress</span>
              <span>
                {formatPrice(totalFunded, wishlist.currency)} / {formatPrice(totalPrice, wishlist.currency)}
              </span>
            </div>
            <ProgressBar funded={totalFunded} total={totalPrice} />
          </div>
        )}

        {!token && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-700">
              <Link href="/login" className="font-medium underline">
                Sign in
              </Link>{" "}
              to reserve items or contribute toward gifts.
            </p>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-400 text-lg">This wishlist has no items yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              currency={wishlist.currency}
              token={token}
              isOwner={isOwner}
              onUpdate={fetchData}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-300 text-center mt-8">
        Contributions are indicative. Coordinate payment privately.
      </p>
    </div>
  );
}
