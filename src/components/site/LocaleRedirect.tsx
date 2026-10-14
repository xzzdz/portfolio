"use client";

import Link from "next/link";
import { useEffect } from "react";

/** เลือกภาษาจากที่เคยเลือกไว้ หรือภาษาของเบราว์เซอร์ แล้วส่งต่อ */
export function LocaleRedirect() {
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("portfolio-locale");
    } catch {
      // ใช้ localStorage ไม่ได้ (private mode) — ไปตามภาษาเบราว์เซอร์
    }
    const browser = navigator.language?.toLowerCase().startsWith("th") ? "th" : "en";
    const target = saved === "th" || saved === "en" ? saved : browser;
    window.location.replace(`/${target}${window.location.search}${window.location.hash}`);
  }, []);

  return (
    <div className="grid min-h-dvh place-items-center font-mono text-xs uppercase tracking-widest text-mute">
      <Link href="/th">Loading…</Link>
    </div>
  );
}
