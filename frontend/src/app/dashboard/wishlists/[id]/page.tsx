"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { wishlistApi, itemApi, scrapeApi, Wishlist, WishlistItem } from "@/lib/api";
import { formatPrice, getStatusBadge } from "@/lib/utils";
import ProgressBar from "@/components/ProgressBar";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ShareMenu from "@/components/ShareMenu";
import EmptyState from "@/components/EmptyState";
import Toast from "@/components/Toast";
import { PageSkeleton } from "@/components/Skeleton";
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
  const [scraping, setScraping] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteItemInfo, setDeleteItemInfo] = useState<{ has_contributions: boolean; contributor_count: number; total_funded: number } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [wl, its] = await Promise.all([wishlistApi.get(id, token), itemApi.list(id)]);
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

  // Polling fallback: refresh data periodically + when tab becomes visible
  useEffect(() => {
    if (!wishlist) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchData();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    const interval = setInterval(fetchData, 10000);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearInterval(interval);
    };
  }, [wishlist?.id, fetchData]);

  // URL Autofill
  const handleUrlPaste = async (url: string) => {
    if (!url || !url.startsWith("http")) return;
    setScraping(true);
    try {
      const data = await scrapeApi.scrape(url);
      if (data.title && !itemName) setItemName(data.title);
      if (data.price && !itemPrice) setItemPrice((data.price / 100).toFixed(2));
      if (data.image && !itemImage) setItemImage(data.image);
      setToast({ message: "Product details auto-filled!", type: "success" });
    } catch {
      // Scraping failed silently - user can fill manually
    } finally {
      setScraping(false);
    }
  };

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
      setItemName(""); setItemPrice(""); setItemLink(""); setItemImage("");
      setToast({ message: "Item added!", type: "success" });
    } finally {
      setAdding(false);
    }
  };

  const openDeleteDialog = async (itemId: string) => {
    setDeleteItemId(itemId);
    if (token && wishlist) {
      try {
        const info = await itemApi.getDeletionInfo(wishlist.id, itemId, token);
        setDeleteItemInfo(info);
      } catch {
        setDeleteItemInfo(null);
      }
    }
  };

  const handleDeleteItem = async () => {
    if (!token || !wishlist || !deleteItemId) return;
    await itemApi.delete(wishlist.id, deleteItemId, token);
    setItems((prev) => prev.filter((i) => i.id !== deleteItemId));
    setDeleteItemId(null);
    setDeleteItemInfo(null);
    setToast({ message: "Item removed", type: "info" });
  };

  if (authLoading || loading) return <PageSkeleton />;
  if (!wishlist) return null;

  const totalFunded = items.reduce((s, i) => s + i.total_funded, 0);
  const totalPrice = items.reduce((s, i) => s + i.price, 0);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/list/${wishlist.slug}` : "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => router.push("/dashboard")} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to lists
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{wishlist.title}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {wishlist.occasion && <span className="inline-flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>{wishlist.occasion}</span>}
              {wishlist.occasion && wishlist.event_date && " · "}
              {wishlist.event_date && <span>{wishlist.event_date}</span>}
            </p>
          </div>
          <ShareMenu url={shareUrl} title={wishlist.title} onToast={(msg) => setToast({ message: msg, type: "success" })} />
        </div>

        {items.length > 0 && (
          <div className="mt-5">
            <div className="flex justify-between text-sm text-gray-500 mb-1.5">
              <span>Overall progress</span>
              <span className="font-medium">{formatPrice(totalFunded, wishlist.currency)} / {formatPrice(totalPrice, wishlist.currency)}</span>
            </div>
            <ProgressBar funded={totalFunded} total={totalPrice} size="md" />
          </div>
        )}

        <div className="mt-5">
          <button
            onClick={() => setShowAddItem(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Item
          </button>
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal open={showAddItem} onClose={() => setShowAddItem(false)} title="Add Item" maxWidth="max-w-lg">
        <form onSubmit={handleAddItem} className="space-y-4">
          {/* URL Autofill */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product URL (auto-fills details)</label>
            <div className="relative">
              <input
                type="url"
                value={itemLink}
                onChange={(e) => setItemLink(e.target.value)}
                onBlur={(e) => handleUrlPaste(e.target.value)}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text");
                  setTimeout(() => handleUrlPaste(text), 100);
                }}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm pr-10"
                placeholder="https://amazon.com/product..."
              />
              {scraping && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Paste a link to auto-fill name, price and image</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Name *</label>
            <input
              type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              placeholder="e.g. AirPods Pro"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ({wishlist.currency}) *</label>
              <input
                type="number" step="0.01" min="0.01" required value={itemPrice} onChange={(e) => setItemPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                placeholder="29.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
              <input
                type="url" value={itemImage} onChange={(e) => setItemImage(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                placeholder="https://..."
              />
            </div>
          </div>

          {itemImage && (
            <div className="rounded-xl overflow-hidden border border-gray-200 h-32">
              <img src={itemImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowAddItem(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="submit" disabled={adding} className="px-5 py-2 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors text-sm">
              {adding ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Item Confirmation */}
      <ConfirmDialog
        open={!!deleteItemId}
        onClose={() => { setDeleteItemId(null); setDeleteItemInfo(null); }}
        onConfirm={handleDeleteItem}
        title="Delete Item"
        message="This will permanently remove this item from your wishlist."
        detail={deleteItemInfo?.has_contributions
          ? `Warning: ${deleteItemInfo.contributor_count} contributor(s) have already pledged ${formatPrice(deleteItemInfo.total_funded, wishlist.currency)}. They will lose their contributions.`
          : undefined
        }
        confirmLabel="Delete Item"
        confirmVariant="danger"
      />

      {items.length === 0 ? (
        <EmptyState
          icon="gift"
          title="No items yet"
          description="Add your first wish! Paste a product URL to auto-fill the details, or add items manually."
          action={{ label: "Add Your First Item", onClick: () => setShowAddItem(true) }}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const badge = getStatusBadge(item.status, item.total_funded, item.price);
            const pct = item.price > 0 ? Math.round((item.total_funded / item.price) * 100) : 0;
            return (
              <div key={item.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all animate-slide-up">
                <div className="flex items-start gap-4">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${badge.color}`}>{badge.label}</span>
                    </div>
                    <p className="text-lg font-bold text-violet-600">{formatPrice(item.price, wishlist.currency)}</p>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-600 transition-colors mt-0.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        View product
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => openDeleteDialog(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Delete item"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <div className="mt-3">
                  <ProgressBar funded={item.total_funded} total={item.price} />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{formatPrice(item.total_funded, wishlist.currency)} of {formatPrice(item.price, wishlist.currency)} ({pct}%)</span>
                    <span>{item.contributor_count} contributor{item.contributor_count !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-300 text-center mt-8">
        You cannot see who contributed - the surprise is safe!
      </p>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
