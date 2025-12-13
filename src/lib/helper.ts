import { format, parseISO, subMonths } from "date-fns";
import { id } from "date-fns/locale";

export function formatCurrency(amount?: string | number, currencyCode = "IDR", locale = "id-ID") {
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

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore?tab=readme-ov-file#_flatten
 * https://github.com/you-dont-need-x/you-dont-need-lodash
 */

// ----------------------------------------------------------------------

// export function flattenArray<T>(list: T[], key = "children"): T[] {
//   let children: T[] = [];

//   const flatten = list?.map((item: any) => {
//     if (item[key] && item[key].length) {
//       children = [...children, ...item[key]];
//     }
//     return item;
//   });

//   return flatten?.concat(children.length ? flattenArray(children, key) : children);
// }

// ----------------------------------------------------------------------

// export function flattenDeep(array: any): any[] {
//   const isArray = array && Array.isArray(array);

//   if (isArray) {
//     return array.flat(Infinity);
//   }
//   return [];
// }

// ----------------------------------------------------------------------

// export function orderBy<T>(array: T[], properties: (keyof T)[], orders?: ("asc" | "desc")[]): T[] {
//   return array.slice().sort((a, b) => {
//     for (let i = 0; i < properties.length; i += 1) {
//       const property = properties[i];
//       const order = orders && orders[i] === "desc" ? -1 : 1;

//       const aValue = a[property];
//       const bValue = b[property];

//       if (aValue < bValue) return -1 * order;
//       if (aValue > bValue) return 1 * order;
//     }
//     return 0;
//   });
// }

// ----------------------------------------------------------------------

// export function keyBy<T>(
//   array: T[],
//   key: keyof T
// ): {
//   [key: string]: T;
// } {
//   return (array || []).reduce((result, item) => {
//     const keyValue = key ? item[key] : item;

//     return { ...result, [String(keyValue)]: item };
//   }, {});
// }

// ----------------------------------------------------------------------

// export function sumBy<T>(array: T[], iteratee: (item: T) => number): number {
//   return array.reduce((sum, item) => sum + iteratee(item), 0);
// }

// ----------------------------------------------------------------------

export function isEqual(a: any, b: any): boolean {
  if (a === null || a === undefined || b === null || b === undefined) {
    return a === b;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a === "string" || typeof a === "number" || typeof a === "boolean") {
    return a === b;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    return a.every((item, index) => isEqual(item, b[index]));
  }

  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a!);
    const keysB = Object.keys(b!);

    if (keysA.length !== keysB.length) {
      return false;
    }

    return keysA.every((key) => isEqual(a[key], b[key]));
  }

  return false;
}

// ----------------------------------------------------------------------

function isObject(item: any) {
  return item && typeof item === "object" && !Array.isArray(item);
}

export const merge = (target: any, ...sources: any[]): any => {
  if (!sources.length) return target;

  const source = sources.shift();

  for (const key in source) {
    if (isObject(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      merge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }

  return merge(target, ...sources);
};

export const createFormData = (values: any) => {
  const payload = new FormData();

  Object.entries(values).forEach(([key, value]: any) => {
    if (value !== "") {
      payload.append(key, value);
    }
  });

  return payload;
};

export function bytesToMegabytes(bytes: number) {
  if (bytes === null || bytes === undefined) {
    return "N/A"; // Handle cases of null or undefined input
  }
  if (typeof bytes !== "number") {
    return "Invalid Input"; // Handle non-numeric input
  }

  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(2)} MB`; // Format to two decimal places and append 'MB'
}

export const ACCEPTED_TYPES = [
  "application/pdf", // PDF
  // "application/msword", // .doc
  // "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  // "application/vnd.ms-powerpoint", // .ppt
  // "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
];

export const TEXT_HELPER = {
  completed: "Menyelesaikan ",
  assigned: "Menerima",
  canceled: "Membatalkan",
};

export const STATUS_TEXT_HELPER = {
  completed: "Sukses",
  canceled: "Dibatalkan",
  ongoing: "Sedang Berjalan",
};
export function getRandomDarkColor(): string {
  let color;
  do {
    color = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
  } while (getLuminance(color) > 0.6 || isRed(color)); // skip too light or too red
  return color;
}

function getLuminance(hex: string): number {
  const r = parseInt(hex.substr(1, 2), 16) / 255;
  const g = parseInt(hex.substr(3, 2), 16) / 255;
  const b = parseInt(hex.substr(5, 2), 16) / 255;

  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));

  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; // W3C formula
}

function isRed(hex: string): boolean {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);

  // Heuristic: red channel much stronger than green & blue
  return r > 150 && g < 80 && b < 80;
}

export function formatDuration(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} Hari`);
  if (hours > 0) parts.push(`${hours} Jam`);
  if (minutes > 0) parts.push(`${minutes} Menit`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} Detik`);

  return parts.join(" ");
}

export const defaultDate = () => {
  const today = new Date();

  // Get date from one month ago
  const oneMonthAgo = subMonths(today, 1);

  // Format the dates (you can customize the format string)
  const formattedToday = format(today, "yyyy-MM-dd");
  const formattedOneMonthAgo = format(oneMonthAgo, "yyyy-MM-dd");

  return { formattedToday, formattedOneMonthAgo };
};
