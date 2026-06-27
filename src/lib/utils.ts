export function formatDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDateShort(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function slugify(str: string) {
  return str
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, n: number, ellipsis = "…") {
  if (str.length <= n) return str;
  const cut = str.slice(0, n).trimEnd();
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > Math.max(0, n - 20) ? cut.slice(0, lastSpace) : cut).trimEnd()}${ellipsis}`;
}

export function capitalize(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function groupBy<T>(arr: T[], key: keyof T) {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const groupKey = String(item[key]);
    (acc[groupKey] ||= []).push(item);
    return acc;
  }, {});
}

export function calcReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return {
    minutes: Math.max(1, Math.ceil(words / 200)),
    words,
  };
}
