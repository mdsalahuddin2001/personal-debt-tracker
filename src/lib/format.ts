const currencyFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** Format an amount as Bangladeshi taka, e.g. ৳1,500.00 */
export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

/** Format a signed balance with an explicit + / − prefix. */
export function formatSignedCurrency(amount: number): string {
  const sign = amount > 0 ? "+" : amount < 0 ? "−" : "";
  return `${sign}${currencyFormatter.format(Math.abs(amount))}`;
}

export function formatDate(date: Date | string): string {
  return dateFormatter.format(new Date(date));
}

/** For prefilling <input type="date"> (yyyy-mm-dd). */
export function toDateInputValue(date: Date | string = new Date()): string {
  return new Date(date).toISOString().slice(0, 10);
}

/** Human-readable file size, e.g. 1.4 MB or 820 KB. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}
