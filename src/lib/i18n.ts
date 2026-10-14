// ภาษาของตัวเว็บ portfolio — ใช้เป็น segment แรกของ URL (/th, /en)

export const locales = ["th", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "th";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** ข้อความสองภาษา — ใช้กับเนื้อหาทั้งเว็บและข้อมูลตัวอย่างในเดโม่ */
export type L = { th: string; en: string };

export const pick = (text: L, locale: Locale) => text[locale];

/** แทนค่า `{name}` ในข้อความ */
export function fill(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

/** สลับภาษาใน path เดิม เช่น /th/projects/x → /en/projects/x */
export function swapLocaleInPath(pathname: string, next: Locale) {
  const parts = pathname.split("/");
  if (parts.length > 1 && hasLocale(parts[1])) {
    parts[1] = next;
    return parts.join("/") || `/${next}`;
  }
  return `/${next}${pathname === "/" ? "" : pathname}`;
}
