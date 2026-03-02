"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
    title: "Create Wishlists",
    desc: "Add items with prices, links, and images. Paste a product URL and we auto-fill the details.",
    color: "bg-violet-100 text-violet-600",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Group Funding",
    desc: "Friends chip in together for expensive gifts. Real-time progress bars show how much is collected.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Surprise Safe",
    desc: "The creator never sees who contributed or how much. The surprise stays completely intact.",
    color: "bg-amber-100 text-amber-600",
  },
];

const steps = [
  { num: "1", title: "Create a list", desc: "Birthday, wedding, Christmas - any occasion." },
  { num: "2", title: "Add wishes", desc: "Paste product URLs for auto-fill, or add items manually." },
  { num: "3", title: "Share the link", desc: "Send it via WhatsApp, Telegram, or email." },
  { num: "4", title: "Friends contribute", desc: "They reserve or chip in - all in real-time." },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-6">
          <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
          Real-time gift coordination
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-5 leading-tight tracking-tight">
          Gift giving,{" "}
          <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            without the chaos
          </span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Create wishlists, share with friends, and let them coordinate gifts without ruining the surprise.
          No duplicates. Group funding for expensive items. All in real-time.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          {user ? (
            <Link
              href="/dashboard"
              className="px-8 py-3.5 bg-violet-600 text-white rounded-xl font-semibold text-lg hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="px-8 py-3.5 bg-violet-600 text-white rounded-xl font-semibold text-lg hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 bg-white text-violet-600 rounded-xl font-semibold text-lg border-2 border-violet-200 hover:border-violet-400 transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">How it works</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">
                {s.num}
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">{s.title}</h4>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 mt-8 border-t border-gray-100">
        <p className="text-center text-xs text-gray-400">
          Wishly - Social Wishlists. Made with care.
        </p>
      </footer>
    </div>
  );
}
