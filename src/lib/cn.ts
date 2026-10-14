type ClassValue = string | false | null | undefined | 0;

/** รวม className แบบมีเงื่อนไข — แทน clsx สำหรับงานเล็กๆ */
export function cn(...values: ClassValue[]) {
  return values.filter(Boolean).join(" ");
}
