"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { wishlistApi, itemApi, Wishlist, WishlistItem } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import ProgressBar from "@/components/ProgressBar";
import { getStatusBadge } from "@/lib/utils";
import { getSocket, joinWishlist, leaveWishlist, ItemUpdateEvent } from "@/lib/socket";

export default function WishlistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddItem, setShowAddItem] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemLink, setItemLink] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [wl, its] = await Promise.all([
        wishlistApi.get(id, token),
        itemApi.list(id),
      ]);
      setWishlist(wl);
      setItems(its);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, token, router]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!wishlist?.id) return;
    const wishlistId = wishlist.id;
    joinWishlist(wishlistId);
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
      leaveWishlist(wishlistId);
    };
  }, [wishlist?.id]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !wishlist) return;
    const priceCents = Math.round(parseFloat(itemPrice) * 100);
    if (isNaN(priceCents) || priceCents <= 0) return;
    setAdding(true);
    try {
      const item = await itemApi.create(
        wishlist.id,
        { name: itemName, price: priceCents, link: itemLink || undefined, image_url: itemImage || undefined },
        token
      );
      setItems((prev) => [...prev, item]);
      setShowAddItem(false);
      setItemName("");
      setItemPrice("");
      setItemLink("");
      setItemImage("");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!token || !wishlist || !confirm("Delete this item? Contributions will be removed.")) return;
    await itemApi.delete(wishlist.id, itemId, token);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  if (authLoading || loading) {
    return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;
  }

  if (!wishlist) return null;

  const totalFunded = items.reduce((s, i) => s + i.total_funded, 0);
  const totalPrice = items.reduce((s, i) => s + i.price, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-400 hover:text-gray-600 mb-4 block">
        &larr; Back to lists
      </button>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{wishlist.title}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {wishlist.occasion && `${wishlist.occasion} · `}
          {wishlist.event_date || "No date"}
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

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              const url = `${window.location.origin}/list/${wishlist.slug}`;
              navigator.clipboard.writeText(url);
              alert("Public link copied!");
            }}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
          >
            Copy Share Link
          </button>
          <button
            onClick={() => setShowAddItem(!showAddItem)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + Add Item
          </button>
        </div>
      </div>

      {showAddItem && (
        <form onSubmit={handleAddItem} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ({wishlist.currency}) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Link</label>
              <input
                type="url"
                value={itemLink}
                onChange={(e) => setItemLink(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={itemImage}
              onChange={(e) => setItemImage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={adding}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {adding ? "Adding..." : "Add Item"}
            </button>
            <button type="button" onClick={() => setShowAddItem(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
              Cancel
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-400 text-lg">Your wishlist is empty. Add your first item</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const badge = getStatusBadge(item.status, item.total_funded, item.price);
            return (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
                    </div>
                    <p className="text-lg font-bold text-indigo-600">{formatPrice(item.price, wishlist.currency)}</p>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline">
                        View link
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-sm text-red-400 hover:text-red-600 ml-4"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-3">
                  <ProgressBar funded={item.total_funded} total={item.price} />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>
                      {formatPrice(item.total_funded, wishlist.currency)} of {formatPrice(item.price, wishlist.currency)}
                    </span>
                    <span>{item.contributor_count} contributor{item.contributor_count !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-300 text-center mt-8">
        Contributions are indicative. Coordinate payment privately.
      </p>
    </div>
  );
}
