const createFormatter = (currency) => new Intl.NumberFormat("en-US", { style: "currency", currency });

// Amounts arrive as integer minor units; division happens only for display.
export function formatMoney(amountMinor, currency = "INR") {
  const formatter = createFormatter(currency);
  const digits = formatter.resolvedOptions().maximumFractionDigits;
  return formatter.format(amountMinor / 10 ** digits);
}
