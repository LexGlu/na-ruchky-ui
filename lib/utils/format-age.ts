import dayjs from "dayjs";
import "dayjs/locale/uk";

// 1 рік, 2/3/4 роки, 5+ років
function formatUkrYears(years: number): string {
  const lastTwo = years % 100;
  const lastOne = years % 10;

  if (lastOne === 1 && lastTwo !== 11) return `${years} рік`;
  if ([2, 3, 4].includes(lastOne) && ![12, 13, 14].includes(lastTwo))
    return `${years} роки`;
  return `${years} років`;
}

// 1 місяць, 2/3/4 місяці, 5+ місяців
function formatUkrMonths(months: number): string {
  const lastTwo = months % 100;
  const lastOne = months % 10;

  if (lastOne === 1 && lastTwo !== 11) return `${months} місяць`;
  if ([2, 3, 4].includes(lastOne) && ![12, 13, 14].includes(lastTwo))
    return `${months} місяці`;
  return `${months} місяців`;
}

// If we have a decimal year (x.5), approximate grammar as "роки"
function formatDecimalUkrYears(value: number): string {
  const integerPart = Math.floor(value);
  const decimalPart = value - integerPart;
  if (decimalPart === 0) {
    // If it's a clean integer like 2, 5, etc.
    return formatUkrYears(integerPart);
  }
  // If we have .5, use "роки" to keep it simple
  return `${value} роки`;
}

/**
 * Returns a string describing age in Ukrainian.
 * <1 month => "менше місяця"
 * <1 year => "X місяців" (with correct grammar)
 * >=1 year => rounds to the nearest 0 or .5 year, e.g. "1 рік", "1.5 роки", "2 роки", "5 років", "5.5 років"
 */
export default function formatAge(birthDate: string | null): string {
  if (!birthDate) return "Невідомий вік";
  dayjs.locale("uk");

  const now = dayjs();
  const bd = dayjs(birthDate);

  // Invalid or future
  if (!bd.isValid() || bd.isAfter(now)) return "Невідомий вік";

  const totalMonths = now.diff(bd, "month");

  // Under 1 month
  if (totalMonths < 1) {
    return "менше місяця";
  }

  // Under 1 year => use months
  if (totalMonths < 12) {
    return formatUkrMonths(totalMonths);
  }

  // 1 year or more => round to whole or half
  const years = Math.floor(totalMonths / 12);
  const remainder = totalMonths % 12;
  // If remainder >= 6 => .5
  const finalValue = years + (remainder >= 6 ? 0.5 : 0);

  return formatDecimalUkrYears(finalValue);
}
