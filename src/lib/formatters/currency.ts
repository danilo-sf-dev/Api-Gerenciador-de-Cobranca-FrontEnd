/**
 * Formats a number to Brazilian Real (R$) currency format.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Parses a currency string or raw input back to a number.
 */
export function parseCurrency(value: string): number {
  const cleanValue = value.replace(/[^\d]/g, "");
  if (!cleanValue) return 0;
  return parseFloat(cleanValue) / 100;
}
