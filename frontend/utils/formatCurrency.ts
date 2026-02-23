export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000000) {
    const value = amount / 1000000000;
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}B ₫`;
  }
  if (amount >= 1000000) {
    const value = amount / 1000000;
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}M ₫`;
  }
  if (amount >= 1000) {
    const value = amount / 1000;
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}K ₫`;
  }
  return formatCurrency(amount);
}