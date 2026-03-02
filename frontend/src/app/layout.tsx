import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Wishly - Social Wishlists",
  description: "Create wishlists, share with friends, and coordinate gifts without ruining the surprise. Group funding for expensive items.",
  keywords: "wishlist, gift registry, group gifting, birthday, christmas, wedding",
  openGraph: {
    title: "Wishly - Social Wishlists",
    description: "Create wishlists, share with friends, and coordinate gifts without ruining the surprise.",
    type: "website",
    siteName: "Wishly",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface-dim min-h-screen text-gray-900">
        <AuthProvider>
          <Navbar />
          <main className="animate-fade-in">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
