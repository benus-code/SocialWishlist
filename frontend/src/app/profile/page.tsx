"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import Toast from "@/components/Toast";
import { PageSkeleton } from "@/components/Skeleton";

export default function ProfilePage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.display_name) setDisplayName(user.display_name);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await authApi.updateProfile({ display_name: displayName || undefined }, token);
      setToast({ message: "Profile updated!", type: "success" });
    } catch {
      setToast({ message: "Failed to update profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <PageSkeleton />;
  if (!user) return null;

  const initials = (user.display_name || user.email).slice(0, 2).toUpperCase();

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <button onClick={() => router.push("/dashboard")} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to dashboard
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-20 h-20 rounded-full mb-3 border-2 border-violet-100" />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900">{user.display_name || "My Profile"}</h1>
          <p className="text-sm text-gray-400">{user.email}</p>
          {user.oauth_provider && (
            <span className="mt-2 px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
              Connected via {user.oauth_provider.charAt(0).toUpperCase() + user.oauth_provider.slice(1)}
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              placeholder="How friends will see you"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Member since</label>
            <p className="text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors text-sm"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
