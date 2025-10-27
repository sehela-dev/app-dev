export function formatCurrency(amount: string | number, currencyCode = "IDR", locale = "id-ID") {
  // Create a new Intl.NumberFormat object
  const data = parseInt(amount as string);
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0, // Ensure at least two decimal places
    maximumFractionDigits: 0, // Ensure at most two decimal places
  });

  // Format the amount and return the string
  return formatter.format(data);
}
