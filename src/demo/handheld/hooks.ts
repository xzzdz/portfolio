"use client";

import { useEffect, useState } from "react";

/** นับถอยหลังถึงเวลาหมดอายุ (ใช้กับ QR ของรายการรอชำระ) */
export function useCountdown(expiresAt: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const left = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
  return { left, m: String(Math.floor(left / 60)).padStart(2, "0"), s: String(left % 60).padStart(2, "0") };
}
