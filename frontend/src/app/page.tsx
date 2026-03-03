"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    title: "Paste & Auto-fill",
    desc: "Drop a product URL and we grab the name, image, and price automatically. No manual entry needed.",
    color: "bg-violet-100 text-violet-600",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Group Funding",
    desc: "Friends chip in together for expensive gifts. Real-time progress bars show how close you are to the goal.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Surprise Safe",
    desc: "The wishlist creator never sees who contributed or how much. The surprise stays completely intact.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Instant Updates",
    desc: "When someone reserves or contributes, everyone sees it immediately. No page refresh needed.",
    color: "bg-blue-100 text-blue-600",
  },
];

const steps = [
  { num: "1", title: "Create a list", desc: "Birthday, wedding, housewarming - any occasion." },
  { num: "2", title: "Add wishes", desc: "Paste product links for auto-fill, or add items manually." },
  { num: "3", title: "Share the link", desc: "One-tap sharing via WhatsApp, Telegram, or email." },
  { num: "4", title: "Friends contribute", desc: "They reserve or chip in together - updated live." },
];

const occasions = [
  { emoji: "\uD83C\uDF82", label: "Birthdays" },
  { emoji: "\uD83C\uDF84", label: "Christmas" },
  { emoji: "\uD83D\uDC92", label: "Weddings" },
  { emoji: "\uD83C\uDFE0", label: "Housewarming" },
  { emoji: "\uD83D\uDC76", label: "Baby Showers" },
  { emoji: "\uD83C\uDF93", label: "Graduation" },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
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
          No duplicate presents. Group funding for pricey items. All updated in real-time.
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

        {/* App Preview Mockup */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Sarah&apos;s Birthday Wishlist</h3>
                <p className="text-xs text-gray-400">Birthday &middot; March 15, 2026</p>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> 72% funded</span>
                <span className="font-medium text-gray-500">360.00 / 500.00 EUR</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full" style={{ width: "72%" }} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: "AirPods Pro", price: "249.00", pct: 100, status: "Fully Funded", color: "bg-emerald-50 text-emerald-700" },
                { name: "Book Set", price: "45.00", pct: 65, status: "65% funded", color: "bg-violet-50 text-violet-700" },
                { name: "Running Shoes", price: "129.00", pct: 20, status: "20% funded", color: "bg-gray-50 text-gray-500" },
              ].map((item) => (
                <div key={item.name} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="w-full h-16 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg mb-2 flex items-center justify-center">
                    <svg className="w-6 h-6 text-violet-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-violet-600 font-bold">{item.price} EUR</p>
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-300 mt-3">What your friends will see when they open your wishlist</p>
        </div>
      </section>

      {/* Occasions */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">For every occasion</h2>
        <p className="text-center text-gray-500 text-sm mb-8">One tool for all your gift-giving moments</p>
        <div className="flex flex-wrap justify-center gap-3">
          {occasions.map((o) => (
            <div
              key={o.label}
              className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-lg">{o.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{o.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Everything you need</h2>
        <p className="text-center text-gray-500 text-sm mb-10">Simple yet powerful features for perfect gift coordination</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">How it works</h2>
        <p className="text-center text-gray-500 text-sm mb-10">Ready in under a minute</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.num} className="text-center relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-5 left-[60%] w-[80%] h-px bg-gradient-to-r from-violet-200 to-transparent" />
              )}
              <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3 relative z-10">
                {s.num}
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">{s.title}</h4>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy highlight */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-8 sm:p-10 text-center text-white">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">The surprise is always safe</h2>
          <p className="text-violet-100 max-w-lg mx-auto leading-relaxed">
            Wishlist creators only see the total amount collected and number of contributors.
            They never see individual names or amounts. The magic of gifting stays intact.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to simplify gift giving?</h2>
        <p className="text-gray-500 mb-8">Free to use. Takes 30 seconds to create your first wishlist.</p>
        {user ? (
          <Link
            href="/dashboard"
            className="inline-block px-10 py-4 bg-violet-600 text-white rounded-xl font-semibold text-lg hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-violet-600 text-white rounded-xl font-semibold text-lg hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
          >
            Create Your First Wishlist
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-8 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <span className="font-semibold text-gray-700 text-sm">Wishly</span>
          </div>
          <p className="text-xs text-gray-400">
            Social wishlists for every occasion. Made with care.
          </p>
        </div>
      </footer>
    </div>
  );
}
