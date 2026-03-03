"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="glass border-b border-gray-200/60 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Wishly
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm px-3 py-1.5 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors font-medium"
              >
                My Lists
              </Link>
              <Link
                href="/contributions"
                className="text-sm px-3 py-1.5 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors font-medium flex items-center gap-1.5"
                title="Contributions"
              >
                <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Contributions</span>
              </Link>
              <Link
                href="/profile"
                className="text-sm px-3 py-1.5 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                title="Profile"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm px-3 py-1.5 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm px-4 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
