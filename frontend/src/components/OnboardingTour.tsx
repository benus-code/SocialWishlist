"use client";

import { useState, useEffect } from "react";

const TOUR_KEY = "wishly_onboarding_done";

const steps = [
  {
    title: "Welcome to Wishly!",
    description:
      "Let us show you around so you can make the most of your wishlists. This will only take a moment.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Create your wishlists",
    description:
      'Click "New Wishlist" to create a list for any occasion: birthday, wedding, Christmas... Add a title, an occasion, and an optional date.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
    color: "from-violet-500 to-indigo-600",
  },
  {
    title: "Add items to your list",
    description:
      "Inside each wishlist, add items you want. Paste a product URL and the name, image, and price are auto-filled! You can also add items manually.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    color: "from-indigo-500 to-blue-600",
  },
  {
    title: "Share with friends",
    description:
      "Each wishlist has a unique shareable link. Send it via WhatsApp, Telegram, email, or just copy the link. Your friends don't need an account to view it!",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    color: "from-blue-500 to-cyan-600",
  },
  {
    title: "Track contributions",
    description:
      'Go to "Contributions" in the top menu to see all the gifts you\'ve helped fund. Contributions are always anonymous to the wishlist creator!',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "from-emerald-500 to-green-600",
  },
  {
    title: "You're all set!",
    description:
      "You now know the basics. Start by creating your first wishlist and sharing it with the people you love. Happy gifting!",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    color: "from-violet-500 to-purple-600",
  },
];

export default function OnboardingTour({ onComplete }: { onComplete?: () => void }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      setVisible(true);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(TOUR_KEY, "1");
    setVisible(false);
    onComplete?.();
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!visible) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={finish} />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Top gradient bar */}
        <div className={`h-1.5 bg-gradient-to-r ${current.color}`} />

        {/* Skip button */}
        {!isLast && (
          <button
            onClick={finish}
            className="absolute top-4 right-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip
          </button>
        )}

        {/* Content */}
        <div className="px-6 pt-8 pb-6 text-center">
          {/* Icon */}
          <div
            className={`w-16 h-16 bg-gradient-to-br ${current.color} rounded-2xl flex items-center justify-center mx-auto mb-5 text-white shadow-lg`}
          >
            {current.icon}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">{current.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
            {current.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-5">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-violet-500" : "w-1.5 bg-gray-200 hover:bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 pb-6">
          {isFirst ? (
            <div />
          ) : (
            <button
              onClick={prev}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium"
            >
              Back
            </button>
          )}
          <button
            onClick={next}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm ${
              isLast
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-md"
                : "bg-violet-600 text-white hover:bg-violet-700"
            }`}
          >
            {isLast ? "Get Started!" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
