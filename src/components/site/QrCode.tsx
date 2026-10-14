"use client";

// qrcode.react ใช้ hooks แต่ไม่ได้ประกาศ "use client" — ห่อไว้ให้เรียกจาก Server Component ได้
import { QRCodeSVG } from "qrcode.react";

export function QrCode({ value, size }: { value: string; size: number }) {
  return <QRCodeSVG value={value} size={size} marginSize={0} />;
}
