"use client";

import { QRCodeSVG } from "qrcode.react";
import { DEMO_PROMPTPAY_ID, promptPayPayload } from "@/lib/promptpay";

/** QR พร้อมเพย์ตามมาตรฐาน EMVCo — ใช้เลขปลายทางของเดโม่ (ไม่ใช่บัญชีจริง) */
export function ThaiQr({ amount, size = 168, className }: { amount: number; size?: number; className?: string }) {
  const payload = promptPayPayload(DEMO_PROMPTPAY_ID, amount);
  return (
    <QRCodeSVG
      value={payload}
      size={size}
      level="M"
      marginSize={0}
      className={className}
      bgColor="#FFFFFF"
      fgColor="#0F172A"
      title="Thai QR Payment"
    />
  );
}
