import type { ThemeId } from "./types";

/** ธีมพื้นหลังที่ผู้ใช้เลือกเอง — วาดด้วย gradient ล้วน (ไม่มี blur filter) */
export const themes: Record<
  ThemeId,
  { name: string; label: string; dark: boolean; base: [string, string, string]; orbs: [string, string] }
> = {
  aurora: { name: "Light Aurora", label: "Light Aurora (Vivid Blue)", dark: false, base: ["#E0F2FE", "#E0E7FF", "#F5F3FF"], orbs: ["#0F52BA", "#7C3AED"] },
  emerald: { name: "Emerald Sage", label: "Emerald Sage (Mint Glow)", dark: false, base: ["#ECFDF5", "#E0F2FE", "#F0FDF4"], orbs: ["#10B981", "#06B6D4"] },
  sunset: { name: "Sunset Amber", label: "Sunset Amber (Warm Pink & Amber)", dark: false, base: ["#FFF1F2", "#FFEDD5", "#FEF3C7"], orbs: ["#EC4899", "#F59E0B"] },
  slate: { name: "Slate Soft", label: "เทาอ่อนมาตรฐาน (Slate-50)", dark: false, base: ["#F8FAFC", "#F1F5F9", "#F8FAFC"], orbs: ["transparent", "transparent"] },
  midnight: { name: "Midnight Indigo", label: "Midnight Indigo (Dark Indigo)", dark: true, base: ["#030712", "#0F172A", "#1E1B4B"], orbs: ["#3B82F6", "#8B5CF6"] },
};

export function themeBackground(id: ThemeId) {
  const th = themes[id];
  const [a, b, c] = th.base;
  const [o1, o2] = th.orbs;
  const orb = (color: string, x: string, y: string, size: string) =>
    color === "transparent" ? "" : `radial-gradient(${size} at ${x} ${y}, ${color}${th.dark ? "55" : "33"} 0%, transparent 70%),`;
  return `${orb(o1, "12%", "8%", "60% 40%")}${orb(o2, "90%", "60%", "55% 45%")}linear-gradient(160deg, ${a}, ${b} 55%, ${c})`;
}
