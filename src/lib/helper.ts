import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

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

/**
 * Format date with Indonesian locale
 * @param date - Date string or Date object
 * @param formatStr - Format pattern (default: 'dd/MM/yyyy')
 * @returns Formatted date string
 */
export const formatDateHelper = (date: string | Date, formatStr: string = "dd/MM/yyyy"): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: id });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
};
