"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/lib/api";

interface GoogleSignInProps {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function GoogleSignIn({ onSuccess, onError }: GoogleSignInProps) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    authApi.googleClientId().then((res) => {
      if (res) setClientId(res.client_id);
    });
  }, []);

  useEffect(() => {
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [clientId]);

  useEffect(() => {
    if (!loaded || !clientId || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential?: string }) => {
        if (response.credential) {
          onSuccess(response.credential);
        } else {
          onError?.("Google sign-in failed");
        }
      },
    });

    const btnEl = document.getElementById("google-signin-btn");
    if (btnEl) {
      window.google.accounts.id.renderButton(btnEl, {
        type: "standard",
        theme: "outline",
        size: "large",
        width: "100%",
        text: "continue_with",
        shape: "pill",
      });
    }
  }, [loaded, clientId, onSuccess, onError]);

  if (!clientId) return null;

  return (
    <div className="w-full">
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-gray-400">or</span>
        </div>
      </div>
      <div id="google-signin-btn" className="flex justify-center" />
    </div>
  );
}
