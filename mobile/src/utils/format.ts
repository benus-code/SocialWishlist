const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'CHF',
  CAD: 'CA$',
  XOF: 'CFA',
  XAF: 'FCFA',
};

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

export function formatPrice(cents: number, currency: string = 'EUR'): string {
  const amount = (cents / 100).toFixed(2);
  const symbol = getCurrencySymbol(currency);
  return `${amount} ${symbol}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
  return formatDate(dateStr);
}

export function getProgressPercent(funded: number, price: number): number {
  if (price <= 0) return 0;
  return Math.min(100, Math.round((funded / price) * 100));
}

export function getItemStatus(
  totalFunded: number,
  price: number,
): 'AVAILABLE' | 'PARTIALLY_FUNDED' | 'FULLY_FUNDED' {
  if (totalFunded <= 0) return 'AVAILABLE';
  if (totalFunded >= price) return 'FULLY_FUNDED';
  return 'PARTIALLY_FUNDED';
}
