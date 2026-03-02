export function formatPrice(cents: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function getStatusBadge(status: string, totalFunded: number, price: number): { label: string; color: string } {
  const pct = price > 0 ? totalFunded / price : 0;

  switch (status) {
    case "FULLY_FUNDED":
      return { label: "Funded", color: "bg-emerald-100 text-emerald-700" };
    case "PARTIALLY_FUNDED":
      if (pct > 0.7) return { label: `${Math.round(pct * 100)}%`, color: "bg-amber-100 text-amber-700" };
      return { label: `${Math.round(pct * 100)}%`, color: "bg-violet-100 text-violet-700" };
    default:
      return { label: "Available", color: "bg-gray-100 text-gray-600" };
  }
}
